import React, { useState, useEffect } from 'react';
import {
    Panel,
    PanelHeader,
    PanelBody,
    PanelRow,
    Spinner,
    Notice,
    Modal
} from '@wordpress/components';
import SectorCreator from './SectorManager/SectorCreator';
import { fetchSectors, saveSector, updateSectorMeta } from '../api/apiRequests';
import SectorList from './SectorManager/SectorList';

const SectorManager = () => {
    const [sectors, setSectors] = useState([])
    const [editingSector, setEditingSector] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        loadSectors();
    }, []);

    const loadSectors = () => {
        setIsLoading(true);
        fetchSectors()
            .then(data => {
                const sortedSectors = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setSectors(sortedSectors);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
                setIsLoading(false);
            });
    };

    const handleSectorSaved = async (newSector) => {
        setIsLoading(true);
        try {
            let savedSector;
            if (editingSector) {
                savedSector = await saveSector(newSector, editingSector);
           
            } else {
                savedSector = await saveSector(newSector);
            }
            
            const meta = {
                description: newSector.meta.description || '',
            };

            await updateSectorMeta(savedSector.id, meta);
        
            setNotice({ status: 'success', message: 'Sector saved successfully.' });
            setEditingSector(null);
            loadSectors();
        } catch (error) {
            console.error('Error saving sector:', error);
            setNotice({ status: 'error', message: 'Error saving sector.' });
            setIsLoading(false);
        }   
    };

    const handleEdit = (sector) => {
        setEditingSector(sector);
    }

    const handleCancel = () => {
        setEditingSector(null);
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Sector Manager</h2>
            <div className="panel-container">
                <main>
                    <SectorList sectors={sectors}
                                onEdit={handleEdit}
                    />
                </main>
                <aside>
                {editingSector && (
                            <Modal
                                title="Edit Sector"
                                onRequestClose={handleCancel}
                                isDismissible={true}
                            >
                                <SectorCreator
                                    onSave={handleSectorSaved} 
                                    editingSector={editingSector}
                                    onCancel={handleCancel}
                                />
                            </Modal>
                        )}
                        
                    <Panel>
                        <PanelHeader>Add Sector</PanelHeader>
                            <PanelBody>
                                <PanelRow>

                                    {notice && (
                                        <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                            {notice.message}
                                        </Notice>
                                    )}
                                    <SectorCreator  onSave={handleSectorSaved} onCancel={handleCancel}/>
                                </PanelRow>
                            </PanelBody>
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default SectorManager;