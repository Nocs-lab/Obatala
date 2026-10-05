import React, { useEffect, useReducer, useState } from 'react';
import { Button, 
        ButtonGroup, 
        Icon, 
        Tooltip,
        Notice, 
        Spinner,
        __experimentalConfirmDialog as ConfirmDialog  
    } from '@wordpress/components';
import {trash} from '@wordpress/icons';
import { assignUserToSector, deleteSectorUser, fetchUsers, fetchUsersBySector } from '../../../api/apiRequests';
import UserSelect from './UserSelect';
import Reducer, { initialState } from '../../../redux/reducer';


const UserManager = ({ sector}) => {
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
            loadSectorUsers(sector.id);
            setNotice({ status: 'success', message: 'Users successfully added.' });
        } catch (error) {
            console.error('Error adding users:', error);
            setNotice({ status: 'error', message: 'Error adding users.' });
        }
    };
    
    // Remove o usuário do setor
    const handleDeleteUser = async (user) => {
        const data = { user_id: user.ID };
        deleteSectorUser(sector.id, data)
            .then(() => {
                const updatedUsers = sectorUsers.filter(type => type.id !== user.id);
                setSectorUsers(updatedUsers);
                loadSectorUsers(sector.id);
                setNotice({ status: 'success', message: 'User successfully removed.' })
            })
            .catch(error => {
                console.error('Error removing users to sector:', error);
                setNotice({ status: 'error', message: 'Error removing user.' })
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
                <div className="notice-container">
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                </div>
            )}

            <UserSelect
                users={users}
                sectorUsers={sectorUsers}
                onSelectUser={assignUserSector}
            />

            <hr class="mt-2" />
             
            <div className='title-container-table'>
                <h3>Related users</h3>
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
                Are you sure you want to delete user {state.user?.display_name}?
            </ConfirmDialog>

            {sectorUsers.length > 0 ? (
                <table className="wp-list-table widefat fixed striped mt-1">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Actions</th>
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
                                                icon={<Icon icon={trash} />}
                                                onClick={() => handleConfirmDelete(user)}
                                            />
                                        </Tooltip>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <Notice isDismissible={false} status="warning">No existing users for this group.</Notice>
            )}
        </>
    );
}

export default UserManager;
