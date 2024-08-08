import React, { useState, useEffect } from 'react';
import { Spinner, Notice, Panel, PanelHeader, PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import MetroNavigation from './ProcessManager/MetroNavigation';
import MetaFieldInputs from './ProcessManager/MetaFieldInputs';
import CommentForm from './ProcessManager/CommentForm';

const ProcessViewer = () => {
    const [process, setProcess] = useState(null);
    const [steps, setSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('process_id');
    };

    useEffect(() => {
        const processId = getProcessIdFromUrl();
        if (processId) {
            fetchProcess(processId);
        } else {
            setError('No process ID found in the URL.');
            setIsLoading(false);
        }
    }, []);

    const fetchProcess = async (processId) => {
        setIsLoading(true);
        try {
            const data = await apiFetch({ path: `/obatala/v1/process_obatala/${processId}?_embed` });
            setProcess(data);
            if (data.meta && data.meta.step_order) {
                const stepOrder = data.meta.step_order;
                const stepsData = await fetchSteps(stepOrder);
                setSteps(stepsData);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching process:', error);
            setError('Error fetching process details.');
            setIsLoading(false);
        }
    };

    const fetchSteps = async (stepOrder) => {
        try {
            const stepsData = await apiFetch({ path: `/obatala/v1/process_step` });
            return stepsData;
        } catch (error) {
            console.error('Error fetching steps:', error);
            setError('Error fetching steps details.');
            return [];
        }
    };
/*
    const processType = processTypes.find(processType => {
        return processType.id == process.process_type;
    });
*/
    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return <Notice status="error" isDismissible={false}>{error}</Notice>;
    }

    if (!process) {
        return <Notice status="warning" isDismissible={false}>No process found.</Notice>;
    }

    const options = steps.map(step => ({ label: `${step.title.rendered}`, value: step.id }));
    console.log("aqui", process);
    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Viewer</span>
            <h2>{process.process_type ? process.process_type : 'Process type title'}: {process.title?.rendered}</h2>
            <div className="badge-container">
                <span className={`badge ${process.status === 'completed' ? 'success' : 'warning'}`}>
                    {process.status}
                </span>
                {steps[currentStep] && (
                    <span className="badge">
                        Current step: {steps[currentStep]?.title.rendered || 'Unknown Step'}
                    </span>
                )}
            </div>

            <MetroNavigation
                options={options}
                currentStep={currentStep}
                onStepChange={(newStep) => setCurrentStep(newStep)}
            />

            <div className="panel-container">
                <main>
                    {steps.length > 0 && steps[currentStep] ? (
                        <Panel key={`${steps[currentStep].id}-${currentStep}`}>
                            <PanelHeader>{`${steps[currentStep].title.rendered}`}</PanelHeader>
                            <PanelBody>
                                <PanelRow>
                                    <ul className="meta-fields-list">
                                        {Array.isArray(steps[currentStep].meta_fields) ? steps[currentStep].meta_fields.map((field, idx) => (
                                            <li key={`${steps[currentStep].id}-meta-${idx}`} className="meta-field-item">
                                                <MetaFieldInputs field={field} />
                                            </li>
                                        )) : null}
                                    </ul>
                                </PanelRow>
                            </PanelBody>
                        </Panel>
                    ) : (
                        <Notice status="warning" isDismissible={false}>No steps found for this process type.</Notice>
                    )}
                </main>
                <aside>
                    <Panel>
                        <PanelHeader>Comments</PanelHeader>
                        <CommentForm stepId={steps[currentStep].id} />
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessViewer;
