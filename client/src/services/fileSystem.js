import { getInstance } from './webcontainer';
import { dirname } from '../utils/convertToWebContainerFs';

async function safe(fn) {
  try {
    const wc = await getInstance();
    return await fn(wc);
  } catch (err) {
    console.warn('[fs]', err.message);
    return null;
  }
}

async function ensureDir(wc, path) {
  if (!path) return;
  await wc.fs.mkdir(path, { recursive: true });
}

export const wcFs = {
  async writeFile(path, content) {
    return safe(async (wc) => {
      const dir = dirname(path);
      if (dir) await ensureDir(wc, dir);
      await wc.fs.writeFile(path, content ?? '');
    });
  },
  async mkdir(path) {
    return safe((wc) => wc.fs.mkdir(path, { recursive: true }));
  },
  async rm(path) {
    return safe((wc) => wc.fs.rm(path, { recursive: true, force: true }));
  },
  async rename(from, to) {
    return safe(async (wc) => {
      try {
        if (typeof wc.fs.rename === 'function') {
          await wc.fs.rename(from, to);
          return;
        }
      } catch (_) {}
      const data = await wc.fs.readFile(from);
      const dir = dirname(to);
      if (dir) await ensureDir(wc, dir);
      await wc.fs.writeFile(to, data);
      await wc.fs.rm(from, { recursive: true, force: true });
    });
  },
};
