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

    const handleSectorSaved = async (newSector) => {
        setIsLoading(true);
        try {
            let savedSector;
            if (editingSector) {
                savedSector = await saveSector(newSector, editingSector);
           
            } else {
                savedSector = await saveSector(newSector);
            }
        
            setNotice({ status: 'success', message: 'Sector saved successfully.' });
            setEditingSector(null);
            setAddingSector(null);
            loadSectors();
        } catch (error) {
            console.error('Error saving sector:', error);
           
            if (error === 'Setor já existe' || error === 'Setor com o mesmo nome já existe') {
                setNotice({ status: 'error', message: 'Sector already exists.' });
            } else {
                setNotice({ status: 'error', message: 'Error saving sector.' });
            }
            setEditingSector(null);
            setAddingSector(null);
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
        <main>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <div className="title-container">
                <h2>Sector manager</h2>
                <ButtonGroup>
                    <Button variant="primary" 
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

            <SectorList sectors={sectors}
                        onEdit={handleEdit}
            />

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
                    title="Add sector"
                    onRequestClose={handleCancel}
                    isDismissible={true}
                >
                    <SectorCreator
                        onSave={handleSectorSaved} 
                        onCancel={handleCancel}
                    />
                </Modal>
            )}
        </main>
    );
};

export default SectorManager;
