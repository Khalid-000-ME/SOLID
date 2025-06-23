'use client';
import { useState, useEffect, useCallback } from 'react';
import { generateZip, createDirectoryTree } from '@/utils/exportZip';
import { FileNode } from '@/types/directory';
import CodeEditor from '@/components/CodeEditor';
import { parseCodeString, buildDirectoryTree } from '@/utils/codeParser';

export default function EditorPage() {
  const [agentOutput, setAgentOutput] = useState<string>('');
  const [directoryTree, setDirectoryTree] = useState<FileNode | null>(null);

  // Sample agent output (replace with actual agent response)
  const sampleOutput = JSON.stringify({
    "main.py": "print('Hello World')",
    "index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n</head>\n<body>\n  <h1>Welcome to My App</h1>\n  <script src=\"main.js\"></script>\n</body>\n</html>",
    "templates/index.html": "<div>Hello from template</div>",
    "static/css/styles.css": "body { font-family: Arial, sans-serif; }",
    "static/js/main.js": "console.log('JavaScript is working!');"
  });

  // Update directory tree when agent output changes
  useEffect(() => {
    if (agentOutput) {
      try {
        const parsed = typeof agentOutput === 'string' ? JSON.parse(agentOutput) : agentOutput;
        const tree = createDirectoryTree(parsed);
        setDirectoryTree(tree);
      } catch (error) {
        console.error('Error parsing agent output:', error);
      }
    }
  }, [agentOutput]);

  const handleDownload = () => {
    if (!directoryTree) {
      console.error('No directory tree to download');
      return;
    }
    
    // Create a proper FileNode structure if needed
    const treeToZip: FileNode = {
      name: 'root',
      type: 'directory',
      children: directoryTree.children || [directoryTree]
    };
    
    generateZip(treeToZip, 'project-files');
  };

  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJsonSubmit = useCallback(() => {
    try {
      const parsed = parseCodeString(jsonInput);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Failed to parse JSON or invalid format');
      }
      
      // Create a new directory tree from the parsed JSON
      const newTree = buildDirectoryTree(parsed);
      
      // If there's a 'Main' directory, use it as the root
      const mainDir = newTree.children?.find((child: FileNode) => 
        child.name.toLowerCase() === 'main' && 
        (child.type === 'folder' || child.type === 'directory')
      ) as FileNode | undefined;
      
      if (mainDir && mainDir.children) {
        // Set the Main directory as the new root
        const updatedTree: FileNode = {
          name: 'root',
          type: 'directory',
          children: mainDir.children.map(child => ({
            ...child,
            name: child.name.replace(/^Main[\\/]?/, '') // Remove 'Main/' prefix from paths
          }))
        };
        setDirectoryTree(updatedTree);
      } else {
        // Use the entire parsed structure as is
        setDirectoryTree({
          name: 'root',
          type: 'directory',
          children: newTree.children || []
        });
      }
      
      setAgentOutput(parsed);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
      console.error('Error parsing JSON:', error);
      setError(errorMessage);
    }
  }, [jsonInput]);

  return (
    <div className="nintendo-ds-bg min-h-screen p-6 font-['Press_Start_2P'] text-white text-xs">
      <div className="relative max-w-6xl mx-auto mb-8 p-4 bg-black/50 rounded-lg border-4 border-white/20">
        <h1 className="text-center text-lg md:text-xl text-white mb-0 tracking-wider">CODE EDITOR</h1>
      </div>
      
      <div className="max-w-6xl mx-auto mb-8 bg-black/50 rounded-lg border-4 border-white/20 overflow-hidden">
        <div className="bg-black/70 p-2 border-b-4 border-white/20">
          <span className="text-white text-xs tracking-wider">PROJECT IMPORT</span>
        </div>
        <div className="p-6">
        
        <div className="flex gap-3 mb-3">
          <button 
            onClick={() => {
              setAgentOutput(sampleOutput);
              setError(null);
            }}
            className="nintendo-button nintendo-button-green"
          >
            <span className="nintendo-button-text">LOAD SAMPLE</span>
          </button>
          <div className="flex-1">
            <div className="text-white/80 text-[10px] mb-2 leading-tight">
              PASTE PROJECT JSON (AUTODETECTS 'MAIN' FOLDER):
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleJsonSubmit();
                    }
                  }}
                  placeholder={`{
  "Main/app.js": "console.log('Hello World')",
  "Main/index.html": "<!DOCTYPE html>..."
}`}
                  className="w-full p-3 bg-black/40 text-white/90 border-2 border-white/20 rounded-sm font-['Press_Start_2P'] text-[10px] leading-tight h-32 focus:outline-none focus:border-blue-500/50"
                />
                {error && (
                  <div className="text-red-400 text-[10px] mt-2 text-center">
                    {error}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleJsonSubmit}
                  disabled={!jsonInput.trim()}
                  className="nintendo-button nintendo-button-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="nintendo-button-text">IMPORT JSON</span>
                </button>
                <button
                  onClick={() => {
                    setJsonInput('');
                    setError(null);
                  }}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-[10px] rounded-sm border-2 border-white/20 hover:border-white/40 transition-all"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      
      <div className="max-w-6xl mx-auto bg-black/50 rounded-lg border-4 border-white/20 overflow-hidden">
        <div className="bg-black/70 p-3 border-b-4 border-white/20">
          <span className="text-white text-lg tracking-wider">CODE EDITOR</span>
        </div>
        <div className="p-0 overflow-hidden">
          <CodeEditor 
            agentOutput={agentOutput}
            directoryTree={directoryTree}
            onDirectoryTreeChange={setDirectoryTree}
          />
        </div>
      </div>
      
      <button
        onClick={handleDownload}
        className="nintendo-download-button fixed bottom-6 right-6"
      >
        <span className="nintendo-button-text">DOWNLOAD ZIP</span>
      </button>
    </div>
  );
}
