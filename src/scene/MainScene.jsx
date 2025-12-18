import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, Grid, ContactShadows, OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import useSceneStore from '../app/store/useSceneStore';
import useAppStore from '../app/store/useAppStore';

import MannequinManager from '../components/canvas/mannequin/MannequinManager';
import Attachment from '../components/canvas/Attachment';
import ExportManager from '../core/exporter/ExportManager';

export default function MainScene() {
  const { objects, updateObject, selectedObjectId, selectObject, isAltPressed, setIsAltPressed } = useSceneStore();
  const { activeTool } = useAppStore();
  
  useEffect(() => {
    const down = (e) => { if (e.key === 'Alt') setIsAltPressed(true); };
    const up = (e) => { if (e.key === 'Alt') setIsAltPressed(false); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [setIsAltPressed]);

  const isEditing = activeTool === 'sculpt' || activeTool === 'paint';
  const cameraEnabled = !isEditing || isAltPressed;

  return (
    <group onPointerMissed={() => selectObject(null)}>
      <Environment preset="city" blur={0.8} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
      
      <ContactShadows resolution={1024} scale={10} blur={1.5} opacity={0.7} color="#000000" />
      <Grid infiniteGrid fadeDistance={20} fadeStrength={5} sectionColor="#333" cellColor="#1a1a1a" position={[0, -0.01, 0]} />

      <MannequinManager />

      {objects.map((obj) => (
        <Attachment
          key={obj.id}
          id={obj.id}
          {...obj}
          isSelected={obj.id === selectedObjectId}
          onSelect={selectObject}
          onGizmoChange={updateObject}
        />
      ))}

      <ExportManager />

      <OrbitControls makeDefault enabled={cameraEnabled} minDistance={1} maxDistance={8} target={[0, 1, 0]} />
      
      {/* GIZMO ESTILO BLENDER (Canto Superior Direito) */}
      <GizmoHelper alignment="top-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ff3653', '#8adb00', '#2c8fdf']} labelColor="black" />
      </GizmoHelper>
    </group>
  );
}