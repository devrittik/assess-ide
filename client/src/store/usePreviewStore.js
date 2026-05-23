import { create } from 'zustand';

export const usePreviewStore = create((set) => ({
  url: null,
  port: null,
  status: 'idle',
  message: '',
  visible: true, // preview panel visibility (toggled from toolbar)
  setStatus(status, message = '') { set({ status, message }); },
  setUrl(url, port) { set({ url, port, status: 'ready', message: '' }); },
  toggleVisible() { set((s) => ({ visible: !s.visible })); },
  reset() { set({ url: null, port: null, status: 'idle', message: '' }); },
}));
