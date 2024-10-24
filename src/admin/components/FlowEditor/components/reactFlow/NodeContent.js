import React, { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import DragAndDropList from "../dragables/DragAndDropList";
import NodeHandle from "./NodeHandle";
import { NodeToolbar } from "@xyflow/react";
import { TextControl } from "@wordpress/components";
import { useFlowContext } from "../../context/FlowContext";
import TainacanFields from "./TainacanFields";
import ObatalaFields from "./ObatalaFields";

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
];

const TAINACAN_FIELD_OPTIONS = [
  { id: "search", label: "Tainacan Search" },
  { id: "tainacan-list", label: "Tainacan Item List" },
];

const NodeContent = ({ id, data = {} }) => {
  const { fields = [], updateFields = () => {} } = data;
  const { selectedNodes } = useReactFlow();
  const [isAddingFields, setIsAddingFields] = useState(false);
  const [isAddingTainacanFields, setIsAddingTainacanFields] = useState(false);
  const { updateNodeName } = useFlowContext();
  const isSelected = selectedNodes?.some((node) => node.id === id);
  const [stageName, setStageName] = useState(data?.stageName || "");

  const solveTitle = (fieldId) => {
    if (fieldId === "search") return "Tainacan Search";
    if (fieldId === "tatainacan-list") return "Tainacan Item List";
    return false
  };
  const addFieldToNode = (fieldId) => {
    const newField = {
      id: `${fieldId}-${fields.length + 1}`,
      type: fieldId,
      title: solveTitle(fieldId) ? solveTitle(fieldId) : "Untitled Field",
    };
    updateFields([...fields, newField]);
  };

  const handleStageNameChange = (e) => {
    setStageName(e);
    updateNodeName(id, e);
  };

  return (
    <div style={nodeStyle}>
      <NodeHandle nodeId={id} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

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
        }}
      />

      <DragAndDropList nodeId={id} fields={fields} updateFields={updateFields} />

      <NodeToolbar isVisible={isSelected} position="right" style={{display: "flex", flexDirection: "column"}}>
        <TainacanFields
          isAdding={isAddingTainacanFields}
          setIsAdding={setIsAddingTainacanFields}
          addFieldToNode={addFieldToNode}
          options={TAINACAN_FIELD_OPTIONS}
        />
        <ObatalaFields
          isAdding={isAddingFields}
          setIsAdding={setIsAddingFields}
          addFieldToNode={addFieldToNode}
          options={FIELD_OPTIONS}
        />
      </NodeToolbar>
    </div>
  );
};

export default NodeContent;
