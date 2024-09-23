import { createRoot } from "react-dom/client";
import ProcessManager from "./components/ProcessManager";
import ProcessTypeManager from "./components/ProcessTypeManager";
import ProcessStepManager from './components/ProcessStepManager';
import ProcessViewer from './components/ProcessViewer';
import ProcessTypeEditor from './components/ProcessTypeEditor';
import ProcessStepEditor from './components/ProcessStepEditor';
import SectorManager from "./components/SectorManager";

// Função para navegar para o ProcessViewer ao selecionar um processo
const navigateToProcessViewer = (processId) => {
  window.location.href = `?page=process-viewer&process_id=${processId}`;
};

// Adiciona um evento listener para ser executado quando o conteúdo do DOM for completamente carregado
document.addEventListener("DOMContentLoaded", () => {
  // Obtém os elementos do DOM pelos IDs
  const processElement = document.getElementById("process-manager");
  const processTypeElement = document.getElementById("process-type-manager");
  const processStepElement = document.getElementById("process-step-manager");
  const processViewerElement = document.getElementById("process-viewer");
  const processTypeEditorElement = document.getElementById("process-type-editor");
  const processStepEditorElement = document.getElementById("process-step-editor");
  const sectorManagerElement = document.getElementById("sector-manager");

  // Verifica se o elemento com o ID 'process-manager' existe
  // Se existir, renderiza o componente ProcessManager dentro deste elemento
  if (processElement) {
    createRoot(processElement).render(<ProcessManager onSelectProcess={navigateToProcessViewer} />);
  }

  // Verifica se o elemento com o ID 'process-type-manager' existe
  // Se existir, renderiza o componente ProcessTypeManager dentro deste elemento
  if (processTypeElement) {
    createRoot(processTypeElement).render(<ProcessTypeManager />);
  }

  // Verifica se o elemento com o ID 'process-step-manager' existe
  // Se existir, renderiza o componente ProcessStepManager dentro deste elemento
  if (processStepElement) {
    createRoot(processStepElement).render(<ProcessStepManager />);
  }

  // Verifica se o elemento com o ID 'process-viewer' existe
  // Se existir, renderiza o componente ProcessViewer dentro deste elemento
  if (processViewerElement) {
    createRoot(processViewerElement).render(<ProcessViewer />);
  }

  // Verifica se o elemento com o ID 'process-type-editor' existe
  // Se existir, renderiza o componente ProcessTypeEditor dentro deste elemento
  if (processTypeEditorElement) {
    createRoot(processTypeEditorElement).render(<ProcessTypeEditor />);
  }

  // Verifica se o elemento com o ID 'process-step-editor' existe
  // Se existir, renderiza o componente ProcessStepEditor dentro deste elemento
  if (processStepEditorElement) {
    createRoot(processStepEditorElement).render(<ProcessStepEditor />);
  }

  if (sectorManagerElement) {
    createRoot(sectorManagerElement).render(<SectorManager />);
  }
});
