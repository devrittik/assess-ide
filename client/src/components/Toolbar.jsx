import React, { useState } from 'react';
import { useFileStore } from '../store/useFileStore';
import { useTerminalStore } from '../store/useTerminalStore';
import { usePreviewStore } from '../store/usePreviewStore';
import { installAndStart, mountTree } from '../services/webcontainer';
import { saveProject } from '../services/projectApi';
import { createReactTemplate } from '../templates/reactTemplate';

export default function Toolbar() {
  const projectId = useFileStore((s) => s.projectId);
  const projectName = useFileStore((s) => s.projectName);
  const files = useFileStore((s) => s.files);
  const setFiles = useFileStore((s) => s.setFiles);
  const write = useTerminalStore((s) => s.write);
  const previewStatus = usePreviewStore((s) => s.status);
  const previewVisible = usePreviewStore((s) => s.visible);
  const togglePreview = usePreviewStore((s) => s.toggleVisible);
  const terminalVisible = useTerminalStore((s) => s.visible);
  const toggleTerminal = useTerminalStore((s) => s.toggleVisible);
  const setStatus = usePreviewStore((s) => s.setStatus);

  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setStatus('installing', 'Installing dependencies…');
    try {
      await installAndStart({
        onData: (chunk) => {
          if (write) write(chunk);
          if (typeof chunk === 'string' && /VITE.*ready|Local:.*http/i.test(chunk)) {
            setStatus('starting', 'Dev server starting…');
          }
        },
      });
    } catch (err) {
      setStatus('error', err.message);
      if (write) write(`\r\n\x1b[31m${err.message}\x1b[0m\r\n`);
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    setSaveMsg('');
    const res = await saveProject(projectId, files, projectName);
    setSaving(false);
    setSaveMsg(res ? 'Saved ✓' : 'Save failed');
    setTimeout(() => setSaveMsg(''), 2000);
  };

  const handleReset = async () => {
    if (!confirm('Reset to default React template? This wipes the current project.')) return;
    const tpl = createReactTemplate();
    setFiles(tpl);
    await mountTree(tpl);
  };

  return (
    <header className="toolbar">
      <div className="brand">
        <span className="logo">{'{ }'}</span>
        <span>Assess IDE</span>
      </div>
      <div className="toolbar-actions">
        <button
          onClick={toggleTerminal}
          className={terminalVisible ? 'primary' : 'outline-btn'}
          title={terminalVisible ? 'Hide terminal panel' : 'Show terminal panel'}
        >{terminalVisible ? '⬛ Terminal' : '⬜ Terminal'}</button>
        <button
          onClick={togglePreview}
          className={previewVisible ? 'primary' : 'outline-btn'}
          title={previewVisible ? 'Hide preview panel' : 'Show preview panel'}
        >{previewVisible ? '▣ Preview' : '▢ Preview'}</button>
        <button onClick={handleRun} disabled={running} className="primary">
          {running ? '⏳ Running…' : '▶ Run'}
        </button>
        <button onClick={handleSave} disabled={saving}>
          {saving ? '⏳ Saving…' : '💾 Save'}
        </button>
        <button onClick={handleReset}>↺ Reset</button>
        <span className="status">
          {saveMsg && <span className="save-msg">{saveMsg}</span>}
          {previewStatus !== 'idle' && (
            <span className={`preview-status ${previewStatus}`}>{previewStatus}</span>
          )}
        </span>
      </div>
    </header>
  );
}
