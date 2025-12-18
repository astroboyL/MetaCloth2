import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { 
  Box, ChevronDown, ChevronRight, Search, Settings, 
  Save, Download, Users, Shirt, Scissors, PaintBucket,
  MoreHorizontal, Plus, Trash2, Eye, Grid3X3, Layers,
  Move, Maximize, Rotate3d, Database
} from 'lucide-react';
import { HexColorPicker } from "react-colorful";

import useAppStore from './app/store/useAppStore';
import useSceneStore from './app/store/useSceneStore';
import MainScene from './scene/MainScene';

// --- COMPONENTES VISUAIS ESTILO UNREAL ENGINE 5 ---

// 1. HEADER (Menu Superior)
const UE5Header = () => {
  const { activeTool, setActiveTool } = useAppStore();
  const { requestExport } = useSceneStore();

  const modes = [
    { id: 'select', label: 'SELECTION', icon: Move },
    { id: 'sculpt', label: 'SCULPTING', icon: Scissors },
    { id: 'paint', label: 'TEXTURING', icon: PaintBucket },
  ];

  return (
    <div className="h-12 bg-[#111111] border-b border-[#333] flex items-center justify-between px-4 select-none">
      {/* Logo e Menu Arquivo */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0070e0] rounded-full flex items-center justify-center font-bold text-white italic text-xs">u</div>
          <span className="font-bold text-gray-200 tracking-wide text-sm">MetaCloth <span className="text-[#0070e0]">EDITOR</span></span>
        </div>
        
        <div className="flex items-center gap-4 text-[11px] text-gray-400 font-medium">
          <span className="hover:text-white cursor-pointer">File</span>
          <span className="hover:text-white cursor-pointer">Edit</span>
          <span className="hover:text-white cursor-pointer">Window</span>
          <span className="hover:text-white cursor-pointer">Tools</span>
          <span className="hover:text-white cursor-pointer">Help</span>
        </div>
      </div>

      {/* Abas de Modo Central (Style MetaHuman) */}
      <div className="flex bg-[#0a0a0a] rounded p-1 border border-[#333]">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveTool(mode.id)}
            className={`
              flex items-center gap-2 px-6 py-1.5 rounded text-[10px] font-bold tracking-wider transition-all
              ${activeTool === mode.id 
                ? 'bg-[#333] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}
            `}
          >
            <mode.icon size={12} />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Ações Direita */}
      <div className="flex items-center gap-3">
        <button onClick={requestExport} className="bg-[#0070e0] hover:bg-[#005bb5] text-white px-4 py-1.5 rounded text-[11px] font-bold flex items-center gap-2 transition-colors">
          <Save size={12}/> SAVE ASSET
        </button>
        <div className="w-8 h-8 bg-[#222] rounded-full flex items-center justify-center border border-[#444]">
           <Settings size={14} className="text-gray-400"/>
        </div>
      </div>
    </div>
  );
};

