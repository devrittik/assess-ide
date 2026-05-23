import React, { useRef, useState, useCallback, useEffect } from 'react';
import CodeEditor from './CodeEditor';
import PreviewFrame from './PreviewFrame';
import { usePreviewStore } from '../store/usePreviewStore';

export default function MainPanel() {
  const [splitPct, setSplitPct] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const previewVisible = usePreviewStore((s) => s.visible);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.min(85, Math.max(15, pct)));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className="main-panel" ref={containerRef}>
      <div className="editor-pane" style={{ width: previewVisible ? `${splitPct}%` : '100%' }}>
        <CodeEditor />
      </div>
      {previewVisible && (
        <>
          <div
            className="panel-divider panel-divider-h"
            onMouseDown={onMouseDown}
            title="Drag to resize"
          />
          <div className="preview-pane" style={{ flex: 1 }}>
            <PreviewFrame />
          </div>
        </>
      )}
    </div>
  );
}
