import React, { useState, useEffect, useCallback  } from "react";
import {
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
import { set } from "date-fns";
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { get_flow_data } from '../api/apiRequests';

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
  const user = useSelect((select) => select(coreStore).getCurrentUser(), []);
  
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
    const processId = getProcessIdFromUrl();
    if (processId) {
      setIsLoading(true);
      apiFetch({ path: `/obatala/v1/process_obatala/${processId}?_embed` })
        .then((data) => {
          setProcess(data);
          setFlowNodes(data.meta.flowData);
          const processTypeId = data.meta.process_type;

        if (processTypeId) {
          apiFetch({ path: `/obatala/v1/process_type/${processTypeId}` })
            .then((processType) => {
              setFilteredProcessType(processType);
              setIsLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching process type:", error);
              setError("Error fetching process type.");
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
        })
        .catch((error) => {
          console.error("Error fetching process:", error);
          setError("Error fetching process details.");
          setIsLoading(false);
        });
    } else {
      setError("No process ID found in the URL.");
      setIsLoading(false);
    }
  }, []);

  const fetchMetaData = async (processId, steps) => {
    setIsLoading(true);
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

    } catch (error) {
        console.error('Error fetching meta data:', error);
        setError('Error fetching meta data.');
    } finally {
        setIsLoading(false);
    }
};

const handleFieldChange = (fieldId, newValue) => {
  const stepId = orderedSteps[currentStep].id;

  setFormValues(prevValues => ({
          ...prevValues,
          [stepId]: {
              ...prevValues[stepId],
              [fieldId]: newValue
          }
  }));

  setIsSubmitEnabled(formValues);
};

const handleSubmit = async (e) => {
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
          [stepId]: { fields }
      };


      await apiFetch({
          path: `/obatala/v1/process_obatala/${process.id}/meta`,
          method: 'POST',
          data: {
              stageData: updatedStageData,
              submittedStages: {
                  ...existingMetaData.submittedStages,
                  [stepId]: true,
              }
          }
      });

      setSubmittedSteps(prev => ({
          ...prev,
          [currentStep]: true, 
      }));

  } catch (error) {
      console.error('Error saving metadata:', error);
      setError('Error saving metadata.');
  }
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

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Notice status="error" isDismissible={false}>
        {error}
      </Notice>
    );
  }

  if (!process) {
    return (
      <Notice status="warning" isDismissible={false}>
        No process found.
      </Notice>
    );
  }
  console.log(process.meta.flowData);
  console.log(orderedSteps)
  const options = orderedSteps.map(step => ({ label: step.data.stageName, value: step.id, fields: step.data.fields }));

  return (
    <div>
      <span className="brand">
        <strong>Obatala</strong> Curatorial Process Viewer
      </span>
      <h2>
        {filteredProcessType
          ? filteredProcessType.title.rendered
          : "Process type title"}
        : {process.title?.rendered}
      </h2>
      <div className="badge-container">
        <span
          className={`badge ${
            process.meta.access_level == "public" ? "success" : "warning"
          }`}
        >
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
            <Panel key={`${orderedSteps[currentStep].id}-${currentStep}`}>
              <PanelHeader>
                <h3>{`${options[currentStep].label}`}</h3>
                <span className="badge default ms-auto">Setor: Recepção</span>
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
                                                        onFieldChange={handleFieldChange} 
                                                    />
                                                </li>
                                            )) : null}
                                        </ul>
                                        <div className="action-bar">
                                            <Button
                                                variant="primary"
                                                type="submit"
                                                disabled={!isSubmitEnabled || submittedSteps[currentStep]}
                                            >Submit
                                            </Button>
                                        </div>
                                    </form>
                                    ) : (
                                        <Notice status="warning" isDismissible={false}>No fields found for this Step.</Notice>
                                    )}
                </PanelRow>
                <footer>
                  Última atualização em 21/10/2024 por João da Silva
                </footer>
              </PanelBody>
            </Panel>
          ) : (
            <Notice status="warning" isDismissible={false}>
              No steps found for this process.
            </Notice>
          )}
        </main>
        <aside>
            <Panel>
                <PanelHeader>Comments</PanelHeader>
                <CommentForm stepId={orderedSteps[currentStep]?.id || null} />
            </Panel>
        </aside>
      </div>
    </div>
  );
};

export default ProcessViewer;
