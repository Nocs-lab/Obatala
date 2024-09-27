import React, { useState, useEffect, useRef } from "react";
import {
  Panel,
  PanelHeader,
  PanelRow,
  Spinner,
  Notice,
  TextControl,
  Button,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import ProcessFlow from "./FlowEditor/ProcessFlow";
import { FlowProvider } from "./FlowEditor/context/FlowContext";

const processDataEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("process_type_id");
  const [processData, setProcessData] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const flowRef = useRef(null); // Referência para acessar os dados do fluxo
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] }); // Novo estado para o flowData
  const [title, setTitle] = useState("");

  useEffect(() => {
    setIsLoading(true);

    apiFetch({ path: `/obatala/v1/process_type/${id}` })
      .then((typeData) => {
        console.log("Process model data:", typeData);
        setProcessData(typeData);
        setTitle(typeData.title.rendered);
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

  const handleSave = async () => {
    try {
      const flowData = flowRef.current.getFlowData(); // Obtém os dados do flow

      const updatedData = {
        ...processData,
        title: title,
        meta: {
          flowData, // Armazena os dados de fluxo como meta
        },
      };

      console.log("Updated data:", updatedData);

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

      setProcessData({
        ...processData,
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

  if (isLoading) {
    return <Spinner />;
  }

  if (!processData) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <span className="brand">
        <strong>Obatala</strong> Curatorial Process Management
      </span>
      <h2>Edit Process Model: {title}</h2>

      <div className="panel-container">
        <main>
          <Panel>
            <PanelHeader>
              <TextControl
                value={title}
                placeholder="Digite o placeholder"
                onChange={(value) => setTitle(value)}
              />
              <Button isPrimary type="submit" style={{
                margin: 0
              }}
              onClick={handleSave}
              >
                Save
              </Button>
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
              {/* Passa o flowData carregado como initialData para o ProcessFlow */}
              <FlowProvider>
                <ProcessFlow ref={flowRef} initialData={flowData} />
              </FlowProvider>
            </PanelRow>
          </Panel>
        </main>
      </div>
    </div>
  );
};

export default processDataEditor;
