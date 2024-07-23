import { render } from "@wordpress/element";
import ProcessManager from "./components/ProcessManager";
import ProcessTypeManager from "./components/ProcessTypeManager";
import ProcessStepManager from './components/ProcessStepManager';
import ProcessViewer from './components/ProcessViewer';
import ProcessSectorManager from "./components/ProcessSectorManager";
import { ErrorProvider } from './contexts/ErrorContext';

// Função para navegar para o ProcessViewer ao selecionar um processo
const navigateToProcessViewer = (processId) => {
  window.location.href = `?page=process-viewer&process_id=${processId}`;
};

// Função para renderizar um componente dentro de um elemento do DOM
const renderComponent = (Component, props, element) => {
  if (element) {
    render(
      <ErrorProvider>
        <Component {...props} />
      </ErrorProvider>,
      element
    );
  }
};

// Adiciona um evento listener para ser executado quando o conteúdo do DOM for completamente carregado
document.addEventListener("DOMContentLoaded", () => {
  // Obtém os elementos do DOM pelos IDs
  const processElement = document.getElementById("process-manager");
  const processTypeElement = document.getElementById("process-type-manager");
  const processStepElement = document.getElementById("process-step-manager");
  const processViewerElement = document.getElementById("process-viewer");
  const processSectorElement = document.getElementById("process-sector-manager");

  // Verifica se o elemento com o ID 'process-manager' existe
  // Se existir, renderiza o componente ProcessManager dentro deste elemento
  renderComponent(ProcessManager, { onSelectProcess: navigateToProcessViewer }, processElement);

  // Verifica se o elemento com o ID 'process-type-manager' existe
  // Se existir, renderiza o componente ProcessTypeManager dentro deste elemento
  renderComponent(ProcessTypeManager, {}, processTypeElement);

  // Verifica se o elemento com o ID 'process-step-manager' existe
  // Se existir, renderiza o componente ProcessStepManager dentro deste elemento
  renderComponent(ProcessStepManager, {}, processStepElement);

  // Verifica se o elemento com o ID 'process-viewer' existe
  // Se existir, renderiza o componente ProcessViewer dentro deste elemento
  renderComponent(ProcessViewer, {}, processViewerElement);

  // Verifica se o elemento com o ID 'process-sector-manager' existe
  // Se existir, renderiza o componente ProcessSectorManager dentro deste elemento
  renderComponent(ProcessSectorManager, {}, processSectorElement);
});
