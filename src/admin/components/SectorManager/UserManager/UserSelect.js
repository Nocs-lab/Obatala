import React, { useState } from 'react';
import { Button, ComboboxControl, } from '@wordpress/components';
import {closeSmall } from '@wordpress/icons';

const UserSelect = ({ users, sectorUsers, onSelectUser }) => {
    const [stepInputValue, setStepInputValue] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    const handleChange = (value) => {
        const user = users.find(user => user.id === value);
        if (user) {
            setSelectedUser(user);
            setStepInputValue('');
        }
    };

    const handleRemoveUser = () => {
        setSelectedUser(null);
    };

    const associatedUserIds = sectorUsers.map(user => user.id);

    return (
        <>
            <ComboboxControl
                label="Select a User"
                value={stepInputValue}
                options={users.map(user => ({ 
                    label: user.display_name, 
                    value: user.id,
                    disabled: associatedUserIds.includes(user.id)
                }))}
                onChange={handleChange}
                onInputChange={setStepInputValue}
            />
            {selectedUser && (
                <div className="selected-user">
                    {selectedUser.display_name}
                    <Button
                        icon={closeSmall}
                        onClick={handleRemoveUser}
                        className="remove-user-button"
                    />
                </div>
            )}
            <Button 
                variant="secondary" 
                onClick={() => onSelectUser(selectedUser?.ID)}
                disabled={!selectedUser}    
            >
                Add user(s)
            </Button>
        </>       
    );
}

export default UserSelect;
