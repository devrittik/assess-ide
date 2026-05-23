const packageJson = `{
  "name": "sandbox-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.4"
  }
}
`;

const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 3000 },
});
`;

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

const mainJsx = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);
`;

const appJsx = `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="card">
      <h1>Hello from the Assess IDE 👋</h1>
      <p>Edit <code>src/App.jsx</code> and the preview updates live.</p>
      <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>
    </div>
  );
}
`;

const indexCss = `:root {
  font-family: system-ui, sans-serif;
  color-scheme: dark;
  background: #1e1e2e;
  color: #cdd6f4;
}
body { margin: 0; display: grid; place-items: center; min-height: 100vh; }
.card { padding: 2rem 3rem; border-radius: 16px; background: #181825; box-shadow: 0 8px 30px rgba(0,0,0,.4); text-align: center; }
button { margin-top: 1rem; padding: .6rem 1.2rem; border-radius: 8px; border: 1px solid #45475a; background: #313244; color: #cdd6f4; cursor: pointer; font: inherit; }
button:hover { background: #45475a; }
code { background: #313244; padding: 2px 6px; border-radius: 4px; }
`;

export function createReactTemplate() {
  return {
    'package.json': { type: 'file', content: packageJson },
    'vite.config.js': { type: 'file', content: viteConfig },
    'index.html': { type: 'file', content: indexHtml },
    src: {
      type: 'folder',
      children: {
        'main.jsx': { type: 'file', content: mainJsx },
        'App.jsx': { type: 'file', content: appJsx },
        'index.css': { type: 'file', content: indexCss },
      },
    },
  };
}
