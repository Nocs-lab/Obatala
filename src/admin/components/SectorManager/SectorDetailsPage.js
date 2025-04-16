// SectorDetailsPage.js
import React, { useEffect, useState } from 'react';
import apiFetch from "@wordpress/api-fetch";
import { Notice, Spinner } from '@wordpress/components';

const SectorDetailsPage = () => {
    const [sector, setSector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("sector_id");
    };
    useEffect(() => {
        const fetchSectorDetails = async () => {
            const sectorId = getProcessIdFromUrl();
            if (!sectorId) {
                setError('Sector ID not found in URL');
                setLoading(false);
                return;
            }
            try {
                // Busca os detalhes do setor
                const sectorData = await apiFetch({ 
                    path: `/obatala/v1/get_sector_obatala/${sectorId}` 
                });
                
                // Busca os usuários do setor
                const users = await apiFetch({ 
                    path: `/obatala/v1/sector_obatala/${sectorId}/users` 
                });
                
                setSector({
                    ...sectorData,
                    users: Array.isArray(users) ? users : [],
                    userCount: Array.isArray(users) ? users.length : 0
                });
            } catch (err) {
                setError('Failed to load sector details');
                console.error('Error loading sector details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSectorDetails();
    });

    if (loading) return <Spinner />;
    if (error) return <Notice status="error" isDismissible={false}>{error}</Notice>;
    if (!sector) return <Notice status="warning" isDismissible={false}>Sector not found</Notice>;

    return (
        <div className="title-container">
            <div className="sector-details">
                <h2>Group Details: {sector.name}</h2>
                <p><strong>Name:</strong> {sector.name}</p>
                <p><strong>Description:</strong> {sector.description || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`badge ${sector.status === 'Active' ? 'success' : 'error'}`}>
                    {sector.status}
                </span></p>
            </div>
            
            <hr className="mt-2" />
            
            <div className='title-container-table'>
                <h3>Associated Users</h3>
                <span className="badge">{sector.users?.length || 0}</span>
            </div>
            
            {sector.users ? (
                sector.users.length > 0 ? (
                    <table className="wp-list-table widefat fixed striped mt-1">
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
        </div>
    );
};

export default SectorDetailsPage;