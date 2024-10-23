import React, { useEffect, useState } from 'react';
import { Button, 
        ButtonGroup, 
        Icon, 
        Tooltip,
        Notice, 
        Spinner } from '@wordpress/components';
import {trash} from '@wordpress/icons';
import { assignUserToSector, deleteSectorUser, fetchUsers, fetchUsersBySector } from '../../../api/apiRequests';
import UserSelect from './UserSelect';

const UserManager = ({ sector }) => {
    const [users, setUsers] = useState([]);
    const [sectorUsers, setSectorUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [notice, setNotice] = useState(null);

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
    const assignUserSector = async (userId) => {
        const data = {
            user_id: userId,
            sector_id: sector.id,
        }
        assignUserToSector(data)
            .then(() => {
                loadSectorUsers(sector.id);
                setNotice({ status: 'success', message: 'User successfully added.' })
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
                setIsLoading(false);
                setNotice({ status: 'error', message: 'Error adding user.' })
            });
    };

    // Remove o usuário do setor
    const handleDeleteUser = async (user) => {
        const data = { user_id: user.ID };
        deleteSectorUser(sector.id, data)
            .then(() => {
                const updatedUsers = sectorUsers.filter(type => type.id !== user.id);
                setSectorUsers(updatedUsers);
                setNotice({ status: 'success', message: 'User successfully removed.' })
            })
            .catch(error => {
                console.error('Error removing users to sector:', error);
                setNotice({ status: 'error', message: 'Error removing user.' })
            });
    }

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <UserSelect
                users={users}
                sectorUsers={sectorUsers}
                onSelectUser={assignUserSector}
            />

            {notice && (
                <div className="notice-container">
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                </div>
            )}

            {sectorUsers.length > 0 ? (
                <table className="wp-list-table widefat fixed striped mt-2">
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
                                        <Tooltip text="Delete">
                                            <Button
                                                icon={<Icon icon={trash} />}
                                                onClick={() => handleDeleteUser(user)}
                                            />
                                        </Tooltip>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <Notice isDismissible={false} status="warning" className="mt-2">No existing users for this sector.</Notice>
            )}
        </>
    );
}

export default UserManager;
