import React, { useState, useEffect, useRef } from "react";
import NodeHandle from "./NodeHandle";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useFlowContext } from "../../context/FlowContext";
import { Tooltip } from "@wordpress/components";


const NodeConditional = (node) => {
  const { edges } = useFlowContext();
  const { nodes } = useFlowContext();

  const matchedEdgeInput = edges.find(edge => edge?.target === node.id);
  const matchedEdgeOutput = edges.filter(edge => edge?.source === node.id);
  const nodeInput = nodes.find(node => node.id === matchedEdgeInput?.source);

  let radioFields = [];
  if (nodeInput?.data?.fields && Array.isArray(nodeInput.data.fields)) {
    radioFields = nodeInput.data.fields.filter(field => field.type === "radio");
  }

  const [isVisibleToolbar, setIsVisibleToolbar] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [selectedFields, setSelectedFields] = useState([]);
  const modalRef = useRef(null);
  const containerRef = useRef(null);

  // Função para alternar a visibilidade da barra de ferramentas
  const handleClick = (event) => {
    if (containerRef.current && containerRef.current.contains(event.target)) {
      setIsVisibleToolbar(true);
    }
  };

  // Fechar o modal quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsVisibleToolbar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Função para fechar a toolbar
  const handleCancel = () => {
    setIsVisibleToolbar(false);
  };

  // Função para verificar se o valor já foi selecionado
  const isValueSelected = (value) => {
    return selectedFields.some((field) => field.value === value);
  };

  // Função para lidar com a seleção de valores
  const handleValueChange = (fieldIndex, value) => {
    // Verifica se o valor já foi selecionado
    if (isValueSelected(value)) {
      alert("This value has already been selected for another field.");
      return; // Não permite selecionar o valor
    }

    // Atualiza o campo com o novo valor
    setSelectedFields((prev) => {
      const updatedFields = [...prev];
      updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], value };
      return updatedFields;
    });
  };

  return (

    <div 
      ref={containerRef} 
      className="bpmn-conditional-operator custom-drag-handle" 
      onClick={handleClick} 
    >
      <Handle type="target" position={Position.Left} style={{ top: "100%", right: "-8px" }} />
      <Handle type="source" position={Position.Right} style={{ top: "0", right: "0px" }} />
      <Tooltip text="Remove step">
        <div className="btn close-btn" onClick={() => removeNode(node.id)}></div>
      </Tooltip>

      {isVisibleToolbar && (
        <div 
          ref={modalRef}
          className="node-toolbar"
          style={{
            position: "absolute",
            top: "50px",
            right: "10px",
            width: "600px",
            backgroundColor: "#fff",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 10,
            borderRadius: "8px",
            maxHeight: "500px",
            overflowY: "auto",
            transform: "rotate(-45deg)",
            transition: "transform 0.3s ease"
          }}
        >
          <h2>Condition Settings</h2>
          <hr />
          <h1>Input Stage: {matchedEdgeInput.source}</h1>
          <h1>Output Stages:</h1>
          {matchedEdgeOutput.map((edge, index) => (
            <h1 key={index}>
              If
              <select
                value={selectedField}
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  // Atualiza todos os campos com o novo selectedField
                  setSelectedFields((prev) => prev.map((field) => ({ ...field, field: e.target.value })));
                }}
                style={{ margin: "0 10px" }}
              >
                <option value="" disabled>Select a field</option>
                {radioFields.map((field, fieldIndex) => (
                  <option key={fieldIndex} value={field.config?.label || field.title || field.id}>
                    {field.config?.label || field.title || field.id}
                  </option>
                ))}
              </select>
              receives
              <select
                value={selectedFields[index]?.value || ""}
                onChange={(e) => handleValueChange(index, e.target.value)}
                style={{ margin: "0 10px" }}
                disabled={!selectedField}
              >
                <option value="" disabled>Select a value</option>
                {selectedField &&
                  radioFields
                    .find((field) => field.config?.label === selectedField)
                    ?.config?.options
                    ?.split(",")
                    .map((option, optionIndex) => (
                      <option key={optionIndex} value={option.trim()}>
                        {option.trim()}
                      </option>
                    ))}
              </select>
              , go to {edge.target}
            </h1>
          ))}
          <hr />
        </div>
      )}
    </div>
  );
};

export default NodeConditional;
