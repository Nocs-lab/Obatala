import React, { useState, useEffect } from 'react';
import { Button, SelectControl, TextControl, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

const isProcessModelComplete = (flowData) => {
    const nodes = Array.isArray(flowData?.nodes) ? flowData.nodes : [];
    const edges = Array.isArray(flowData?.edges) ? flowData.edges : [];
    const nodesById = new Map(nodes.filter(node => node?.id).map(node => [String(node.id), node]));
    const regularNodes = nodes.filter(node => {
        const nodeId = String(node?.id || '');
        return nodeId !== 'Start' && nodeId !== 'End' && !nodeId.startsWith('Condicional');
    });

    if (!nodesById.has('Start') || !nodesById.has('End') || regularNodes.length === 0) {
        return false;
    }

    if (regularNodes.some(node => {
        const fields = node?.data?.fields;
        return !Array.isArray(fields) || fields.length === 0 || !(node.tempSector || node.sector_obatala);
    })) {
        return false;
    }

    const incoming = new Map([...nodesById.keys()].map(nodeId => [nodeId, 0]));
    const outgoing = new Map([...nodesById.keys()].map(nodeId => [nodeId, 0]));
    const graph = new Map([...nodesById.keys()].map(nodeId => [nodeId, []]));

    edges.forEach(edge => {
        const source = String(edge?.source || '');
        const target = String(edge?.target || '');
        if (!nodesById.has(source) || !nodesById.has(target)) {
            return;
        }
        outgoing.set(source, outgoing.get(source) + 1);
        incoming.set(target, incoming.get(target) + 1);
        graph.get(source).push(target);
    });

    const hasDisconnectedNode = [...nodesById.keys()].some(nodeId =>
        (nodeId !== 'Start' && incoming.get(nodeId) === 0)
        || (nodeId !== 'End' && outgoing.get(nodeId) === 0)
    );
    if (hasDisconnectedNode) {
        return false;
    }

    const visited = new Set();
    const queue = ['Start'];
    while (queue.length > 0) {
        const nodeId = queue.shift();
        if (visited.has(nodeId)) {
            continue;
        }
        visited.add(nodeId);
        graph.get(nodeId).forEach(target => {
            if (!visited.has(target)) {
                queue.push(target);
            }
        });
    }

    return visited.size === nodesById.size && visited.has('End');
};

const getProcessModelStatus = (processModel) => {
    const status = processModel?.meta?.status;

    if (Array.isArray(status)) {
        return status[0] || '';
    }

    return typeof status === 'string' ? status : '';
};

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
        if (!newProcessTitle || (!editingProcess && !newProcessType)) {
            setNotice({ status: 'error', message: __('Please provide a title and select a process type.', 'obatala') });
            return;
        }
        // get process model id
        const selectedProcessModel = editingProcess
            ? null
            : processTypes.find(type => type.id === parseInt(newProcessType));
        if (!editingProcess && !selectedProcessModel) {
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

                await apiFetch({
                    path: `/obatala/v1/process_obatala/${savedProcess.id}/meta`,
                    method: 'POST',
                    data: {
                        access_level: accessLevel,
                    }
                });

                const fullProcess = await apiFetch({
                    path: `/obatala/v1/process_obatala/${savedProcess.id}`,
                });

                onProcessSaved(fullProcess);
                setNotice({ status: 'success', message: __('Process updated successfully.', 'obatala') });
                return;
            }

            // get our process type meta fields
            const metaFields = await apiFetch({ path: `/obatala/v1/process_type/${selectedProcessModel.id}/meta` })

            if (metaFields.status !== 'Active') {
                setNotice({ status: 'error', message: __('The process cannot be created because the selected process model is inactive', 'obatala') });
                return;
            }

            if (!isProcessModelComplete(metaFields.flowData)) {
                setNotice({
                    status: 'error',
                    message: __('The selected process model is incomplete. Connect all steps and define at least one field and a valid group for each step.', 'obatala')
                });
                return;
            }

            savedProcess = await apiFetch({
                path: `/obatala/v1/process_obatala`,
                method: 'POST',
                data: {
                    ...newProcess,
                    process_type: selectedProcessModel.id,
                }
            });

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

                const fullProcess = await apiFetch({
                    path: `/obatala/v1/process_obatala/${savedProcess.id}`,
                });

                onProcessSaved(fullProcess);
                setNewProcessTitle('');
                setNewProcessType('');
                setAccessLevel('Not restricted');
                setNotice({ status: 'success', message: editingProcess ? __('Process updated successfully.', 'obatala') : __('Process created successfully.', 'obatala') });

        } catch (error) {
            console.error('Error creating process:', error);
            setNotice({ status: 'error', message: error?.message || __('Error creating process.', 'obatala') });
        }
    };

    const handleCancel = () => {
        onCancel();
        setNewProcessTitle('');
        setNewProcessType('');
        setAccessLevel('Not restricted');
    };

    const modelsActives = processTypes.filter(
        (process) => getProcessModelStatus(process) === 'Active'
    );

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
