import { useState, useEffect, useReducer } from 'react';
import {
    Panel,
    PanelHeader,
    Spinner,
    Notice,
    __experimentalConfirmDialog as ConfirmDialog
    } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
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
        fetchProcessTypes();
        fetchProcessSteps();
    }, []);

    const fetchProcessTypes = () => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_type?per_page=100&_embed` })
            .then(data => {
                console.log('Fetched Process Types:', data);
                const sortedProcessTypes = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessTypes(sortedProcessTypes);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
                setIsLoading(false);
            });
    };

    const fetchProcessSteps = () => {
        apiFetch({ path: `/wp/v2/process_step?per_page=100&_embed` })
            .then(data => {
                console.log('Fetched Process Steps:', data);
                const sortedSteps = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessSteps(sortedSteps);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process steps:', error);
                setIsLoading(false);
            });
    };

    const handleSaveProcessType = (processType) => {
        if (editingProcessType) {
            apiFetch({ path: `/wp/v2/process_type/${editingProcessType.id}`, method: 'PUT', data: processType })
                .then(savedProcessType => {
                    const updatedProcessTypes = processTypes.map(type => type.id === savedProcessType.id ? savedProcessType : type);
                    setProcessTypes(updatedProcessTypes);
                    setEditingProcessType(null);
                })
                .catch(error => {
                    console.error('Error updating process type:', error);
                });
        } else {
            apiFetch({ path: `/wp/v2/process_type`, method: 'POST', data: processType })
                .then(savedProcessType => {
                    setProcessTypes([...processTypes, savedProcessType]);
                    fetchProcessTypes();
                })
                .catch(error => {
                    console.error('Error adding process type:', error);
                });
        }
    };

    const handleDeleteProcessType = (id) => {
        apiFetch({ path: `/wp/v2/process_type/${id}`, method: 'DELETE' })
            .then(() => {
                const updatedProcessTypes = processTypes.filter(type => type.id !== id);
                setProcessTypes(updatedProcessTypes);
            })
            .catch(error => {
                console.error('Error deleting process type:', error);
            });
    };

    const handleEditProcessType = (processType) => {
        setEditingProcessType(processType);
    };


    const handleAddProcessStep = (steps) => {
        steps.forEach(step => {
            const { id, process_type } = step;
    
            const existingStep = processSteps.find(existing => existing.id === id);
            
            if (!existingStep) {
                console.error('Etapa não encontrada:', id);
                return;
            }
    
            const currentProcessTypes = Array.isArray(existingStep.process_type) ? 
                                        existingStep.process_type.map(Number) : [];
            const newProcessType = Number(process_type);
    
            if (currentProcessTypes.includes(newProcessType)) {
                setNotice({ status: 'error', message: `Step is already linked to this Process Type` });
                return;
            }
        
            const updatedProcessTypes = [...currentProcessTypes, newProcessType];
    
            apiFetch({
                path: `/wp/v2/process_step/${id}`,
                method: 'PUT',
                data: { process_type: updatedProcessTypes }
            })
            .then(updatedProcessStep => {
                setProcessSteps(prevProcessSteps =>
                    prevProcessSteps.map(s => s.id === id ? updatedProcessStep : s)
                );
            })
            .catch(error => {
                console.error('Error updating process step:', error);
            });
        });
    };
    
    
    
    const handleUpdatedProcessStep = async () => {
        const { stepId, typeId } = state.deleteStep;

        try {
            const existingStep = processSteps.find(step => step.id === stepId);
    
            if (!existingStep) {
                console.error('Etapa não encontrada:', stepId);
                return;
            }
    
            // Verifica se o tipo de processo específico está vinculado a algum processo
            const hasLinkedProcesses = await apiFetch({ path: `/wp/v2/process_obatala?per_page=100` })
                .then(allProcesses => 
                    allProcesses.some(process => Number(process.process_type) === typeId)
                );
    
            if (hasLinkedProcesses) {
                setNotice({ status: 'error', message: 'Cannot delete step as it is linked to a process type in use.' });
                return;
            }
    
            // Atualiza os tipos de processo da etapa para remover o tipo específico
            const stepProcessTypes = Array.isArray(existingStep.process_type) ? existingStep.process_type.map(Number) : [];
            const updatedProcessTypes = stepProcessTypes.filter(id => id !== typeId);
    
            //console.log('Updated Process Types:', updatedProcessTypes);
    
            const updatedProcessStep = await apiFetch({
                path: `/wp/v2/process_step/${stepId}`,
                method: 'PUT',
                data: { process_type: updatedProcessTypes }
            });
    
            //console.log('Etapa atualizada:', updatedProcessStep);
    
            setProcessSteps(prevProcessSteps =>
                prevProcessSteps.map(step => step.id === stepId ? updatedProcessStep : step)
            );
    
        } catch (error) {
            console.error('Erro ao atualizar a etapa do processo:', error);
        }
    };
    
    

    const handleConfirmDeleteType = (id) => {
        dispatch({ type: 'OPEN_MODAL_PROCESS_TYPE', payload: id });
    };

    const handleConfirmDeleteStep = (stepId, typeId) => {
        dispatch({ type: 'OPEN_MODAL_STEP', payload: {stepId, typeId} });
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
                        isOpen={ state.isOpen }
                        onConfirm={() => {
                            if (state.deleteProcessType) {
                                handleDeleteProcessType(state.deleteProcessType);
                            } else if (state.deleteStep) {
                                handleUpdatedProcessStep(state.deleteStep);
                            }
                            dispatch({ type: 'CLOSE_MODAL' });
                        }}
                        onCancel={handleCancel}
                    >   
                        Are you sure you want to delete this {state.deleteProcessType ? 'Process Type' : 'Step' }?

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
                        <ProcessTypeForm onSave={handleSaveProcessType} onCancel={() => setEditingProcessType(null)} editingProcessType={editingProcessType} />    
                        {notice && (
                            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                {notice.message}
                            </Notice>
                        )}
                        <ProcessStepForm processTypes={processTypes} processSteps={processSteps} onAddStep={handleAddProcessStep} />
                    </Panel>
                </aside>
            </div>
        </div>
      
    );
};

export default ProcessTypeManager;