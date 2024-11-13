import React, { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import DragAndDropList from "../dragables/DragAndDropList";
import NodeHandle from "./NodeHandle";
import { NodeToolbar } from "@xyflow/react";
import { TextControl, ComboboxControl } from "@wordpress/components";
import { useFlowContext } from "../../context/FlowContext";
import { set } from "date-fns";
import { fetchSectors } from "../../../../api/apiRequests";

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

const NodeContent = ({ id, data  = {} }) => {
  const {
    fields = [],
    updateFields = () => {},
  } = data;

  const [sectors, setSectors] = useState([]);

  const { selectedNodes } = useReactFlow();
  const [isAddingFields, setIsAddingFields] = useState(false);
  const { updateNodeName } = useFlowContext();
  const {updateNodeSector} = useFlowContext();

  const isSelected = selectedNodes?.some((node) => node.id === id);
  const [stageName, setStageName] = useState(data?.stageName || "");
  const {nodes} = useFlowContext();
  const filteredNode = nodes.find(node => node.id === id);
  const [sector, setSector] = useState(filteredNode?.sector_obatala || '');
  
  useEffect(() => {
    console.log(filteredNode)
    loadSectors();
  }, []);

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
        });
  };
  
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

  const handleStageSectorChange = (value) => {
    setSector(value);
    updateNodeSector(id, [value]);
  };

 return (
        <>
            {/* Node Drag Handle */}
            <NodeHandle nodeId={id} />

            {/* Connection Handles */}
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />

            {/* Node Name */}
            <TextControl
                value={stageName}
                label="Step name"
                onChange={handleStageNameChange}
                placeholder="Digite o nome da etapa"
            />

            <ComboboxControl
                label="Select a Sector"
                value={sector}
                options={sectors.map(sector => ({ 
                    label: sector.name, 
                    value: sector.id,
                }))}
                onChange={handleStageSectorChange}
            />

            {/* List of Fields */}
            {fields.length > 0 && (
                <div className="flow-fields">
                    <DragAndDropList nodeId={id} fields={fields} updateFields={updateFields} />
                </div>
            )}

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
        </>
    );
};

export default NodeContent;
