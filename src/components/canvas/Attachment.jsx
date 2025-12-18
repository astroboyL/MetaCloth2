import React, { useRef, useState, useLayoutEffect, useEffect, useMemo } from 'react';
import { TransformControls, Html, useCursor, Instance, Instances } from '@react-three/drei';
import { useThree } from '@react-three/fiber'; 
import * as THREE from 'three';
import useAppStore from '../../app/store/useAppStore';
import useSceneStore from '../../app/store/useSceneStore';
import { useClothSimulation } from '../../core/physics/useClothSimulation';

// --- VISUAL: PONTOS DE CONTROLE (META HUMAN GIZMOS) ---
// Agora eles parecem "Alvos" (Target Points)
const ControlPointsOverlay = ({ meshRef, visible }) => {
  if (!visible || !meshRef.current) return null;
  
  const points = useMemo(() => {
    const p = [];
    const geo = meshRef.current.geometry;
    const pos = geo.attributes.position;
    const count = pos.count;
    // Distribuição mais densa para "precisão"
    const step = Math.max(1, Math.floor(count / 400)); 

    for(let i=0; i<count; i+=step) { 
        p.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)));
    }
    return p;
  }, [meshRef.current, meshRef.current?.geometry]);

  return (
    <group>
      {/* Círculo Externo */}
      <Instances range={1000}>
        <ringGeometry args={[0.008, 0.01, 16]} /> 
        <meshBasicMaterial color="#aaaaaa" transparent opacity={0.4} depthTest={false} side={THREE.DoubleSide}/>
        {points.map((pt, i) => <Instance key={`ring-${i}`} position={pt} lookAt={[0,0,100]} />)} 
        {/* Nota: lookAt fixo é simplificação; ideal seria billboarding no vertex shader, mas Instance não suporta fácil lookAt dinâmico por instância sem update frame */}
      </Instances>
      
      {/* Ponto Central */}
      <Instances range={1000}>
        <sphereGeometry args={[0.003, 8, 8]} />
        <meshBasicMaterial color="white" depthTest={false}/>
        {points.map((pt, i) => <Instance key={`dot-${i}`} position={pt} />)}
      </Instances>
    </group>
  );
};

