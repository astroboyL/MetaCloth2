import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useAppStore = create(
  immer((set) => ({
    // --- ESTADO GERAL ---
    activeTab: 'bases', // 'bases', 'sculpt', 'paint', 'attachments'
    activeTool: 'select', // 'select', 'sculpt', 'paint'
    
    // --- CONFIGURAÇÃO DO SCULPT ---
    sculptSettings: {
      radius: 0.3,
      intensity: 0.5,
      mode: 'pull'
    },

    // --- CONFIGURAÇÃO DA PINTURA (NOVO) ---
    paintSettings: {
      color: '#ff0000', // Cor inicial vermelha
      brushSize: 10,    // Tamanho em pixels (no canvas de textura)
      opacity: 1.0,
      brushHardness: 0.5
    },

    // --- ACTIONS ---
    setActiveTab: (tabId) => set((state) => { state.activeTab = tabId; }),
    
    setActiveTool: (tool) => set((state) => { state.activeTool = tool; }),
    
    setSculptSetting: (key, value) => set((state) => {
      state.sculptSettings[key] = value;
    }),

    // Action para mudar configurações de pintura
    setPaintSetting: (key, value) => set((state) => {
      state.paintSettings[key] = value;
    })
  }))
);

export default useAppStore;
