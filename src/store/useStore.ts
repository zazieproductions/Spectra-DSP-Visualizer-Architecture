import { create } from 'zustand';

export type VisualizerMode = 'CUBE' | 'HELIX' | 'TERRAIN' | 'RINGS';

export interface NodeData {
  id: string;
  type: 'SYNTH' | 'LFO' | 'FILTER' | 'DELAY' | 'OUT';
  x: number;
  y: number;
  params: Record<string, number>;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'AUDIO' | 'CV';
}

interface AppState {
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;
  nodes: NodeData[];
  updateNodePos: (id: string, x: number, y: number) => void;
  connections: Connection[];
  addConnection: (conn: Connection) => void;
  removeConnection: (id: string) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  consoleActive: boolean;
  setConsoleActive: (active: boolean) => void;
  cpuLoad: number;
  setCpuLoad: (load: number) => void;
}

export const useStore = create<AppState>((set) => ({
  visualizerMode: 'CUBE',
  setVisualizerMode: (mode) => set({ visualizerMode: mode }),
  nodes: [
    { id: 'synth_1', type: 'SYNTH', x: 100, y: 100, params: { freq: 440, wave: 0 } as Record<string, number> },
    { id: 'filter_1', type: 'FILTER', x: 300, y: 150, params: { cutoff: 1000, res: 1 } as Record<string, number> },
    { id: 'delay_1', type: 'DELAY', x: 500, y: 100, params: { time: 0.3, feedback: 0.4 } as Record<string, number> },
    { id: 'out_1', type: 'OUT', x: 700, y: 200, params: { gain: 0.8 } as Record<string, number> },
  ],
  updateNodePos: (id, x, y) => set((state) => ({
    nodes: state.nodes.map(n => n.id === id ? { ...n, x, y } : n)
  })),
  connections: [
    { id: 'c1', from: 'synth_1', to: 'filter_1', type: 'AUDIO' },
    { id: 'c2', from: 'filter_1', to: 'delay_1', type: 'AUDIO' },
    { id: 'c3', from: 'delay_1', to: 'out_1', type: 'AUDIO' },
  ],
  addConnection: (conn) => set((state) => ({ connections: [...state.connections, conn] })),
  removeConnection: (id) => set((state) => ({ connections: state.connections.filter(c => c.id !== id) })),
  isPlaying: false,
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  consoleActive: false,
  setConsoleActive: (active) => set({ consoleActive: active }),
  cpuLoad: 12.4,
  setCpuLoad: (load) => set({ cpuLoad: load }),
}));
