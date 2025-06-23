import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileNode } from '@/types/directory';

interface FileMap {
  [key: string]: string | object;
}

/**
 * Recursively adds files and directories to a JSZip instance
 */
const addToZip = (zip: JSZip, node: FileNode, currentPath: string = ''): void => {
  if (!node) return;
  
  const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
  
  if (node.type === 'file' || node.type === 'File') {
    try {
      // Ensure content is a string
      let content = '';
      if (node.content !== undefined) {
        content = typeof node.content === 'string' 
          ? node.content 
          : JSON.stringify(node.content, null, 2);
      }
      zip.file(fullPath, content);
    } catch (error) {
      console.error(`Error adding file ${fullPath}:`, error);
    }
  } else if (node.children) {
    // It's a directory
    const folder = currentPath ? zip.folder(node.name) : zip;
    if (folder) {
      node.children.forEach(child => {
        const childPath = currentPath ? `${currentPath}/${node.name}` : node.name;
        addToZip(folder, child, childPath);
      });
    }
  }
};

/**
 * Generates and downloads a zip file from a directory tree
 */
export function generateZip(directoryTree: FileNode | null, zipName: string = 'project'): void {
  if (!directoryTree) {
    console.error('No directory tree provided');
    return;
  }

  try {
    const zip = new JSZip();
    
    // If the root has children, add them directly
    if (directoryTree.children) {
      directoryTree.children.forEach(child => {
        addToZip(zip, child, directoryTree.name === 'root' ? '' : directoryTree.name);
      });
    } else {
      // Otherwise add the root itself
      addToZip(zip, directoryTree);
    }
    
    // Generate the zip file
    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        saveAs(content, `${zipName}.zip`);
        console.log('ZIP file generated successfully');
      })
      .catch((error) => {
        console.error('Error generating zip file:', error);
      });
  } catch (error) {
    console.error('Error creating zip:', error);
  }
}

/**
 * Converts a flat file map to a directory tree structure
 */
export function createDirectoryTree(files: FileMap): FileNode {
  const root: FileNode = { 
    name: 'root', 
    type: 'directory',
    children: [] 
  };
  
  Object.entries(files).forEach(([path, content]) => {
    const parts = path.split('/').filter(Boolean); // Remove empty strings
    let current = root;
    
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      
      if (!current.children) {
        current.children = [];
      }
      
      let child = current.children.find((c: FileNode) => c.name === name);
      
      if (!child) {
        child = {
          name,
          type: isFile ? 'file' : 'directory',
          path: parts.slice(0, i + 1).join('/'),
          ...(isFile ? { content: String(content) } : { children: [] })
        };
        current.children.push(child);
      }
      
      if (child) {
        current = child;
      }
    }
  });
  
  // If there's only one directory at root level, return it directly
  if (root.children?.length === 1 && root.children[0].type === 'directory') {
    return root.children[0];
  }
  
  return root;
}
