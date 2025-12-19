import React, { useEffect, useRef, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useGraph } from '@react-three/fiber';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

// AGORA É O XBOT (O "OUTRO" MANEQUIM)
const MODEL_URL = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb';

export default function MannequinManager({ isPlaying }) {
  const group = useRef();
  
  // Carrega o modelo Xbot
  const { scene, animations } = useGLTF(MODEL_URL);
  
  // Clona para garantir isolamento
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);
  const { actions } = useAnimations(animations, group);

  // 1. EFEITO: PINTAR DE ROSA
  useEffect(() => {
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#ffc0cb', // Rosa Salmão
          roughness: 0.6,
          metalness: 0.1,
          // skinning: true <-- Removido para evitar erro
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clone]);

  // 2. EFEITO: ANIMAÇÃO (Procura 'idle' ou 'agree' ou usa a primeira)
  useEffect(() => {
    // Tenta achar animação de "Idle" ou pega a primeira disponível
    const actionName = Object.keys(actions).find(name => name.toLowerCase().includes('idle')) || Object.keys(actions)[0];
    const action = actions[actionName];

    if (action) {
      if (isPlaying) {
        action.reset().fadeIn(0.5).play();
        action.paused = false;
      } else {
        action.paused = true;
      }
    }
    
    return () => {
      if (action) action.fadeOut(0.5);
    };
  }, [actions, isPlaying]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={clone} scale={[1, 1, 1]} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);