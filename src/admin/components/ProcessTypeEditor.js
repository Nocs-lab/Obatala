import React, { useState, useEffect } from 'react';
import { Panel, PanelHeader, Spinner, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessStepForm from './ProcessTypeManager/ProcessStepForm';
import StepList from './ProcessTypeManager/StepList';

const ProcessTypeEditor = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('process_type_id');
    const [processType, setProcessType] = useState(null);
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stepOrder, setStepOrder] = useState([]);

    useEffect(() => {
        setIsLoading(true);

        apiFetch({ path: `/obatala/v1/process_type/${id}` })
            .then((typeData) => {
                setProcessType(typeData);
                const order = typeData.meta.step_order || [];
                setStepOrder(order);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setNotice({ status: 'error', message: 'Error fetching process type.' });
                setIsLoading(false);
            });
    }, [id]);

    const handleSave = async (updatedProcessType) => {
        setIsLoading(true);
        try {
            const savedType = await apiFetch({
                path: `/obatala/v1/process_type/${id}`,
                method: 'PUT',
                data: updatedProcessType
            });

            const meta = {
                description: updatedProcessType.meta.description.toString(),
                accept_attachments: updatedProcessType.meta.accept_attachments,
                accept_tainacan_items: updatedProcessType.meta.accept_tainacan_items,
                generate_tainacan_items: updatedProcessType.meta.generate_tainacan_items,
                step_order: stepOrder,
            };

            await apiFetch({
                path: `/obatala/v1/process_type/${id}/meta`,
                method: 'PUT',
                data: meta
            });

            setProcessType(prevType => ({
                ...prevType,
                title: savedType.title,
                meta
            }));

            setNotice({ status: 'success', message: 'Process type and meta updated successfully.' });
        } catch (error) {
            setNotice({ status: 'error', message: 'Error updating process type and meta.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddProcessStep = (stepIds) => {
        const newStepOrder = Array.isArray(stepOrder) ? stepOrder : [];

        const stepsToAdd = stepIds.filter(stepId => !newStepOrder.includes(stepId));

        if (stepsToAdd.length === 0) {
            setNotice({ status: 'warning', message: 'All selected steps are already in the process type.' });
            return;
        }

        const updatedStepOrder = [...newStepOrder, ...stepsToAdd];

        apiFetch({
            path: `/obatala/v1/process_type/${id}/meta`,
            method: 'PUT',
            data: { step_order: updatedStepOrder }
        })
            .then(() => {
                setStepOrder(updatedStepOrder);
                setNotice({ status: 'success', message: 'Steps added successfully.' });
            })
            .catch(error => {
                console.error('Error updating step order:', error);
                setNotice({ status: 'error', message: 'Error updating step order.' });
            });
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (!processType) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Process Type Editor</h2>
            <div className="panel-container">
                <main>
                    <Panel>
                        <PanelHeader><h3>Steps</h3></PanelHeader>
                    
                        {notice && (
                            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                {notice.message}
                            </Notice>
                        )}

                        <StepList
                            processTypeId={processType.id}
                            stepOrder={stepOrder}
                            onNotice={setNotice}
                        />
                    </Panel>
                </main>
                <aside>
                    <Panel>
                        <PanelHeader>Editing process type</PanelHeader>
                        <ProcessTypeForm 
                            onSave={handleSave} 
                            editingProcessType={processType} 
                            onCancel={() => { /* Handle cancel if necessary */ }} 
                        />
                        <ProcessStepForm 
                            onAddStep={handleAddProcessStep} 
                        />
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessTypeEditor;
