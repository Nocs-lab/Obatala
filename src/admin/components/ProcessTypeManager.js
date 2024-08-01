import { useState, useEffect, useReducer } from 'react';
import {
    Panel,
    PanelHeader,
    Spinner,
    Notice,
    __experimentalConfirmDialog as ConfirmDialog
} from '@wordpress/components';
import { fetchProcessTypes, saveProcessType, deleteProcessType } from '../api/apiRequests';
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessTypeList from './ProcessTypeManager/ProcessTypeList';
import Reducer, { initialState } from '../redux/reducer';

const ProcessTypeManager = () => {
    const [processTypes, setProcessTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProcessType, setEditingProcessType] = useState(null);
    const [state, dispatch] = useReducer(Reducer, initialState);
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
                accept_attachments: processType.accept_attachments,
                accept_tainacan_items: processType.accept_tainacan_items,
                generate_tainacan_items: processType.generate_tainacan_items,
                description: processType.description,
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

    const handleConfirmDeleteType = (id) => {
        dispatch({ type: 'OPEN_MODAL_PROCESS_TYPE', payload: id });
    };

    const handleCancel = () => {
        dispatch({ type: 'CLOSE_MODAL' });
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
                    <ConfirmDialog
                        isOpen={state.isOpen}
                        onConfirm={() => {
                            if (state.deleteProcessType) {
                                handleDeleteProcessType(state.deleteProcessType);
                            }
                            dispatch({ type: 'CLOSE_MODAL' });
                        }}
                        onCancel={handleCancel}
                    >
                        Are you sure you want to delete this Process Type?
                    </ConfirmDialog>

                    <ProcessTypeList
                        processTypes={processTypes}
                        onEdit={handleEditProcessType}
                        onDelete={handleConfirmDeleteType}
                    />
                </main>
                <aside>
                    <Panel>
                        <PanelHeader>Managing process types</PanelHeader>
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
