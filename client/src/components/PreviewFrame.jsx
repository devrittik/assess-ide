import React, { useEffect, useState } from 'react';
import { onServerReady, getServerInfo } from '../services/webcontainer';
import { usePreviewStore } from '../store/usePreviewStore';

export default function PreviewFrame() {
  const url = usePreviewStore((s) => s.url);
  const status = usePreviewStore((s) => s.status);
  const message = usePreviewStore((s) => s.message);
  const setUrl = usePreviewStore((s) => s.setUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const existing = getServerInfo();
    if (existing.url) setUrl(existing.url, existing.port);
    const unsub = onServerReady((u, p) => setUrl(u, p));
    return unsub;
  }, [setUrl]);

  return (
    <div className="preview-container">
      <div className="preview-bar">
        <span className="preview-label">Preview</span>
        <span className="preview-url" title={url || ''}>
          {url || `(${status}) ${message}`}
        </span>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          disabled={!url}
          className="preview-btn refresh-btn"
          title="Refresh"
        >↻</button>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="preview-btn open-btn" title="Open in new tab">↗</a>
        )}
      </div>
      {url ? (
        <iframe
          key={refreshKey}
          src={url}
          title="preview"
          className="preview-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      ) : (
        <div className="preview-empty">
          {status === 'idle' && 'Click ▶ Run to install dependencies and start the dev server.'}
          {status === 'installing' && 'Installing dependencies…'}
          {status === 'starting' && 'Starting dev server…'}
          {status === 'error' && `Error: ${message}`}
        </div>
      )}
    </div>
  );
}
