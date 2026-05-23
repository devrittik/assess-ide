const map = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  json: 'json',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  md: 'markdown',
  markdown: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  py: 'python',
  sh: 'shell',
  txt: 'plaintext',
  svg: 'xml',
  xml: 'xml',
};

export function getLanguage(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase();
  return map[ext] || 'plaintext';
}