// 2. SIDEBAR ESQUERDA (Asset Browser / Presets)
const UE5AssetBrowser = () => {
  const { addObject } = useSceneStore();
  const [category, setCategory] = useState('tops');

  // Simulando categorias do MetaHuman
  const categories = [
    { id: 'tops', label: 'Tops / Shirts', icon: Shirt },
    { id: 'bottoms', label: 'Bottoms', icon: Layers },
    { id: 'shoes', label: 'Shoes', icon: Box },
    { id: 'body', label: 'Body Type', icon: Users },
  ];

  // Presets visuais (Mockup)
  const presets = [
    { id: 'box', name: 'Basic Cube', type: 'box', thumb: 'bg-gray-700' },
    { id: 'sphere', name: 'Sphere Base', type: 'sphere', thumb: 'bg-gray-600 rounded-full' },
    { id: 'cylinder', name: 'Cylinder', type: 'cylinder', thumb: 'bg-gray-500 mx-auto w-1/2 h-full' },
    { id: 'plane', name: 'Fabric Plane', type: 'plane', thumb: 'bg-gray-400 h-2 mt-6' },
    { id: 'tshirt', name: 'T-Shirt Base', type: 'box', thumb: 'bg-blue-900/40 border border-blue-500/30' }, // Simulado
    { id: 'hoodie', name: 'Hoodie', type: 'sphere', thumb: 'bg-red-900/40 border border-red-500/30' },
  ];

  return (
    <div className="w-72 bg-[#151515] border-r border-[#222] flex flex-col h-full">
      {/* Título da Aba */}
      <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-3 justify-between">
        <span className="text-[11px] font-bold text-gray-300 flex items-center gap-2">
           <Database size={12} className="text-[#0070e0]"/> CONTENT BROWSER
        </span>
        <MoreHorizontal size={12} className="text-gray-500"/>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Barra de Categorias Vertical */}
        <div className="w-12 bg-[#0f0f0f] border-r border-[#222] flex flex-col items-center py-2 gap-2">
           {categories.map(cat => (
             <button 
               key={cat.id} 
               onClick={() => setCategory(cat.id)}
               className={`p-2 rounded hover:bg-[#333] transition-colors relative group ${category === cat.id ? 'text-[#0070e0]' : 'text-gray-500'}`}
             >
               <cat.icon size={18}/>
               {category === cat.id && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#0070e0]"></div>}
             </button>
           ))}
        </div>

        {/* Grid de Assets */}
        <div className="flex-1 flex flex-col bg-[#151515]">
           <div className="p-2 border-b border-[#222]">
              <div className="bg-[#0a0a0a] border border-[#333] rounded flex items-center px-2 py-1 gap-2">
                 <Search size={12} className="text-gray-500"/>
                 <input type="text" placeholder="Search Assets..." className="bg-transparent border-none outline-none text-[10px] text-gray-300 w-full placeholder-gray-600"/>
              </div>
           </div>

           <div className="p-3 grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar">
              <div className="col-span-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">
                 {categories.find(c => c.id === category)?.label}
              </div>
              
              {presets.map(item => (
                <div 
                  key={item.id}
                  onClick={() => addObject({ type: item.type, name: item.name })}
                  className="aspect-square bg-[#1a1a1a] border border-[#333] rounded hover:border-[#0070e0] hover:bg-[#222] cursor-pointer transition-all group flex flex-col relative overflow-hidden"
                >
                   {/* Thumbnail Fake */}
                   <div className="flex-1 p-4 flex items-center justify-center relative">
                      <div className={`w-full h-full ${item.thumb} shadow-2xl group-hover:scale-105 transition-transform`}></div>
                      <Plus size={16} className="absolute text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-0.5"/>
                   </div>
                   {/* Label */}
                   <div className="h-6 bg-[#0f0f0f] flex items-center px-2 border-t border-[#222]">
                      <span className="text-[10px] text-gray-400 truncate group-hover:text-white">{item.name}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// 3. RIGHT SIDEBAR (Details Panel / Outliner)
const UE5DetailsPanel = () => {
  const { objects, selectedObjectId, selectObject, removeObject, transformMode, setTransformMode } = useSceneStore();
  const { sculptSettings, setSculptSetting, paintSettings, setPaintSetting, activeTool } = useAppStore();
  
  const selectedObj = objects.find(o => o.id === selectedObjectId);

  return (
    <div className="w-80 bg-[#151515] border-l border-[#222] flex flex-col h-full text-[11px] text-gray-300">
      
      {/* Título: Outliner */}
      <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-3 justify-between">
        <span className="font-bold flex items-center gap-2">
           <Layers size={12} className="text-[#0070e0]"/> OUTLINER
        </span>
      </div>

      {/* Lista de Objetos (Compacta) */}
      <div className="h-1/3 overflow-y-auto border-b border-[#222] bg-[#0f0f0f]">
         {objects.map(obj => (
            <div 
              key={obj.id} 
              onClick={() => selectObject(obj.id)}
              className={`flex items-center px-2 py-1 gap-2 cursor-pointer border-l-2 ${selectedObjectId === obj.id ? 'bg-[#0070e0]/20 border-[#0070e0] text-white' : 'border-transparent hover:bg-[#222] text-gray-400'}`}
            >
               <Box size={12}/>
               <span className="flex-1 truncate">{obj.name}</span>
               <div className="flex gap-1 opacity-0 hover:opacity-100">
                 <Eye size={10} className="hover:text-white"/>
                 <Trash2 size={10} className="hover:text-red-500" onClick={(e) => {e.stopPropagation(); removeObject(obj.id)}}/>
               </div>
            </div>
         ))}
      </div>

      {/* Título: Details */}
      <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-3 justify-between">
        <span className="font-bold flex items-center gap-2">
           <Grid3X3 size={12} className="text-[#0070e0]"/> DETAILS
        </span>
      </div>

      {/* Propriedades Dinâmicas */}
      <div className="flex-1 overflow-y-auto p-1 bg-[#151515]">
         {selectedObj ? (
           <div className="space-y-1">
             
             {/* Transform Section */}
             <div className="bg-[#1a1a1a] border border-[#222] rounded overflow-hidden">
                <div className="bg-[#222] px-2 py-1 flex items-center gap-1 font-bold text-gray-400 border-b border-[#333]">
                   <ChevronDown size={10}/> <span className="uppercase">Transform</span>
                </div>
                <div className="p-2 space-y-2">
                   {/* Botões de Modo */}
                   <div className="flex bg-[#0f0f0f] rounded p-0.5 mb-2">
                      {[{id:'translate', icon:Move}, {id:'rotate', icon:Rotate3d}, {id:'scale', icon:Maximize}].map(m => (
                        <button 
                          key={m.id} 
                          onClick={() => setTransformMode(m.id)}
                          className={`flex-1 flex justify-center py-1 rounded hover:bg-[#333] ${transformMode === m.id ? 'bg-[#333] text-[#0070e0]' : 'text-gray-500'}`}
                        >
                          <m.icon size={12}/>
                        </button>
                      ))}
                   </div>
                   
                   {['Location', 'Rotation', 'Scale'].map(label => (
                     <div key={label} className="grid grid-cols-[60px_1fr_1fr_1fr] gap-1 items-center">
                        <span className="text-gray-500">{label}</span>
                        <input disabled value="0.0" className="bg-[#0f0f0f] border border-[#333] rounded px-1 text-right text-gray-300"/>
                        <input disabled value="0.0" className="bg-[#0f0f0f] border border-[#333] rounded px-1 text-right text-gray-300"/>
                        <input disabled value="0.0" className="bg-[#0f0f0f] border border-[#333] rounded px-1 text-right text-gray-300"/>
                     </div>
                   ))}
                </div>
             </div>

             {/* Dynamic Tool Settings (Contextual) */}
             {activeTool === 'sculpt' && (
                <div className="bg-[#1a1a1a] border border-[#222] rounded overflow-hidden mt-2">
                  <div className="bg-[#222] px-2 py-1 flex items-center gap-1 font-bold text-orange-400 border-b border-[#333]">
                    <ChevronDown size={10}/> <span className="uppercase">Sculpt Settings</span>
                  </div>
                  <div className="p-2 space-y-3">
                     <div>
                       <div className="flex justify-between mb-1"><span>Radius</span> <span className="text-gray-500">{sculptSettings.radius.toFixed(2)}</span></div>
                       <input type="range" min="0.1" max="1" step="0.01" value={sculptSettings.radius} onChange={(e) => setSculptSetting('radius', parseFloat(e.target.value))} className="w-full accent-[#0070e0] h-1 bg-[#333] rounded-full appearance-none"/>
                     </div>
                     <div>
                       <div className="flex justify-between mb-1"><span>Strength</span> <span className="text-gray-500">{sculptSettings.intensity.toFixed(2)}</span></div>
                       <input type="range" min="0.1" max="1" step="0.01" value={sculptSettings.intensity} onChange={(e) => setSculptSetting('intensity', parseFloat(e.target.value))} className="w-full accent-[#0070e0] h-1 bg-[#333] rounded-full appearance-none"/>
                     </div>
                  </div>
                </div>
             )}

            {activeTool === 'paint' && (
                <div className="bg-[#1a1a1a] border border-[#222] rounded overflow-hidden mt-2">
                  <div className="bg-[#222] px-2 py-1 flex items-center gap-1 font-bold text-purple-400 border-b border-[#333]">
                    <ChevronDown size={10}/> <span className="uppercase">Material Settings</span>
                  </div>
                  <div className="p-2 space-y-3">
                     <div>
                       <div className="flex justify-between mb-1"><span>Brush Size</span> <span className="text-gray-500">{paintSettings.brushSize}px</span></div>
                       <input type="range" min="1" max="100" value={paintSettings.brushSize} onChange={(e) => setPaintSetting('brushSize', parseInt(e.target.value))} className="w-full accent-[#0070e0] h-1 bg-[#333] rounded-full appearance-none"/>
                     </div>
                     <div className="flex flex-col gap-2">
                        <span>Albedo Color</span>
                        <HexColorPicker color={paintSettings.color} onChange={(c) => setPaintSetting('color', c)} style={{width: '100%', height: '100px'}}/>
                     </div>
                  </div>
                </div>
             )}

           </div>
         ) : (
           <div className="p-4 text-center text-gray-600 italic">
              Select an asset to view details.
           </div>
         )}
      </div>
    </div>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-[#111] text-[#e0e0e0] font-sans select-none overflow-hidden">
      <UE5Header />
      <div className="flex flex-1 overflow-hidden relative">
        <UE5AssetBrowser />
        
        <main className="flex-1 relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
          <Canvas shadows camera={{ position: [2, 2, 4], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
              <Suspense fallback={null}><MainScene /></Suspense>
          </Canvas>
          <Loader />
          
          {/* Overlay de Informação UE5 */}
          <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono">
             PERSPECTIVE <span className="text-gray-700">|</span> LIT <span className="text-gray-700">|</span> SHOW
          </div>
          <div className="absolute bottom-2 right-2 text-[10px] text-gray-600">
             GRID: 10cm
          </div>
        </main>

        <UE5DetailsPanel />
      </div>
    </div>
  );
}