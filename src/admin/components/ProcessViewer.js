import React, { useState, useEffect } from 'react';
import { Spinner, Notice, Panel, PanelHeader, PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { fetchProcessTypes } from '../api/apiRequests';
import MetroNavigation from './ProcessManager/MetroNavigation';
import MetaFieldInputs from './ProcessManager/MetaFieldInputs';
import CommentForm from './ProcessManager/CommentForm';

const ProcessViewer = () => {
    const [process, setProcess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState([]);
    const [filteredProcessType, setFilteredProcessType] = useState(null);
    const [processTypes, setProcessTypes] = useState([]);

    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('process_id');
    };

    useEffect(() => {
        const processId = getProcessIdFromUrl();
        
        if (processId) {
            // Carrega os tipos de processo e então busca o processo
            fetchLoadProcess().then(() => {
                fetchProcess(processId);
            });
        } else {
            setError('No process ID found in the URL.');
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const processId = getProcessIdFromUrl();
        
        if (processId && processTypes.length > 0) {
            fetchProcessType(processId);
        }
    }, [processTypes]);

    useEffect(() => {
        if (process) {
            fetchSteps();
        }
    }, [process]);

    const fetchProcess = (processId) => {
        setIsLoading(true);
        apiFetch({ path: `/obatala/v1/process_obatala/${processId}?_embed` })
            .then(data => {
                setProcess(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process:', error);
                setError('Error fetching process details.');
                setIsLoading(false);
            });
    };

    const fetchSteps = async () => {
        try {
            const stepsData = await apiFetch({ path: `/obatala/v1/process_step` });
            setSteps(stepsData);
        } catch (error) {
            console.error('Error fetching steps:', error);
            setError('Error fetching steps details.');
        }
    };
    
    const fetchLoadProcess = () => {
        setIsLoading(true);
        return fetchProcessTypes()
            .then(data => {
                setProcessTypes(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
                setIsLoading(false);
            });
    };

    const fetchProcessType = (processId) => {
        setIsLoading(true);
        apiFetch({ path: `/obatala/v1/process_obatala/${processId}/process_type` })
            .then(processTypeId => {
                // Converta ambos para string ou number, conforme necessário
                const filteredProcessType = processTypes.find(type => String(type.id) === String(processTypeId));
                
                console.log("Filtrado", filteredProcessType);
                setFilteredProcessType(filteredProcessType);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process type:', error);
                setError('Error fetching process details.');
                setIsLoading(false);
            });
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return <Notice status="error" isDismissible={false}>{error}</Notice>;
    }

    if (!process) {
        return <Notice status="warning" isDismissible={false}>No process found.</Notice>;
    }

    // Map orderedSteps to include the title from the steps list
    const orderedSteps = process.meta.step_order.map(order => {
        const step = steps.find(s => s.id === order.step_id);
        return { ...order, title: step ? step.title.rendered : 'Unknown Title', meta_fields: order.meta_fields || [] };
    });

    const options = orderedSteps.map(step => ({ label: step.title, value: step.step_id }));

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Viewer</span>
            <h2>{filteredProcessType ? filteredProcessType.title.rendered : 'Process type title'}: {process.title?.rendered}</h2>
            <div className="badge-container">
                <span className={`badge ${process.status === 'completed' ? 'success' : 'warning'}`}>
                    {process.status}
                </span>
                {orderedSteps[currentStep] && (
                    <span className="badge">
                        Current step: {orderedSteps[currentStep]?.title || 'Unknown Step'}
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
                    {orderedSteps.length > 0 && orderedSteps[currentStep] ? (
                        <Panel key={`${orderedSteps[currentStep].step_id}-${currentStep}`}>
                            <PanelHeader>{`${orderedSteps[currentStep].title}`}</PanelHeader>
                            <PanelBody>
                                <PanelRow>
                                    <ul className="meta-fields-list">
                                        {Array.isArray(orderedSteps[currentStep].meta_fields) ? orderedSteps[currentStep].meta_fields.map((field, idx) => (
                                            <li key={`${orderedSteps[currentStep].step_id}-meta-${idx}`} className="meta-field-item">
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
                        <CommentForm stepId={orderedSteps[currentStep]?.step_id || null} />
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessViewer;
