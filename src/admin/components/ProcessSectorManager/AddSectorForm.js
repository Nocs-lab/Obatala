import React, { useState } from 'react';
import { TextControl, Button, PanelRow } from '@wordpress/components';

const AddSectorForm = ({ onAddSector, isLoading }) => {
    const [newSectorName, setNewSectorName] = useState('');
    const [newSectorDescription, setNewSectorDescription] = useState('');

    const handleAddSector = () => {
        if (newSectorName.trim() === '' || newSectorDescription.trim() === '') return;
        onAddSector(newSectorName, newSectorDescription);
        setNewSectorName('');
        setNewSectorDescription('');
    };

    return (
        <PanelRow>
            <TextControl
                label="New Sector Name"
                value={newSectorName}
                onChange={(value) => setNewSectorName(value)}
            />
            <TextControl
                label="Setor Description"
                value={newSectorDescription}
                onChange={(value) => setNewSectorDescription(value)}
            />
            <Button isPrimary onClick={handleAddSector} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add new sector'}
            </Button>
        </PanelRow>
    );
};

export default AddSectorForm;
