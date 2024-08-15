import { useState, useEffect } from 'react';
import { Spinner, Button, Notice, Panel, PanelHeader, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import ProcessCreator from './ProcessManager/ProcessCreator';

const ProcessManager = ({ onSelectProcess }) => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [processTypeMappings, setProcessTypeMappings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processSteps, setProcessSteps] = useState([]);
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

    const fetchProcesses = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch({ path: `/obatala/v1/process_obatala?per_page=100&_embed` });
            if (data && Array.isArray(data)) {
                setProcesses(data);
                await fetchProcessTypesForProcesses(data);
            } else {
                console.error('No processes data returned.');
                setProcesses([]); // Garanta que processes seja sempre um array
            }
        } catch (error) {
            console.error('Error fetching processes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProcessTypesForProcesses = async (processes) => {
        if (!processes || processes.length === 0) {
            console.error('No processes available for fetching process types.');
            return;
        }

        const promises = processes.map(async process => {
            try {
                const processTypeId = await apiFetch({ path: `/obatala/v1/process_obatala/${process.id}/process_type` });
                return { processId: process.id, processTypeId };
            } catch (error) {
                console.error(`Error fetching process type for process ${process.id}:`, error);
                return { processId: process.id, processTypeId: null };
            }
        });

        const results = await Promise.all(promises);
        setProcessTypeMappings(results);
    };

    const handleProcessCreated = async (newProcess) => {
        // Adiciona o novo processo à lista
        setProcesses(prevProcesses => [...prevProcesses, newProcess]);

        // Atualiza os mapeamentos de tipo de processo
        const updatedProcesses = [...processes, newProcess];
        await fetchProcessTypesForProcesses(updatedProcesses);
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
                                            <th>Process Type Title</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processes.map(process => {
                                            const typeMapping = processTypeMappings.find(m => m.processId == process.id);
                                            const processType = typeMapping ? processTypes.find(type => type.id == typeMapping.processTypeId) : null;

                                            return (
                                                <tr key={process.id}>
                                                    <td>{process.title.rendered}</td>
                                                    <td>{processType ? processType.title.rendered : ''}</td>
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
