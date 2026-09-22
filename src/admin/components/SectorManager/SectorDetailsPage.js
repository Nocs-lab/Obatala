// SectorDetailsPage.js
import React, { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from "@wordpress/api-fetch";
import { Notice, Panel, PanelHeader, PanelRow, Spinner } from '@wordpress/components';
import BrandHeader from '../BrandHeader';
import BrandFooter from '../BrandFooter';
import UsersManager from './UserManager/UserManager';

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
            <main>
                <Panel>
                    <PanelHeader>{__('Description', 'obatala')}</PanelHeader>
                    <PanelRow>
                        <p>{sector.descricao || 'N/A'}</p>
                    </PanelRow>
                </Panel>

                <Panel>
                    <PanelHeader>{__('Manage users', 'obatala')}</PanelHeader>
                    <PanelRow>
                        <UsersManager sector={sector} />
                    </PanelRow>
                </Panel>
            </main>
            <BrandFooter />
        </>
    );
};

export default SectorDetailsPage;
