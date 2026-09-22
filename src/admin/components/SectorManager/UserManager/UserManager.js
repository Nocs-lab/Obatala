import React, { useEffect, useState } from 'react';
import { Notice, Panel, PanelHeader, PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { assignUserToSector, fetchUsers } from '../../../api/apiRequests';
import UserSelect from './UserSelect';


const UserManager = ({ sector, sectorUsers, onUsersChanged = () => {}, loadSectorsUsers = () => {} }) => {
    const [users, setUsers] = useState([]);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        loadUsers();
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

    // Associa um usuário ao setor com base no ID de ambos
    const assignUserSector = async (usersId) => {
        try {
            await Promise.all(usersId.map((userId) => {
                const data = { user_id: userId, sector_id: sector.id };
                return assignUserToSector(data);
            }));
            setNotice({ status: 'success', message: __('Users successfully added.', 'obatala') });
            await onUsersChanged();
            loadSectorsUsers();
            return true;
        } catch (error) {
            console.error('Error adding users:', error);
            setNotice({ status: 'error', message: __('Error adding users.', 'obatala') });
            return false;
        }
    };
    
    return (
        <aside className="sector-user-manager">
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}

            <Panel>
                <PanelHeader>{__('Add new user', 'obatala')}</PanelHeader>
                <PanelRow>
                    <UserSelect
                        users={users}
                        sectorUsers={sectorUsers}
                        onSelectUser={assignUserSector}
                    />
                </PanelRow>
            </Panel>
        </aside>
    );
}

export default UserManager;
