"use client";

import { useState } from "react";
import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";

export type FileNode = {
  id: string;
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
  content?: string;
};

const FileTree = ({ 
  files, 
  onFileSelect 
}: { 
  files: FileNode[]; 
  onFileSelect: (content: string, fileName?: string) => void 
}) => {
  return (
    <div className="font-mono text-sm">
      {files.map((node) => (
        <TreeNode key={node.id} node={node} onFileSelect={onFileSelect} />
      ))}
    </div>
  );
};

const TreeNode = ({ 
  node, 
  onFileSelect 
}: { 
  node: FileNode; 
  onFileSelect: (content: string, fileName?: string) => void 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (node.type === "folder") {
      setIsExpanded(!isExpanded);
    } else {
      onFileSelect(node.content || "", node.name);
    }
  };

  return (
    <div className="pl-4 py-1">
      <div 
        className="flex items-center cursor-pointer hover:bg-gray-100 py-1 rounded"
        onClick={handleClick}
      >
        {node.type === "folder" ? (
          <>
            {isExpanded ? (
              <ChevronDown className="mr-1" size={16} />
            ) : (
              <ChevronRight className="mr-1" size={16} />
            )}
            <Folder className="mr-2" size={16} />
          </>
        ) : (
          <File className="ml-5 mr-2" size={16} />
        )}
        <span>{node.name}</span>
      </div>

      {isExpanded && node.children && (
        <div className="pl-4">
          {node.children.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onFileSelect={onFileSelect} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTree;