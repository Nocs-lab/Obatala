import { render } from '@wordpress/element';
import ProcessManager from './components/ProcessManager';
import ProcessTypeManager from './components/ProcessTypeManager';
// import ProcessStepManager from './components/ProcessStepManager';

document.addEventListener('DOMContentLoaded', () => {
    const processElement = document.getElementById('process-manager');
    const processTypeElement = document.getElementById('process-type-manager');
    const processStepElement = document.getElementById('process-step-manager');

    if (processElement) {
        render(<ProcessManager />, processElement);
    }

    if (processTypeElement) {
        render(<ProcessTypeManager />, processTypeElement);
    }

    // if (processStepElement) {
    //     render(<ProcessStepManager />, processStepElement);
    // }
});
