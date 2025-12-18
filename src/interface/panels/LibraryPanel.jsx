import React from 'react';
import { Package, Shield, Scissors, Disc } from 'lucide-react';
import useSceneStore from '../../app/store/useSceneStore';

export default function LibraryPanel() {
  const { addObject } = useSceneStore();

  // Lista de itens disponíveis (Simulando um banco de dados de assets)
  const items = [
    { id: 'pocket_tactical', name: 'Bolso Tático', type: 'box', icon: Package },
    { id: 'patch_logo', name: 'Patch Logo', type: 'plane', icon: Shield },
    { id: 'zipper_metal', name: 'Zíper Metal', type: 'cylinder', icon: Scissors },
    { id: 'button_round', name: 'Botão Redondo', type: 'sphere', icon: Disc },
  ];

  const handleAddItem = (item) => {
    // Adiciona o objeto na frente do manequim (altura do peito aproximadamente)
    addObject({
      name: item.name,
      type: item.type, // box, sphere, etc. (Na Fase 4 usaremos GLBs reais)
      position: [0, 1.3, 0.3], // Levemente à frente do peito (Z=0.3)
      scale: [0.1, 0.1, 0.1],
      rotation: [0, 0, 0]
    });
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">
        Biblioteca de Assets
      </h3>
      
      <div className="grid grid-cols-2 gap-2 px-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleAddItem(item)}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-all">
              <item.icon size={20} />
            </div>
            <span className="text-[10px] font-bold text-gray-300 group-hover:text-white uppercase">
              {item.name}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <p className="text-[9px] text-gray-600 text-center">
          Dica: Clique no botão para adicionar. Use as setas coloridas (Gizmo) no modelo para posicionar.
        </p>
      </div>
    </div>
  );
}
