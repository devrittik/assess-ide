import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import FileActions from './FileActions';
import FileTree from './FileTree';
import { useFileStore } from '../store/useFileStore';
import { deleteProject, saveProject } from '../services/projectApi';
import { createReactTemplate } from '../templates/reactTemplate';
import { mountTree } from '../services/webcontainer';

const STORAGE_KEY = 'assess-ide.projectId';

export default function Sidebar() {
  const projectName = useFileStore((s) => s.projectName);
  const projectId = useFileStore((s) => s.projectId);
  const setProjectName = useFileStore((s) => s.setProjectName);
  const setProject = useFileStore((s) => s.setProject);
  const setFiles = useFileStore((s) => s.setFiles);
  const files = useFileStore((s) => s.files);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(projectName); }, [projectName]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commitName = () => {
    const n = draft.trim();
    if (n && n !== projectName) {
      setProjectName(n);
      if (projectId) {
        saveProject(projectId, files, n).catch((err) =>
          console.warn('[rename-persist]', err.message)
        );
      }
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project permanently? This cannot be undone.')) return;
    if (projectId) await deleteProject(projectId);
    localStorage.removeItem(STORAGE_KEY);
    const newId = uuid();
    const tpl = createReactTemplate();
    setProject(newId, 'Untitled Project');
    setFiles(tpl);
    localStorage.setItem(STORAGE_KEY, newId);
    await mountTree(tpl);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        {editing ? (
          <input
            ref={inputRef}
            className="project-name-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName();
              if (e.key === 'Escape') { setEditing(false); setDraft(projectName); }
            }}
          />
        ) : (
          <div
            className="project-name"
            title={projectId || ''}
            onClick={() => setEditing(true)}
          >{projectName} <span className="rename-hint">✎</span></div>
        )}
        <div className="project-id-row">
          <span className="project-id">{projectId?.slice(0, 8)}</span>
          <button className="delete-project-btn" onClick={handleDelete} title="Delete project">🗑</button>
        </div>
      </div>
      <FileActions />
      <FileTree />
    </aside>
  );
}
