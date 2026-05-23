import React, { useState } from 'react';
import { useFileStore } from '../store/useFileStore';

export default function FileNode({ name, path, node, depth }) {
  const activeFile = useFileStore((s) => s.activeFile);
  const expanded = useFileStore((s) => s.expanded[path]);
  const toggleExpanded = useFileStore((s) => s.toggleExpanded);
  const setActiveFile = useFileStore((s) => s.setActiveFile);
  const deleteFile = useFileStore((s) => s.deleteFile);
  const renameNode = useFileStore((s) => s.renameNode);
  const createFile = useFileStore((s) => s.createFile);
  const createFolder = useFileStore((s) => s.createFolder);

  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const isFolder = node.type === 'folder';
  const isActive = !isFolder && activeFile === path;

  const handleClick = () => {
    if (isFolder) toggleExpanded(path);
    else setActiveFile(path);
  };

  const commitRename = () => {
    const n = draftName.trim();
    if (n && n !== name) renameNode(path, n);
    setRenaming(false);
    setDraftName(n || name);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Delete "${path}"?`)) deleteFile(path);
  };

  const handleNewFile = (e) => {
    e.stopPropagation();
    const n = prompt('New file name:');
    if (!n) return;
    createFile(`${path}/${n}`);
  };

  const handleNewFolder = (e) => {
    e.stopPropagation();
    const n = prompt('New folder name:');
    if (!n) return;
    createFolder(`${path}/${n}`);
  };

  return (
    <div>
      <div
        className={`file-node ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: 6 + depth * 12 }}
        onClick={handleClick}
        title={path}
      >
        <span className="icon">
          {isFolder ? (expanded ? '▾' : '▸') : '📄'}
        </span>
        {renaming ? (
          <input
            className="rename-input"
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setRenaming(false); setDraftName(name); }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="name">{name}</span>
        )}
        <span className="actions" onClick={(e) => e.stopPropagation()}>
          {isFolder && (
            <>
              <button title="New file" onClick={handleNewFile}>+F</button>
              <button title="New folder" onClick={handleNewFolder}>+D</button>
            </>
          )}
          <button title="Rename" onClick={(e) => { e.stopPropagation(); setRenaming(true); }}>✎</button>
          <button title="Delete" onClick={handleDelete}>✕</button>
        </span>
      </div>
      {isFolder && expanded && node.children && (
        <div>
          {Object.entries(node.children)
            .sort(([a, na], [b, nb]) => {
              const af = na.type === 'folder' ? 0 : 1;
              const bf = nb.type === 'folder' ? 0 : 1;
              if (af !== bf) return af - bf;
              return a.localeCompare(b);
            })
            .map(([childName, childNode]) => (
              <FileNode
                key={childName}
                name={childName}
                path={`${path}/${childName}`}
                node={childNode}
                depth={depth + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}
