import React, { useState, useEffect } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { Panel, PanelHeader, Spinner, Notice } from '@wordpress/components';
import ProcessTypeForm from './ProcessTypeManager/ProcessTypeForm';
import ProcessStepForm from './ProcessTypeManager/ProcessStepForm';
import StepList from './ProcessTypeManager/StepList';

const ProcessTypeEditor = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('process_type_id');
    const [processType, setProcessType] = useState(null);
    const [processSteps, setProcessSteps] = useState([]);
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        Promise.all([
            apiFetch({ path: `/obatala/v1/process_type/${id}` }),
            apiFetch({ path: `/obatala/v1/process_step?per_page=100&_embed` })
        ])
            .then(([typeData, stepsData]) => {
                const sortedSteps = stepsData.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessType(typeData);
                setProcessSteps(sortedSteps);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setNotice({ status: 'error', message: 'Error fetching process type or steps.' });
                setIsLoading(false);
            });
    }, [id]);

    const handleSave = async (updatedProcessType) => {
        setIsLoading(true);
        try {
            await apiFetch({
                path: `/obatala/v1/process_type/${id}`,
                method: 'PUT',
                data: updatedProcessType
            });
            setNotice({ status: 'success', message: 'Process type updated successfully.' });
        } catch (error) {
            setNotice({ status: 'error', message: 'Error updating process type.' });
        }
        setIsLoading(false);
    };

    const handleAddProcessStep = (processTypeId, stepIds) => {
        const stepOrder = Array.isArray(processType?.step_order) ? processType.step_order : [];

        const stepsToAdd = stepIds.filter(stepId => !stepOrder.includes(stepId));

        if (stepsToAdd.length === 0) {
            setNotice({ status: 'warning', message: 'All selected steps are already in the process type.' });
            return;
        }

        const updatedStepOrder = [...stepOrder, ...stepsToAdd];

        apiFetch({
            path: `/obatala/v1/process_type/${id}/meta`,
            method: 'PUT',
            data: { step_order: updatedStepOrder }
        })
            .then(() => {
                setProcessType(prevType => ({
                    ...prevType,
                    step_order: updatedStepOrder
                }));
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
                            processTypeId={id}
                            processSteps={processSteps}
                            stepOrder={processType.step_order}
                            onNotice={setNotice}
                        />
                    </Panel>
                </main>
                <aside>
                    <Panel>
                        <PanelHeader>Editing process type</PanelHeader>
                        <ProcessTypeForm onSave={handleSave} editingProcessType={processType} onCancel={() => { /* Handle cancel if necessary */ }} />
                        <ProcessStepForm processTypes={[processType]} processSteps={processSteps} onAddStep={handleAddProcessStep} />
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessTypeEditor;