export default function Attachment({ 
  id, position, rotation, scale, type, paintData, sculptData,
  isSelected, onSelect, onGizmoChange 
}) {
  const meshRef = useRef();
  const brushRadiusRef = useRef(); 
  const brushStrengthRef = useRef(); 
  
  const [canvasTexture, setCanvasTexture] = useState(null);
  const lastUpdate = useRef(0);
  const { camera } = useThree(); 

  const { activeTool, sculptSettings, paintSettings } = useAppStore();
  const { transformMode, physics, savePaintState, saveSculptState, isAltPressed } = useSceneStore();
  
  const isSculptMode = isSelected && activeTool === 'sculpt';
  const isPaintMode = isSelected && activeTool === 'paint';
  const isEditMode = isSculptMode || isPaintMode;

  useCursor(isEditMode, isAltPressed ? 'grab' : 'default', 'auto'); 

  // --- GEOMETRIA ---
  const geometry = useMemo(() => {
    let geo;
    const seg = 128; 

    switch (type) {
      case 'box': geo = new THREE.BoxGeometry(1, 1, 0.2, 64, 64, 4); break;
      case 'sphere': geo = new THREE.SphereGeometry(0.5, seg, seg); break;
      case 'cylinder': geo = new THREE.CylinderGeometry(0.2, 0.2, 1, 64, 32); break;
      case 'plane': geo = new THREE.PlaneGeometry(1, 1, 64, 64); break;
      default: geo = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
    }
    // Lógica Box UV (Mantida)
    if (type === 'box') {
      geo = geo.toNonIndexed(); 
      const pos = geo.attributes.position;
      const norm = geo.attributes.normal;
      const uvs = geo.attributes.uv;
      const count = pos.count;
      const colW = 1 / 3; const rowH = 1 / 2;
      const v3 = new THREE.Vector3();
      for (let i = 0; i < count; i++) {
        v3.set(norm.getX(i), norm.getY(i), norm.getZ(i));
        let col = 0, row = 0;
        if (v3.x > 0.5) { col = 0; row = 0; }       
        else if (v3.x < -0.5) { col = 1; row = 0; } 
        else if (v3.y > 0.5) { col = 2; row = 0; }  
        else if (v3.y < -0.5) { col = 0; row = 1; } 
        else if (v3.z > 0.5) { col = 1; row = 1; }  
        else if (v3.z < -0.5) { col = 2; row = 1; } 
        const u = uvs.getX(i); const v = uvs.getY(i);
        uvs.setXY(i, (u * colW) + (col * colW), (v * rowH) + (row * rowH));
      }
    }
    return geo;
  }, [type]);

  useLayoutEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (paintData) {
      const img = new Image(); img.src = paintData;
      img.onload = () => { ctx.clearRect(0,0,2048,2048); ctx.drawImage(img,0,0); if(canvasTexture) canvasTexture.needsUpdate = true; };
    } else {
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,2048,2048);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    setCanvasTexture(tex);
  }, []);

  useEffect(() => {
    if (!canvasTexture) return;
    const ctx = canvasTexture.image.getContext('2d');
    if (paintData) {
        const img = new Image(); img.src = paintData;
        img.onload = () => { ctx.clearRect(0,0,2048,2048); ctx.drawImage(img,0,0); canvasTexture.needsUpdate = true; };
    } else {
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0,0,2048,2048); canvasTexture.needsUpdate = true;
    }
    if (sculptData && meshRef.current) {
        const posAttr = meshRef.current.geometry.attributes.position;
        if (posAttr.array.length === sculptData.length) {
            posAttr.array.set(sculptData); posAttr.needsUpdate = true; meshRef.current.geometry.computeVertexNormals();
        }
    }
  }, [paintData, sculptData]);

  useClothSimulation(meshRef, physics.isEnabled);

  const handlePointerMove = (e) => {
    // --- Lógica de Visualização do Pincel ---
    const showPaintBrush = isPaintMode && !isAltPressed;
    if (brushRadiusRef.current) brushRadiusRef.current.visible = showPaintBrush;
    if (brushStrengthRef.current) brushStrengthRef.current.visible = showPaintBrush;

    if (showPaintBrush && brushRadiusRef.current && brushStrengthRef.current) {
      const hitPoint = e.point.clone();
      if (e.face) {
        const normal = e.face.normal.clone().transformDirection(meshRef.current.matrixWorld).normalize();
        hitPoint.add(normal.multiplyScalar(0.02));
      }
      brushRadiusRef.current.position.copy(hitPoint);
      brushStrengthRef.current.position.copy(hitPoint);
      brushRadiusRef.current.lookAt(camera.position);
      brushStrengthRef.current.lookAt(camera.position);

      const radiusSize = paintSettings.brushSize / 500;
      brushRadiusRef.current.scale.set(radiusSize, radiusSize, radiusSize);
      const intensity = paintSettings.opacity;
      const strengthSize = radiusSize * Math.max(0.1, Math.min(1, intensity)); 
      brushStrengthRef.current.scale.set(strengthSize, strengthSize, strengthSize);
    }

    // Se ALT apertado, NÃO fazemos nada de lógica de deformação, mas o visual das bolinhas se mantém.
    if (isAltPressed || !e.buttons) return; 

    const now = performance.now();
    if (now - lastUpdate.current < 16) return;
    lastUpdate.current = now;

    // --- LÓGICA DE ESCULTURA (DEFORMAÇÃO) ---
    if (isSculptMode) {
      e.stopPropagation();
      const mesh = meshRef.current;
      if (!mesh.userData.isUnique) { mesh.geometry = mesh.geometry.clone(); mesh.userData.isUnique = true; }
      
      const localPoint = mesh.worldToLocal(e.point.clone());
      const posAttr = mesh.geometry.attributes.position;
      const v = new THREE.Vector3();
      const radiusSq = sculptSettings.radius * sculptSettings.radius;
      let geometryChanged = false;

      // Precisão aumentada: Otimizei o loop e a influência
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        if (v.distanceToSquared(localPoint) < radiusSq) {
          const dist = v.distanceTo(localPoint);
          // Curva Gaussiana para suavidade extra
          const factor = Math.exp(-dist * dist / (2 * (sculptSettings.radius * 0.5) ** 2)) * sculptSettings.intensity * 0.05;
          const normal = e.face.normal.clone().normalize();
          v.addScaledVector(normal, factor);
          posAttr.setXYZ(i, v.x, v.y, v.z);
          geometryChanged = true;
        }
      }
      if (geometryChanged) { posAttr.needsUpdate = true; mesh.geometry.computeVertexNormals(); }
    }

    // --- PINTURA ---
    if (isPaintMode && canvasTexture && e.uv) {
      e.stopPropagation();
      const ctx = canvasTexture.image.getContext('2d');
      const x = e.uv.x * 2048; const y = (1 - e.uv.y) * 2048;
      ctx.beginPath();
      ctx.arc(x, y, paintSettings.brushSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = paintSettings.color;
      ctx.globalAlpha = paintSettings.opacity;
      ctx.fill();
      canvasTexture.needsUpdate = true; 
    }
  };

  const handlePointerUp = (e) => {
      if (!isEditMode || isAltPressed) return;
      if (isSculptMode && meshRef.current) {
          saveSculptState(id, new Float32Array(meshRef.current.geometry.attributes.position.array));
      }
      if (isPaintMode && canvasTexture) {
          savePaintState(id, canvasTexture.image.toDataURL());
      }
  };

  return (
    <>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <meshStandardMaterial 
          map={canvasTexture}
          color={canvasTexture ? "#ffffff" : (isSelected ? "#0070e0" : "#333333")}
          roughness={0.6} metalness={0.1}
          side={THREE.DoubleSide}
          wireframe={isSculptMode && isAltPressed} // Wireframe só ajuda na rotação
        />
        
        {/* --- CORREÇÃO: BOLINHAS VISÍVEIS MESMO COM ALT PRESSIONADO --- */}
        {/* Removi a checagem "!isAltPressed" da visibilidade */}
        <ControlPointsOverlay meshRef={meshRef} visible={isSculptMode && isSelected} />

        {isSelected && isAltPressed && (
          <Html position={[0, 1.2, 0]} center pointerEvents="none">
             <div className="px-2 py-1 rounded bg-black/70 text-white text-[9px] border border-white/20 font-mono">
                ROTATING CAMERA (CONTROL POINTS LOCKED)
             </div>
          </Html>
        )}
      </mesh>

      {/* Cursores de Pintura (Só aparecem se NÃO estiver com ALT) */}
      {isSelected && isPaintMode && !isAltPressed && (
        <>
          <mesh ref={brushRadiusRef}>
            <ringGeometry args={[0.95, 1, 64]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} side={THREE.DoubleSide} depthTest={false} depthWrite={false} />
          </mesh>
          <mesh ref={brushStrengthRef}>
            <ringGeometry args={[0.85, 1, 64]} />
            <meshBasicMaterial color="#0070e0" transparent opacity={0.5} side={THREE.DoubleSide} depthTest={false} depthWrite={false} />
          </mesh>
        </>
      )}

      {isSelected && activeTool === 'select' && !isAltPressed && (
        <TransformControls
          object={meshRef}
          mode={transformMode}
          size={0.8}
          onMouseUp={() => {
            if (meshRef.current) {
              onGizmoChange(id, {
                position: meshRef.current.position.toArray(),
                rotation: meshRef.current.rotation.toArray(),
                scale: meshRef.current.scale.toArray(),
              });
            }
          }}
        />
      )}
    </>
  );
}