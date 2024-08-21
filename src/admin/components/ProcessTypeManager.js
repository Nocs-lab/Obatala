import React, { useState, useEffect } from 'react';
import {
    Panel,
    PanelHeader,
    Spinner,
    Notice,
} from '@wordpress/components';
import { fetchProcessTypes, saveProcessType, deleteProcessType, updateProcessTypeMeta } from '../api/apiRequests';
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessTypeList from './ProcessTypeManager/ProcessTypeList';

const ProcessTypeManager = () => {
    const [processTypes, setProcessTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProcessType, setEditingProcessType] = useState(null);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        loadProcessTypes();
    }, []);

    const loadProcessTypes = () => {
        setIsLoading(true);
        fetchProcessTypes()
            .then(data => {
                const sortedProcessTypes = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessTypes(sortedProcessTypes);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
                setIsLoading(false);
            });
    };

    const handleSaveProcessType = async (processType) => {
        setIsLoading(true);
        try {
            let savedProcessType;
            if (editingProcessType) {
                savedProcessType = await saveProcessType(processType, editingProcessType);
            } else {
                savedProcessType = await saveProcessType(processType);
            }
            const meta = {
                accept_attachments: processType.meta.accept_attachments,
                accept_tainacan_items: processType.meta.accept_tainacan_items,
                generate_tainacan_items: processType.meta.generate_tainacan_items,
                description: processType.meta.description,
            };
            await updateProcessTypeMeta(savedProcessType.id, meta);
            setNotice({ status: 'success', message: 'Process type saved successfully.' });
            setEditingProcessType(null);
            loadProcessTypes();
        } catch (error) {
            console.error('Error saving process type:', error);
            setNotice({ status: 'error', message: 'Error saving process type.' });
            setIsLoading(false);
        }
    };

    const handleDeleteProcessType = (id) => {
        deleteProcessType(id)
            .then(() => {
                const updatedProcessTypes = processTypes.filter(type => type.id !== id);
                setProcessTypes(updatedProcessTypes);
            })
            .catch(error => {
                console.error('Error deleting process type:', error);
            });
    };

    const handleEditProcessType = (id) => {
        window.location.href = `?page=process-type-editor&process_type_id=${id}`;
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Process Type Manager</h2>
            <div className="panel-container">
                <main>
                    <ProcessTypeList
                        processTypes={processTypes}
                        onEdit={handleEditProcessType}
                        onDelete={handleDeleteProcessType}
                    />
                </main>
                <aside>
                    <Panel>
                        <PanelHeader>
                            <h3>Add process type</h3>
                        </PanelHeader>
                        <ProcessTypeForm onSave={handleSaveProcessType} onCancel={() => setEditingProcessType(null)} editingProcessType={editingProcessType} />
                        {notice && (
                            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                {notice.message}
                            </Notice>
                        )}
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessTypeManager;
