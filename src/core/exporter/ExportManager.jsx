import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import useSceneStore from '../../app/store/useSceneStore';
import { exportToUnreal } from './Exporter';

/**
 * Componente Gerenciador de Exportação
 * Fica invisível na cena, apenas aguardando o sinal para rodar o script de exportação.
 */
export default function ExportManager() {
  const { scene } = useThree(); // Acesso direto à cena do Three.js
  const { exportRequested, finishExport, objects } = useSceneStore();

  useEffect(() => {
    // Se a Store avisar que o usuário clicou em "Exportar"...
    if (exportRequested) {
      console.log("Iniciando pipeline de exportação...");
      
      // Chama a função pura de exportação
      exportToUnreal(scene, objects);
      
      // Avisa a Store que terminou, para desligar o sinal
      finishExport();
    }
  }, [exportRequested, scene, objects, finishExport]);

  return null; // Não renderiza nada visualmente
}
