import React, { useEffect, useReducer, useState } from 'react';
import { Button,
        ButtonGroup,
        Tooltip,
        Notice,
        Spinner,
        __experimentalConfirmDialog as ConfirmDialog
    } from '@wordpress/components';
import { trash } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import { assignUserToSector, deleteSectorUser, fetchUsers, fetchUsersBySector } from '../../../api/apiRequests';
import UserSelect from './UserSelect';
import Reducer, { initialState } from '../../../redux/reducer';


const UserManager = ({sector,loadSectorsUsers}) => {
    const [users, setUsers] = useState([]);
    const [sectorUsers, setSectorUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notice, setNotice] = useState(null);

    const [state, dispatch] = useReducer(Reducer, initialState)

    useEffect(() => {
        loadUsers();
        loadSectorUsers(sector.id);
    }, []);

    // Obtem todos os usuários
    const loadUsers = () => {
        fetchUsers()
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    };

    // Obtem os usuários de um setor especifico
    const loadSectorUsers = async (sectorId) => {
        setIsLoading(true)
        fetchUsersBySector(sectorId)
            .then((data) => {
                setSectorUsers(data);
                setIsLoading(false)
            })
            .catch (error => {
                console.error('Error fetching sector users:', error);
                setIsLoading(false)
        });
    };
    // Associa um usuário ao setor com base no ID de ambos
    const assignUserSector = async (usersId) => {
        try {
            await Promise.all(usersId.map((userId) => {
                const data = { user_id: userId, sector_id: sector.id };
                return assignUserToSector(data);
            }));
            setNotice({ status: 'success', message: 'Users successfully added.' });
            setTimeout(() => {
                loadSectorUsers(sector.id);
                loadSectorsUsers();
            }, 2000); 
        } catch (error) {
            console.error('Error adding users:', error);
            setNotice({ status: 'error', message: __('Error adding users.', 'obatala') });
        }
    };
    
    // Remove o usuário do setor
    const handleDeleteUser = async (user) => {
        const data = { user_id: user.ID };
        deleteSectorUser(sector.id, data)
            .then(() => {
                const updatedUsers = sectorUsers.filter(type => type.id !== user.id);
                setSectorUsers(updatedUsers);
                setNotice({ status: 'success', message: __('User successfully removed.', 'obatala') })
                setTimeout(() => {
                    loadSectorUsers(sector.id);
                    loadSectorsUsers();
                }, 2000); 
            })
            .catch(error => {
                console.error('Error removing users to sector:', error);
                setNotice({ status: 'error', message: __('Error removing user.', 'obatala') })
            });
    };

    const handleConfirmDelete = (user) => {
        dispatch({type: 'OPEN_MODAL_USER', payload: user})
    };

    const handleCancel = () => {
        dispatch({ type: 'CLOSE_MODAL' });
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <>
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}

            <UserSelect
                users={users}
                sectorUsers={sectorUsers}
                onSelectUser={assignUserSector}
            />

            <hr className="mt-2" />
             
            <div className='title-container-table'>
                <h3>{__('Related users', 'obatala')}</h3>
                <span className="badge">{sectorUsers.length}</span>
            </div>

            <ConfirmDialog
                isOpen={state.isOpen}
                onConfirm={() => {
                    handleDeleteUser(state.user);
                    dispatch({type: 'CLOSE_MODAL'})
                }}
                onCancel={ handleCancel }
            >
                {sprintf(__('Are you sure you want to delete user %s?', 'obatala'), state.user?.display_name || '')}
            </ConfirmDialog>

            {sectorUsers.length > 0 ? (
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
                                        <ButtonGroup>
                                            <Tooltip text="Remove user from sector">
                                                <Button
                                                    isDestructive
                                                    icon={trash}
                                                    onClick={() => handleConfirmDelete(user)}
                                                />
                                            </Tooltip>
                                        </ButtonGroup>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Notice isDismissible={false} status="warning">{__('No existing users for this group.', 'obatala')}</Notice>
            )}
        </>
    );
}

export default UserManager;
