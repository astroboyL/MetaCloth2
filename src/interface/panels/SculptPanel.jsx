import React from 'react';
import { Circle, Zap, MousePointer2 } from 'lucide-react';
import useAppStore from '../../app/store/useAppStore';

export default function SculptPanel() {
  const { sculptSettings, setSculptSetting, activeTool, setActiveTool } = useAppStore();

  return (
    <div className="h-full flex flex-col p-4 space-y-6">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        Ferramentas de Malha
      </h3>

      {/* Seletor de Modo */}
      <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
        <button 
          onClick={() => setActiveTool('select')}
          className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${
            activeTool === 'select' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MousePointer2 size={14} /> Mover
        </button>
        <button 
          onClick={() => setActiveTool('sculpt')}
          className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${
            activeTool === 'sculpt' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap size={14} /> Esculpir
        </button>
      </div>

      {/* Controles do Pincel (Só aparecem se estiver no modo Sculpt) */}
      {activeTool === 'sculpt' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          
          {/* Tamanho */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
              <span>Raio de Ação</span>
              <span className="text-orange-500">{sculptSettings.radius.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.1" max="1.0" step="0.05"
              value={sculptSettings.radius}
              onChange={(e) => setSculptSetting('radius', parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-600"
            />
          </div>

          {/* Intensidade */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
              <span>Intensidade</span>
              <span className="text-orange-500">{sculptSettings.intensity.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.1" max="1.0" step="0.05"
              value={sculptSettings.intensity}
              onChange={(e) => setSculptSetting('intensity', parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-600"
            />
          </div>

          <div className="p-3 bg-orange-900/20 border border-orange-500/20 rounded-lg">
            <p className="text-[9px] text-orange-200 leading-relaxed">
              <strong className="block mb-1 text-orange-400">COMO USAR:</strong>
              Clique e arraste sobre o objeto para puxar os vértices. Use isso para ajustar roupas ao corpo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
