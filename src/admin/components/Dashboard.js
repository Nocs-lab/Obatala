import React, { useState, useEffect, useMemo } from 'react';
import {
    Icon,
    Notice,
    Panel,
    PanelRow,
    PanelHeader,
    Spinner
} from '@wordpress/components';
import { fetchProcessModels, fetchSectors, fetchSectorsUsers, } from '../api/apiRequests';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const DashboardPage = () => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [sectorsUsers, setSectorsUsers] = useState([])
    const [topModels, setTopModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingProcesses, setPendingProcesses] = useState([]);

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);

    const unserializePHP = (serializedData) => {
        if (!serializedData) return {};
        try {            
            if (typeof serializedData === 'object') {
                return serializedData;
            }
            if (typeof serializedData === 'string') {
                const matches = serializedData.matchAll(/s:\d+:"([^"]+)";(b|i|s):([^;]+);/g);
                const result = {};

                for (const match of matches) {
                    const key = match[1];
                    const type = match[2];
                    let value = match[3];

                    if (type === 'b') {
                        value = value === '1';
                    } else if (type === 'i') {
                        value = parseInt(value);
                    }
                    result[key] = value;
                }
                return result;
            }
        } catch {
            console.error('Error parsing PHP data:');
        }
        return {};
    };

    const getProcessDetails = (process) => {
        try {
            if (!process.meta) {
                return {
                    percentage: 0,
                    lastUpdate: null,
                    currentStage: null
                };
            }
            const { nodes, edges } = process.meta.flowData || {};
            const submittedStages = process.meta.submittedStages?.[0]
                ? unserializePHP(process.meta.submittedStages[0])
                : {};
            const stageData = process.meta.stageData?.[0]
                ? unserializePHP(process.meta.stageData[0])
                : {};
            // Determinar o caminho ativo (considerando condicionais)
            let activePathNodes = [];
            let currentNodeId = 'Start';

            while (currentNodeId && currentNodeId !== 'End') {
                const currentNode = nodes?.find(n => n.id === currentNodeId);
                if (!currentNode) break;

                if (currentNode.type === 'customNodeConditional') {
                    const inputNodeId = currentNode.data?.condition?.inputNode;
                    if (inputNodeId) {
                        const inputStageName = nodes.find(n => n.id === inputNodeId)?.data?.stageName || inputNodeId;
                        const submittedValue = submittedStages[inputStageName];
                        const matchingOutput = currentNode.data?.condition?.outputNodes?.find(
                            output => output.conditionValue === submittedValue
                        );

                        if (matchingOutput) {
                            currentNodeId = matchingOutput.nodeId;
                            continue;
                        }
                    }
                }

                // nós normais
                const nextEdge = edges?.find(edge => edge.source === currentNodeId);
                if (!nextEdge) break;

                currentNodeId = nextEdge.target;
                if (nodes?.some(n => n.id === currentNodeId &&
                    n.type === 'customNode' &&
                    !['Start', 'End'].includes(n.id) &&
                    !n.id.startsWith('Condicional'))) {
                    activePathNodes.push(currentNodeId);
                }
            }

            // Calcular porcentagem
            const validNodes = nodes?.filter(node =>
                node.type === 'customNode' &&
                !['Start', 'End'].includes(node.id) &&
                !node.id.startsWith('Condicional')
            ) || [];

            const completedCount = validNodes.reduce((count, node) => {
                const stageName = node.data?.stageName || node.id;
                const isSubmitted = submittedStages[stageName] === true ||
                    submittedStages[stageName] === "1" ||
                    submittedStages[stageName] === 1;
                const isFinished = node.node_status === "Finished";
                const isInActivePath = activePathNodes.includes(node.id);

                return count + (isInActivePath && (isSubmitted || isFinished) ? 1 : 0);
            }, 0);

            const totalActiveNodes = validNodes.filter(node =>
                activePathNodes.includes(node.id)
            ).length;

            const percentage = totalActiveNodes > 0
                ? Math.round((completedCount / totalActiveNodes) * 100)
                : 0;

            const currentStageId = process.meta?.current_stage?.[0];
            let currentStage = null;
            let lastUpdate = process.modified;

            if (currentStageId) {
                currentStage = nodes?.find(n => n.id === currentStageId)?.data?.stageName || currentStageId;

                const stageUpdate = stageData[currentStageId]?.updateAt ||
                    stageData[currentStage]?.updateAt;
                if (stageUpdate) {
                    lastUpdate = stageUpdate;
                }
            }

            return {
                percentage,
                lastUpdate: formatDate(lastUpdate),
                currentStage,
                currentStageId
            };
        } catch {
            console.error('Error getting process details:');
            return {
                percentage: 0,
                lastUpdate: null,
                currentStage: null,
                currentStageId: null
            };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            console.error('Error formatting date:');
            return dateString;
        }
    };

    useEffect(() => {
        loadProcessTypes();
        loadProcesses();
        loadSectors();
        loadSectorsUsers();
    }, []);

    useEffect(() => {
        topFiveModels();
    }, [processes])

    const loadProcessTypes = () => {
        setIsLoading(true);
        fetchProcessModels()
            .then(data => {
                setProcessTypes(data);
                setIsLoading(false);
            })
            .catch(() => {
                console.error('Error fetching process types:');
                setIsLoading(false);
            });
    };

    // Função para verificar se um processo está pendente
    const isProcessPending = (process) => {
        if (process.status !== 'publish') return false;

        const processStatus = process.meta?.status?.[0];
        const currentStageId = process.meta?.current_stage?.[0];

        if (processStatus === "Finished") return false;

        if (!process.meta?.flowData?.nodes) return false;

        if (!currentStageId) return true;

        const currentNode = process.meta.flowData.nodes.find(node => node.id === currentStageId);

        if (!currentNode || currentNode.type === 'endNode') return false;

        if (currentNode.sector_obatala) {
            const userInSector = sectorsUsers.some(sector =>
                sector.sector_id === currentNode.sector_obatala &&
                sector.users.some(user => user.ID === currentUser?.id)
            );
            return userInSector;
        }

        return true;
    };

    useEffect(() => {
        if (!currentUser?.id) return;

        const loadPendingProcesses = async () => {
            setIsLoading(true);
            try {
                const processes = await apiFetch({
                    path: '/obatala/v1/process_obatala?per_page=100&_embed'
                });

                const pending = processes
                    .filter(isProcessPending)
                    .slice(0, 10)
                    .map(process => {
                        const details = getProcessDetails(process);

                        return {
                            id: process.id,
                            title: process.title?.rendered || 'Sem título',
                            percentage: details.percentage,
                            lastUpdate: details.lastUpdate,
                            currentStage: details.currentStage,
                            currentStageId: details.currentStageId,
                            link: obatalaApp.admin_url + `admin.php?page=process-viewer&process_id=${process.id}`,
                        };
                    });

                setPendingProcesses(pending);
            } catch {
                console.error('Error loading pending processes:');
            } finally {
                setIsLoading(false);
            }
        };

        loadPendingProcesses();
    }, [currentUser?.id, sectorsUsers]);

    const loadProcesses = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch({
                path: `/obatala/v1/process_obatala?per_page=100&_embed`,
            });
            if (data && Array.isArray(data)) {
                setProcesses(data);
            } else {
                console.error("No processes data returned.");
                setProcesses([]);
            }
        } catch {
            console.error("Error fetching processes:");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSectors = () => {
        setIsLoading(true);
        fetchSectors()
            .then(data => {
                const sectors = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    name: value.nome,
                    description: value.descricao,
                    status: value.status,
                }));

                setSectors(sectors);
                setIsLoading(false);
            })
            .catch(() => {
                console.error('Error fetching sectors:');
                setIsLoading(false);
            });
    };

    const loadSectorsUsers = () => {
        setIsLoading(true);
        fetchSectorsUsers()
            .then(data => {
                setSectorsUsers(data);
                setIsLoading(false);
            })
            .catch(() => {
                console.error('Error fetching sectors:');
                setIsLoading(false);
            });
    };

    const sectorsUserLogged = useMemo(() => {
        return sectorsUsers.filter(sector => {
            const matchesUser = currentUser?.id
                ? sector?.users?.some(user => user.ID === currentUser?.id) &&
                sector?.sector_status === 'Active'
                : true;
            return matchesUser;
        });
    }, [sectorsUsers, currentUser]);

    const matchesSectors = useMemo(() => {
        return sectors.filter(sector => {
            const matchesSector = sectorsUserLogged?.some(sectorLogged => sectorLogged?.sector_id === sector?.id);
            return matchesSector;
        });
    }, [sectorsUserLogged, sectors]);

    const topFiveModels = () => {
        try {
            setIsLoading(true);

            const modelCount = {};

            processes.map(process => {
                const modelId = process?.meta?.process_type[0];
                if (modelId) {
                    if (modelId) {
                        if (!modelCount[modelId]) {
                            modelCount[modelId] = 0;
                        }
                        modelCount[modelId] += 1;
                    }
                }
            });
            const sortedModels = Object.entries(modelCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([modelId, count]) => ({
                    modelId,
                    count,
                    modelName: getModelNameById(modelId),
                }));

            setTopModels(sortedModels);
        } catch {
            console.error('Erro ao buscar dados dos processos:');
        } finally {
            setIsLoading(false);
        }
    };

    const getModelNameById = (modelId) => {
        const model = processTypes.find(m => m.id.toString() === modelId);
        return model ? model.title.rendered : 'Desconhecido';
    };

    // Função para contar processos concluídos
    const countCompletedProcesses = useMemo(() => {
        const finishedProcesses = processes.filter(process => {
            const status = process?.meta?.status?.[0];
            return status === "Finished";
        });
        return finishedProcesses.length;
    }, [processes]);

    // Porcentagem de processos concluídos
    const completedProcessesPercentage = useMemo(() => {
        return processes.length ? Math.round((countCompletedProcesses / processes.length) * 100) : 0;
    }, [countCompletedProcesses, processes.length]);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <BrandHeader />
            <main>
                <div className="title-container">
                    <h2>Dashboard</h2>
                    <div className="stat" title={`${completedProcessesPercentage}%`}>
                        <p className="description">{countCompletedProcesses}/{processes.length} completed processes</p>
                        <progress value={completedProcessesPercentage} max="100">{completedProcessesPercentage}%</progress>
                    </div>
                </div>
                <div className="dashboard-container">
                    <div className="dashboard-item-personal">
                        <div className="card-container">
                            <div className="card-item primary-100">
                                <img src={currentUser.avatar_urls?.[96]} className="user-photo" alt={`Foto de ${currentUser?.name}`} />
                                <span className="description">Olá, <strong>{currentUser.name}</strong>!</span>

                                {matchesSectors.length > 0 && (
                                    <>
                                        <div className="table-responsive mt-2">
                                            <table className="wp-list-table widefat transparent">
                                                <thead>
                                                    <tr>
                                                        <th>My group</th>
                                                        <th>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {matchesSectors.map((sector) => (
                                                        <tr key={sector.id}>
                                                            <td>
                                                                <a
                                                                    href={`/wp-admin/admin.php?page=sector-details&sector_id=${sector.id}`}
                                                                >
                                                                    {sector.name}
                                                                </a>
                                                            </td>
                                                            <td>{sector.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                            {pendingProcesses.length > 0 && (
                                <Panel className="warning">
                                    <PanelHeader>Pending processes</PanelHeader>
                                    <PanelRow>
                                        {pendingProcesses.length > 0 ? (
                                            <ul className="list-actions mb-0">
                                                {pendingProcesses.map(process => {
                                                    return (
                                                        <li key={process.id}>
                                                            <a href={process.link}>
                                                                <span className="percent">{process.percentage}%</span>
                                                                <span className="text">
                                                                    {process.title}
                                                                    <small className="d-block">
                                                                        Etapa atual: {process.currentStage || 'N/A'}
                                                                    </small>
                                                                </span>
                                                                <Icon icon="arrow-right-alt2" />
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <Notice status="info" isDismissible={false}>
                                                No pending processes found.
                                            </Notice>
                                        )}
                                    </PanelRow>
                                </Panel>
                            )}
                        </div>
                    </div>
                    <div className="dashboard-item-stats">
                        <div className="card-container">
                            <a href={obatalaApp.admin_url +"admin.php?page=process-manager"} className="card-item">
                                <span className="indicator">{processes.length}</span>
                                <span className="description"><Icon icon="admin-page" /> Processes</span>
                            </a>
                            <a href={obatalaApp.admin_url +"admin.php?page=process-type-manager"} className="card-item">
                                <span className="indicator">{processTypes.length}</span>
                                <span className="description"><Icon icon="welcome-widgets-menus" /> Models</span>
                            </a>
                            <a href={obatalaApp.admin_url +"admin.php?page=sector_manager"} className="card-item">
                                <span className="indicator">{sectors.length}</span>
                                <span className="description"><Icon icon="groups" /> Groups</span>
                            </a>
                        </div>
                        <div className="panel-container mt-2">
                            <Panel>
                                <PanelHeader>Top 5 most used models</PanelHeader>
                                <PanelRow>
                                    {topModels.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="wp-list-table widefat striped table-view-list">
                                                <thead>
                                                    <tr>
                                                        <th>Nome</th>
                                                        <th>Quantidade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topModels.map((sector) => (
                                                        <tr key={sector.modelId}>
                                                            <td>{sector.modelName}</td>
                                                            <td>{sector.count}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <Notice isDismissible={false} status="warning">Sem resultados.</Notice>
                                    )}
                                </PanelRow>
                            </Panel>
                        </div>
                    </div>
                </div>
            </main>
            <BrandFooter />
        </>
    );
};

export default DashboardPage;
