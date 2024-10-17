import React, { useState, useEffect } from 'react';
import { Button, SelectControl, TextControl, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessCreator = ({ processTypes, onProcessSaved, editingProcess, onCancel }) => {
    const [newProcessTitle, setNewProcessTitle] = useState('');
    const [newProcessType, setNewProcessType] = useState('');
    const [accessLevel, setAccessLevel] = useState('public');
    const [notice, setNotice] = useState(null);
    
    useEffect(() => {
        if (editingProcess) {
            console.log( editingProcess )
            setAccessLevel(editingProcess.meta.access_level);
            setNewProcessTitle(editingProcess.title.rendered);
            setNewProcessType(editingProcess.meta.process_type);
        }
    }, [editingProcess]);

    const handleSaveProcess = async () => {
        if (!newProcessTitle || !newProcessType) {
            setNotice({ status: 'error', message: 'Please provide a title and select a process type.' });
            return;
        }
        // get process model id
        const selectedProcessModel = processTypes.find(type => type.id === parseInt(newProcessType));
        console.log('processID', selectedProcessModel)
        if (!selectedProcessModel) {
            setNotice({ status: 'error', message: 'Invalid process type selected.' });
            return;
        }

        const newProcess = {
            title: newProcessTitle,
            status: 'publish',
            type: 'process_obatala',
        };
    
        try {
            let savedProcess;
            if (editingProcess) {
                // Atualiza o processo
                savedProcess = await apiFetch({
                    path: `/obatala/v1/process_obatala/${editingProcess.id}`,
                    method: 'POST',
                    data: { ...newProcess }
                });
            } else {
                // Cria o processo
                savedProcess = await apiFetch({
                    path: `/obatala/v1/process_obatala`,
                    method: 'POST',
                    data: newProcess
                });
            }
            
            // get our process type meta fields
            const metaFields = await apiFetch({ path: `/obatala/v1/process_type/${selectedProcessModel.id}/meta` })
    
            // Atualiza o meta para o processocom os dados do fluxo
            console.log(metaFields)            
    
            const metaUpdateData = {
                flowData: metaFields.flowData
            };
    
            // Atualiza o meta para o processo 
            await apiFetch({
                path: `/obatala/v1/process_obatala/${savedProcess.id}/meta`,
                method: 'POST',
                data: metaUpdateData
            });

            await apiFetch({
                path: `/obatala/v1/process_obatala/${savedProcess.id}/process_type`,
                method: 'POST',
                data: {process_type: selectedProcessModel.id}
            });

    
            // Atualiza o objeto savedProcess com os metas
            savedProcess.meta = metaUpdateData;
    
            onProcessSaved(savedProcess);
            setNewProcessTitle('');
            setNewProcessType('');
            setAccessLevel('public');
            setNotice({ status: 'success', message: editingProcess ? 'Process updated successfully.' : 'Process created successfully.' });
        } catch (error) {
            console.error('Error creating process:', error);
            setNotice({ status: 'error', message: 'Error creating process.' });
        }
    };
    

    const handleCancel = () => {
        onCancel();
        setNewProcessTitle('');
        setNewProcessType('');
        setAccessLevel('public');
    };

    return (
        <div>
             {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}
            
            <TextControl
                label="Process Title"
                value={newProcessTitle}
                onChange={(value) => setNewProcessTitle(value)}
                disabled={!!editingProcess}
            />

            <SelectControl
                 label="Process Type"
                 value={newProcessType}
                 options={[
                     { label: 'Select a process type...', value: '' },
                     ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                 ]}
                 onChange={(value) => setNewProcessType(value)}
                 disabled={!!editingProcess}
            />       

            <SelectControl
                label="Access Level"
                value={accessLevel}
                options={[
                    { label: 'Public', value: 'public' },
                    { label: 'Private', value: 'private' }
                ]}
                onChange={(value) => setAccessLevel(value)}
            />
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
                <Button isSecondary onClick={handleCancel}>Cancel</Button>
                <Button isPrimary onClick={handleSaveProcess}>Save</Button>
            </div>
            
        </div>
     
    );
};

export default ProcessCreator;