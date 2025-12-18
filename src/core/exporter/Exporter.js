import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import * as THREE from 'three';

/**
 * Função de Exportação BLINDADA para Unreal Engine 5
 * Versão Final: Protegida contra materiais sem cor e erros de textura.
 */
export const exportToUnreal = (scene, objects) => {
  const exporter = new GLTFExporter();

  // 1. CRIAR UMA CENA LIMPA
  const exportScene = new THREE.Scene();
  exportScene.name = "ExportScene";
  
  // Limpa ambiente
  exportScene.background = null;
  exportScene.environment = null;

  // 2. TRAVESSIA MANUAL
  scene.traverse((child) => {
    // a) Filtros: Ignora tudo que não queremos
    if (
      !child.visible ||
      child.isTransformControls || 
      child.isGridHelper || 
      child.isAxesHelper || 
      child.isLight ||
      child.type === 'LineSegments' ||
      child.type === 'Helper' || 
      (child.type === 'Bone' && !child.parent?.isSkinnedMesh)
    ) {
      return; 
    }

    // b) Processamento de Malhas
    if (child.isMesh || child.isSkinnedMesh) {
      // Clona a geometria (Deep Clone)
      const clonedMesh = child.clone(true);
      
      // c) SANITIZAÇÃO DE MATERIAL
      if (clonedMesh.material) {
        try {
          if (Array.isArray(clonedMesh.material)) {
            clonedMesh.material = clonedMesh.material.map(m => sanitizeMaterial(m));
          } else {
            clonedMesh.material = sanitizeMaterial(clonedMesh.material);
          }
        } catch (e) {
          console.warn("Material ignorado por erro:", e);
          // Fallback para material cinza padrão se falhar
          clonedMesh.material = new THREE.MeshStandardMaterial({ color: 0x888888 });
        }
      }

      // Adiciona na cena de exportação
      exportScene.add(clonedMesh);
    }
  });

  /**
   * Função Auxiliar: Cria um material novo e limpo.
   * Possui verificações de segurança para evitar crash.
   */
  function sanitizeMaterial(originalMat) {
    const newMat = new THREE.MeshStandardMaterial();
    
    // 1. Copia Nome
    newMat.name = originalMat.name || 'Material';

    // 2. Copia Cor (COM PROTEÇÃO)
    // O erro acontecia aqui: alguns materiais não têm .color
    if (originalMat.color && originalMat.color.isColor) {
      newMat.color.copy(originalMat.color);
    } else {
      newMat.color.setHex(0xffffff); // Branco padrão
    }

    // 3. Copia Propriedades Físicas (com defaults)
    newMat.roughness = (originalMat.roughness !== undefined) ? originalMat.roughness : 0.5;
    newMat.metalness = (originalMat.metalness !== undefined) ? originalMat.metalness : 0.0;
    newMat.side = THREE.DoubleSide; // Visível dos dois lados
    
    // Mantém skinning para o manequim se necessário
    newMat.skinning = !!originalMat.skinning;

    // 4. Copia a Textura Principal (Map/Albedo) SE VÁLIDA
    if (originalMat.map) {
      // Verifica se é uma textura válida
      if (originalMat.map.image || originalMat.map.isCanvasTexture) {
        newMat.map = originalMat.map;
        newMat.map.needsUpdate = true;
      }
    }

    // 5. O "KILL SWITCH": Força nulo em mapas problemáticos
    newMat.envMap = null;       
    newMat.lightMap = null;
    newMat.aoMap = null;        
    newMat.emissiveMap = null;
    
    return newMat;
  }

  // 3. CONFIGURAÇÃO FINAL
  const options = {
    binary: true,
    trs: true,
    onlyVisible: true,
    maxTextureSize: 4096,
    animations: [], 
    includeCustomExtensions: false
  };

  console.log("Iniciando exportação segura...");

  // 4. EXPORTAÇÃO
  exporter.parse(
    exportScene,
    (result) => {
      const blob = new Blob([result], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `MetaCloth_Asset_UE5_${new Date().getTime()}.glb`;
      link.click();
      URL.revokeObjectURL(link.href);
      console.log("Sucesso! Arquivo gerado.");
    },
    (error) => {
      console.error('Erro na exportação:', error);
      alert('Erro ao exportar. Verifique o console.');
    },
    options
  );
}