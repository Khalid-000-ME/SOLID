// utils/codeParser.js
export function parseCodeString(codeString) {
    try {
      return JSON.parse(codeString);
    } catch (error) {
      console.error("JSON parsing error:", error);
      return null;
    }
  }
  
  export function buildDirectoryTree(filesDict) {
    const tree = { name: "root", type: "folder", children: [] };
    
    Object.entries(filesDict).forEach(([path, content]) => {
      const parts = path.split('/');
      let currentLevel = tree.children;
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        const existingNode = currentLevel.find(node => node.name === part);
        
        if (existingNode) {
          if (isFile) existingNode.content = content;
          currentLevel = existingNode.children;
        } else {
          const newNode = {
            name: part,
            type: isFile ? "file" : "folder",
            ...(isFile ? { content } : { children: [] })
          };
          currentLevel.push(newNode);
          currentLevel = isFile ? null : newNode.children;
        }
      });
    });
    
    return tree;
  }
  