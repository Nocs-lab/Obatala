import { useState, useEffect, useReducer } from 'react';
import {
    Panel,
    PanelHeader,
    Spinner,
    Notice,
    __experimentalConfirmDialog as ConfirmDialog
} from '@wordpress/components';
import {
    fetchProcessTypes,
    fetchProcessSteps,
    saveProcessType,
    deleteProcessType,
    updateProcessStep,
    checkLinkedProcesses
} from '../api/apiRequests'; // Supondo que as funções de API estejam neste arquivo
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessTypeList from './ProcessTypeManager/ProcessTypeList';
import ProcessStepForm from './ProcessTypeManager/ProcessStepForm';
import Reducer, { initialState } from '../redux/reducer';

const ProcessTypeManager = () => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processSteps, setProcessSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProcessType, setEditingProcessType] = useState(null);
    const [state, dispatch] = useReducer(Reducer, initialState);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        loadProcessTypes();
        loadProcessSteps();
    }, []);

    const loadProcessTypes = async () => {
        setIsLoading(true);
        try {
            const data = await fetchProcessTypes();
            setProcessTypes(data);
        } catch (error) {
            setNotice({ status: 'error', message: 'Error fetching process types.' });
        } finally {
            setIsLoading(false);
        }
    };

    const loadProcessSteps = async () => {
        try {
            const data = await fetchProcessSteps();
            setProcessSteps(data);
        } catch (error) {
            setNotice({ status: 'error', message: 'Error fetching process steps.' });
        }
    };

    const handleSaveProcessType = async (processType) => {
        try {
            if (editingProcessType) {
                const updatedProcessType = await saveProcessType(editingProcessType.id, processType);
                setProcessTypes((prevProcessTypes) =>
                    prevProcessTypes.map((type) => (type.id === updatedProcessType.id ? updatedProcessType : type))
                );
                setEditingProcessType(null);
            } else {
                await saveProcessType(null, processType);
                loadProcessTypes();
            }
        } catch (error) {
            setNotice({ status: 'error', message: 'Error saving process type.' });
        }
    };

    const handleDeleteProcessType = async (id) => {
        try {
            await deleteProcessType(id);
            setProcessTypes((prevProcessTypes) => prevProcessTypes.filter((type) => type.id !== id));
        } catch (error) {
            setNotice({ status: 'error', message: 'Error deleting process type.' });
        }
    };

    const handleEditProcessType = (processType) => {
        setEditingProcessType(processType);
    };

    const handleAddProcessStep = async (steps) => {
        try {
            for (const step of steps) {
                const { id, process_type } = step;
                const existingStep = processSteps.find((existing) => existing.id === id);
                if (!existingStep) {
                    setNotice({ status: 'error', message: `Step not found: ${id}` });
                    continue;
                }

                const currentProcessTypes = Array.isArray(existingStep.process_type)
                    ? existingStep.process_type.map(Number)
                    : [];
                const newProcessType = Number(process_type);

                if (currentProcessTypes.includes(newProcessType)) {
                    setNotice({ status: 'error', message: 'Step is already linked to this Process Type.' });
                    continue;
                }

                const updatedProcessTypes = [...currentProcessTypes, newProcessType];
                await updateProcessStep(id, { process_type: updatedProcessTypes });
                setProcessSteps((prevProcessSteps) =>
                    prevProcessSteps.map((s) => (s.id === id ? { ...s, process_type: updatedProcessTypes } : s))
                );
            }
        } catch (error) {
            setNotice({ status: 'error', message: 'Error updating process step.' });
        }
    };

    const handleUpdatedProcessStep = async () => {
        const { stepId, typeId } = state.deleteStep;
        try {
            const existingStep = processSteps.find((step) => step.id === stepId);
            if (!existingStep) {
                setNotice({ status: 'error', message: `Step not found: ${stepId}` });
                return;
            }

            const hasLinkedProcesses = await checkLinkedProcesses(typeId);
            if (hasLinkedProcesses) {
                setNotice({ status: 'error', message: 'Cannot delete step as it is linked to a process type in use.' });
                return;
            }

            const stepProcessTypes = Array.isArray(existingStep.process_type)
                ? existingStep.process_type.map(Number)
                : [];
            const updatedProcessTypes = stepProcessTypes.filter((id) => id !== typeId);

            await updateProcessStep(stepId, { process_type: updatedProcessTypes });
            setProcessSteps((prevProcessSteps) =>
                prevProcessSteps.map((step) => (step.id === stepId ? { ...step, process_type: updatedProcessTypes } : step))
            );
        } catch (error) {
            setNotice({ status: 'error', message: 'Error updating process step.' });
        }
    };

    const handleConfirmDeleteType = (id) => {
        dispatch({ type: 'OPEN_MODAL_PROCESS_TYPE', payload: id });
    };

    const handleConfirmDeleteStep = (stepId, typeId) => {
        dispatch({ type: 'OPEN_MODAL_STEP', payload: { stepId, typeId } });
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
                            } else if (state.deleteStep) {
                                handleUpdatedProcessStep();
                            }
                            dispatch({ type: 'CLOSE_MODAL' });
                        }}
                        onCancel={handleCancel}
                    >
                        Are you sure you want to delete this {state.deleteProcessType ? 'Process Type' : 'Step'}?
                    </ConfirmDialog>
                    <ProcessTypeList
                        processTypes={processTypes}
                        processSteps={processSteps}
                        onEdit={handleEditProcessType}
                        onDelete={handleConfirmDeleteType}
                        onDeleteStep={handleConfirmDeleteStep}
                    />
                </main>
                <aside>
                    <Panel>
                        <PanelHeader>Managing process types</PanelHeader>
                        <ProcessTypeForm
                            onSave={handleSaveProcessType}
                            onCancel={() => setEditingProcessType(null)}
                            editingProcessType={editingProcessType}
                        />
                        {notice && (
                            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                {notice.message}
                            </Notice>
                        )}
                        <ProcessStepForm
                            processTypes={processTypes}
                            processSteps={processSteps}
                            onAddStep={handleAddProcessStep}
                        />
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessTypeManager;
