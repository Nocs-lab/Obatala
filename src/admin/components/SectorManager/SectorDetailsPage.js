// SectorDetailsPage.js
import React, { useEffect, useState } from 'react';
import apiFetch from "@wordpress/api-fetch";
import { Notice, Spinner } from '@wordpress/components';

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
        <div className="title-container">
            <div>
                <h2 style={{ marginTop: 0, marginBottom: 20 }}>Group Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    <div>
                        <strong>Name:</strong>
                        <p>{sector.nome}</p>
                    </div>
                    <div>
                        <strong>Description:</strong>
                        <p>{sector.descricao || 'N/A'}</p>
                    </div>
                    <div>
                        <strong>Status:</strong>
                        <p>
                            <span style={{
                                display: 'inline-block',
                                padding: '3px 10px',
                                borderRadius: '3px',
                                backgroundColor: sector.status === 'Active' ? '#d1f3e0' : '#f8d7da',
                                color: sector.status === 'Active' ? '#1e9246' : '#dc3545',
                                fontWeight: '500'
                            }}>
                                {sector.status}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            
            <div className='title-container-table' style={{ 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '4px', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0 }}>Associated Users</h3>
                    <span style={{
                        marginLeft: '10px',
                        backgroundColor: '#e9ecef',
                        padding: '2px 10px',
                        borderRadius: '10px',
                        fontSize: '14px'
                    }}>
                        {sector.users?.length || 0}
                    </span>
                </div>
                
                {sector.users ? (
                    sector.users.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="wp-list-table widefat fixed striped" style={{ width: '100%' }}>
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
                        </div>
                    ) : (
                        <Notice isDismissible={false} status="warning">
                            No users in this group.
                        </Notice>
                    )
                ) : (
                    <Spinner />
                )}
            </div>
        </div>
    );
};

export default SectorDetailsPage;