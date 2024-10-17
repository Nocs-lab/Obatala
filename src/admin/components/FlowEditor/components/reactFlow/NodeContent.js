import React, { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import DragAndDropList from "../dragables/DragAndDropList";
import NodeHandle from "./NodeHandle";
import { NodeToolbar } from "@xyflow/react";
import { TextControl } from "@wordpress/components";
import { useFlowContext } from "../../context/FlowContext";
import { set } from "date-fns";
const nodeStyle = {
  border: "1px solid #ddd",
  backgroundColor: "white",
  borderRadius: "4px",
  position: "relative",
  fontSize: "10px",
  minWidth: "100px",
};

const FIELD_OPTIONS = [
  { id: "text", label: "Texto" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Telefone" },
  { id: "address", label: "Endereço" },
  { id: "number", label: "Número" },
  { id: "datepicker", label: "Date Picker" },
  { id: "upload", label: "Upload de Arquivo" },
  { id: "select", label: "Select (Múltiplas Opções)" },
  { id: "radio", label: "Radio (Opções de Seleção)" },
  { id: "search", label: "Busca em Tainacan" },
];

const NodeContent = ({ id, data = {} }) => {
  const {
    fields = [],
    updateFields = () => {},
  } = data;

  const { selectedNodes } = useReactFlow();
  const [isAddingFields, setIsAddingFields] = useState(false);
  const { updateNodeName } = useFlowContext();
  const isSelected = selectedNodes?.some((node) => node.id === id);
  const [stageName, setStageName] = useState(data?.stageName || "");

  const addFieldToNode = (fieldId) => {
    const newField = {
      id: `${fieldId}-${fields.length + 1}`,
      type: fieldId,
      title: "Campo sem título",
    };
    updateFields([...fields, newField]);
    setIsAddingFields(false);
  };

  const handleStageNameChange = (e) => {
    setStageName(e);
    updateNodeName(id, e);
  };

  return (
    <div style={nodeStyle}>
      {/* Node Drag Handle */}
      <NodeHandle nodeId={id} />

      {/* Connection Handles */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Node Name */}
      <div
        style={{
          padding: "2px",
        }}
      >
        <TextControl
          value={stageName}
          onChange={handleStageNameChange}
          placeholder="Digite o nome da etapa"
          style={{
            width: "100%",
            padding: "5px",
            marginBottom: "10px",
            fontSize: "10px",
            border: "none",
            borderBottom: "1px solid #ccc",
            outline: "none",
            borderRadius: 0,
            WebkitBorderRadius: 0,
          }}
        />
      </div>

      {/* List of Fields */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#fff",
          borderRadius: "4px",
        }}
      >
        <DragAndDropList nodeId={id} fields={fields} updateFields={updateFields} />
      </div>

      {/* Toolbar with Add and Delete */}
      <NodeToolbar isVisible={isSelected} position="right">
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          {isAddingFields ? (
            <>
              <h4>Adicionar Campo</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {FIELD_OPTIONS.map((option) => (
                  <li
                    className="node-meta-list"
                    key={option.id}
                    onClick={() => addFieldToNode(option.id)}
                    style={{ padding: "5px", cursor: "pointer" }}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setIsAddingFields(false)}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#ddd",
                  color: "#333",
                  border: "none",
                  borderRadius: "4px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: "20px",
                height: "20px",
              }}
                onClick={() => setIsAddingFields(true)}
                className="btn max-btn"
              ></div>

              {/* Remover nó */}
            </>
          )}
        </div>
      </NodeToolbar>
    </div>
  );
};

export default NodeContent;
