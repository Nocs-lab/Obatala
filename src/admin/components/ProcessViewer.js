import React, { useState, useEffect, useCallback, useMemo  } from "react";
import {
    Icon,
    Spinner,
    Notice,
    Panel,
    PanelHeader,
    PanelBody,
    PanelRow,
    Button,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import MetroNavigation from "./ProcessManager/MetroNavigation";
import MetaFieldInputs from "./ProcessManager/MetaFieldInputs";
import CommentForm from "./ProcessManager/CommentForm";
import { fetchNodePermission, fetchProcessById, fetchProcessTypeById, fetchSectors } from "../api/apiRequests";
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

const ProcessViewer = () => {
    const [process, setProcess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [filteredProcessType, setFilteredProcessType] = useState(null);
    const [submittedSteps, setSubmittedSteps] = useState({});
    const [formValues, setFormValues] = useState({});
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
    const [flowNodes, setFlowNodes] = useState([]);
    const [orderedSteps, setOrderedSteps] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [sectorUser, setSectorUser] = useState([]);
    const [hasPermission, setHasPermission] = useState(null);
    const [isPublic, setIsPublic] = useState(null);
    const [currentStageData, setCurrentStageData] = useState({});

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);
    const allAuthors = useSelect(select => select(coreStore).getUsers({ who: 'authors' }), []);
    const [isStepSubmitEnabled, setIsStepSubmitEnabled] = useState({});
    
    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("process_id");
    };

    useEffect(()  => {
        if (flowNodes && flowNodes.nodes && flowNodes.edges) {
            const steps = getOrderedSteps();
            if (steps.length > 0) {
                setOrderedSteps(steps);

                const processId = getProcessIdFromUrl();
                if (processId) {
                    fetchMetaData(processId, steps);
                }
            }
        }
    }, [flowNodes]);

    useEffect(() => {
        if (!currentUser) {
            return;
        }
        const processId = getProcessIdFromUrl();
        if (processId) {
        setIsLoading(true);
        loadSectors();
            fetchProcessById(processId)
                .then((data) => {
                    setProcess(data);
                    setIsPublic(data.meta?.access_level?.[0] === 'Public' || data.meta?.access_level?.[0] === 'public' )

                const processTypeId = data.meta.process_type;
                if (processTypeId) {
                fetchProcessTypeById(processTypeId)
                    .then((processType) => {
                        setFilteredProcessType(processType);
                    })
                    .catch((error) => {
                        console.error("Error fetching process type:", error);
                        setError("Error fetching process type.");
                    });
                } else {
                }
            })
            .catch((error) => {
                console.error("Error fetching process:", error);
                setError("Error fetching process details.");
            });
            fetchNodePermission(processId, currentUser.id)
                .then((result) => {
                    setFlowNodes(result.data);
                    setHasPermission(result.status);
                    setSectorUser(result.data_sector)
                
                })
                .catch((error) => {
                    console.error("Error fetching process:", error);
                    setError("Error fetching process meta.");
                });
  
            
        } else {
        setError("No process ID found in the URL.");
    }
    setIsLoading(false);
    }, [currentUser]);

    const calculatePercentagem = () => {
        const result = (Object.keys(submittedSteps).length / flowNodes?.nodes?.length) * 100;
        return result.toFixed(2);
    }

    const loadSectors = () => {
        fetchSectors()
            .then(data => {
                const sectors = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    name: value.nome,
                    description: value.descricao,
                    status: value.status,
                }));
    
                setSectors(sectors);
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
            })
      
    };
    
    const getSectorName = (sectorId) => {
        const sector = sectors.find(sector => sector.id === sectorId);
        return sector ? sector.name : "Unknown";
    };

    const fetchMetaData = async (processId, steps) => {
        try {
            const metaData = await apiFetch({ path: `/obatala/v1/process_obatala/${processId}/meta` });
            
            const submittedState = metaData.submittedStages || {};
            const updatedSubmittedSteps = steps.reduce((acc, step, index) => {
                if (submittedState[step.id]) {
                    acc[index] = true;
                }
                return acc;
            }, {});

            setSubmittedSteps(prev => ({ ...prev, ...updatedSubmittedSteps }));

            const stageData = metaData.stageData || {};

            const updatedFormValues = steps.reduce((acc, step) => {
                if (stageData[step.id]) {
                    acc[step.id] = stageData[step.id].fields.reduce((acc, field) => {
                        acc[field.fieldId] = field.value || ''; 
                        return acc;
                    }, {});
                }
                return acc;
            }, {});

            setFormValues(prev => ({ ...prev, ...updatedFormValues }));
            
            const updateCurrentStageData = steps.reduce((acc, step) => {
                if (stageData[step.id]) {
                    acc[step.id] = [stageData[step.id].updateAt, stageData[step.id].user];
                }
                return acc;
            }, {});

            setCurrentStageData(updateCurrentStageData);
            

        } catch (error) {
            console.error('Error fetching meta data:', error);
            setError('Error fetching meta data.');
        } 
    };

    const handleFieldChange = (fieldId, newValue) => {
        const stepId = orderedSteps[currentStep].id;
    
        // Atualize os valores do formulário
        setFormValues(prevValues => ({
            ...prevValues,
            [stepId]: {
                ...prevValues[stepId],
                [fieldId]: newValue,
            },
        }));

        // Verifica se todos os campos da etapa atual foram preenchidos
        const allFieldsFilled = orderedSteps[currentStep].data.fields.every((field) => {
            const value = formValues[stepId]?.[field.id] || newValue;
            return value !== undefined && value !== '';
        });
        setIsStepSubmitEnabled(prevState => ({
            ...prevState,
            [currentStep]: allFieldsFilled,
        }));

        setIsSubmitEnabled(formValues);
    };

    const getOrderedSteps = useCallback(() => {
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

            nodes.forEach(node => {
                if (!visited.has(node.id)) {
                    orderedSteps.push(node);
                }
            });
            
            return orderedSteps;
        }
        return [];
    }, [flowNodes]);

    const handleSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();

        const stepId = orderedSteps[currentStep].id;
        
        const fields = orderedSteps[currentStep].data.fields.map(field => ({
            fieldId: field.id,
            value: formValues[stepId]?.[field.id],
        }));
        
        try {
            const existingMetaData = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'GET',
            });

            const updatedStageData = {
                ...existingMetaData.stageData,
                [stepId]: { fields, updateAt: new Date(),
                    user: currentUser.name },
            };

            await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'POST',
                data: {
                    stageData: updatedStageData,
                    submittedStages: {
                        ...existingMetaData.submittedStages,
                        [stepId]: true,
                    },
                }
            });

            setSubmittedSteps(prev => ({
                ...prev,
                [currentStep]: true, 
            }));

            setCurrentStageData(prev => ({
                ...prev,
                [stepId]: [new Date(), currentUser.name],
            }));

            setIsLoading(false);

        } catch (error) {
            console.error('Error saving metadata:', error);
            setError('Error saving metadata.');
        }
    };

    const isUserInSector = (stepSector) => {
        if (!Array.isArray(sectorUser)) {
            console.error("sectorUser não é um array válido:", sectorUser);
            return false;
        }
        return sectorUser.includes(stepSector);
    };

    if (!isLoading && !process) {
        return (
            <Notice status="warning" isDismissible={false}>
                No process found.
            </Notice>
        );
    }

    const options = orderedSteps.map(step => ({ 
        label: step.data.stageName, 
        value: step.id, 
        fields: step.data.fields, 
        sector_stage: step.sector_obatala,
    }));

    const lastUpdateStage = () => { 
        const currentStepData = currentStageData[options[currentStep]?.value];
        const user = currentStepData ? currentStepData[1] : 'Desconhecido'
        const dateFormat = currentStepData && currentStepData[0] ? format(currentStepData[0], "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
        }) : 'Data não disponível'

        return {user, dateFormat}
    }

    const authorsById = allAuthors ? allAuthors.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {}) : {};

    const createAtProcess = () => {
        const formatDate = format(process?.date, "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
        })
        return formatDate;
    }

    return (
        <main>
            {isLoading ? (
                <Spinner />
            ) :(
                <>
                    <span className="brand">
                        <strong>Obatala</strong> Curatorial Process Viewer
                    </span>
                    <div className="title-container">
                        <h2>
                            <small>
                                Model: {filteredProcessType
                                    ? filteredProcessType.title.rendered
                                    : "Process type title"}
                            </small>
                            {process.title?.rendered}
                        </h2>
                    </div>
                    <div className="badge-container">
                        <span
                            className={`badge ${
                                process.meta.access_level == "public" || process.meta.access_level == 'Public' ? "success" : "warning"
                            }`}
                            >
                            {process.meta.access_level}
                        </span>
                        <span className="badge default"><Icon icon="yes"/> {calculatePercentagem()}% concluído</span>
                        <span className="badge default"><Icon icon="admin-users"/> Criado por: {authorsById[process?.author]?.name} em {createAtProcess()}</span>
                    </div>

                    {!isPublic && hasPermission === false ? (
                        <div style={{margin: '50px'}}>
                            <div className="notice-container">
                                <Notice status="error" isDismissible={false}> 
                                    You do not have permission to access this process.
                                </Notice>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isPublic && hasPermission === false && (
                                <div className="notice-container">
                                    <Notice status="warning" isDismissible={false}>
                                        You can only view this process.
                                    </Notice>
                                </div>
                            )}
                            <div className="panel-container three-columns">
                                <MetroNavigation
                                    options={options}
                                    currentStep={currentStep}
                                    onStepChange={(newStep) => setCurrentStep(newStep)}
                                    submittedSteps={submittedSteps}
                                />
                                <main>
                                    {orderedSteps.length > 0 && orderedSteps[currentStep] ? (
                                        <Panel key={`${orderedSteps[currentStep].id}-${currentStep}`}>
                                            <PanelHeader>
                                                <h3>{`${options[currentStep].label}`}</h3>
                                                <span className="badge default ms-auto">
                                                    Grupo: {getSectorName(options[currentStep].sector_stage)}
                                                </span>
                                            </PanelHeader>
                                            <PanelBody>
                                                <PanelRow>
                                                    {options[currentStep].fields.length > 0 ? (
                                                        <form className="centered" onSubmit={handleSubmit}>
                                                            <ul className="meta-fields-list">
                                                                {Array.isArray(options[currentStep].fields) ? options[currentStep].fields.map((field, idx) => (
                                                                    <li key={`${orderedSteps[currentStep].id}-meta-${idx}`} className="meta-field-item">
                                                                        <MetaFieldInputs 
                                                                            field={field} 
                                                                            fieldId={field.id} 
                                                                            initalValue={formValues[orderedSteps[currentStep].id]?.[field.id] || ''}
                                                                            isEditable={!submittedSteps[currentStep]}
                                                                            noHasPermission={!isUserInSector(options[currentStep].sector_stage)} 
                                                                            onFieldChange={handleFieldChange} 
                                                                        />
                                                                    </li>
                                                                )) : null}
                                                            </ul>
                                                            <div className="action-bar">
                                                                <Button
                                                                    variant="primary"
                                                                    type="submit"
                                                                    disabled={!isSubmitEnabled || submittedSteps[currentStep] || !isUserInSector(options[currentStep].sector_stage)}
                                                                    >Submit
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <div className="notice-container">
                                                            <Notice status="warning" isDismissible={false}>
                                                                No fields found for this Step.
                                                            </Notice>
                                                        </div>
                                                    )}
                                                </PanelRow>
                                                <footer>
                                                    {Object.keys(currentStageData).includes(options[currentStep]?.value) ?
                                                    `Última atualização em ${lastUpdateStage().dateFormat} por ${lastUpdateStage().user}`    
                                                    : 'Sem atualizações no momento'
                                                    }
                                                </footer>
                                            </PanelBody>
                                        </Panel>
                                    ) : (
                                        <div className="notice-container">
                                            <Notice status="warning" isDismissible={false}>
                                            No steps found for this process.
                                            </Notice>
                                        </div>
                                    )}
                                </main>
                                <aside>
                                    <Panel>
                                        <PanelHeader>Comments</PanelHeader>
                                        <CommentForm stepId={orderedSteps[currentStep]?.id || null} />
                                    </Panel>
                                </aside>
                            </div>
                        </>
                    )}   
                </>
        )}     
        </main>
    );
};

export default ProcessViewer;
