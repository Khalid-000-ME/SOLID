// components/CodeEditor.tsx
import React, { useState, useEffect, memo } from 'react';
import { FileNode } from '@/types/directory';

// Define the FileTree component first to avoid hoisting issues

interface CodeEditorProps {
  agentOutput: string;
  directoryTree: FileNode | null;
  onDirectoryTreeChange: (tree: FileNode | null) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  agentOutput, 
  directoryTree, 
  onDirectoryTreeChange
}) => {
  // Ensure we have a proper component with all required props
  if (!onDirectoryTreeChange) {
    console.error('onDirectoryTreeChange is required');
    return null;
  }
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // Update active file when directory tree changes
  useEffect(() => {
    if (directoryTree?.children?.length) {
      const firstFile = findFirstFile(directoryTree);
      if (firstFile) {
        setActiveFile(firstFile);
        setEditedContent(
          typeof firstFile.content === 'string' 
            ? firstFile.content 
            : JSON.stringify(firstFile.content, null, 2)
        );
      }
    }
  }, [directoryTree]);
  
  // Helper function to find the first file in the tree
  const findFirstFile = (node: FileNode): FileNode | null => {
    if (node.type === 'file' || node.type === 'File') {
      return node;
    }
    if (node.children?.length) {
      for (const child of node.children) {
        const found = findFirstFile(child);
        if (found) return found;
      }
    }
    return null;
  };

    const handleFileSelect = (file: FileNode) => {
    setActiveFile(file);
    setEditedContent(
      typeof file.content === 'string' 
        ? file.content 
        : JSON.stringify(file.content, null, 2)
    );
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);
    
    // Update in-memory tree
    if (activeFile && directoryTree) {
      const updateFileContent = (node: FileNode): FileNode => {
        if (node.path === activeFile.path) {
          return { ...node, content: newContent };
        }
        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateFileContent)
          };
        }
        return node;
      };
      
      const newTree = updateFileContent({...directoryTree});
      onDirectoryTreeChange(newTree);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-black/30 rounded-lg overflow-hidden border-4 border-white/20 font-['Press_Start_2P'] text-xs">
      {/* File Tree Panel */}
      <div className="w-1/4 bg-black/40 overflow-y-auto border-r-4 border-white/20">
        <div className="p-2 bg-black/50 border-b-4 border-white/20">
          <h3 className="text-white text-[10px] tracking-wider">FILES</h3>
        </div>
        {directoryTree ? (
          <div className="p-2">
            <FileTree 
              node={directoryTree} 
              onSelect={handleFileSelect}
              level={0}
              isActive={activeFile}
            />
          </div>
        ) : (
          <div className="p-4 text-white/70 text-[10px] leading-tight">
            No files to display. Import a project to begin.
          </div>
        )}
      </div>
      
      {/* Editor Panel */}
      <div className="w-3/4 flex flex-col bg-black/20">
        {activeFile ? (
          <>
            <div className="p-2 bg-black/50 border-b-4 border-white/20">
              <h2 className="text-white text-[10px] tracking-wider truncate" title={activeFile.path || activeFile.name}>
                {activeFile.path || activeFile.name}
              </h2>
            </div>
            <div className="flex-1 overflow-auto">
              <textarea
                value={editedContent}
                onChange={handleContentChange}
                className="w-full h-full p-4 font-mono text-sm bg-black/30 text-white/90 outline-none resize-none"
                spellCheck={false}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  lineHeight: '1.5',
                  tabSize: 2,
                }}
              />
            </div>
            {activeFile.name.endsWith('.html') && (
              <div className="p-2 bg-black/50 border-t-4 border-white/20">
                <button 
                  onClick={() => previewHtml(editedContent)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded-sm border-2 border-white/20 hover:border-white/40 transition-all"
                >
                  PREVIEW HTML
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/50 text-[10px]">
            <p>SELECT A FILE TO EDIT</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface FileTreeProps {
  node: FileNode;
  onSelect: (file: FileNode) => void;
  level: number;
  isActive?: FileNode | null;
}

// FileTree component without memo first
function FileTreeComponent({ node, onSelect, level = 0, isActive }: FileTreeProps & { isActive?: FileNode | null }) {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first two levels
  const isFolder = node.type === 'folder' || node.type === 'directory';
  const hasChildren = !!node.children?.length;
  const isActiveFile = isActive?.path === node.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFolder) {
      setExpanded(!expanded);
    } else {
      onSelect(node);
    }
  };

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch(ext) {
      case 'js': return 'JS';
      case 'jsx': return 'JSX';
      case 'ts': return 'TS';
      case 'tsx': return 'TSX';
      case 'css': return 'CSS';
      case 'html': return 'HTML';
      case 'json': return '{}';
      case 'md': return 'MD';
      case 'py': return 'PY';
      default: return 'F';
    }
  };

  return (
    <div className={`py-0.5 ${level > 0 ? 'pl-4' : ''}`}>
      <div 
        className={`flex items-center cursor-pointer py-1 px-2 rounded-sm ${isActiveFile ? 'bg-blue-600/50' : 'hover:bg-white/10'}`}
        onClick={handleClick}
      >
        {isFolder ? (
          <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-yellow-400 text-center text-[10px]">
            {expanded ? '[-]' : '[+]'}
          </span>
        ) : (
          <span className="inline-flex items-center justify-center w-5 h-5 mr-2 bg-blue-900/50 text-blue-300 text-[10px] rounded-sm">
            {getFileIcon(node.name)}
          </span>
        )}
        <span className={`text-[10px] ${isActiveFile ? 'text-white' : 'text-white/80'} truncate`} style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}>
          {node.name}
        </span>
      </div>

      {isFolder && hasChildren && expanded && (
        <div className="border-l-2 border-white/10 ml-2 pl-2">
          {node.children?.map((child, index) => (
            <FileTree 
              key={`${child.name}-${index}`}
              node={child} 
              onSelect={onSelect}
              level={level + 1}
              isActive={isActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Memoized version of FileTree
const FileTree = memo(FileTreeComponent);
FileTree.displayName = 'FileTree';

// HTML Preview Handler
const previewHtml = (content: string) => {
  const preview = window.open('about:blank', 'preview');
  if (preview) {
    preview.document.write(content);
    preview.document.close();
  }
};

// Memoize the main component for better performance
const MemoizedCodeEditor = memo(CodeEditor);
MemoizedCodeEditor.displayName = 'CodeEditor';

// Export the memoized component as default
export default MemoizedCodeEditor;