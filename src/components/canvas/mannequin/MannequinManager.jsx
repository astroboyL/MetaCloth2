import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import useSceneStore from '../../../app/store/useSceneStore';

// URLs ESTÁVEIS (Direto do Repositório Three.js)
const MODEL_MALE = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb';
const MODEL_FEMALE = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Michelle.glb';

export default function MannequinManager() {
  const group = useRef();
  const { mannequin } = useSceneStore();
  
  // Seleciona a URL correta
  const url = mannequin.type === 'male' ? MODEL_MALE : MODEL_FEMALE;
  
  const { nodes, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Tenta encontrar uma animação válida (Idle, mixamo.com, ou a primeira disponível)
    const animName = animations.find(a => 
      a.name.toLowerCase().includes('idle') || 
      a.name.toLowerCase().includes('mixamo')
    )?.name || animations[0]?.name;
    
    if (actions[animName]) {
      if (mannequin.animation.isPlaying) {
        actions[animName].reset().fadeIn(0.5).play();
        actions[animName].timeScale = mannequin.animation.speed;
      } else {
        actions[animName].paused = true;
      }
    }
    return () => actions[animName]?.fadeOut(0.5);
  }, [url, actions, mannequin.animation.isPlaying, mannequin.animation.speed, animations]);

  return (
    <group ref={group} dispose={null}>
      {/* Ajustamos a escala da Michelle pois ela pode vir em tamanho diferente */}
      <primitive 
        object={nodes.Scene || nodes.mixamorigHips || nodes.Hips} 
        scale={mannequin.type === 'male' ? [1,1,1] : [1,1,1]} 
      />
    </group>
  );
}

// Pré-carregamento
useGLTF.preload(MODEL_MALE);
useGLTF.preload(MODEL_FEMALE);