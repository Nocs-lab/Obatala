import { render } from "@wordpress/element";
import ProcessManager from "./components/ProcessManager";
import ProcessTypeManager from "./components/ProcessTypeManager";
import ProcessStepManager from './components/ProcessStepManager';
import ProcessViewer from './components/ProcessViewer';
import ProcessSectorManager from "./components/ProcessSectorManager";
import { ErrorProvider } from './contexts/ErrorContext';

const navigateToProcessViewer = (processId) => {
  window.location.href = `?page=process-viewer&process_id=${processId}`;
};

document.addEventListener("DOMContentLoaded", () => {
  const processElement = document.getElementById("process-manager");
  const processTypeElement = document.getElementById("process-type-manager");
  const processStepElement = document.getElementById("process-step-manager");
  const processViewerElement = document.getElementById("process-viewer");
  const processSectorElement = document.getElementById("process-sector-manager");

  const renderComponent = (Component, element) => {
    if (element) {
      render(
        <ErrorProvider>
          <Component />
        </ErrorProvider>,
        element
      );
    }
  };

  renderComponent(ProcessManager, processElement);
  renderComponent(ProcessTypeManager, processTypeElement);
  renderComponent(ProcessStepManager, processStepElement);
  renderComponent(ProcessViewer, processViewerElement);
  renderComponent(ProcessSectorManager, processSectorElement);
});
