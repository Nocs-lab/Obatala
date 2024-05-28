import { render } from '@wordpress/element';
import ExampleComponent from './components/ExampleComponent';

const App = () => {
    return (
        <div>
            <h1>Gerenciar Processos</h1>
            <ExampleComponent />
        </div>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('obatala-manage-processes');
    if (appElement) {
        render(<App />, appElement);
    }
});