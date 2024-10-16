import { useState, useEffect } from 'react';
import { Spinner, Button, Notice, Panel, PanelHeader, PanelRow, Icon, ButtonGroup, Tooltip, Modal} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import ProcessCreator from './ProcessManager/ProcessCreator';
import { edit, seen, plus } from '@wordpress/icons';

const ProcessManager = ({ onSelectProcess }) => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [processTypeMappings, setProcessTypeMappings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processSteps, setProcessSteps] = useState([]);
    const [selectedProcessId, setSelectedProcessId] = useState(null);
    const [addingProcess, setAddingProcess] = useState(null);
    const [editingProcess, setEditingProcess] = useState(null);
    const [notice, setNotice] = useState(null);

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

    const handleProcessSaved = async (newProcess) => {
        if (editingProcess) {
            const updatedProcesses = processes.map(process =>
                process.id === editingProcess.id ? newProcess : process
            );
            setProcesses(updatedProcesses);
            setEditingProcess(null);
        }
        else {
            // Adiciona o novo processo à lista
            setProcesses(prevProcesses => [...prevProcesses, newProcess]);
            setAddingProcess(null);
        }
        setIsLoading(true);
        // Atualiza os mapeamentos de tipo de processo
        const updatedProcesses = [...processes, newProcess];
        setNotice({ status: 'success', message: 'Process saved successfully.' });
        await fetchProcessTypesForProcesses(updatedProcesses);
        setIsLoading(false);
    };
    

    const handleSelectProcess = (processId) => {
        setSelectedProcessId(processId);
        onSelectProcess(processId);
    };

    const handleEditProcess = (process) => {
        setEditingProcess(process);
    };

    const handleAddProcess = () => {
        setAddingProcess(true);
    };
    const handleCancel = () => {
        setEditingProcess(null);
        setAddingProcess(null);
    };


    if (isLoading) {
        return <Spinner />;
    }

    return (
        <main>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <div className="title-container">
                <h2>Process Manager</h2>
                <ButtonGroup>
                    <Button variant="primary" 
                        icon={<Icon icon={plus}/>}
                        onClick={handleAddProcess}
                        >Add new</Button>
                </ButtonGroup>
            </div>
            {notice && (
                <div className="notice-container">
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                </div>
            )}
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
                                    <th>Access Level</th>
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
                                            <td>{process.meta.current_stage || 'Not Started'}</td>
                                            <td><span className={`badge ${process.meta.access_level == 'public' ? 'success' : 'warning'}`}>{process.meta.access_level}</span></td>
                                            <td>
                                                <ButtonGroup>
                                                    <Tooltip text="View">
                                                        <Button
                                                        icon={<Icon icon={seen} />} 
                                                        onClick={() => handleSelectProcess(process.id)}
                                                        />

                                                    </Tooltip>
                                                    <Tooltip text="Edit">
                                                        <Button
                                                        icon={<Icon icon={edit} />}
                                                        onClick={() => handleEditProcess(process)}
                                                    />

                                                    </Tooltip>
                                                </ButtonGroup>
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
            {editingProcess && (
                    <Modal
                        title="Edit Process"
                        onRequestClose={handleCancel}
                        isDismissible={true}
                    >
                        <ProcessCreator 
                            processTypes={processTypes} 
                            onProcessSaved={handleProcessSaved} 
                            editingProcess={editingProcess}
                            onCancel={handleCancel} 
                        />
                    </Modal>
            )}
            {addingProcess && (
                <Modal
                    title="Add new process"
                    onRequestClose={handleCancel}
                    isDismissible={true}
                >
                    <ProcessCreator 
                        processTypes={processTypes} 
                        onProcessSaved={handleProcessSaved}
                        onCancel={handleCancel}
                    />
                </Modal>
            )}
            {selectedProcessId && (
                <div>
                    {/* Render your ProcessViewer component or call onSelectProcess with selectedProcessId */}
                    {onSelectProcess(selectedProcessId)}
                </div>
            )}
        </main>
    );
};

export default ProcessManager;
 