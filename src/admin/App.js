import { render } from "@wordpress/element";
import ProcessManager from "./components/ProcessManager";
import ProcessTypeManager from "./components/ProcessTypeManager";
// import ProcessStepManager from './components/ProcessStepManager';

// Adiciona um evento listener para ser executado quando o conteúdo do DOM for completamente carregado
document.addEventListener("DOMContentLoaded", () => {
  // Obtém os elementos do DOM pelos IDs
  const processElement = document.getElementById("process-manager");
  const processTypeElement = document.getElementById("process-type-manager");
  const processStepElement = document.getElementById("process-step-manager");
  const processViewerElement = document.getElementById("process-viewer");

  // Verifica se o elemento com o ID 'process-manager' existe
  // Se existir, renderiza o componente ProcessManager dentro deste elemento
  if (processElement) {
    render(<ProcessManager />, processElement);
  }

  // Verifica se o elemento com o ID 'process-type-manager' existe
  // Se existir, renderiza o componente ProcessTypeManager dentro deste elemento
  if (processTypeElement) {
    render(<ProcessTypeManager />, processTypeElement);
  }

  // Verifica se o elemento com o ID 'process-step-manager' existe
  // Se existir, renderiza o componente ProcessStepManager dentro deste elemento
  if (processStepElement) {
    render(<h1>ProcessStepManager</h1>, processStepElement);
  }
  // Verifica se o elemento com o ID 'process-viewer' existe
  // Se existir, renderiza o componente ProcessViewer dentro deste elemento
  if (processViewerElement) {
    render(<h1>ProcessViewer</h1>, processViewerElement);
  }
});
