import { useState, useEffect } from 'react';
import { Spinner, Button, SelectControl, TextControl, Notice, Panel, PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessStepManager = () => {
    const [processSteps, setProcessSteps] = useState([]);
    const [processTypes, setProcessTypes] = useState([]);
    const [newStepTitle, setNewStepTitle] = useState('');
    const [newStepType, setNewStepType] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Carrega os passos de processo e tipos de processo ao inicializar
    useEffect(() => {
        fetchProcessSteps();
        fetchProcessTypes();
    }, []);

    // Função para buscar os passos de processo da API WordPress
    const fetchProcessSteps = () => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_step?per_page=100&_embed` })
            .then(data => {
                setProcessSteps(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process steps:', error);
                setIsLoading(false);
            });
    };

    // Função para buscar os tipos de processo da API WordPress
    const fetchProcessTypes = () => {
        apiFetch({ path: `/wp/v2/process_type?per_page=100&_embed` })
            .then(data => {
                setProcessTypes(data);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
            });
    };

    // Função para criar um novo passo de processo
    const handleCreateStep = () => {
        if (!newStepTitle || !newStepType) {
            alert('Please provide a title and select a process type.');
            return;
        }

        const newStep = {
            title: newStepTitle,
            status: 'publish',
            type: 'process_step',
            process_type: newStepType,
        };

        apiFetch({ path: `/wp/v2/process_step`, method: 'POST', data: newStep })
            .then(savedStep => {
                setProcessSteps([...processSteps, savedStep]);
                setNewStepTitle('');
                setNewStepType('');
            })
            .catch(error => {
                console.error('Error creating process step:', error);
            });
    };

    // Renderiza um spinner enquanto os dados estão sendo carregados
    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            {/* Título e cabeçalho da página */}
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Process Step Manager</h2>
            <div className="panel-container">
                <main>
                    {/* Painel com os passos de processo existentes */}
                    <Panel>
                        <PanelBody title="Existing Process Steps" initialOpen={true}>
                            <PanelRow>
                                {/* Lista os passos de processo existentes */}
                                {processSteps.length > 0 ? (
                                    <table className="wp-list-table widefat fixed striped">
                                        <thead>
                                            <tr>
                                                <th>Step Title</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {processSteps.map(step => (
                                                <tr key={step.id}>
                                                    <td>{step.title.rendered}</td>
                                                </tr>
                                            ))}    
                                        </tbody>
                                    </table>
                                ) : (
                                    // Aviso se não houver passos de processo existentes
                                    <Notice isDismissible={false} status="warning">No existing process steps.</Notice>
                                )}
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </main>
                <aside>
                    {/* Painel para criar um novo passo de processo */}
                    <Panel>
                        <PanelBody title="Create Process Step" initialOpen={true}>
                            <PanelRow>
                                {/* Formulário para inserir título e tipo de processo do novo passo */}
                                <TextControl
                                    label="Step Title"
                                    value={newStepTitle}
                                    onChange={(value) => setNewStepTitle(value)}
                                />
                                <SelectControl
                                    label="Process Type"
                                    value={newStepType}
                                    options={[
                                        { label: 'Select a process type...', value: '' },
                                        ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                                    ]}
                                    onChange={(value) => setNewStepType(value)}
                                />
                                <Button isPrimary onClick={handleCreateStep}>Create Step</Button>
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessStepManager;