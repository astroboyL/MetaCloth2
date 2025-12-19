import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';

const useSceneStore = create(
  temporal(
    immer((set) => ({
      // --- PADRÃO AGORA É MALE (XBOT) ---
      mannequin: { type: 'male', isVisible: true, animation: { current: 'Idle', isPlaying: true, speed: 1.0 } },
      
      transformMode: 'translate',
      isAltPressed: false,
      physics: { isEnabled: false, gravity: -9.8, wind: 0 },
      exportRequested: false,
      objects: [], 
      selectedObjectId: null,

      // ACTIONS
      setMannequinType: (type) => set((state) => { 
        if(state.mannequin) state.mannequin.type = type; 
      }),
      
      toggleAnimation: () => set((state) => { 
        if(state.mannequin?.animation) state.mannequin.animation.isPlaying = !state.mannequin.animation.isPlaying; 
      }),

      setTransformMode: (mode) => set((state) => { state.transformMode = mode; }),
      setIsAltPressed: (pressed) => set((state) => { state.isAltPressed = pressed; }),
      togglePhysics: () => set((state) => { state.physics.isEnabled = !state.physics.isEnabled; }),
      
      requestExport: () => set((state) => { state.exportRequested = true; }),
      finishExport: () => set((state) => { state.exportRequested = false; }),

      addObject: (objData) => set((state) => {
        const newObj = {
          id: uuidv4(),
          name: objData.name || 'New Asset',
          position: [0, 1, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          type: objData.type || 'box',
          blendWeights: objData.blendWeights || null,
          color: '#888888',
          ...objData
        };
        state.objects.push(newObj);
        state.selectedObjectId = newObj.id;
      }),

      updateObject: (id, changes) => set((state) => {
        const index = state.objects.findIndex(o => o.id === id);
        if (index !== -1) {
          state.objects[index] = { ...state.objects[index], ...changes };
        }
      }),

      selectObject: (id) => set((state) => { state.selectedObjectId = id; }),
      removeObject: (id) => set((state) => {
        state.objects = state.objects.filter(o => o.id !== id);
        if (state.selectedObjectId === id) state.selectedObjectId = null;
      }),
    })),
    {
      limit: 30,
      partialize: (state) => ({ objects: state.objects }), 
    }
  )
);

export default useSceneStore;