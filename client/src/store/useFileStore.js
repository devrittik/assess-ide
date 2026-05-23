import { create } from 'zustand';
import {
  getNodeAtPath,
  setNodeAtPath,
  deleteNodeAtPath,
  dirname,
} from '../utils/convertToWebContainerFs';
import { wcFs } from '../services/fileSystem';

export const useFileStore = create((set, get) => ({
  projectId: null,
  projectName: 'Untitled Project',
  files: {},
  activeFile: null,
  // Multi-tab support: array of open file paths
  openTabs: [],
  expanded: {},
  dirty: 0,

  setProject(projectId, name) {
    set({ projectId, projectName: name || 'Untitled Project' });
  },

  setProjectName(name) {
    set({ projectName: name, dirty: get().dirty + 1 });
  },

  setFiles(files) {
    set({ files: files || {}, dirty: get().dirty + 1 });
  },

  setActiveFile(path) {
    const openTabs = get().openTabs;
    if (!openTabs.includes(path)) {
      set({ activeFile: path, openTabs: [...openTabs, path] });
    } else {
      set({ activeFile: path });
    }
  },

  closeTab(path) {
    const openTabs = get().openTabs.filter((t) => t !== path);
    let activeFile = get().activeFile;
    if (activeFile === path) {
      // Switch to adjacent tab
      const idx = get().openTabs.indexOf(path);
      if (openTabs.length > 0) {
        activeFile = openTabs[Math.max(0, idx - 1)];
      } else {
        activeFile = null;
      }
    }
    set({ openTabs, activeFile });
  },

  toggleExpanded(path) {
    set((s) => ({ expanded: { ...s.expanded, [path]: !s.expanded[path] } }));
  },

  setExpanded(path, value) {
    set((s) => ({ expanded: { ...s.expanded, [path]: value } }));
  },

  createFile(path, content = '') {
    const files = structuredClone(get().files);
    if (getNodeAtPath(files, path)) return false;
    setNodeAtPath(files, path, { type: 'file', content });
    const expanded = { ...get().expanded };
    const parts = path.split('/').filter(Boolean);
    let cur = '';
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur ? `${cur}/${parts[i]}` : parts[i];
      expanded[cur] = true;
    }
    const openTabs = [...get().openTabs, path];
    set({ files, expanded, activeFile: path, openTabs, dirty: get().dirty + 1 });
    wcFs.writeFile(path, content);
    return true;
  },

  createFolder(path) {
    const files = structuredClone(get().files);
    if (getNodeAtPath(files, path)) return false;
    setNodeAtPath(files, path, { type: 'folder', children: {} });
    const expanded = { ...get().expanded, [path]: true };
    set({ files, expanded, dirty: get().dirty + 1 });
    wcFs.mkdir(path);
    return true;
  },

  deleteFile(path) {
    const files = structuredClone(get().files);
    if (!deleteNodeAtPath(files, path)) return false;
    const openTabs = get().openTabs.filter((t) => t !== path && !t.startsWith(path + '/'));
    let activeFile = get().activeFile;
    if (activeFile === path || activeFile?.startsWith(path + '/')) {
      activeFile = openTabs[openTabs.length - 1] || null;
    }
    set({ files, activeFile, openTabs, dirty: get().dirty + 1 });
    wcFs.rm(path);
    return true;
  },

  renameNode(oldPath, newName) {
    if (!newName || newName.includes('/')) return false;
    const files = structuredClone(get().files);
    const node = getNodeAtPath(files, oldPath);
    if (!node) return false;
    const newPath = dirname(oldPath) ? `${dirname(oldPath)}/${newName}` : newName;
    if (getNodeAtPath(files, newPath)) return false;
    deleteNodeAtPath(files, oldPath);
    setNodeAtPath(files, newPath, node);
    const openTabs = get().openTabs.map((t) => (t === oldPath ? newPath : t));
    const activeFile = get().activeFile === oldPath ? newPath : get().activeFile;
    set({ files, activeFile, openTabs, dirty: get().dirty + 1 });
    wcFs.rename(oldPath, newPath);
    return true;
  },

  updateFileContent(path, content) {
    const files = structuredClone(get().files);
    const node = getNodeAtPath(files, path);
    if (!node || node.type !== 'file') return false;
    node.content = content;
    setNodeAtPath(files, path, node);
    set({ files, dirty: get().dirty + 1 });
    wcFs.writeFile(path, content);
    return true;
  },
}));
