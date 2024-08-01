import React, { useState } from 'react';
import { Button, SelectControl, TextControl, Panel, PanelHeader, PanelBody, PanelRow, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessCreator = ({ processTypes, onProcessCreated }) => {
    const [newProcessTitle, setNewProcessTitle] = useState('');
    const [newProcessType, setNewProcessType] = useState('');
    const [notice, setNotice] = useState(null);

    const handleCreateProcess = async () => {
        if (!newProcessTitle || !newProcessType) {
            setNotice({ status: 'error', message: 'Please provide a title and select a process type.' });
            return;
        }

        const selectedProcessType = processTypes.find(type => type.id === parseInt(newProcessType));

        if (!selectedProcessType) {
            setNotice({ status: 'error', message: 'Invalid process type selected.' });
            return;
        }
        
        const newProcess = {
            title: newProcessTitle,
            status: 'publish',
            type: 'process_obatala',
            meta: {
                process_type: selectedProcessType.id,
                current_stage: null,
            }
        };

        try {
            const savedProcess = await apiFetch({
                path: `/obatala/v1/process_obatala`,
                method: 'POST',
                data: newProcess
            });

            console.log(savedProcess);

            const stepOrder = selectedProcessType.meta.step_order || [];
            const metaFieldsPromises = stepOrder.map(stepId => apiFetch({ path: `/obatala/v1/process_step/${stepId}/meta` }));

            const metaFieldsResults = await Promise.all(metaFieldsPromises);

            const stepOrderWithMeta = stepOrder.map((stepId, index) => ({
                step_id: stepId,
                meta_fields: metaFieldsResults[index]
            }));

            await apiFetch({
                path: `/obatala/v1/process_obatala/${savedProcess.id}/meta`,
                method: 'POST',
                data: { step_order: stepOrderWithMeta, process_type: selectedProcessType.id }
            });

            onProcessCreated(savedProcess);
            setNewProcessTitle('');
            setNewProcessType('');
            setNotice({ status: 'success', message: 'Process created successfully.' });
        } catch (error) {
            console.error('Error creating process:', error);
            setNotice({ status: 'error', message: 'Error creating process.' });
        }
    };

    return (
        <Panel>
            <PanelHeader>Create Process</PanelHeader>
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}
            <PanelBody>
                <PanelRow>
                    <TextControl
                        label="Process Title"
                        value={newProcessTitle}
                        onChange={(value) => setNewProcessTitle(value)}
                    />
                    <SelectControl
                        label="Process Type"
                        value={newProcessType}
                        options={[
                            { label: 'Select a process type...', value: '' },
                            ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                        ]}
                        onChange={(value) => setNewProcessType(value)}
                    />
                    <Button isPrimary onClick={handleCreateProcess}>Create Process</Button>
                </PanelRow>
            </PanelBody>
        </Panel>
    );
};

export default ProcessCreator;
