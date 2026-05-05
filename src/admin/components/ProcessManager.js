import { useState, useEffect, useMemo } from 'react';
import { Spinner, Button, Notice, Icon, Modal, TabPanel} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import ProcessCreator from './ProcessManager/ProcessCreator';
import { plus } from '@wordpress/icons';
import ProcessList from './ProcessManager/ProcessList';
import { fetchUserProcesses } from '../api/apiRequests';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const ProcessManager = ({ onSelectProcess }) => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [processTypeMappings, setProcessTypeMappings] = useState([]);
    const [isLoadingProcesses, setIsLoadingProcesses] = useState(true);
    const [isLoadingUserProcesses, setIsLoadingUserProcesses] = useState(false);
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
        if (!currentUser?.id) {
            setProcessUser([]);
            setIsLoadingUserProcesses(false);
            return Promise.resolve([]);
        }

        setIsLoadingUserProcesses(true);        
        return fetchUserProcesses(currentUser.id)
            .then(data => {
                setProcessUser(data);
                setIsLoadingUserProcesses(false);
                return data;
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
                setIsLoadingUserProcesses(false);
                return [];
            });
    };

    const fetchProcesses = async () => {
        setIsLoadingProcesses(true);
        try {
            const data = await apiFetch({
                path: `/obatala/v1/process_obatala?per_page=100&_embed`,
            });
            if (data && Array.isArray(data)) {
                setProcesses(data);
                await fetchProcessModelsForProcesses(data);
            } else {
                console.error("No processes data returned.");
                setProcesses([]); 
            }
        } catch (error) {
            console.error("Error fetching processes:", error);
        } finally {
            setIsLoadingProcesses(false);
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
            setProcesses(prevProcesses => [...prevProcesses, newProcess]);
            setAddingProcess(null);
        }
        setIsLoadingProcesses(true);
        // Atualiza os mapeamentos de tipo de processo
        const updatedProcesses = [...processes, newProcess];
        setNotice({ status: 'success', message: __('Process saved successfully.', 'obatala') });
        await fetchProcessModelsForProcesses(updatedProcesses);
        await fetchProcessesUser();
        setIsLoadingProcesses(false);
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
    
    if (isLoadingProcesses) {
        return <Spinner />;
    }
    
    return (
        <>
            <BrandHeader />
            <div className="title-container">
                <h2>{__('Processes', 'obatala')}</h2>
                <span className="badge">{filteredProcess.length}</span>
                <div className="group-button">
                    <Button
                        variant="secondary"
                        size="small"
                        icon={<Icon icon={plus} />}
                        onClick={handleAddProcess}
                    >
                        {__('Add new', 'obatala')}
                    </Button>
                </div>
            </div>
            <main>
                {notice && (
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                )}
                <div className="panel-container">
                    <TabPanel
                        className="process-tabs"
                        activeClass="active-tab"
                        onSelect={(tabName) => setActiveTab(tabName)}
                        initialTabName="all"
                        tabs={[
                            {
                                name: 'all',
                                title: __('All processes', 'obatala'),
                                className: activeTab === 'all' ? 'is-active' : ''
                            },
                            {
                                name: 'my',
                                title: __('My processes', 'obatala'),
                                className: activeTab === 'my' ? 'is-active' : ''
                            },
                        ]}
                    >
                        {({ tab }) => (
                            <ProcessList
                                processes={filteredProcess}
                                loading={isLoadingProcesses || (activeTab === 'my' && isLoadingUserProcesses)}
                                onEdit={handleEditProcess}
                                onViewProcess={handleSelectProcess}
                                processTypeMappings={processTypeMappings}
                                processTypes={processTypes}
                                accessLevel={accessLevel}
                                setAccessLevel={setAccessLevel}
                                modelFilter={modelFilter}
                                setModelFilter={setModelFilter}
                            />
                        )}
                    </TabPanel>
                </div>
                {editingProcess && (
                    <Modal
                        title={__('Edit Process', 'obatala')}
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
                        title={__('Add new process', 'obatala')}
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
            <BrandFooter />
        </>
    );
};

export default ProcessManager;
