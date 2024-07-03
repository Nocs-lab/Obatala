import { useState, useEffect } from 'react';
import { Spinner,  __experimentalConfirmDialog as ConfirmDialog  } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessTypeList from './ProcessTypeManager/ProcessTypeList';
import ProcessStepForm from './ProcessTypeManager/ProcessStepForm';



const ProcessTypeManager = () => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processSteps, setProcessSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProcessType, setEditingProcessType] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [stepToDelete, setStepToDelete] = useState(null);
      
    useEffect(() => {
        fetchProcessTypes();
        fetchProcessSteps();
    }, []);

    const fetchProcessTypes = () => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_type?per_page=100&_embed` })
            .then(data => {
                console.log('Fetched Process Types:', data);
                setProcessTypes(data);
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
                setProcessSteps(data);
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

    const handleAddProcessStep = (step) => {
        apiFetch({ path: `/wp/v2/process_step`, method: 'POST', data: step })
            .then(savedProcessStep => {
                setProcessSteps([...processSteps, savedProcessStep]);
            })
            .catch(error => {
                console.error('Error adding process step:', error);
            });
        
    };
     
    const handleDeleteProcessStep = () => {
        if(stepToDelete){
            apiFetch({ path: `/wp/v2/process_step/${stepToDelete}`, method: 'DELETE' })
                .then(() => {
                    const updatedProcessSteps = processSteps.filter(step => step.id !== stepToDelete);
                    setProcessSteps(updatedProcessSteps);
                    setStepToDelete(null);
                    setIsOpen(false);
                })
                .catch(error => {
                    console.error('Error deleting process step:', error);
                });
        }
        return false 
        
       }; 

     const handleConfirmDelete = (id) => {
        setStepToDelete(id);
        setIsOpen(true);
    } 
     
    const handleCancel = () => {
        setIsOpen( false );
        setStepToDelete(null);
    }; 

    if (isLoading) {
        return <Spinner />;
    }

    return (
            <div>
            <span class="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Manage Process Types and Steps</h2>
            <div className="panel-container">
                <main>
                     <ConfirmDialog
                     isOpen={ isOpen }
                     onConfirm={ handleDeleteProcessStep }
                     onCancel={handleCancel}
                    >
                        Are you sure you want to delete this step?
                    </ConfirmDialog> 
                    <ProcessTypeList 
                        processTypes={processTypes} 
                        processSteps={processSteps} 
                        onEdit={handleEditProcessType} 
                        onDelete={handleDeleteProcessType} 
                        onDeleteStep={handleConfirmDelete}
                        
                    />
                </main>
                <aside>
                    <ProcessTypeForm onSave={handleSaveProcessType} onCancel={() => setEditingProcessType(null)} editingProcessType={editingProcessType} />    
                    <ProcessStepForm processTypes={processTypes} onAddStep={handleAddProcessStep} />
                </aside>
            </div>
        </div>
      
    );
};

export default ProcessTypeManager;
