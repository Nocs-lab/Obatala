import React, { useState, useEffect, useMemo } from 'react';
import {
    Icon,
    Notice,
    Panel,
    PanelRow,
    PanelHeader
} from '@wordpress/components';
import { people,  starFilled } from "@wordpress/icons";
import { fetchProcessModels, fetchSectors, fetchSectorsUsers, } from '../api/apiRequests';
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
                ? sector?.users?.some(user => user.ID === currentUser?.id)
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

    return (
        <>
            <header><BrandHeader title="Dashboard" /></header>
            <main>
                <div className="title-container">
                    <h2>Dashboard</h2>
                </div>

                <div className="card-container">
                    <div className="card-item">
                        <img src="https://placehold.co/40" className="user-photo" alt="Foto de NOME" />
                        <span className="description">Olá, <strong>NOME</strong>!</span>
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
                </div>
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
                                                <td>{sector.name}</td>
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
