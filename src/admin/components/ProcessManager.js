import { useState, useEffect } from 'react';
import { Spinner, Button, Notice, Panel, PanelHeader, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import ProcessCreator from './ProcessManager/ProcessCreator';

const ProcessManager = ({ onSelectProcess }) => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processSteps, setProcessSteps] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProcessId, setSelectedProcessId] = useState(null);

    useEffect(() => {
        fetchProcessTypes();
        fetchProcessSteps();
        fetchProcesses();
    }, []);

    const fetchProcessTypes = () => {
        apiFetch({ path: `/obatala/v1/process_type?per_page=100&_embed` })
            .then(data => {
                const sortedProcessType = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessTypes(sortedProcessType);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
            });
    };

    const fetchProcessSteps = () => {
        apiFetch({ path: `/obatala/v1/process_step?per_page=100&_embed` })
            .then(data => {
                const sortedProcessSteps = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessSteps(sortedProcessSteps);
            })
            .catch(error => {
                console.error('Error fetching process steps:', error);
            });
    };

    const fetchProcesses = () => {
        setIsLoading(true);
        apiFetch({ path: `/obatala/v1/process_obatala?per_page=100&_embed` })
            .then(data => {
                console.log('Fetched processes:', data); // Adiciona log para verificar os dados
                setProcesses(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching processes:', error);
                setIsLoading(false);
            });
    };

    const handleProcessCreated = (newProcess) => {
        setProcesses([...processes, newProcess]);
    };

    const handleSelectProcess = (processId) => {
        setSelectedProcessId(processId);
        onSelectProcess(processId);
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Process Manager</h2>
            <div className="panel-container">
                <main>
                    <Panel>
                        <PanelHeader>
                            <h3>Existing Processes</h3>
                            <span className="badge">{processes.length}</span>
                        </PanelHeader>
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
                                        {processes.map(process => {
                                            console.log(process); // Adiciona log para verificar os dados
                                            const processTypeFiltered = processSteps.find(step => {
                                                return step.id == process.process_type;
                                            });
                                            console.log(processTypeFiltered); // Adiciona log para verificar os dados
                                            return (
                                                <tr key={process.id}>
                                                    <td>{process.title.rendered}</td>
                                                    <td>{processTypeFiltered ? processTypeFiltered.title.rendered : 'Unknown'}</td>
                                                    <td><span className="badge success">{process.status}</span></td>
                                                    <td>
                                                        <Button isSecondary onClick={() => handleSelectProcess(process.id)}>
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <Notice isDismissible={false} status="warning">No existing processes.</Notice>
                            )}
                        </PanelRow>
                    </Panel>
                </main>
                <aside>
                    <ProcessCreator processTypes={processTypes} onProcessCreated={handleProcessCreated} />
                </aside>
            </div>
            {selectedProcessId && (
                <div>
                    {/* Render your ProcessViewer component or call onSelectProcess with selectedProcessId */}
                    {onSelectProcess(selectedProcessId)}
                </div>
            )}
        </div>
    );
};

export default ProcessManager;
