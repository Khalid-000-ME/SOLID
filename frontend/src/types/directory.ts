export interface FileNode {
  name: string;
  path?: string;
  type: 'file' | 'File' | 'directory' | 'folder';
  content?: string | object;
  children?: FileNode[];
}

export type DirectoryTree = FileNode;
