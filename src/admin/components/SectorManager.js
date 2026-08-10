import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import {
    Spinner,
    Button,
    Notice,
    Modal,
    Icon,
    TabPanel,
    __experimentalConfirmDialog as ConfirmDialog 
} from '@wordpress/components';
import { plus } from "@wordpress/icons";
import SectorCreator from './SectorManager/SectorCreator';
import { deleteSector, fetchSectors, fetchSectorsUsers, saveSector } from '../api/apiRequests';
import SectorList from './SectorManager/SectorList';
import Reducer, { initialState } from '../redux/reducer';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const SectorManager = () => {
    const [sectors, setSectors] = useState([])
    const [sectorsUsers, setSectorsUsers] = useState([])
    const [editingSector, setEditingSector] = useState(null);
    const [addingSector, setAddingSector] = useState(null);
    const [status, setStatus] = useState(null);
    const [group, setGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [notice, setNotice] = useState(null);

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);
    const [state, dispatch] = useReducer(Reducer, initialState)

    useEffect(() => {
        loadSectors();
        loadSectorsUsers();
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
    }

    const handleSectorSaved = async (newSector) => {
        setIsLoading(true);
        try {
            let savedSector;
            if (editingSector) {
                savedSector = await saveSector(newSector, editingSector);
           
            } else {
                savedSector = await saveSector(newSector);
            }
        
            setNotice({ status: 'success', message: __('Group successfully saved.', 'obatala') });
            setEditingSector(null);
            setAddingSector(null);
            loadSectors();
        } catch (error) {
            console.error('Error saving sector:', error);
           
            if (error === 'Setor já existe' || error === 'Setor com o mesmo nome já existe') {
                setNotice({ status: 'error', message: __('Group already exists.', 'obatala') });
            } else {
                setNotice({ status: 'error', message: __('Error saving group.', 'obatala') });
            }
            setEditingSector(null);
            setAddingSector(null);
            setIsLoading(false);
        }   
  
    };
    const handleDelete = (sector) => {
        setIsLoading(true)
        deleteSector(sector.id)
            .then(() => {
                const updatedSectors = sectors.filter(type => type.id !== sector.id);
                setSectors(updatedSectors);
                setIsLoading(false);
                setNotice({ status: 'success', message: __('Group successfully removed.', 'obatala') })
                
            })
            .catch(error => {
                if(error === 'Erro ao deletar o setor, o setor esta vinculado a um usuario'){
                    setNotice({ status: 'error', message: __('Cannot delete group linked to a user.', 'obatala') }); 
                }
                console.error('Error deleting process type:', error);
                setIsLoading(false);
            });
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
        dispatch({ type: 'CLOSE_MODAL' });
    };

    const handleConfirmDelete = (sector) => {
        dispatch({type: 'OPEN_MODAL_SECTOR', payload: sector})
    };

    const filteredSectors = useMemo(() => {
        return sectors.filter(sector => {
          const matchesStatus = status
            ? sector?.status.includes(status)
            : true; 
          const matchesGroups = group === 'my groups'
            ? sectorsUsers.some(sectorUser =>  sectorUser.sector_id === sector.id &&  sectorUser.users.some(user => user.ID === currentUser?.id))
            : true;
      
          return matchesStatus && matchesGroups;
        });
    }, [status, group, sectors, sectorsUsers]);
    
    if (isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <BrandHeader />
            <div className="title-container">
                <h2>{__('Groups', 'obatala')}</h2>
                <span className="badge default">{filteredSectors.length}</span>
                <div className="group-button">
                    <Button variant="secondary"
                        size="small"
                        icon={<Icon icon={plus} />}
                        onClick={handleAdd}
                    >{__('Add new', 'obatala')}</Button>
                </div>
            </div>
            <main>
                {notice && (
                        <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                            {notice.message}
                        </Notice>
                )}
                <ConfirmDialog
                    isOpen={state.isOpen}
                    onConfirm={() => {
                        handleDelete(state.sector);
                        dispatch({ type: 'CLOSE_MODAL' })
                    }}
                    onCancel={handleCancel}
                >
                    Are you sure you want to delete group {state.sector?.name}?
                </ConfirmDialog>

                <TabPanel
                    activeClass="active-tab"
                    onSelect={(tabName) => setGroup(tabName === 'all' ? '' : 'my groups')}
                    initialTabName={group === 'my groups' ? 'my' : 'all'}
                    tabs={[
                        { name: 'all', title: __('All groups', 'obatala'), className: group === '' ? 'is-active' : '' },
                        { name: 'my', title: __('My groups', 'obatala'), className: group === 'my groups' ? 'is-active' : '' },
                    ]}
                >
                    {({ tab }) => (
                        <SectorList sectors={filteredSectors}
                            onEdit={handleEdit}
                            onDelete={handleConfirmDelete}
                            status={status}
                            setStatus={setStatus}
                            group={group}
                            setGroup={setGroup}
                            loadSectorsUsers={loadSectorsUsers}
                        />
                    )}
                </TabPanel>

                {/* Open modal to editing Sector */}
                {editingSector && (
                    <Modal
                        title={__('Edit Group', 'obatala')}
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
                        title={__('Add Group', 'obatala')}
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
            <BrandFooter />
        </>
    );
};

export default SectorManager;
