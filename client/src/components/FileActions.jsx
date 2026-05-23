import React from 'react';
import { useFileStore } from '../store/useFileStore';

export default function FileActions() {
  const createFile = useFileStore((s) => s.createFile);
  const createFolder = useFileStore((s) => s.createFolder);

  const handleNewFile = () => {
    const name = prompt('New file path (e.g. src/Hello.jsx):');
    if (!name) return;
    if (!createFile(name)) alert('File already exists.');
  };

  const handleNewFolder = () => {
    const name = prompt('New folder path (e.g. src/components):');
    if (!name) return;
    if (!createFolder(name)) alert('Folder already exists.');
  };

  return (
    <div className="file-actions">
      <button onClick={handleNewFile}>+ File</button>
      <button onClick={handleNewFolder}>+ Folder</button>
    </div>
  );
}
