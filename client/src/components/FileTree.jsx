import React from 'react';
import { useFileStore } from '../store/useFileStore';
import FileNode from './FileNode';

export default function FileTree() {
  const files = useFileStore((s) => s.files);
  const entries = Object.entries(files).sort(([a, na], [b, nb]) => {
    const af = na.type === 'folder' ? 0 : 1;
    const bf = nb.type === 'folder' ? 0 : 1;
    if (af !== bf) return af - bf;
    return a.localeCompare(b);
  });

  if (entries.length === 0) {
    return <div className="empty">No files yet. Use the buttons above to start.</div>;
  }

  return (
    <div className="file-tree">
      {entries.map(([name, node]) => (
        <FileNode key={name} name={name} path={name} node={node} depth={0} />
      ))}
    </div>
  );
}
