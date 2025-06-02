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

    
    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);
    
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
                    <div class="dashboard-item-personal">
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

                            <Panel className="warning">
                                <PanelHeader>Pending input processes <span className="badge">3</span></PanelHeader>
                                <PanelRow>
                                    <ul className="list-actions mb-0">
                                        <li><a href="#"><Icon icon="warning" /><span className="text">Nome de processo 1</span><Icon icon="arrow-right-alt2" /></a></li>
                                        <li><a href="#"><Icon icon="warning" /><span className="text">Nome de processo Responsável pela doação...</span><Icon icon="arrow-right-alt2" /></a></li>
                                        <li><a href="#"><Icon icon="warning" /><span className="text">Nome de processo 3</span><Icon icon="arrow-right-alt2" /></a></li>
                                    </ul>
                                </PanelRow>
                            </Panel>
                        </div>
                    </div>
                    <div class="dashboard-item-stats">
                        <div className="card-container">
                            <a href="/wp-admin/admin.php?page=process-manager" className="card-item">
                                <span className="indicator">{processes.length}</span>
                                <span className="description"><Icon icon="admin-page" /> Processes</span>
                            </a>
                            <a href="/wp-admin/admin.php?page=process-type-manager" className="card-item">
                                <span className="indicator">{processTypes.length}</span>
                                <span className="description"><Icon icon="welcome-widgets-menus" /> Models</span>
                            </a>
                            <a href="/wp-admin/admin.php?page=sector_manager" className="card-item">
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
