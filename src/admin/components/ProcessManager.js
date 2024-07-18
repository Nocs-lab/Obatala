import { useState, useEffect } from 'react';
import { Spinner, Button, SelectControl, TextControl, Notice, Panel, PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessManager = ({ onSelectProcess }) => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newProcessTitle, setNewProcessTitle] = useState('');
    const [newProcessType, setNewProcessType] = useState('');
    const [selectedProcessId, setSelectedProcessId] = useState(null); // Estado para armazenar o ID do processo selecionado

    useEffect(() => {
        fetchProcessTypes();
        fetchProcesses();
    }, []);

    // Função para buscar os tipos de processo na API
    const fetchProcessTypes = () => {
        apiFetch({ path: `/wp/v2/process_type?per_page=100&_embed` })
            .then(data => {
                setProcessTypes(data);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
            });
    };

    // Função para buscar os processos existentes na API
    const fetchProcesses = () => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_obatala?per_page=100&_embed` })
            .then(data => {
                setProcesses(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching processes:', error);
                setIsLoading(false);
            });
    };

    // Função para criar um novo processo
    const handleCreateProcess = () => {
        if (!newProcessTitle || !newProcessType) {
            alert('Please provide a title and select a process type.');
            return;
        }

        const newProcess = {
            title: newProcessTitle,
            status: 'publish',
            type: 'process_obatala',
            process_type: newProcessType,
            current_stage: null,
        };

        apiFetch({ path: `/wp/v2/process_obatala`, method: 'POST', data: newProcess })
            .then(savedProcess => {
                setProcesses([...processes, savedProcess]);
                setNewProcessTitle('');
                setNewProcessType('');
                // Seleciona o processo apenas quando clicado explicitamente
                // onSelectProcess(savedProcess.id);
            })
            .catch(error => {
                console.error('Error creating process:', error);
            });
    };

    // Função para selecionar um processo e redirecionar para o ProcessViewer
    const handleSelectProcess = (processId) => {
        setSelectedProcessId(processId);
        onSelectProcess(processId);
    };

    // Renderização condicional com base no estado de carregamento
    if (isLoading) {
        return <Spinner />;
    }

    // Renderiza a lista de processos ou o ProcessViewer dependendo do estado de selectedProcessId
    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Process Manager</h2>
            <div className="panel-container">
                <main>
                    <Panel>
                        <PanelBody title="Existing Processes" initialOpen={true}>
                            <PanelRow>
                                {processes.length > 0 ? (
                                    <table className="wp-list-table widefat fixed striped">
                                        <thead>
                                            <tr>
                                                <th>Process Title</th>
                                                <th>Process Type</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {processes.map(process => (
                                            <tr key={process.id}>
                                                <td>{process.title.rendered}</td>
                                                <td>{process.process_type ? 'Process type title' : ''}</td>
                                                <td><span className="badge success">{process.status}</span></td>
                                                <td>
                                                    <Button isSecondary onClick={() => handleSelectProcess(process.id)}>
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <Notice isDismissible={false} status="warning">No existing processes.</Notice>
                                )}
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </main>
                <aside>
                    <Panel>
                        <PanelBody title="Create Processes" initialOpen={true}>
                            <PanelRow>
                                <TextControl
                                    label="Process Title"
                                    value={newProcessTitle}
                                    onChange={(value) => setNewProcessTitle(value)}
                                />
                                <SelectControl
                                    label="Process Type"
                                    value={newProcessType}
                                    options={[
                                        { label: 'Select a process type...', value: '' },
                                        ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                                    ]}
                                    onChange={(value) => setNewProcessType(value)}
                                />
                                <Button isPrimary onClick={handleCreateProcess}>Create Process</Button>
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </aside>
            </div>
            {/* Renderiza o ProcessViewer apenas se selectedProcessId estiver definido */}
            {selectedProcessId && (
                onSelectProcess(selectedProcessId)
            )}
        </div>
    );
};

export default ProcessManager;
