// SectorDetailsPage.js
import React, { useEffect, useState } from 'react';
import { Button, Notice, Panel, PanelHeader, PanelRow, Spinner, Tooltip, __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from "@wordpress/api-fetch";
import { deleteSectorUser, fetchUsersBySector } from '../../api/apiRequests';
import BrandHeader from '../BrandHeader';
import BrandFooter from '../BrandFooter';
import UsersManager from './UserManager/UserManager';

const SectorDetailsPage = () => {
    const [sector, setSector] = useState(null);
    const [sectorUsers, setSectorUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getSectorIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("sector_id");
    };

    const loadSectorUsers = async () => {
        if (!sector?.id) {
            return;
        }

        setUsersLoading(true);
        setUsersError(null);
        try {
            const data = await fetchUsersBySector(sector.id);
            setSectorUsers(Array.isArray(data) ? data : []);
        } catch (requestError) {
            console.error('Error fetching sector users:', requestError);
            setUsersError(__('Failed to load related users.', 'obatala'));
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        loadSectorUsers();
    }, [sector]);

    const handleDeleteUser = async () => {
        if (!userToDelete) {
            return;
        }

        try {
            await deleteSectorUser(sector.id, { user_id: userToDelete.ID });
            setSectorUsers(currentUsers => currentUsers.filter(user => user.ID !== userToDelete.ID));
        } catch (requestError) {
            console.error('Error removing user from sector:', requestError);
            setUsersError(__('Error removing user.', 'obatala'));
        } finally {
            setUserToDelete(null);
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        const fetchSectorDetails = async () => {
            const sectorId = getSectorIdFromUrl();
            if (!sectorId) {
                if (isMounted) {
                    setError(__('Sector ID not found in URL', 'obatala'));
                    setLoading(false);
                }
                return;
            }
            
            try {
                const fetchSectorData = async () => {
                    try {
                        return await apiFetch({ path: `/obatala/v1/get_sector_obatala/${sectorId}` });
                    } catch (requestError) {
                        if (requestError?.code !== 'invalid_json') {
                            throw requestError;
                        }

                        const sectors = await apiFetch({ path: '/obatala/v1/all_sector_obatala' });
                        if (!sectors?.[sectorId]) {
                            throw requestError;
                        }

                        return {
                            id: sectorId,
                            ...sectors[sectorId],
                        };
                    }
                };

                const sectorData = await fetchSectorData();
                
                if (isMounted) {
                    setSector(sectorData);
                }
            } catch (err) {
                if (isMounted) {
                    setError(__('Failed to load group details', 'obatala'));
                    console.error('Error loading sector details:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchSectorDetails();
        
        return () => {
            isMounted = false;
        };
    }, []);

    if (loading) return <div style={{ padding: '20px' }}><Spinner /></div>;
    if (error) return <Notice status="error" isDismissible={false}>{error}</Notice>;
    if (!sector) return <Notice status="warning" isDismissible={false}>{__('Group not found', 'obatala')}</Notice>;

    return (
        <>
            <BrandHeader />
            <div className="title-container">
                <h2>
                    <small>{__('Grupo', 'obatala')}</small>
                    {sector.nome}
                </h2>
                <div className="badge-container">
                    <span className={`badge ${sector.status === 'Active' ? 'success' : 'danger'}`}>
                        {sector.status === 'Active'
                            ? __('Ativo', 'obatala')
                            : __('Inativo', 'obatala')}
                    </span>
                </div>
            </div>
            <main className="panel-container">
                <ConfirmDialog
                    isOpen={Boolean(userToDelete)}
                    onConfirm={handleDeleteUser}
                    onCancel={() => setUserToDelete(null)}
                >
                    {sprintf(__('Are you sure you want to delete user %s?', 'obatala'), userToDelete?.display_name || '')}
                </ConfirmDialog>

                <Notice status="info" isDismissible={false}>{__('Group description', 'obatala')}: {sector.descricao || 'N/A'}</Notice>

                <Panel>
                    <PanelHeader>
                        <div className="title-container-table">
                            <span>{__('Related users', 'obatala')}</span>
                            <span className="badge">{sectorUsers.length}</span>
                        </div>
                    </PanelHeader>
                    <PanelRow>
                        {usersLoading && <Spinner />}
                        {usersError && <Notice status="error" isDismissible={false}>{usersError}</Notice>}
                        {!usersLoading && !usersError && sectorUsers.length > 0 && (
                            <div className="table-responsive">
                                <table className="wp-list-table widefat striped mt-1">
                                    <thead>
                                        <tr>
                                            <th>{__('Name', 'obatala')}</th>
                                            <th>{__('Username', 'obatala')}</th>
                                            <th>{__('Email', 'obatala')}</th>
                                            <th>{__('Actions', 'obatala')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sectorUsers.map(user => (
                                            <tr key={user.ID}>
                                                <td>{user.display_name}</td>
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <div className="group-button">
                                                        <Tooltip text={__('Remove user from sector', 'obatala')}>
                                                            <Button
                                                                isDestructive
                                                                icon={trash}
                                                                onClick={() => setUserToDelete(user)}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!usersLoading && !usersError && sectorUsers.length === 0 && (
                            <Notice isDismissible={false} status="warning">{__('No existing users for this group.', 'obatala')}</Notice>
                        )}
                    </PanelRow>
                </Panel>

                <UsersManager
                    sector={sector}
                    sectorUsers={sectorUsers}
                    onUsersChanged={loadSectorUsers}
                />
            </main>
            <BrandFooter />
        </>
    );
};

export default SectorDetailsPage;
