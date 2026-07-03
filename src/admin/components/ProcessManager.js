import { useState, useEffect, useMemo } from 'react';
import { Spinner, Button, Notice, Icon, Modal, TabPanel, __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import ProcessCreator from './ProcessManager/ProcessCreator';
import { plus } from '@wordpress/icons';
import ProcessList from './ProcessManager/ProcessList';
import { fetchUserProcesses, deleteProcess } from '../api/apiRequests';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const getMetaValue = (meta, key) => {
    if (!meta || meta[key] === undefined || meta[key] === null) {
        return '';
    }
    const value = meta[key];
    return Array.isArray(value) ? (value[0] ?? '') : value;
};

const sortProcessesNewestFirst = (processList) => {
    return [...processList].sort((a, b) => {
        const aAno = parseInt(getMetaValue(a.meta, 'ano_processo') || '0', 10);
        const bAno = parseInt(getMetaValue(b.meta, 'ano_processo') || '0', 10);
        if (aAno !== bAno) {
            return bAno - aAno;
        }

        const aSeq = parseInt(getMetaValue(a.meta, 'sequencial_processo') || '0', 10);
        const bSeq = parseInt(getMetaValue(b.meta, 'sequencial_processo') || '0', 10);
        if (aSeq !== bSeq) {
            return bSeq - aSeq;
        }

        const aDate = new Date(a.date || a.modified || 0).getTime();
        const bDate = new Date(b.date || b.modified || 0).getTime();
        if (aDate !== bDate) {
            return bDate - aDate;
        }

        return (b.id || 0) - (a.id || 0);
    });
};

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
    const [processToDelete, setProcessToDelete] = useState(null);
    const [isDeletingProcess, setIsDeletingProcess] = useState(false);
    const [progressMap, setProgressMap] = useState({});
    const [fetchedProcessIds, setFetchedProcessIds] = useState(new Set());
    const [progressFilter, setProgressFilter] = useState('');

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);

    useEffect(() => {
        fetchProcessModels();
        fetchProcesses();
    }, []);

    useEffect(() => {
        fetchProcessesUser();
    }, [currentUser])

    useEffect(() => {
        processes.forEach((process) => {
            const processId = process.id;
            if (!fetchedProcessIds.has(processId)) {
                setFetchedProcessIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(processId);
                    return newSet;
                });
                apiFetch({
                    path: `/obatala/v1/process_obatala/${processId}/node`,
                    method: 'GET',
                })
                .then((response) => {
                    setProgressMap((prev) => ({
                        ...prev,
                        [processId]: response.progress,
                    }));
                })
                .catch((error) => {
                    console.error('Erro ao buscar progresso do processo:', error);
                    setProgressMap((prev) => ({
                        ...prev,
                        [processId]: 0,
                    }));
                });
            }
        });
    }, [processes, fetchedProcessIds]);


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
                setProcesses(sortProcessesNewestFirst(data));
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
            setProcesses((prev) =>
                sortProcessesNewestFirst(
                    prev.map((process) =>
                        process.id === editingProcess.id ? newProcess : process
                    )
                )
            );
            setEditingProcess(null);
        } else {
            setProcesses((prev) => sortProcessesNewestFirst([...prev, newProcess]));
            setAddingProcess(null);
        }

        setFetchedProcessIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(newProcess.id);
            return newSet;
        });

        setNotice({ status: 'success', message: __('Process saved successfully.', 'obatala') });

        setProcessTypeMappings((prev) => {
            const processTypeId = newProcess.meta?.process_type?.[0] ?? newProcess.meta?.process_type;
            const withoutCurrent = prev.filter((m) => m.processId !== newProcess.id);
            return [
                ...withoutCurrent,
                { processId: newProcess.id, processTypeId: processTypeId ?? null },
            ];
        });

        await fetchProcessesUser();
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

    const handleConfirmDelete = (process) => {
        setProcessToDelete(process);
    };

    const handleDeleteProcess = async () => {
        if (!processToDelete) {
            return;
        }

        setIsDeletingProcess(true);
        try {
            const response = await deleteProcess(processToDelete.id);
            setProcesses((prev) => prev.filter((p) => p.id !== processToDelete.id));
            setProcessTypeMappings((prev) => prev.filter((m) => m.processId !== processToDelete.id));
            const successMessage = response?.message
                ? __(response.message, 'obatala')
                : __('Process deleted successfully.', 'obatala');
            setNotice({ status: 'success', message: successMessage });
            await fetchProcessesUser();
        } catch (error) {
            console.error('Error deleting process:', error);
            const rawMessage = error?.message || error?.data?.message;
            setNotice({
                status: 'error',
                message: typeof rawMessage === 'string'
                    ? __(rawMessage, 'obatala')
                    : __('Error deleting process.', 'obatala'),
            });
        } finally {
            setIsDeletingProcess(false);
            setProcessToDelete(null);
        }
    };

    const filteredUserProcesses =useMemo(() => {
        return Array.isArray(processUser)
        ?   processes.filter(process => processUser?.includes(process.id))
        : []
    }, [processUser,processes]);

    const filteredProcess = useMemo(() => {
        const processList = activeTab === 'all' ? processes : filteredUserProcesses;

        return sortProcessesNewestFirst(
            processList.filter(process => {
                const matchesAccessLevel = !accessLevel ||
                    process?.meta?.access_level?.[0]?.includes(accessLevel);

                const matchesProcessType = !modelFilter ||
                    process?.meta?.process_type?.[0]?.includes(modelFilter.toString());

                if (!matchesAccessLevel || !matchesProcessType) {
                    return false;
                }

                const progress = progressMap[process.id];
                if (progressFilter === 'not_started') {
                    return progress === 0;
                }
                if (progressFilter === 'in_progress') {
                    return progress > 0 && progress < 100;
                }
                if (progressFilter === 'finished') {
                    return progress === 100;
                }

                return true;
            })
        );
    }, [accessLevel, modelFilter, processes, filteredUserProcesses, activeTab, progressMap, progressFilter]);

    if (isLoadingProcesses) {
        return <Spinner />;
    }

    return (
        <>
            <BrandHeader />
            <div className="title-container">
                <h2>{__('Processes', 'obatala')}</h2>
                <span className="badge default">{filteredProcess.length}</span>
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
                <ConfirmDialog
                    isOpen={!!processToDelete}
                    onConfirm={handleDeleteProcess}
                    onCancel={() => setProcessToDelete(null)}
                    confirmButtonText={__('Delete', 'obatala')}
                    cancelButtonText={__('Cancel', 'obatala')}
                    isBusy={isDeletingProcess}
                >
                    {sprintf(
                        __('Are you sure you want to delete process %s?', 'obatala'),
                        processToDelete?.title?.rendered || ''
                    )}
                </ConfirmDialog>
                <div className="panel-container">
                    <TabPanel
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
                                progressMap={progressMap}
                                progressFilter={progressFilter}
                                setProgressFilter={setProgressFilter}
                                loading={isLoadingProcesses || (activeTab === 'my' && isLoadingUserProcesses)}
                                onEdit={handleEditProcess}
                                onViewProcess={handleSelectProcess}
                                onDelete={handleConfirmDelete}
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
