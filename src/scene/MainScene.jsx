import React from 'react';
import { OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei';
import MannequinManager from '../components/canvas/mannequin/MannequinManager';
import Attachment from '../components/canvas/Attachment';
import useSceneStore from '../app/store/useSceneStore';
import useAppStore from '../app/store/useAppStore';

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
      
      {/* CORREÇÃO CRÍTICA: key={gender} 
          Isso força o React a recriar o componente do zero quando troca de M/F.
          Isso conserta o bug da animação travar.
      */}
      <MannequinManager 
        key={gender} 
        type={gender} 
        isPlaying={isPlaying} 
      />

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

export default MainScene;