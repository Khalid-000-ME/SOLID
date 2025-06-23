export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
}

export interface CodeEditorProps {
  agentOutput: string;
  directoryTree: FileNode | null;
  onDirectoryTreeChange: (tree: FileNode | null) => void;
}
