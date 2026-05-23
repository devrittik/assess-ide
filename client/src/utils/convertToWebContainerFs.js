export function convertToWebContainerFs(tree) {
  const out = {};
  for (const [name, node] of Object.entries(tree || {})) {
    if (!node) continue;
    if (node.type === 'folder') {
      out[name] = { directory: convertToWebContainerFs(node.children || {}) };
    } else if (node.type === 'file') {
      out[name] = { file: { contents: node.content ?? '' } };
    }
  }
  return out;
}

export function walkTree(tree, cb, base = '') {
  for (const [name, node] of Object.entries(tree || {})) {
    const path = base ? `${base}/${name}` : name;
    cb(path, node);
    if (node?.type === 'folder') walkTree(node.children || {}, cb, path);
  }
}

export function getNodeAtPath(tree, path) {
  if (!path) return null;
  const parts = path.split('/').filter(Boolean);
  let cur = tree;
  let node = null;
  for (let i = 0; i < parts.length; i++) {
    node = cur?.[parts[i]];
    if (!node) return null;
    if (i < parts.length - 1) {
      if (node.type !== 'folder') return null;
      cur = node.children;
    }
  }
  return node;
}

export function setNodeAtPath(tree, path, node) {
  const parts = path.split('/').filter(Boolean);
  let cur = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const name = parts[i];
    if (!cur[name] || cur[name].type !== 'folder') {
      cur[name] = { type: 'folder', children: {} };
    }
    cur = cur[name].children;
  }
  cur[parts[parts.length - 1]] = node;
}

export function deleteNodeAtPath(tree, path) {
  const parts = path.split('/').filter(Boolean);
  let cur = tree;
  for (let i = 0; i < parts.length - 1; i++) {
    const name = parts[i];
    if (!cur[name] || cur[name].type !== 'folder') return false;
    cur = cur[name].children;
  }
  const name = parts[parts.length - 1];
  if (cur[name] === undefined) return false;
  delete cur[name];
  return true;
}

export function dirname(path) {
  const i = path.lastIndexOf('/');
  return i === -1 ? '' : path.slice(0, i);
}

export function basename(path) {
  const i = path.lastIndexOf('/');
  return i === -1 ? path : path.slice(i + 1);
}
