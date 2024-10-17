import React, { useState, useEffect } from "react";
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
import { fetchProcessModels } from "../api/apiRequests";
import MetroNavigation from "./ProcessManager/MetroNavigation";
import MetaFieldInputs from "./ProcessManager/MetaFieldInputs";
import CommentForm from "./ProcessManager/CommentForm";

const ProcessViewer = () => {
  const [process, setProcess] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [filteredProcessType, setFilteredProcessType] = useState(null);
  const [submittedSteps, setSubmittedSteps] = useState({});
  const [formValues, setFormValues] = useState({});
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const getProcessIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("process_id");
  };

  useEffect(() => {
    const processId = getProcessIdFromUrl();
    if (processId) {
      setIsLoading(true);
      apiFetch({ path: `/obatala/v1/process_obatala/${processId}?_embed` })
        .then((data) => {
          setProcess(data);
          setIsLoading(false);
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

  const handleFieldChange = (fieldId, newValue) => {
    setFormValues((prevValues) => {
      const updatedValues = { ...prevValues[currentStep], [fieldId]: newValue };
      return {
        ...prevValues,
        [currentStep]: updatedValues,
      };
    });

    setIsSubmitEnabled(formValues);
  };

  const handleSubmit = () => {
    setSubmittedSteps((prev) => ({
      ...prev,
      [currentStep]: true,
    }));
    setIsSubmitEnabled(false);
    console.log("Form values:", formValues);
  };

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
  const orderedSteps = process.meta.flowData.nodes.map((node) => {
    console.log(node);
    const step = steps.find((s) => s.id === node.id);
    return {
      ...node,
      title: node ? node.data.stageName : "Unknown Title",
      meta_fields: node.data.fields || [],
    };
  });

  const options = orderedSteps.map((step) => ({
    label: step.title,
    value: step.step_id,
  }));

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
                        <Panel key={`${orderedSteps[currentStep].step_id}-${currentStep}`}>
                            <PanelHeader>
                                <h3>{`${orderedSteps[currentStep].title}`}</h3>
                                <span className="badge default ms-auto">Setor: Recepção</span>
                            </PanelHeader>
                            <PanelBody>
                                <PanelRow>
                                    <form className="centered" action="">
                                        <ul className="meta-fields-list">
                                            {Array.isArray(orderedSteps[currentStep].meta_fields) ? orderedSteps[currentStep].meta_fields.map((field, idx) => (
                                                <li key={`${orderedSteps[currentStep].step_id}-meta-${idx}`} className="meta-field-item">
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
                                        <div className="action-bar">
                                            <Button
                                                variant="primary"
                                                onClick={handleSubmit}
                                                disabled={!isSubmitEnabled || submittedSteps[currentStep]}
                                            >Submit
                                            </Button>
                                        </div>
                                    </form>
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
