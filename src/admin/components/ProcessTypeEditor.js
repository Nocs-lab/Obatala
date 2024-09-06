import React, { useState, useEffect, useRef } from "react";
import {
  Panel,
  PanelHeader,
  PanelRow,
  Spinner,
  Notice,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import ProcessTypeForm from "./ProcessTypeManager/ProcessTypeForm";
import ProcessStepForm from "./ProcessTypeManager/ProcessStepForm";
import ProcessFlow from "./FlowEditor/ProcessFlow";
import StepList from "./ProcessTypeManager/StepList";

const ProcessTypeEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("process_type_id");
  const [processType, setProcessType] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stepOrder, setStepOrder] = useState([]);
  const flowRef = useRef(null); // Referência para acessar os dados do fluxo
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] }); // Novo estado para o flowData

  useEffect(() => {
    setIsLoading(true);

    apiFetch({ path: `/obatala/v1/process_type/${id}` })
      .then((typeData) => {
        console.log("Process type data:", typeData);
        setProcessType(typeData);
        const order = typeData.meta.step_order || [];
        setStepOrder(order);

        // Extraindo flowData do processo carregado
        const flowData = typeData.meta.flowData || { nodes: [], edges: [] };
        setFlowData(flowData);

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setNotice({ status: "error", message: "Error fetching process type." });
        setIsLoading(false);
      });
  }, [id]);

  const handleSave = async (updatedProcessType) => {
    try {
      const flowData = flowRef.current.getFlowData(); // Obtém os dados do flow
  
      const updatedData = {
        ...updatedProcessType,
        meta: {
          ...updatedProcessType.meta,
          flowData, // Armazena os dados de fluxo como meta
          step_order: stepOrder,
        },
      };
  
      // Evita recarregar a página
      await apiFetch({
        path: `/obatala/v1/process_type/${id}`,
        method: "PUT",
        data: updatedData,
      });
  
      await apiFetch({
        path: `/obatala/v1/process_type/${id}/meta`,
        method: "PUT",
        data: updatedData.meta,
      });
  
      setProcessType({
        ...updatedProcessType,
        meta: updatedData.meta,
      });
  
      setNotice({
        status: "success",
        message: "Process type and meta updated successfully.",
      });
    } catch (error) {
      console.error(error);
      setNotice({
        status: "error",
        message: `Error updating process type and meta: ${error}`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleAddProcessStep = (stepIds) => {
    const newStepOrder = Array.isArray(stepOrder) ? stepOrder : [];

    const stepsToAdd = stepIds.filter(
      (stepId) => !newStepOrder.includes(stepId)
    );

    if (stepsToAdd.length === 0) {
      setNotice({
        status: "warning",
        message: "All selected steps are already in the process type.",
      });
      return;
    }

    const updatedStepOrder = [...newStepOrder, ...stepsToAdd];

    apiFetch({
      path: `/obatala/v1/process_type/${id}/meta`,
      method: "PUT",
      data: { step_order: updatedStepOrder },
    })
      .then(() => {
        setStepOrder(updatedStepOrder);
        setNotice({ status: "success", message: "Steps added successfully." });
      })
      .catch((error) => {
        console.error("Error updating step order:", error);
        setNotice({ status: "error", message: "Error updating step order." });
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
      <span className="brand">
        <strong>Obatala</strong> Curatorial Process Management
      </span>
      <h2>Edit Process Type</h2>
      <div className="panel-container">
        <main>
          <Panel>
            <PanelHeader>
              <h3>Steps</h3>
            </PanelHeader>
            <PanelRow>
              {notice && (
                <Notice
                  status={notice.status}
                  isDismissible
                  onRemove={() => setNotice(null)}
                >
                  {notice.message}
                </Notice>
              )}
              <StepList
                processTypeId={processType.id}
                stepOrder={stepOrder}
                onNotice={setNotice}
              />
              {/* Passa o flowData carregado como initialData para o ProcessFlow */}
              <ProcessFlow ref={flowRef} initialData={flowData} />
            </PanelRow>
          </Panel>
        </main>
        <aside>
          <Panel>
            <PanelHeader>
              <h3>Edit Process Type data</h3>
            </PanelHeader>
            {notice && (
              <PanelRow>
                <Notice
                  status={notice.status}
                  isDismissible
                  onRemove={() => setNotice(null)}
                >
                  {notice.message}
                </Notice>
              </PanelRow>
            )}
            <ProcessTypeForm
              editingProcessType={processType}
              onSave={handleSave}
            />
          </Panel>
          <Panel>
            <PanelHeader>
              <h3>Adding steps</h3>
            </PanelHeader>
            <ProcessStepForm onAddStep={handleAddProcessStep} />
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default ProcessTypeEditor;
