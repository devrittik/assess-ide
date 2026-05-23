import React, { useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useFileStore } from '../store/useFileStore';
import { getNodeAtPath } from '../utils/convertToWebContainerFs';
import { getLanguage } from '../utils/getLanguage';
import { debounce } from '../utils/debounce';

function TabBar() {
  const openTabs = useFileStore((s) => s.openTabs);
  const activeFile = useFileStore((s) => s.activeFile);
  const setActiveFile = useFileStore((s) => s.setActiveFile);
  const closeTab = useFileStore((s) => s.closeTab);

  if (openTabs.length === 0) return null;

  return (
    <div className="editor-tabs">
      {openTabs.map((path) => {
        const name = path.split('/').pop();
        const isActive = path === activeFile;
        return (
          <div
            key={path}
            className={`editor-tab-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveFile(path)}
            title={path}
          >
            <span className="tab-name">{name}</span>
            <button
              className="tab-close"
              onClick={(e) => { e.stopPropagation(); closeTab(path); }}
              title={`Close ${name}`}
            >×</button>
          </div>
        );
      })}
    </div>
  );
}

export default function CodeEditor() {
  const activeFile = useFileStore((s) => s.activeFile);
  const files = useFileStore((s) => s.files);
  const updateFileContent = useFileStore((s) => s.updateFileContent);

  const node = activeFile ? getNodeAtPath(files, activeFile) : null;
  const content = node?.type === 'file' ? node.content || '' : '';
  const language = useMemo(
    () => (activeFile ? getLanguage(activeFile) : 'plaintext'),
    [activeFile]
  );

  const debouncedRef = useRef(null);
  useEffect(() => {
    debouncedRef.current = debounce((path, val) => {
      updateFileContent(path, val);
    }, 250);
    return () => debouncedRef.current?.cancel();
  }, [updateFileContent]);

  return (
    <div className="editor-container">
      <TabBar />
      {!activeFile ? (
        <div className="editor-empty">
          <h2>Welcome to your sandbox</h2>
          <p>Select a file on the left to start editing.</p>
        </div>
      ) : !node || node.type !== 'file' ? (
        <div className="editor-empty">File not found.</div>
      ) : (
        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          value={content}
          path={activeFile}
          onChange={(val) => debouncedRef.current?.(activeFile, val ?? '')}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            tabSize: 2,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      )}
    </div>
  );
}
