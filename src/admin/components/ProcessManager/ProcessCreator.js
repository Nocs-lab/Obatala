import React, { useState, useEffect } from 'react';
import { Button, SelectControl, TextControl, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

const ProcessCreator = ({ processTypes, onProcessSaved, editingProcess, onCancel }) => {
    const [newProcessTitle, setNewProcessTitle] = useState('');
    const [newProcessType, setNewProcessType] = useState('');
    const [accessLevel, setAccessLevel] = useState('Not restricted');
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        if (editingProcess) {
            setAccessLevel(
                Array.isArray(editingProcess.meta.access_level)
                    ? editingProcess.meta.access_level[0]
                    : editingProcess.meta.access_level
            );
            setNewProcessTitle(editingProcess.title.rendered);
            setNewProcessType(editingProcess.meta.process_type);
        }
    }, [editingProcess]);

    const handleSaveProcess = async (e) => {
        e.preventDefault();
        if (!newProcessTitle || !newProcessType) {
            setNotice({ status: 'error', message: __('Please provide a title and select a process type.', 'obatala') });
            return;
        }
        // get process model id
        const selectedProcessModel = processTypes.find(type => type.id === parseInt(newProcessType));
        if (!selectedProcessModel) {
            setNotice({ status: 'error', message: __('Invalid process type selected.', 'obatala') });
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
            if (metaFields.status === 'Inactive') {
                setNotice({ status: 'error', message: __('The process cannot be created because the selected process model is inactive', 'obatala') });

            } else {
                const metaUpdateData = {
                    process_type: selectedProcessModel.id,
                    access_level: accessLevel,
                    flowData: metaFields.flowData,
                    _obatala_tainacan_mapping_snapshot: metaFields.tainacan_export_mapping || {},
                    status: 'Stopped'
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
                    data: { process_type: selectedProcessModel.id }
                });

                // Atualiza o objeto savedProcess com os metas
                savedProcess.meta = metaUpdateData;
                onProcessSaved(savedProcess);
                setNewProcessTitle('');
                setNewProcessType('');
                setAccessLevel('public');
                setNotice({ status: 'success', message: editingProcess ? __('Process updated successfully.', 'obatala') : __('Process created successfully.', 'obatala') });

            }

        } catch (error) {
            console.error('Error creating process:', error);
            setNotice({ status: 'error', message: __('Error creating process.', 'obatala') });
        }
    };

    const handleCancel = () => {
        onCancel();
        setNewProcessTitle('');
        setNewProcessType('');
        setAccessLevel('Not restricted');
    };

    const modelsActives = processTypes.filter((process) => process?.meta?.status[0] === 'Active');

    return (
        <form onSubmit={handleSaveProcess}>
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}

            <TextControl
                label={__('Process Title', 'obatala')}
                value={newProcessTitle}
                onChange={(value) => setNewProcessTitle(value)}
                disabled={!!editingProcess}
            />

            <SelectControl
                label={__('Process Model', 'obatala')}
                value={newProcessType}
                options={[
                    {
                        label: __('Select a process model...', 'obatala'),
                        value: '',
                    },
                    ...modelsActives.map(type => ({ label: type.title.rendered, value: type.id }))

                ]}

                onChange={(value) => setNewProcessType(value)}
                disabled={!!editingProcess}
            />

            <SelectControl
                label={__('Access level', 'obatala')}
                value={accessLevel}
                options={[
                    { label: __('Not restricted', 'obatala'), value: 'Not restricted' },
                    { label: __('Restricted', 'obatala'), value: 'Restricted' }
                ]}
                onChange={(value) => setAccessLevel(value)}
            />
            <div className="group-button">
                <Button variant="tertiary" onClick={handleCancel}>{__('Cancel', 'obatala')}</Button>
                <Button variant="primary" type="submit">{__('Save', 'obatala')}</Button>
            </div>

        </form>

    );
};

export default ProcessCreator;
