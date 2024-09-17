import React, { useState, useEffect } from 'react';
import { Spinner, Notice, Panel, PanelHeader, PanelBody, PanelRow , Button} from '@wordpress/components';
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
    const [flowNodes, setFlowNodes] = useState([]);
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
        if (process && filteredProcessType) {
            fetchSteps();
        }
    }, [process, filteredProcessType]);

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
        setIsLoading(true);
        apiFetch({ path: `/obatala/v1/process_type/${filteredProcessType.id}?_embed` })
            .then(data => {
                setFlowNodes(data.meta.flowData);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching steps:', error);
                setError('Error fetching steps details.');
                setIsLoading(false);
            });
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
            const updatedValues = {
                ...prevValues,
                [currentStep]: {
                    ...prevValues[currentStep],
                    [fieldId]: newValue
                }
            };
            return updatedValues;
            
        });
        setIsSubmitEnabled(formValues);
    };
    
    const handleSubmit = async () => {
        const updatedFlowData = {
            ...flowNodes,
            nodes: flowNodes.nodes.map(node => {
                if (node.id === orderedSteps[currentStep].id) {
                    return {
                        ...node,
                        fields: node.fields.map(field => {
                            const newValue = formValues[currentStep]?.[field.id] || field.value;
                            return {
                                ...field,
                                value: newValue
                            };
                        })
                    };
                }
                return node;
            })
        };

        try {
            const result = await apiFetch({
                path: `/obatala/v1/process_type/${filteredProcessType.id}/meta`,
                method: 'PUT',
                data: { flowData: updatedFlowData }
            });
            if(result){
                setSubmittedSteps(prev => ({
                    ...prev,
                    [currentStep]: true,
                }));
            }
        } catch (error) {
            console.error('Error saving metadata: ', error);
            setError('Error saving metadata.');

        }
    };


    
    const getOrderedSteps = () => {
        if (flowNodes && flowNodes.nodes){
            const { edges, nodes } = flowNodes;
            const nodeMap = new Map(nodes.map(node => [node.id, node]));
            const sources = new Set(edges.map(edge => edge.source));
            const targets = new Set(edges.map(edge => edge.target));

            const initialStep = nodes.filter(node => sources.has(node.id) && !targets.has(node.id));
            
            const orderedSteps = [];
            const visited = new Set();
    
            const visit = (nodeId) => {
                if (visited.has(nodeId)) return;
                visited.add(nodeId);
                const node = nodeMap.get(nodeId);
                if (node) {
                    orderedSteps.push(node);
                    edges
                        .filter(edge => edge.source === nodeId)
                        .forEach(edge => visit(edge.target));
                }
            };
    
            initialStep.forEach(node => visit(node.id));
    
            return orderedSteps;

        }
        return [];
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

    const orderedSteps = getOrderedSteps();
    const options = orderedSteps.map(step => ({ label: step.stageName, value: step.id }));
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
                                <h3>{`${orderedSteps[currentStep].stageName}`}</h3>
                                <span className="badge default ms-auto">Setor: Recepção</span>
                            </PanelHeader>
                            <PanelBody>
                                <PanelRow>
                                    
                                    {orderedSteps[currentStep].fields.length > 0 ? (
                                        <form className="centered" action="">
                                        <ul className="meta-fields-list">
                                            {Array.isArray(orderedSteps[currentStep].fields) ? orderedSteps[currentStep].fields.map((field, idx) => (
                                                <li key={`${orderedSteps[currentStep].id}-meta-${idx}`} className="meta-field-item">
                                                    <MetaFieldInputs 
                                                        field={field} 
                                                        fieldId={field.id}  
                                                        initalValue={formValues[currentStep]?.[field.id] || ''}
                                                        isEditable={!submittedSteps[currentStep]} 
                                                        onFieldChange={handleFieldChange} 
                                                    />
                                                </li>
                                            )) : null}
                                        </ul>
                                        <div className="action-bar">
                                            <Button
                                                isPrimary
                                                onClick={handleSubmit}
                                                disabled={!isSubmitEnabled[currentStep] || submittedSteps[currentStep]}
                                            >Submit
                                            </Button>
                                        </div>
                                    </form>
                                    ) : (
                                        <Notice status="warning" isDismissible={false}>No fields found for this Step.</Notice>
                                    )}
                                    
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


