import React, { useState, useEffect, useMemo } from 'react';
import {
    Icon,
    Notice,
    Panel,
    PanelRow,
    PanelHeader,
    Spinner
} from '@wordpress/components';
import { people, starFilled } from "@wordpress/icons";
import { fetchProcessModels, fetchSectors, fetchSectorsUsers } from '../api/apiRequests';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import BrandHeader from './BrandHeader';

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
        } catch (e) {
            console.error('Error parsing PHP data:', e);
        }
        return {};
    };

    const calculateProcessPercentage = (process) => {
        try {
            if (!process.meta) return 0;

            // Desserializa os estágios submetidos
            const submittedStages = process.meta.submittedStages?.[0]
                ? unserializePHP(process.meta.submittedStages[0])
                : {};

            const flowNodes = process.meta.flowData?.nodes || [];
            const validNodes = flowNodes.filter(node =>
                node.type === 'customNode' &&
                !['Start', 'End'].includes(node.id) &&
                !node.id.startsWith('Condicional')
            );

            const submittedCount = validNodes.reduce((count, node) => {
                const stageName = node.data?.stageName || node.id;
                return count + (
                    submittedStages[stageName] === true ||
                        submittedStages[stageName] === "1" ||
                        submittedStages[stageName] === 1 ? 1 : 0
                );
            }, 0);

            const percentage = validNodes.length > 0
                ? Math.round((submittedCount / validNodes.length) * 100)
                : 0;

            return percentage;
        } catch (error) {
            console.error('Error calculating percentage:', error);
            return 0;
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
        } catch (e) {
            console.error('Error formatting date:', e);
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
            .catch(error => {
                console.error('Error fetching process types:', error);
                setIsLoading(false);
            });
    };

    // Função para verificar se um processo está pendente (não completo)
    const isProcessPending = (process) => {
        if (process.status !== 'publish') return false;
    
        if (!process.meta?.flowData?.nodes) return false;
    
        const isNewProcess = !process.meta.submittedStages?.[0];
    
        // Se for novo, automaticamente está pendente
        if (isNewProcess) return true;
    
        const percentage = calculateProcessPercentage(process);
        const isNotComplete = percentage < 100;
    
        const currentStage = process.meta?.current_stage?.[0];
        const isNotAtEndNode = currentStage && 
            !process.meta.flowData.nodes.some(
                node => node.type === 'endNode' && node.id === currentStage
            );
    
        return isNotComplete && isNotAtEndNode;
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
                        const percentage = calculateProcessPercentage(process);
                        const stageData = process.meta?.stageData?.[0]
                            ? unserializePHP(process.meta.stageData[0])
                            : {};

                        const currentStage = process.meta?.current_stage?.[0];
                        const stageInfo = stageData[currentStage] || {};

                        return {
                            id: process.id,
                            title: process.title?.rendered || 'Sem título',
                            current_stage: currentStage,
                            percentage: percentage,
                            last_update: formatDate(stageInfo.updateAt || process.modified),
                            link: `/wp-admin/admin.php?page=process-viewer&process_id=${process.id}`,
                        };
                    });

                setPendingProcesses(pending);
            } catch (error) {
                console.error('Error loading pending processes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadPendingProcesses();
    }, [currentUser?.id]);

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
        } catch (error) {
            console.error("Error fetching processes:", error);
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
            .catch(error => {
                console.error('Error fetching sectors:', error);
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
            .catch(error => {
                console.error('Error fetching sectors:', error);
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
        } catch (error) {
            console.error('Erro ao buscar dados dos processos:', error);
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
        return processes.filter(process => {
            const nodes = process.meta?.flowData?.nodes?.filter(node => node.id !== "End") ?? [];
            const [currentStage] = process.meta?.current_stage || [];
            if (nodes.length === 0 || !currentStage) return false;

            const lastNode = nodes[nodes.length - 1];
            return lastNode?.data?.stageName === currentStage;
        }).length;
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
                </div>

                <div className="card-container">
                    <div className="card-item">
                        <img src={currentUser.avatar_urls?.[96]} className="user-photo" alt={`Foto de ${currentUser?.name}`} />
                        <span className="description">Olá, <strong>{currentUser.name}</strong>!</span>
                    </div>
                    <a href="/wp-admin/admin.php?page=process-manager" className="card-item">
                        <span className="indicator">{processes.length}</span>
                        <span className="description">Processes</span>
                    </a>
                    <a href="/wp-admin/admin.php?page=process-type-manager" className="card-item">
                        <span className="indicator">{processTypes.length}</span>
                        <span className="description">Models</span>
                    </a>
                    <a href="/wp-admin/admin.php?page=sector_manager" className="card-item">
                        <span className="indicator">{sectors.length}</span>
                        <span className="description">Groups</span>
                    </a>
                    <div className="card-item">
                        <span className="indicator">{countCompletedProcesses}/{processes.length} <small>({completedProcessesPercentage}%)</small></span>
                        <span className="description">Completed processes</span>
                        <progress value={completedProcessesPercentage} max="100">{completedProcessesPercentage}%</progress>
                    </div>
                </div>
                <Panel className="mt-2">
                        <PanelHeader>Pending processes</PanelHeader>
                        <PanelRow>
                            {pendingProcesses.length > 0 ? (
                                <table className="wp-list-table widefat fixed striped">
                                    <thead>
                                        <tr>
                                            <th>Process</th>
                                            <th>Current stage</th>
                                            <th>Last update</th>
                                            <th>Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingProcesses.map(process => (
                                            <tr key={process.id}>
                                                <td>
                                                    <a href={process.link} style={{ textDecoration: 'none' }}>
                                                        {process.title}
                                                    </a>
                                                </td>
                                                <td>{process.current_stage}</td>
                                                <td>{process.last_update}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <progress
                                                            value={process.percentage}
                                                            max="100"
                                                            style={{ width: '100px' }}
                                                        >
                                                            {process.percentage}%
                                                        </progress>
                                                        <span>{process.percentage}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <Notice status="info" isDismissible={false}>
                                    No pending processes found.
                                </Notice>
                            )}
                        </PanelRow>
                    </Panel>
                <div className="panel-container mt-2">
                    <Panel>
                        <PanelHeader>My groups</PanelHeader>
                        <PanelRow>
                            {matchesSectors.length > 0 ? (
                                <table className="wp-list-table widefat fixed striped table-view-list">
                                    <thead>
                                        <tr>
                                            <th>Group</th>
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
                            ) : (
                                <Notice isDismissible={false} status="warning">Sem resultados.</Notice>
                            )}
                        </PanelRow>
                    </Panel>
                    <Panel>
                        <PanelHeader>Top 5 most used models</PanelHeader>
                        <PanelRow>
                            {topModels.length > 0 ? (
                                <table className="wp-list-table widefat fixed striped table-view-list" >
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
                            ) : (
                                <Notice isDismissible={false} status="warning">Sem resultados.</Notice>
                            )}
                        </PanelRow>
                    </Panel>
                </div>
            </main>
        </>
    );
};

export default DashboardPage;
