import React from 'react';
import { HexColorPicker } from "react-colorful";
import { Brush, Palette } from 'lucide-react';
import useAppStore from '../../app/store/useAppStore';

export default function PaintPanel() {
  const { paintSettings, setPaintSetting, activeTool, setActiveTool } = useAppStore();

  const togglePaint = () => {
    if (activeTool === 'paint') {
      setActiveTool('select'); // Desliga
    } else {
      setActiveTool('paint'); // Liga
    }
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-6">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        Estúdio de Pintura
      </h3>

      <button 
        onClick={togglePaint}
        className={`w-full py-3 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${
          activeTool === 'paint' 
            ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }`}
      >
        <Brush size={14} /> 
        {activeTool === 'paint' ? 'Modo Pintura ATIVO' : 'Ativar Pincel'}
      </button>

      {activeTool === 'paint' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
              <Palette size={12} /> Cor Base
            </div>
            <div className="custom-color-picker">
              <HexColorPicker 
                color={paintSettings.color} 
                onChange={(color) => setPaintSetting('color', color)} 
                style={{ width: '100%', height: '150px', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
              <span>Tamanho</span>
              <span className="text-purple-400">{paintSettings.brushSize}px</span>
            </div>
            <input 
              type="range" min="1" max="100" step="1"
              value={paintSettings.brushSize}
              onChange={(e) => setPaintSetting('brushSize', parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-purple-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
              <span>Opacidade</span>
              <span className="text-purple-400">{(paintSettings.opacity * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" min="0.1" max="1" step="0.1"
              value={paintSettings.opacity}
              onChange={(e) => setPaintSetting('opacity', parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-purple-500"
            />
          </div>
          
          <div className="p-3 bg-white/5 rounded text-[9px] text-gray-400 text-center">
             Segure <strong>ALT</strong> para girar a câmera enquanto pinta.
          </div>
        </div>
      )}
    </div>
  );
}