import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

// Configurações da simulação
const DAMPING = 0.98; // Resistência do ar (para não balançar para sempre)
const CONSTRAINT_ITERATIONS = 3; // Precisão da rigidez do tecido

export function useClothSimulation(meshRef, isEnabled, anchorPoints = []) {
  // Armazena as posições anteriores para o cálculo de velocidade (Verlet)
  const originalPositions = useRef(null);
  const prevPositions = useRef(null);
  const constraints = useRef([]);

  // INICIALIZAÇÃO: Cria a estrutura de dados quando a física é ligada
  useEffect(() => {
    if (!meshRef.current) return;
    const geometry = meshRef.current.geometry;
    const posAttr = geometry.attributes.position;
    const count = posAttr.count;

    // Salva posições iniciais
    if (!originalPositions.current) {
      originalPositions.current = new Float32Array(posAttr.array);
      prevPositions.current = new Float32Array(posAttr.array);
    }

    // Cria restrições (Constraints): Conecta cada vértice aos seus vizinhos
    // Isso impede que o tecido se desfaça ou estique infinitamente
    if (constraints.current.length === 0 && geometry.index) {
      const indices = geometry.index.array;
      const cons = [];
      // Para cada triângulo, cria conexões entre os vértices (arestas)
      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i];
        const b = indices[i + 1];
        const c = indices[i + 2];
        
        // Função auxiliar para criar constraint
        const addConstraint = (p1, p2) => {
            // Distância original entre os pontos
            const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, p1);
            const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, p2);
            cons.push({ p1, p2, distance: v1.distanceTo(v2) });
        };

        addConstraint(a, b);
        addConstraint(b, c);
        addConstraint(c, a);
      }
      constraints.current = cons;
    }
  }, [isEnabled, meshRef]);

  // LOOP DE FÍSICA (Roda 60fps)
  useFrame((state, delta) => {
    if (!isEnabled || !meshRef.current || !prevPositions.current) return;

    const geometry = meshRef.current.geometry;
    const posAttr = geometry.attributes.position;
    const count = posAttr.count;
    
    // 1. APLICA GRAVIDADE E INÉRCIA (Verlet Integration)
    for (let i = 0; i < count; i++) {
        // Se for um ponto de âncora (topo do bolso), não move!
        // Aqui simplificamos: pontos muito altos (Y > algum valor) ou definidos fixos
        // Para demo: Vamos fixar a linha superior da geometria (Top vertices)
        
        // Pega posição atual
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);

        // Pega posição anterior
        const px = prevPositions.current[i * 3];
        const py = prevPositions.current[i * 3 + 1];
        const pz = prevPositions.current[i * 3 + 2];

        // Velocidade = Posição Atual - Posição Anterior
        let vx = (x - px) * DAMPING;
        let vy = (y - py) * DAMPING;
        let vz = (z - pz) * DAMPING;

        // Atualiza 'Anterior' para ser a 'Atual' antes de mover
        prevPositions.current[i * 3] = x;
        prevPositions.current[i * 3 + 1] = y;
        prevPositions.current[i * 3 + 2] = z;

        // Aplica Gravidade (-9.8 * delta)
        // Ajustamos a força para parecer tecido leve
        vy -= 9.8 * delta * delta * 5; // *5 para ficar visualmente perceptível

        // Move o vértice
        posAttr.setXYZ(i, x + vx, y + vy, z + vz);
    }

    // 2. RESOLVE RESTRIÇÕES (Mantém o tecido junto)
    // Repetimos algumas vezes para o tecido ficar "duro" e não elástico demais
    for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
        constraints.current.forEach(c => {
            const v1 = new THREE.Vector3().fromBufferAttribute(posAttr, c.p1);
            const v2 = new THREE.Vector3().fromBufferAttribute(posAttr, c.p2);
            
            const diff = v2.clone().sub(v1);
            const currentDist = diff.length();
            
            if (currentDist === 0) return;

            // Diferença entre a distância atual e a que deveria ser
            const correction = (currentDist - c.distance) / currentDist * 0.5;
            const offset = diff.multiplyScalar(correction);

            // Move os dois pontos para se aproximarem/afastarem
            // Mas só se não forem fixos! (Vamos simplificar e mover todos por enquanto)
            
            // Hack rápido para fixar o topo: Se o vértice original tinha Y alto, ele pesa mais
            const y1 = originalPositions.current[c.p1 * 3 + 1];
            const y2 = originalPositions.current[c.p2 * 3 + 1];
            
            // Se for o topo do objeto (Y > 0.4 relativo ao centro), considera fixo
            const isPinned1 = y1 > 0.4; 
            const isPinned2 = y2 > 0.4;

            if (!isPinned1) {
                posAttr.setXYZ(c.p1, posAttr.getX(c.p1) + offset.x, posAttr.getY(c.p1) + offset.y, posAttr.getZ(c.p1) + offset.z);
            }
            if (!isPinned2) {
                posAttr.setXYZ(c.p2, posAttr.getX(c.p2) - offset.x, posAttr.getY(c.p2) - offset.y, posAttr.getZ(c.p2) - offset.z);
            }
        });
    }

    // 3. COLISÃO SIMPLES COM O MANEQUIM (Esfera imaginária no peito)
    // O manequim está em 0,0,0. Vamos supor uma esfera de raio 0.3 no peito (Y=1.3)
    const colliderCenter = new THREE.Vector3(0, 1.3, 0);
    const colliderRadius = 0.35;

    for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);
        
        // Posição do vértice no mundo (aproximada, pois o objeto tem suas próprias coordenadas)
        // Precisaríamos somar a posição do objeto (meshRef.current.position), mas vamos simplificar
        // assumindo que a física roda no espaço local e o objeto está perto do corpo.
        
        // Convertendo para espaço local do colisor
        const localV = new THREE.Vector3(x, y, z).applyMatrix4(meshRef.current.matrixWorld);
        const dist = localV.distanceTo(colliderCenter);

        if (dist < colliderRadius) {
            // Empurra para fora
            const pushDir = localV.sub(colliderCenter).normalize();
            const newPos = colliderCenter.add(pushDir.multiplyScalar(colliderRadius));
            
            // Converte de volta para local space do objeto
            const localNewPos = meshRef.current.worldToLocal(newPos);
            posAttr.setXYZ(i, localNewPos.x, localNewPos.y, localNewPos.z);
        }
    }

    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  });
}
