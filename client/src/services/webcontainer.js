import { WebContainer } from '@webcontainer/api';
import { convertToWebContainerFs } from '../utils/convertToWebContainerFs';

let instance = null;
let bootPromise = null;
let serverReadyListeners = new Set();
let serverInfo = { url: null, port: null };
let packageSyncStop = null;

export async function getInstance() {
  if (instance) return instance;
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    if (typeof crossOriginIsolated !== 'undefined' && !crossOriginIsolated) {
      throw new Error(
        'Page is not cross-origin isolated. COOP/COEP headers are required for WebContainers.'
      );
    }
    instance = await WebContainer.boot();
    instance.on('server-ready', (port, url) => {
      serverInfo = { url, port };
      for (const cb of serverReadyListeners) cb(url, port);
    });
    return instance;
  })();
  return bootPromise;
}

export function onServerReady(cb) {
  serverReadyListeners.add(cb);
  if (serverInfo.url) cb(serverInfo.url, serverInfo.port);
  return () => serverReadyListeners.delete(cb);
}

export function getServerInfo() {
  return serverInfo;
}

export async function mountTree(tree) {
  const wc = await getInstance();
  await wc.mount(convertToWebContainerFs(tree));
}

export async function watchPackageFiles(onSync) {
  const wc = await getInstance();
  packageSyncStop?.();

  let timer = null;
  const syncPaths = ['package.json', 'package-lock.json'];

  const syncFile = async (path) => {
    try {
      const content = await wc.fs.readFile(path, 'utf8');
      await onSync(path, content);
    } catch (_) {
      await onSync(path, null);
    }
  };

  const syncAll = async () => {
    await Promise.all(syncPaths.map(syncFile));
  };

  const watcher = wc.fs.watch('.', (_event, filename) => {
    const name = typeof filename === 'string' ? filename : new TextDecoder().decode(filename);
    if (!syncPaths.includes(name)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      syncFile(name);
    }, 100);
  });

  await syncAll();

  packageSyncStop = () => {
    clearTimeout(timer);
    watcher.close();
  };

  return packageSyncStop;
}

export async function runCommand(cmd, args = [], { onData, env } = {}) {
  const wc = await getInstance();
  const proc = await wc.spawn(cmd, args, env ? { env } : undefined);
  if (onData) {
    proc.output.pipeTo(
      new WritableStream({
        write(chunk) {
          onData(chunk);
        },
      })
    );
  }
  return proc;
}

export async function installAndStart({ onData } = {}) {
  const write = onData || (() => {});
  write('\r\n\x1b[36m▶ npm install\x1b[0m\r\n');
  const install = await runCommand('npm', ['install'], { onData: write });
  const code = await install.exit;
  if (code !== 0) {
    write(`\r\n\x1b[31m✖ npm install failed (exit ${code})\x1b[0m\r\n`);
    return { ok: false, code };
  }
  write('\r\n\x1b[36m▶ npm run dev\x1b[0m\r\n');
  const dev = await runCommand('npm', ['run', 'dev'], { onData: write });
  return { ok: true, process: dev };
}
