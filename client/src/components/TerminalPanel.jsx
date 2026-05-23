import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { attachShell } from '../services/terminal';
import { useTerminalStore } from '../store/useTerminalStore';

function SingleTerminal({ terminalId, isActive }) {
  const containerRef = useRef(null);
  const setWrite = useTerminalStore((s) => s.setWrite);

  useEffect(() => {
    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontSize: 12,
      fontFamily: 'Menlo, Consolas, "Liberation Mono", monospace',
      theme: {
        background: '#11111b',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current);
    fit.fit();

    setWrite((data) => term.write(data), terminalId);

    const resizeObserver = new ResizeObserver(() => {
      try { fit.fit(); } catch (_) {}
    });
    resizeObserver.observe(containerRef.current);

    let detach = () => {};
    attachShell(term)
      .then((d) => { detach = d; })
      .catch((err) => {
        term.write(`\r\n\x1b[31mShell failed to start: ${err.message}\x1b[0m\r\n`);
      });

    return () => {
      resizeObserver.disconnect();
      try { detach(); } catch (_) {}
      term.dispose();
      setWrite(null, terminalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminalId]);

  return (
    <div
      ref={containerRef}
      className="xterm-host"
      style={{ display: isActive ? 'flex' : 'none', flex: 1, minHeight: 0 }}
    />
  );
}

export default function TerminalPanel() {
  const terminals = useTerminalStore((s) => s.terminals);
  const activeTerminalId = useTerminalStore((s) => s.activeTerminalId);
  const addTerminal = useTerminalStore((s) => s.addTerminal);
  const removeTerminal = useTerminalStore((s) => s.removeTerminal);
  const setActiveTerminal = useTerminalStore((s) => s.setActiveTerminal);

  return (
    <div className="terminal-panel">
      <div className="terminal-tab-bar">
        <div className="terminal-tabs">
          {terminals.map((t) => (
            <div
              key={t.id}
              className={`terminal-tab-item ${t.id === activeTerminalId ? 'active' : ''}`}
              onClick={() => setActiveTerminal(t.id)}
            >
              <span>⬛ {t.name}</span>
              {terminals.length > 1 && (
                <button
                  className="terminal-tab-close"
                  title="Kill terminal"
                  onClick={(e) => { e.stopPropagation(); removeTerminal(t.id); }}
                >×</button>
              )}
            </div>
          ))}
        </div>
        <div className="terminal-actions">
          <button
            className="terminal-action-btn"
            title="New terminal"
            onClick={addTerminal}
          >+</button>
        </div>
      </div>
      <div className="terminal-body">
        {terminals.map((t) => (
          <SingleTerminal
            key={t.id}
            terminalId={t.id}
            isActive={t.id === activeTerminalId}
          />
        ))}
      </div>
    </div>
  );
}
