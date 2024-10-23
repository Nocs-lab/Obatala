import React, { useState, useEffect, useRef } from "react";
import {
  Panel,
  Icon,
  PanelRow,
  Spinner,
  Notice,
  TextControl,
  Tooltip,
  ButtonGroup,
  Button,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import ProcessFlow from "./FlowEditor/ProcessFlow";
import { FlowProvider } from "./FlowEditor/context/FlowContext";
import { closeSmall, edit, check } from "@wordpress/icons";

const processDataEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("process_type_id");
  const [processData, setProcessData] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const flowRef = useRef(null); // Referência para acessar os dados do fluxo
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] }); // Novo estado para o flowData
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isEditing, setIsEditing] = useState(null);

  useEffect(() => {
    setIsLoading(true);

    apiFetch({ path: `/obatala/v1/process_type/${id}` })
        .then((typeData) => {
            console.log("Process model data:", typeData);
            setProcessData(typeData);
            setTitle(typeData.title.rendered);
            setDescription(
                Array.isArray(typeData.meta.description)
                  ? typeData.meta.description[0]
                  : typeData.meta.description || ""
            );
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
              description: description,
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
        setIsEditing(null);
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

  const handleEdit = (field) => {
      console.log(isEditing);
      setIsEditing(field);
  };

  const handleCancel = () => {
      setIsEditing(null);
  };
  
  const handleCancelEditProcessType = () => {
      window.location.href = '?page=process-type-manager';
  };

  if (isLoading) {
      return <Spinner />;
  }

  if (!processData) {
      return <div>Loading...</div>;
  }
  return (
    <main>
      <span className="brand">
          <strong>Obatala</strong> Curatorial Process Management
      </span>

      {isEditing === "title" ? (
        <div className="inline-edition mt-2 mb-1">
            <TextControl
                value={title}
                onChange={(value) => setTitle(value)}
                autoFocus
            />
            <ButtonGroup>
                <Tooltip text="Save">
                    <Button icon={<Icon icon={check} />} onClick={handleSave} />
                </Tooltip>
                <Tooltip text="Cancel">
                    <Button
                        onClick={handleCancel}
                        icon={<Icon icon={closeSmall} />}
                  />
                </Tooltip>
            </ButtonGroup>
        </div>
      ) : (
        <div className="title-container">
            <h2 onClick={() => handleEdit("title")}>
                Edit Process Model: <strong>{title}</strong>
            </h2>
            <Tooltip text="Edit">
                <Button
                    onClick={() => handleEdit("title")}
                    icon={<Icon icon={edit} />}
                    className="me-auto"
                />
            </Tooltip>
        </div>
      )}

      {isEditing === "description" ? (
        <div className="inline-edition mb-2">
            <TextControl
                value={description}
                onChange={(value) => setDescription(value)}
                autoFocus
            />
            <ButtonGroup>
                <Button icon={<Icon icon={check} />} onClick={handleSave} />
                <Button onClick={handleCancel} icon={<Icon icon={closeSmall} />} />
            </ButtonGroup>
        </div>
      ) : (
        <div className="title-container mb-2">
            <p onClick={() => handleEdit("description")}>{description}</p>
            <Tooltip text="Edit">
                <Button
                  onClick={() => handleEdit("description")}
                  icon={<Icon icon={edit} />}
                  className="me-auto"
                />
            </Tooltip>
        </div>
      )}

      {notice && (
          <div className="notice-container">
              <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                  {notice.message}
              </Notice>
          </div>
      )}

      <Panel>
          <PanelRow>
              {/* Passa o flowData carregado como initialData para o ProcessFlow */}
              <FlowProvider>
                  <ProcessFlow ref={flowRef} initialData={flowData} />
              </FlowProvider>
          </PanelRow>
      </Panel>
      <ButtonGroup>
          <Button variant="primary" type="submit" onClick={handleSave}>
                Save
          </Button>
          <Button variant="link" onClick={handleCancelEditProcessType}>
                Cancel
           </Button>
      </ButtonGroup>
    </main>
  );
};

export default processDataEditor;
