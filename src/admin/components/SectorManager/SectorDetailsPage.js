// SectorDetailsPage.js
import React, { useEffect, useState } from 'react';
import apiFetch from "@wordpress/api-fetch";
import { Notice, Panel, PanelHeader, PanelRow, Spinner } from '@wordpress/components';

const SectorDetailsPage = () => {
    const [sector, setSector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const getSectorIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("sector_id");
    };

    useEffect(() => {
        let isMounted = true;
        
        const fetchSectorDetails = async () => {
            const sectorId = getSectorIdFromUrl();
            if (!sectorId) {
                if (isMounted) {
                    setError('Sector ID not found in URL');
                    setLoading(false);
                }
                return;
            }
            
            try {
                const [sectorData, users] = await Promise.all([
                    apiFetch({ path: `/obatala/v1/get_sector_obatala/${sectorId}` }),
                    apiFetch({ path: `/obatala/v1/sector_obatala/${sectorId}/users` })
                ]);
                
                if (isMounted) {
                    setSector({
                        ...sectorData,
                        users: Array.isArray(users) ? users : [],
                        userCount: Array.isArray(users) ? users.length : 0
                    });
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load sector details');
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
    if (!sector) return <Notice status="warning" isDismissible={false}>Sector not found</Notice>;

    return (
        <main>
            <div className="title-container">
                <h2>
                    <small>Group</small>
                    {sector.nome}
                </h2>
            </div>
            <div className="badge-container">
                <span className={`badge ${sector.status === 'Active' ? 'success' : 'danger'}`}>
                    {sector.status}
                </span>
            </div>
            <Panel>
                <PanelHeader>Description</PanelHeader>
                <PanelRow>
                    <p>{sector.descricao || 'N/A'}</p>
                </PanelRow>
            </Panel>
            
            <Panel>
                <PanelHeader>Associated users <span className="badge">{sector.users?.length || 0}</span></PanelHeader>
                <PanelRow>
                    {sector.users ? (
                        sector.users.length > 0 ? (
                            <table className="wp-list-table widefat fixed striped">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sector.users.map(user => (
                                        <tr key={user.ID}>
                                            <td>{user.display_name}</td>
                                            <td>{user.user_login || user.username}</td>
                                            <td>{user.user_email || user.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <Notice isDismissible={false} status="warning">
                                No users in this group.
                            </Notice>
                        )
                    ) : (
                        <Spinner />
                    )}
                </PanelRow>
            </Panel>
        </main>
    );
};

export default SectorDetailsPage;