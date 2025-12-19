import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader, OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei';
import { 
  Move, Scissors, PaintBucket, Save, Circle, Undo, RotateCcw, 
  Zap, User, Plus, Play, Pause, Brush, Palette, Layers, Droplet, 
  Eye, MousePointer2, Maximize, Rotate3d
} from 'lucide-react';
import { HexColorPicker } from "react-colorful";

// --- IMPORTS DAS SUAS STORES E COMPONENTES ---
import useAppStore from './app/store/useAppStore';
import useSceneStore from './app/store/useSceneStore';
import Attachment from './components/canvas/Attachment';
import MannequinManager from './components/canvas/mannequin/MannequinManager';

// ==========================================
// 1. CENA PRINCIPAL (MAIN SCENE)
// ==========================================
const MainScene = ({ gender, physicsEnabled, isPlaying }) => {
  const { objects, selectedObjectId, selectObject, updateObject, isAltPressed } = useSceneStore();
  const { activeTool } = useAppStore();

  const cameraEnabled = activeTool === 'select' || isAltPressed;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <spotLight position={[-5, 5, 2]} intensity={0.8} color="#ffffff" /> 
      <Environment preset="city" blur={1} />
      
      <Grid infiniteGrid fadeDistance={40} sectionColor="#444" cellColor="#222" />
      
      <MannequinManager type={gender} isPlaying={isPlaying} />

      {objects.map((obj) => (
        <Attachment
          key={obj.id}
          {...obj}
          isSelected={obj.id === selectedObjectId}
          onSelect={selectObject}
          onGizmoChange={(id, newData) => updateObject(id, newData)}
        />
      ))}

      {physicsEnabled && (
        <mesh position={[0, 2.2, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}

      <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
      
      <OrbitControls 
        makeDefault 
        enabled={cameraEnabled} 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 1.8} 
        target={[0, 1, 0]} 
      />
    </>
  );
};

// ==========================================
// 2. HEADER (COM LOGO "METAHUMAN STYLE")
// ==========================================
const UE5Header = () => {
  const { activeTool, setActiveTool } = useAppStore();
  const { mannequin, physics, togglePhysics, requestExport, toggleAnimation } = useSceneStore();
  const { undo, redo } = useSceneStore.temporal.getState();

  const isPlaying = mannequin?.animation?.isPlaying ?? true;

  const modes = [
    { id: 'select', label: 'SELECT', icon: Move },
    { id: 'sculpt', label: 'SCULPT', icon: Scissors },
    { id: 'paint', label: 'PAINT', icon: PaintBucket },
  ];

  return (
    <div className="h-14 bg-[#111111] border-b border-[#333] flex items-center justify-between px-6 select-none z-50 shadow-md">
      
      {/* --- ÁREA DO LOGO (ATUALIZADA) --- */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          {/* Ícone Estilo Unreal/MetaHuman */}
          <div className="w-8 h-8 bg-gradient-to-br from-[#0070e0] to-[#004790] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,112,224,0.4)] border border-[#ffffff20]">
            <span className="font-bold text-white italic text-sm pr-0.5" style={{ fontFamily: 'serif' }}>M</span>
          </div>
          {/* Texto Estilo MetaHuman Creator */}
          <div className="flex flex-col justify-center leading-none">
            <span className="font-bold text-gray-100 tracking-wider text-sm">METACLOTH</span>
            <span className="text-[9px] text-[#0070e0] font-bold tracking-[0.25em] uppercase">Creator</span>
          </div>
        </div>
        
        {/* Undo/Redo Separados */}
        <div className="flex items-center gap-1 border-l border-[#333] pl-6">
            <button onClick={() => undo()} className="p-2 hover:bg-[#333] rounded-md text-gray-400 hover:text-white transition-colors" title="Undo (Ctrl+Z)"><Undo size={16} /></button>
            <button onClick={() => redo()} className="p-2 hover:bg-[#333] rounded-md text-gray-400 hover:text-white transition-colors" title="Redo"><RotateCcw size={16} className="scale-x-[-1]" /></button>
        </div>
      </div>

      {/* --- FERRAMENTAS CENTRAIS --- */}
      <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-[#333] shadow-inner">
        {modes.map(mode => (
          <button 
            key={mode.id} 
            onClick={() => setActiveTool(mode.id)} 
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-[10px] font-bold tracking-wider transition-all 
            ${activeTool === mode.id ? 'bg-[#333] text-white shadow-sm border border-[#444]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a]'}`}
          >
            <mode.icon size={14} /> {mode.label}
          </button>
        ))}
      </div>

      {/* --- AÇÕES À DIREITA --- */}
      <div className="flex items-center gap-4">
         <button 
            onClick={toggleAnimation} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold border border-[#333] transition-all
            ${isPlaying ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-[#222] text-gray-400'}`}
         >
            {isPlaying ? <Pause size={12}/> : <Play size={12}/>}
            {isPlaying ? 'ANIM: ON' : 'ANIM: OFF'}
        </button>

        <button 
            onClick={togglePhysics} 
            className={`p-2 rounded border border-[#333] transition-all 
            ${physics.isEnabled ? 'bg-yellow-600/20 text-yellow-400 border-yellow-600 shadow-[0_0_8px_rgba(234,179,8,0.2)]' : 'bg-[#222] text-gray-500 hover:text-gray-300'}`}
            title="Physics Simulation"
        >
            <Zap size={16} className={physics.isEnabled ? "fill-current" : ""} />
        </button>

        <button onClick={requestExport} className="bg-[#0070e0] hover:bg-[#005bb5] text-white px-5 py-2 rounded text-[11px] font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
          <Save size={14}/> EXPORT
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. PAINEL ESQUERDO (BLEND)
// ==========================================
const LeftPanelBlend = () => {
  const { addObject } = useSceneStore();
  const [slots, setSlots] = useState({ top: null, left: null, right: null });
  const [weights, setWeights] = useState({ top: 0, left: 0, right: 0 }); 
  const [puckPos, setPuckPos] = useState({ x: 0, y: 0 });
  const [isDraggingPuck, setIsDraggingPuck] = useState(false);
  const blendAreaRef = useRef(null);

  const presets = [
      { id: 'fit', name: 'Fit Slim', type: 'box' }, 
      { id: 'over', name: 'Oversized', type: 'sphere' }, 
      { id: 'ath', name: 'Athletic', type: 'cylinder' }, 
      { id: 'cas', name: 'Casual', type: 'plane' }
  ];

  const handleDragStart = (e, preset) => { 
      e.dataTransfer.setData("presetId", preset.id); 
      e.dataTransfer.setData("presetName", preset.name); 
      e.dataTransfer.setData("presetType", preset.type); 
  };
  const handleDropSlot = (e, position) => { 
      e.preventDefault(); 
      const id = e.dataTransfer.getData("presetId"); 
      const name = e.dataTransfer.getData("presetName"); 
      const type = e.dataTransfer.getData("presetType");
      if(id) setSlots(prev => ({ ...prev, [position]: { id, name, type } })); 
  };
  const handleMouseDown = () => setIsDraggingPuck(true);

  const distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingPuck || !blendAreaRef.current) return;
      const rect = blendAreaRef.current.getBoundingClientRect();
      const centerX = rect.width / 2; const centerY = rect.height / 2; 
      let x = e.clientX - rect.left - centerX; let y = e.clientY - rect.top - centerY;
      const radius = 60; const dist = Math.sqrt(x*x + y*y);
      if (dist > radius) { x = (x / dist) * radius; y = (y / dist) * radius; }
      setPuckPos({ x, y });
      
      const maxDist = radius * 2;
      const dTop = distance(x, y, 0, -radius); 
      const dLeft = distance(x, y, -radius * 0.86, radius * 0.5); 
      const dRight = distance(x, y, radius * 0.86, radius * 0.5);
      
      const total = (Math.max(0, 1 - (dTop/maxDist)) + Math.max(0, 1 - (dLeft/maxDist)) + Math.max(0, 1 - (dRight/maxDist))) || 1;
      setWeights({ 
          top: Math.round((Math.max(0, 1 - (dTop/maxDist)) / total) * 100), 
          left: Math.round((Math.max(0, 1 - (dLeft/maxDist)) / total) * 100), 
          right: Math.round((Math.max(0, 1 - (dRight/maxDist)) / total) * 100) 
      });
    };
    const handleMouseUp = () => setIsDraggingPuck(false);
    if (isDraggingPuck) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDraggingPuck]);

  const handleGenerate = () => {
    let dominantType = 'box';
    if(slots.top && weights.top > 40) dominantType = slots.top.type;
    else if(slots.left && weights.left > 40) dominantType = slots.left.type;
    else if(slots.right && weights.right > 40) dominantType = slots.right.type;
    else if(slots.top) dominantType = slots.top.type;

    addObject({ 
        name: `Blend ${dominantType}`, 
        type: dominantType, 
        blendWeights: { ...weights },
        position: [0, 1, 0.5] 
    });
  };

  return (
    <div className="w-80 bg-[#151515] border-r border-[#222] flex flex-col h-full text-gray-300 select-none z-10">
      <div className="flex border-b border-[#222] bg-[#1a1a1a] p-3 gap-1 items-center justify-center shadow-sm">
         <span className="text-[11px] font-bold text-[#0070e0] flex items-center gap-2 tracking-widest"><Circle size={10} className="fill-current"/> BLEND MANAGER</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 relative select-none shadow-lg">
           <div className="h-64 relative flex justify-center mt-4" ref={blendAreaRef}>
              <div className="absolute top-8 w-48 h-48 rounded-full border-4 border-t-white/10 border-x-white/10 border-b-transparent pointer-events-none"></div>
              {['top', 'left', 'right'].map(pos => (
                 <div key={pos} className={`absolute ${pos === 'top' ? 'top-0' : 'bottom-4'} ${pos === 'left' ? 'left-2' : pos === 'right' ? 'right-2' : ''} flex flex-col items-center gap-1`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDropSlot(e, pos)}>
                    <div className={`w-20 h-24 bg-[#0f0f0f] border ${slots[pos] ? 'border-[#0070e0] bg-[#0070e0]/10' : 'border-[#444]'} rounded hover:border-white flex flex-col items-center justify-center transition-colors border-dashed`}>
                       {slots[pos] ? <span className="text-[9px] text-white font-bold">{slots[pos].name}</span> : <span className="text-[9px] text-gray-600 font-medium">Drop Asset</span>}
                    </div>
                 </div>
              ))}
              <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] cursor-move hover:scale-110 transition-transform z-10" style={{ transform: `translate(calc(-50% + ${puckPos.x}px), calc(-25% + ${puckPos.y}px))` }} onMouseDown={handleMouseDown}></div>
           </div>
           
           <div className="mt-4 px-2 pb-2">
               <button onClick={handleGenerate} className="w-full bg-[#0070e0] hover:bg-[#005bb5] text-white py-2.5 rounded text-[11px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
                 <Plus size={14} /> GENERATE MESH
               </button>
           </div>
        </div>

        <div>
           <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Asset Library</div>
           <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                 <div key={p.id} className="bg-[#0f0f0f] border border-[#333] rounded p-3 cursor-pointer hover:border-[#0070e0] hover:bg-[#1a1a1a] transition-all group" draggable onDragStart={(e) => handleDragStart(e, p)}>
                    <div className="h-10 bg-[#222] rounded mb-2 w-full group-hover:bg-[#333] transition-colors"></div>
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">{p.name}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. PAINEL DIREITO (PAINT / PROPERTIES)
// ==========================================
const RightPanel = () => {
  const { activeTool, paintSettings, setPaintSetting } = useAppStore();
  const { transformMode, setTransformMode, selectedObjectId } = useSceneStore();
  
  const [brushSize, setBrushSize] = useState(paintSettings.brushSize);
  const [opacity, setOpacity] = useState(paintSettings.opacity);
  const [color, setColor] = useState(paintSettings.color);

  useEffect(() => { setPaintSetting('brushSize', brushSize); }, [brushSize]);
  useEffect(() => { setPaintSetting('opacity', opacity); }, [opacity]);
  useEffect(() => { setPaintSetting('color', color); }, [color]);

  if (activeTool === 'select') {
    return (
      <div className="w-80 bg-[#151515] border-l border-[#222] flex flex-col h-full text-gray-300">
        <div className="flex border-b border-[#222] bg-[#1a1a1a] p-3 gap-1 items-center shadow-sm">
           <span className="text-[11px] font-bold text-gray-400 flex items-center gap-2 tracking-widest"><MousePointer2 size={12}/> PROPERTIES</span>
        </div>
        {selectedObjectId ? (
            <div className="p-4 space-y-4 text-[11px]">
               <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] shadow-lg">
                  <div className="font-bold text-gray-400 mb-3 border-b border-[#444] pb-2 uppercase tracking-wide">Transform</div>
                  <div className="flex gap-1">
                      <button onClick={() => setTransformMode('translate')} className={`flex-1 py-1.5 rounded border border-[#333] transition-colors ${transformMode === 'translate' ? 'bg-[#0070e0] text-white border-blue-500' : 'bg-[#222] hover:bg-[#2a2a2a]'}`} title="Move"><Move size={14} className="mx-auto"/></button>
                      <button onClick={() => setTransformMode('rotate')} className={`flex-1 py-1.5 rounded border border-[#333] transition-colors ${transformMode === 'rotate' ? 'bg-[#0070e0] text-white border-blue-500' : 'bg-[#222] hover:bg-[#2a2a2a]'}`} title="Rotate"><Rotate3d size={14} className="mx-auto"/></button>
                      <button onClick={() => setTransformMode('scale')} className={`flex-1 py-1.5 rounded border border-[#333] transition-colors ${transformMode === 'scale' ? 'bg-[#0070e0] text-white border-blue-500' : 'bg-[#222] hover:bg-[#2a2a2a]'}`} title="Scale"><Maximize size={14} className="mx-auto"/></button>
                  </div>
               </div>
               <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                   <span className="text-gray-500 font-bold block mb-1">SELECTED OBJECT ID</span>
                   <span className="text-white font-mono text-[10px] break-all">{selectedObjectId}</span>
               </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-600 italic">
                <MousePointer2 size={24} className="mb-2 opacity-20"/>
                <span className="text-[11px]">Select an object in the scene to edit properties or transform.</span>
            </div>
        )}
      </div>
    );
  }

  if (activeTool === 'paint') {
    return (
        <div className="w-80 bg-[#151515] border-l border-[#222] flex flex-col h-full text-gray-300">
          <div className="flex border-b border-[#222] bg-[#1a1a1a] p-3 gap-1 items-center shadow-sm">
             <span className="text-[11px] font-bold text-purple-400 flex items-center gap-2 tracking-widest"><Palette size={12}/> PAINT TOOLS</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide"><Brush size={12}/> Brush Settings</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400 font-medium"><span>Size</span> <span>{brushSize}px</span></div>
                <input type="range" min="1" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"/>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400 font-medium"><span>Opacity</span> <span>{(opacity * 100).toFixed(0)}%</span></div>
                <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-purple-500"/>
              </div>
            </div>
            <div className="h-px bg-[#333]"></div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide"><Droplet size={12}/> Color Picker</div>
              <HexColorPicker color={color} onChange={setColor} style={{width: '100%', height: '140px', borderRadius: '8px'}} />
              <div className="flex gap-2 items-center bg-[#0f0f0f] p-1 rounded border border-[#333]">
                 <div className="w-6 h-6 rounded border border-[#444]" style={{backgroundColor: color}}></div>
                 <input type="text" value={color} className="flex-1 bg-transparent border-none text-[11px] text-gray-300 uppercase font-mono outline-none" readOnly/>
              </div>
            </div>
          </div>
        </div>
      );
  }

  return <div className="w-80 bg-[#151515] border-l border-[#222]"></div>;
};

// ==========================================
// 5. APP PRINCIPAL
// ==========================================
export default function App() {
  const { mannequin, physics, setIsAltPressed, removeObject, selectedObjectId } = useSceneStore();
  
  // ATALHOS GLOBAIS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Alt') setIsAltPressed(true);
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) removeObject(selectedObjectId);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Alt') setIsAltPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setIsAltPressed, removeObject, selectedObjectId]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#111] text-[#e0e0e0] font-sans select-none overflow-hidden">
      <UE5Header />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftPanelBlend />
        <main className="flex-1 relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
          <Canvas shadows camera={{ position: [0, 1.2, 2.5], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
              <Suspense fallback={null}>
                <MainScene 
                  gender={mannequin.type} 
                  physicsEnabled={physics.isEnabled} 
                  isPlaying={mannequin?.animation?.isPlaying ?? true} 
                />
              </Suspense>
          </Canvas>
          <Loader />
          
          <div className="absolute top-4 right-4 flex gap-2">
             <div className="bg-black/50 backdrop-blur px-3 py-1 rounded text-[10px] border border-white/10 text-white font-medium tracking-wide">LIT</div>
          </div>
          <div className="absolute bottom-4 left-4 text-[10px] text-gray-500 font-mono bg-black/40 backdrop-blur px-3 py-1.5 rounded border border-white/5">
             Hold <b>ALT</b> to rotate camera while painting • Press <b>DEL</b> to delete
          </div>
        </main>
        <RightPanel />
      </div>
    </div>
  );
}