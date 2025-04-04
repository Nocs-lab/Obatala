import { useState, useEffect, useMemo } from 'react';
import { Spinner, Button, Notice, Icon, ButtonGroup, Modal, TabPanel} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import ProcessCreator from './ProcessManager/ProcessCreator';
import { plus } from '@wordpress/icons';
import ProcessList from './ProcessManager/ProcessList';

const ProcessManager = ({ onSelectProcess }) => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [processTypeMappings, setProcessTypeMappings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processUser, setProcessUser] = useState([]);
    const [selectedProcessId, setSelectedProcessId] = useState(null);
    const [addingProcess, setAddingProcess] = useState(null);
    const [editingProcess, setEditingProcess] = useState(null);
    const [accessLevel, setAccessLevel] = useState(null);
    const [modelFilter, setModelFilter] = useState(null);
    const [notice, setNotice] = useState(null);
    const [activeTab, setActiveTab] = useState('all'); 

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);

    useEffect(() => {
        fetchProcessModels();
        fetchProcesses();        
    }, []);
    
    useEffect(() => {
        fetchProcessesUser();
    }, [currentUser])
    

    const fetchProcessModels = () => {
        apiFetch({ path: `/obatala/v1/process_type?per_page=100&_embed` })
        .then((data) => {
            const sortedProcessType = data.sort((a, b) =>
            a.title.rendered.localeCompare(b.title.rendered)
            );
            setProcessTypes(sortedProcessType);
        })
        .catch((error) => {
            console.error("Error fetching process types:", error);
        });
    };

    const fetchProcessesUser = () => {
        setIsLoading(true);        
        fetchUserProcesses(currentUser.id)
            .then(data => {
                setProcessUser(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
                setIsLoading(false);
            });
    };

    const fetchProcesses = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch({
                path: `/obatala/v1/process_obatala?per_page=100&_embed`,
            });
            if (data && Array.isArray(data)) {
                setProcesses(data);
                await fetchProcessModelsForProcesses(data);
            } else {
                console.error("No processes data returned.");
                setProcesses([]); // Garanta que processes seja sempre um array
            }
        } catch (error) {
            console.error("Error fetching processes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProcessModelsForProcesses = async (processes) => {
        if (!processes || processes.length === 0) {
            console.error("No processes available for fetching process types.");
            return;
        }

        const promises = processes.map(async (process) => {
        try {
            const processTypeId = await apiFetch({
            path: `/obatala/v1/process_obatala/${process.id}/process_type`,
            });
            return { processId: process.id, processTypeId };
        } catch (error) {
            console.error(
            `Error fetching process type for process ${process.id}:`,
            error
            );
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
        await fetchProcessModelsForProcesses(updatedProcesses);
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

    const filteredUserProcesses =useMemo(() => { 
        return Array.isArray(processUser)
        ?   processes.filter(process => processUser?.includes(process.id))
        : []
    }, [processUser,processes]);
      
    const filteredProcess = useMemo(() => {
        const processList = activeTab === 'all' ? processes : filteredUserProcesses;  

        return processList.filter(process => {
            const matchesAccessLevel = !accessLevel || 
                process?.meta?.access_level?.[0]?.includes(accessLevel);
            
            const matchesProcessType = !modelFilter || 
                process?.meta?.process_type?.[0]?.includes(modelFilter.toString());
            
            return matchesAccessLevel && matchesProcessType;
        });
    }, [accessLevel, modelFilter, processes, filteredUserProcesses, activeTab]); 
    
    if (isLoading) {
        return <Spinner />;
    }
    
    return (
        <>
           <BrandHeader />
            <main>
                <div className="title-container">
                    <h2>Processes</h2>
                    <span className="badge">{filteredProcess.length}</span>
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            icon={<Icon icon={plus} />}
                            onClick={handleAddProcess}
                        >
                            Add new
                        </Button>
                    </ButtonGroup>
                </div>

            {notice && (
                <div className="notice-container">
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                </div>
            )}

            <ProcessList
                processes={filteredProcess}
                onEdit={handleEditProcess}
                onViewProcess={handleSelectProcess}
                processTypeMappings={processTypeMappings}
                processTypes={processTypes}
                accessLevel={accessLevel}
                setAccessLevel={setAccessLevel}
                modelFilter={modelFilter}
                setModelFilter={setModelFilter}
            />
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
