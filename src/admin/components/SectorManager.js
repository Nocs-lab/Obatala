import React, { useState, useEffect } from 'react';
import {
    Spinner,
    Button,
    Notice,
    Modal,
    ButtonGroup,
    Icon,
} from '@wordpress/components';
import { plus } from "@wordpress/icons";
import SectorCreator from './SectorManager/SectorCreator';
import { fetchSectors, saveSector, updateSectorMeta } from '../api/apiRequests';
import SectorList from './SectorManager/SectorList';

const SectorManager = () => {
    const [sectors, setSectors] = useState([])
    const [editingSector, setEditingSector] = useState(null);
    const [addingSector, setAddingSector] = useState(null);
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
            setAddingSector(null);
            loadSectors();
        } catch (error) {
            console.error('Error saving sector:', error);
            setNotice({ status: 'error', message: 'Error saving sector.' });
            setIsLoading(false);
        }   
    };

    const handleAdd = () => {
        setAddingSector(true);
    }

    const handleEdit = (sector) => {
        setEditingSector(sector);
    }

    const handleCancel = () => {
        setEditingSector(null);
        setAddingSector(null);
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <div className="title-container">
                <h2>Sector Manager</h2>
                <ButtonGroup>
                    <Button isPrimary 
                            icon={<Icon icon={plus}/>}
                            onClick={handleAdd}
                            >Add new</Button>
                </ButtonGroup>

            </div>
            {notice && (
                <div className="notice-container">
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                </div>
            )}
            <div className="panel-container">
                <main>
                    <SectorList sectors={sectors}
                                onEdit={handleEdit}
                    />
                </main>
                <section>
                {/* Open modal to editing Sector */}
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

                {/* Open modal to adding Sector */}
                {addingSector && (
                            <Modal
                                title="Add Sector"
                                onRequestClose={handleCancel}
                                isDismissible={true}
                            >
                                <SectorCreator
                                    onSave={handleSectorSaved} 
                                    onCancel={handleCancel}
                                />
                            </Modal>
                        )}
                        
                    
                </section>
            </div>
        </div>
    );
};

export default SectorManager;
