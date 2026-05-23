import React, { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import BottomPanel from './components/BottomPanel';
import { useFileStore } from './store/useFileStore';
import { useTerminalStore } from './store/useTerminalStore';
import { getInstance, mountTree } from './services/webcontainer';
import { loadProject, saveProject } from './services/projectApi';
import { createReactTemplate } from './templates/reactTemplate';
import { debounce } from './utils/debounce';

const STORAGE_KEY = 'assess-ide.projectId';

export default function App() {
  const setProject = useFileStore((s) => s.setProject);
  const setFiles = useFileStore((s) => s.setFiles);
  const files = useFileStore((s) => s.files);
  const projectId = useFileStore((s) => s.projectId);
  const dirty = useFileStore((s) => s.dirty);

  const [bootError, setBootError] = useState(null);
  const [bootStatus, setBootStatus] = useState('Booting WebContainer…');
  const [ready, setReady] = useState(false);
  const firstSaveRef = useRef(true);

  // Vertical split between main panel and bottom panel
  const [vertSplitPct, setVertSplitPct] = useState(65); // main panel height %
  const ideRightRef = useRef(null);
  const vDragging = useRef(false);
  const terminalVisible = useTerminalStore((s) => s.visible);

  const onVMouseDown = useCallback((e) => {
    e.preventDefault();
    vDragging.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const onVMouseMove = useCallback((e) => {
    if (!vDragging.current || !ideRightRef.current) return;
    const rect = ideRightRef.current.getBoundingClientRect();
    const pct = ((e.clientY - rect.top) / rect.height) * 100;
    setVertSplitPct(Math.min(85, Math.max(30, pct)));
  }, []);

  const onVMouseUp = useCallback(() => {
    vDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onVMouseMove);
    window.addEventListener('mouseup', onVMouseUp);
    return () => {
      window.removeEventListener('mousemove', onVMouseMove);
      window.removeEventListener('mouseup', onVMouseUp);
    };
  }, [onVMouseMove, onVMouseUp]);

  // --- Bootstrap ---
  useEffect(() => {
    (async () => {
      try {
        let id = localStorage.getItem(STORAGE_KEY);
        let initialFiles = null;
        let projectName = 'Untitled Project';

        if (id) {
          setBootStatus(`Loading saved project ${id.slice(0, 8)}…`);
          const proj = await loadProject(id);
          if (proj?.files) initialFiles = proj.files;
          if (proj?.name) projectName = proj.name;
        }
        if (!id) id = uuid();
        if (!initialFiles) initialFiles = createReactTemplate();

        setProject(id, projectName);
        setFiles(initialFiles);
        localStorage.setItem(STORAGE_KEY, id);

        setBootStatus('Booting WebContainer…');
        await getInstance();

        setBootStatus('Mounting files…');
        await mountTree(initialFiles);

        saveProject(id, initialFiles, projectName);
        setReady(true);
      } catch (err) {
        console.error(err);
        setBootError(err.message || String(err));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autosaveRef = useRef(null);
  useEffect(() => {
    autosaveRef.current = debounce((id, tree) => {
      if (id) saveProject(id, tree);
    }, 2000);
    return () => autosaveRef.current?.cancel();
  }, []);

  useEffect(() => {
    if (!ready || !projectId) return;
    if (firstSaveRef.current) { firstSaveRef.current = false; return; }
    autosaveRef.current?.(projectId, files);
  }, [dirty, ready, projectId, files]);

  if (bootError) {
    return (
      <div className="boot-error">
        <h1>⚠ Failed to start sandbox</h1>
        <pre>{bootError}</pre>
        <p>
          WebContainers require <strong>cross-origin isolation</strong>. Make sure the page is
          served with <code>Cross-Origin-Opener-Policy: same-origin</code> and{' '}
          <code>Cross-Origin-Embedder-Policy: require-corp</code> headers.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="boot-screen">
        <div className="spinner" />
        <p>{bootStatus}</p>
      </div>
    );
  }

  return (
    <div className="ide-root">
      <Toolbar />
      <div className="ide-body">
        <Sidebar />
        <div className="ide-right" ref={ideRightRef}>
          <div className="main-panel-wrap" style={{ height: terminalVisible ? `${vertSplitPct}%` : '100%' }}>
            <MainPanel />
          </div>
          <div
            className="panel-divider panel-divider-v"
            onMouseDown={onVMouseDown}
            title="Drag to resize"
            style={{ display: terminalVisible ? '' : 'none' }}
          />
          <div className="bottom-panel-wrap" style={{ flex: 1, display: terminalVisible ? '' : 'none' }}>
            <BottomPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
