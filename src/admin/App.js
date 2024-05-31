import { render } from '@wordpress/element';
import ProcessCollection from './components/ProcessCollection';

const App = () => {
    return (
        <div>
            <h1>Gerenciar Processos</h1>
            <ProcessCollection />
        </div>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('obatala-manage-processes');
    if (appElement) {
        render(<App />, appElement);
    }
});