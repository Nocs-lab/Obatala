import React, { useState } from 'react';
import { Button, ComboboxControl, } from '@wordpress/components';
import {closeSmall } from '@wordpress/icons';

const UserSelect = ({ users, sectorUsers, onSelectUser }) => {
    const [stepInputValue, setStepInputValue] = useState('');
    const [selectedUser, setSelectedUser] = useState([]);

    const handleChange = (value) => {
        if (value && !selectedUser.includes(value)) {
            setSelectedUser([...selectedUser, value]);
            setStepInputValue('');
        }
    };

    const handleRemoveUser = (userId) => {
        setSelectedUser(selectedUser.filter((user) => user !== userId));
    };
    const associatedUserIds = sectorUsers.map(user => user.ID);

    return (
        <>
            <ComboboxControl
                label="Select one or more users"
                value={stepInputValue}
                options={users.map(user => ({ 
                    label: user.display_name, 
                    value: user.ID,
                    disabled: associatedUserIds.includes(user.ID)
                }))}
                onInputChange={setStepInputValue}
                onChange={handleChange}
            />
            {selectedUser && (
                <div className="combobox-selection">
                    {selectedUser.map((userId) => {
                        const user = users.find((user) => user.ID === userId)
                        return (
                            <div key={userId} className="combobox-selected">
                                {user.display_name}
                                <Button
                                    icon={closeSmall}
                                    onClick={() => handleRemoveUser(userId)}
                                    className="remove-user-button"
                                    
                                />
                            </div>
                        );
                    })}
                </div>
            )}
            <Button 
                variant="secondary" 
                onClick={() => onSelectUser(selectedUser)}
                disabled={selectedUser.length === 0}   
            >
                Add user(s)
            </Button>
        </>       
    );
}

export default UserSelect;
