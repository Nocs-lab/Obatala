import { useState, useEffect } from 'react';
import { Spinner, Button, SelectControl, TextControl, Notice, Panel, PanelHeader, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessManager = ({ onSelectProcess }) => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newProcessTitle, setNewProcessTitle] = useState('');
    const [newProcessType, setNewProcessType] = useState('');
    const [selectedProcessId, setSelectedProcessId] = useState(null);

    useEffect(() => {
        fetchProcessTypes();
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

        apiFetch({ path: `/obatala/v1/process_obatala`, method: 'POST', data: newProcess })
            .then(savedProcess => {
                setProcesses([...processes, savedProcess]);
                setNewProcessTitle('');
                setNewProcessType('');
            })
            .catch(error => {
                console.error('Error creating process:', error);
            });
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
                        <PanelHeader>Existing Processes</PanelHeader>
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
                                            const processTypeFiltered = processTypes.find(processType => {
                                                return processType.id == process.process_type;
                                            });
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
                    <Panel>
                        <PanelHeader>Create Process</PanelHeader>
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
                    </Panel>
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
