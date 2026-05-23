import { create } from 'zustand';

let nextId = 1;

export const useTerminalStore = create((set, get) => ({
  terminals: [{ id: 1, name: 'bash', write: null, ready: false }],
  activeTerminalId: 1,
  write: null, // compat: write to active terminal
  visible: true, // terminal panel visibility (toggled from toolbar)

  setWrite(fn, id) {
    const tid = id || get().activeTerminalId;
    set((s) => ({
      terminals: s.terminals.map((t) =>
        t.id === tid ? { ...t, write: fn, ready: !!fn } : t
      ),
      write: tid === s.activeTerminalId ? fn : s.write,
    }));
  },

  addTerminal() {
    const id = ++nextId;
    set((s) => ({
      terminals: [...s.terminals, { id, name: `bash ${id}`, write: null, ready: false }],
      activeTerminalId: id,
      write: null,
    }));
    return id;
  },

  removeTerminal(id) {
    const { terminals, activeTerminalId } = get();
    if (terminals.length === 1) return;
    const remaining = terminals.filter((t) => t.id !== id);
    const newActive = activeTerminalId === id ? remaining[remaining.length - 1].id : activeTerminalId;
    const newWrite = remaining.find((t) => t.id === newActive)?.write || null;
    set({ terminals: remaining, activeTerminalId: newActive, write: newWrite });
  },

  setActiveTerminal(id) {
    const term = get().terminals.find((t) => t.id === id);
    set({ activeTerminalId: id, write: term?.write || null });
  },

  toggleVisible() { set((s) => ({ visible: !s.visible })); },
}));
