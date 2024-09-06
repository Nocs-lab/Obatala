import React, { useState, useEffect } from 'react';
import { Spinner, Notice, Panel, PanelHeader, PanelBody, PanelRow , Button} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { fetchProcessTypes } from '../api/apiRequests';
import MetroNavigation from './ProcessManager/MetroNavigation';
import MetaFieldInputs from './ProcessManager/MetaFieldInputs';
import CommentForm from './ProcessManager/CommentForm';
import { check, Icon } from '@wordpress/icons';

const ProcessViewer = () => {
    const [process, setProcess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState([]);
    const [filteredProcessType, setFilteredProcessType] = useState(null);
    const [processTypes, setProcessTypes] = useState([]);
    const [submittedSteps, setSubmittedSteps] = useState({});
    const [formValues, setFormValues] = useState({});
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    
    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('process_id');
    };

    useEffect(() => {
        const processId = getProcessIdFromUrl();
        if (processId) {
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
                const filteredProcessType = processTypes.find(type => String(type.id) === String(processTypeId));
                setFilteredProcessType(filteredProcessType);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process type:', error);
                setError('Error fetching process details.');
                setIsLoading(false);
            });
    };

    const handleFieldChange = (fieldId, newValue) => {
        setFormValues(prevValues => {
            const updatedValues = { ...prevValues[currentStep], [fieldId]: newValue };
            return {
                ...prevValues,
                [currentStep]: updatedValues, 
            };
        });
        
        setIsSubmitEnabled(formValues);
    }; 
    
    const handleSubmit = () => {
        setSubmittedSteps(prev => ({
            ...prev,
            [currentStep]: true,
        }));
        setIsSubmitEnabled(false);
        console.log('Form values:', formValues);

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
                <span className={`badge ${process.meta.access_level == 'public' ? 'success' : 'warning'}`}>
                    {process.meta.access_level}
                </span>
                <span className="badge default">70% concluído</span>
            </div>

            <div className="panel-container three-columns">
                <MetroNavigation
                    options={options}
                    currentStep={currentStep}
                    onStepChange={(newStep) => setCurrentStep(newStep)}
                    submittedSteps={submittedSteps}
                />
                <main>
                    {orderedSteps.length > 0 && orderedSteps[currentStep] ? (
                        <Panel key={`${orderedSteps[currentStep].step_id}-${currentStep}`}>
                            <PanelHeader>
                                {`${orderedSteps[currentStep].title}`}
                                <span className="badge default ms-auto">Setor: Recepção</span>
                            </PanelHeader>
                            <PanelBody>
                                <PanelRow>
                                    <ul className="meta-fields-list">
                                        {Array.isArray(orderedSteps[currentStep].meta_fields) ? orderedSteps[currentStep].meta_fields.map((field, idx) => (
                                            <li key={`${orderedSteps[currentStep].step_id}-meta-${idx}`} className="meta-field-item">
                                                <span className="order">{idx + 1}</span>
                                                <MetaFieldInputs 
                                                    field={field} 
                                                    fieldId={idx}  
                                                    initalValue={formValues[currentStep]?.[idx] || ''}
                                                    isEditable={!submittedSteps[currentStep]} 
                                                    onFieldChange={handleFieldChange} 
                                                />
                                            </li>
                                        )) : null}
                                    </ul>

                                    <Button
                                        isPrimary
                                        onClick={handleSubmit}
                                        disabled={!isSubmitEnabled || submittedSteps[currentStep]}
                                    >Submit
                                    </Button>

                                </PanelRow>
                                <footer>Última atualização em 21/10/2024 por João da Silva</footer>
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
