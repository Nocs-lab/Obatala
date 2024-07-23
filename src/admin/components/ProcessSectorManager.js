import { useState, useEffect, useReducer } from 'react';
import { Spinner, Button, SelectControl, TextControl, Panel, PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import Reducer, { initialState } from './Modals/reducer';
import SectorCard from './ProcessSectorManager/SectorCard';
import ConfirmDeleteModal from './Modals/ConfirmDeleteModal';
import { useError } from '../contexts/ErrorContext';
import ErrorNotification from './ErrorNotification';

const ProcessSectorManager = () => {
    const [sectors, setSectors] = useState([]);
    const [users, setUsers] = useState([]);
    const [newSectorName, setNewSectorName] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [state, dispatch] = useReducer(Reducer, initialState);
    const { addError } = useError();

    useEffect(() => {
        fetchSectors();
        fetchUsers();
    }, []);

    const fetchSectors = () => {
        setIsLoading(true);
        apiFetch({ path: '/wp/v2/sector?per_page=100&_embed' })
            .then(data => {
                setSectors(data);
                setIsLoading(false);
            })
            .catch(error => {
                addError(error);
                setIsLoading(false);
            });
    };

    const fetchUsers = () => {
        setIsLoading(true);
        apiFetch({ path: '/wp/v2/users?per_page=100&_embed' })
            .then(data => {
                setUsers(data);
                setIsLoading(false);
            })
            .catch(error => {
                addError(error);
                setIsLoading(false);
            });
    };

    const handleAddSector = () => {
        if (newSectorName.trim() === '') return;
        setIsLoading(true);
        apiFetch({
            path: '/wp/v2/sector',
            method: 'POST',
            data: { name: newSectorName },
        })
            .then(newSector => {
                setSectors([...sectors, newSector]);
                setNewSectorName('');
                setIsLoading(false);
            })
            .catch(error => {
                addError(error);
                setIsLoading(false);
            });
    };

    const handleAddUserToSector = () => {
        if (selectedUser === '' || selectedSector === '') return;
        setIsLoading(true);
        const user = users.find(user => user.id === selectedUser);
        const updatedSectorIds = user.meta.sector_ids ? [...user.meta.sector_ids, selectedSector] : [selectedSector];

        apiFetch({
            path: `/wp/v2/users/${selectedUser}`,
            method: 'PUT',
            data: { meta: { sector_ids: updatedSectorIds } },
        })
            .then(updatedUser => {
                const updatedUsers = users.map(user =>
                    user.id === updatedUser.id ? updatedUser : user
                );
                setUsers(updatedUsers);
                setSelectedUser('');
                setSelectedSector('');
                setIsLoading(false);
            })
            .catch(error => {
                addError(error);
                setIsLoading(false);
            });
    };

    const handleDeleteSector = (id) => {
        apiFetch({ path: `/wp/v2/sector/${id}?force=true`, method: 'DELETE' })
            .then(() => {
                setSectors(sectors.filter(sector => sector.id !== id));
            })
            .catch(error => {
                addError(error);
            });
    };

    const handleConfirmDeleteSector = (id) => {
        dispatch({ type: 'OPEN_MODAL_SECTOR', payload: id });
    };

    const handleCancel = () => {
        dispatch({ type: 'CLOSE_MODAL' });
    };

    return (
        <>
            <ErrorNotification />
            <Panel>
                {isLoading && <Spinner />}
                <ConfirmDeleteModal
                    isOpen={state.isOpen}
                    onConfirm={() => {
                        if (state.deleteSector) {
                            handleDeleteSector(state.deleteSector);
                        }
                        dispatch({ type: 'CLOSE_MODAL' });
                    }}
                    onCancel={handleCancel}
                    itemType="setor"
                />

                <PanelBody title="Gerenciar Setores e Usuários">
                    <PanelRow>
                        <TextControl
                            label="Nome do Novo Setor"
                            value={newSectorName}
                            onChange={(value) => setNewSectorName(value)}
                        />
                        <Button isPrimary onClick={handleAddSector}>Adicionar Setor</Button>
                    </PanelRow>
                    <PanelRow>
                        <SelectControl
                            label="Usuário"
                            value={selectedUser}
                            options={users.map(user => ({ label: user.name, value: user.id }))}
                            onChange={(value) => setSelectedUser(value)}
                        />
                        <SelectControl
                            label="Setor"
                            value={selectedSector}
                            options={sectors.map(sector => ({ label: sector.name, value: sector.id }))}
                            onChange={(value) => setSelectedSector(value)}
                        />
                        <Button isPrimary onClick={handleAddUserToSector}>Adicionar Usuário ao Setor</Button>
                    </PanelRow>
                </PanelBody>

                <PanelBody title="Setores Criados">
                    <div className="sectors-container">
                        {sectors.length === 0 ? (
                            <p>Nenhum setor criado.</p>
                        ) : (
                            sectors.map(sector => (
                                <SectorCard
                                    key={sector.id}
                                    sector={sector}
                                    users={users.filter(user => user.meta.sector_ids && user.meta.sector_ids.includes(sector.id))}
                                    onDelete={handleConfirmDeleteSector}
                                />
                            ))
                        )}
                    </div>
                </PanelBody>
            </Panel>
        </>
    );
};

export default ProcessSectorManager;
