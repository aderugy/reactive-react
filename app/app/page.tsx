"use client";

import { useState } from "react";
import FileTree from "@/components/FileTree";
import ReactFileEvaluator from "@/components/ReactFileEvaluator";
import { FileNode } from "@/components/FileTree"; // Assurez-vous d'exporter le type dans FileTree

export default function Home() {
  const [projectStructure, setProjectStructure] = useState<FileNode[]>([]);
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const structure = await parseFolderStructure(files);
    setProjectStructure(structure);
  };

  const handleFileSelect = (content: string, fileName?: string) => {
    setSelectedContent(content);
    setSelectedFileName(fileName || "");
  };

  const parseFolderStructure = async (fileList: FileList): Promise<FileNode[]> => {
    const structure: Record<string, FileNode> = {};
    
    // Parcourir tous les fichiers du dossier uploadé
    for (const file of Array.from(fileList)) {
      const path = file.webkitRelativePath;
      const parts = path.split('/');
      
      let currentLevel = structure;
      let currentPath = '';
      
      // Construire l'arborescence niveau par niveau
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        const id = currentPath + part;
        
        // Créer un nouveau nœud s'il n'existe pas
        if (!currentLevel[id]) {
          currentLevel[id] = {
            id,
            name: part,
            type: isFile ? "file" : "folder",
            children: isFile ? undefined : {},
          };
        }
        
        // Descendre dans l'arborescence
        if (!isFile) {
          currentLevel = currentLevel[id].children as Record<string, FileNode>;
          currentPath = id + '/';
        } else {
          // Lire le contenu du fichier
          currentLevel[id].content = await file.text();
        }
      }
    }
    
    // Convertir l'objet en tableau récursivement
    const convertToArray = (nodes: Record<string, FileNode>): FileNode[] => {
      return Object.values(nodes).map(node => ({
        ...node,
        children: node.children ? convertToArray(node.children) : undefined,
      }));
    };
    
    return convertToArray(structure);
  };

  return (
    <main className="flex h-screen bg-white">
      {/* Panneau gauche - Arborescence */}
      <div className="w-64 border-r p-4 overflow-auto bg-gray-50">
        <h2 className="font-bold mb-4 text-lg">Project Files</h2>
        
        {/* Bouton d'upload de dossier */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload un dossier
          </label>
          <input 
            type="file"
            className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
            webkitdirectory="true" 
            onChange={handleFolderUpload}
          />
        </div>

        {/* Arborescence des fichiers */}
        {projectStructure.length > 0 ? (
          <FileTree 
            files={projectStructure} 
            onFileSelect={handleFileSelect} 
          />
        ) : (
          <div className="text-gray-500 text-sm mt-8 text-center">
            <p>Upload un dossier pour commencer</p>
            <p className="mt-2">(Chrome/Edge uniquement)</p>
          </div>
        )}
      </div>
      
      {/* Panneau droit - Éditeur et évaluation */}
      <div className="flex-1 p-4 bg-gray-100">
        {selectedFileName && (
          <div className="mb-2 text-sm text-gray-600">
            Fichier sélectionné: <span className="font-semibold">{selectedFileName}</span>
          </div>
        )}
        <ReactFileEvaluator 
          initialContent={selectedContent} 
        />
      </div>
    </main>
  );
}