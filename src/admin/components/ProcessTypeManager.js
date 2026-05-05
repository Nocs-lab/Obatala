import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import {
    Button,
    Icon,
    Spinner,
    Modal,
    Notice,
    __experimentalConfirmDialog as ConfirmDialog 
} from '@wordpress/components';
import { plus } from "@wordpress/icons";
import { fetchProcessModels, saveProcessType, deleteProcessType, updateProcessTypeMeta } from '../api/apiRequests';
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessTypeList from './ProcessTypeManager/ProcessTypeList';
import Reducer, { initialState } from '../redux/reducer';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const ProcessTypeManager = () => {
    const [processTypes, setProcessTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProcessType, setEditingProcessType] = useState(null);
    const [exportDataProcessType, setExportDataProcessType] = useState(null);
    const [addingProcessType, setAddingProcessType] = useState(null);
    const [status, setStatus] = useState(null);
    const [notice, setNotice] = useState(null);
    const [state, dispatch] = useReducer(Reducer, initialState);
    
    const allAuthors = useSelect(select => select(coreStore).getUsers({ who: 'authors' }), []);
    
    useEffect(() => {
        loadProcessTypes();
    }, []);


    const loadProcessTypes = () => {
        setIsLoading(true);
        fetchProcessModels()
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
                description: processType.meta.description || '',
                status: processType.meta.status || '',
                updateAt: processType.meta.updateAt,
                user: processType.meta.user || ''
            };
            await updateProcessTypeMeta(savedProcessType.id, meta);

            setNotice({ status: 'success', message: __('Process model saved successfully.', 'obatala') });
            setEditingProcessType(null);
            setExportDataProcessType(null);
            setAddingProcessType(null);
            loadProcessTypes();
        } catch (error) {
            console.error('Error saving process model:', error);
            setNotice({ status: 'error', message: __('Error saving process model.', 'obatala') });
            setIsLoading(false);
        }
    };

    const handleDeleteProcessType = (processModel) => {
        deleteProcessType(processModel.id)
            .then(() => {
                const updatedProcessTypes = processTypes.filter(type => type.id !== processModel.id);
                setProcessTypes(updatedProcessTypes);
            })
            .catch(error => {
                console.error('Error deleting process type:', error);
            });
    };

    const handleManageProcessModel = (id) => {
        window.location.href = `?page=process-type-editor&process_type_id=${id}`;
    };

    const handleEditModel = (model) => {
        setEditingProcessType(model);
    };

     const handleExportData = (model) => {
        setExportDataProcessType(model);
        window.location.href = `?page=mappers&process_type_id=${model.id}`;
    };

    const handleAdd = () => {
        setAddingProcessType(true);
    }

    const handleCancel = () => {
        setEditingProcessType(null);
        setExportDataProcessType(null);
        setAddingProcessType(null);
        dispatch({ type: 'CLOSE_MODAL' });
    };

    const handleConfirmDelete = (processModel) => {
        dispatch({type: 'OPEN_MODAL_PROCESS_MODEL', payload: processModel})
    }
    const authorsById = allAuthors ? allAuthors.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {}) : {};

    const filteredModels = useMemo(() => {
        if (!status) return processTypes;
        return processTypes.filter((processType) => 
            processType
                ? processType.meta.status[0].includes(status) 
                : true
        );
    }, [status, processTypes]);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <BrandHeader />
            <div className="title-container">
                <h2>{__('Models', 'obatala')}</h2>
                <span className="badge">{filteredModels.length}</span>
                <div className="group-button">
                    <Button
                        variant="primary"
                        icon={<Icon icon={plus} />}
                        onClick={handleAdd}
                    >
                        {__('Add process model', 'obatala')}
                    </Button>
                </div>
            </div>
            <main>
                {notice && (
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                )}
                <ConfirmDialog
                    isOpen={state.isOpen}
                    onConfirm={() => {
                        handleDeleteProcessType(state.processModel);
                        dispatch({ type: 'CLOSE_MODAL' })
                    }}
                    onCancel={handleCancel}
                >
                    {sprintf(
                        __('Are you sure you want to delete process model %s?', 'obatala'),
                        state.processModel?.title?.rendered || ''
                    )}
                </ConfirmDialog>
                <div className="panel-container">
                    <ProcessTypeList
                        processTypes={filteredModels}
                        onExport={handleExportData}
                        onEdit={handleEditModel}
                        onManager={handleManageProcessModel}
                        onDelete={handleConfirmDelete}
                        status={status}
                        setStatus={setStatus}
                        authorsById={authorsById}
                    />
                    {addingProcessType || editingProcessType ? (
                        <Modal
                            title={editingProcessType ? __('Edit process model', 'obatala') : __('Add process model', 'obatala')}
                            onRequestClose={handleCancel}
                            isDismissible={true}
                            size="medium"
                        >
                            <ProcessTypeForm
                                onSave={handleSaveProcessType}
                                onCancel={handleCancel}
                                editingProcessType={editingProcessType ? editingProcessType : null}
                            />
                        </Modal>
                    ) : null}
                </div>
            </main>
            <BrandFooter />
        </>
    );
};

export default ProcessTypeManager;