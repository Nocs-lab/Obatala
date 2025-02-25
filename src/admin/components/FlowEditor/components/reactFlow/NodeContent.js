import React, { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import DragAndDropList from "../dragables/DragAndDropList";
import NodeHandle from "./NodeHandle";
import { NodeToolbar } from "@xyflow/react";
import { Button, Icon, TextControl, ComboboxControl } from "@wordpress/components";
import { useFlowContext } from "../../context/FlowContext";
import { set } from "date-fns";
import { fetchSectors } from "../../../../api/apiRequests";
import { file, mobile, mapMarker, paragraph, plus, search, calendar, keyboard, commentContent, listView } from '@wordpress/icons';

const FIELD_OPTIONS = [
  { id: "text", label: "Texto", icon: paragraph},
  { id: "email", label: "Email", icon: commentContent},
  { id: "phone", label: "Telefone", icon: mobile },
  { id: "address", label: "Endereço", icon: mapMarker },
  { id: "number", label: "Número", icon: keyboard},
  { id: "datepicker", label: "Date Picker", icon:calendar },
  { id: "upload", label: "Upload de Arquivo", icon:file },
  { id: "select", label: "Select (Múltiplas Opções)", icon:listView },
  { id: "radio", label: "Radio (Opções de Seleção)", icon: listView },
  { id: "search", label: "Busca em Tainacan", icon: search },
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
  const {updateNodeTempSector} = useFlowContext();

  const isSelected = selectedNodes?.some((node) => node.id === id);
  const [stageName, setStageName] = useState(data?.stageName || "");
  const {nodes} = useFlowContext();
  const filteredNode = nodes.find(node => node.id === id);
  const [sector, setSector] = useState(filteredNode?.sector_obatala || '');
  
  useEffect(() => {
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
    updateNodeTempSector(id, [value]);
  };
 
  return (
    <div className="step-container">
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
        label="Group responsible"
        value={sector}
        options={sectors.map(sector => ({ 
          label: sector.name, 
          value: sector.id,
        }))}
        onChange={handleStageSectorChange}
      />

      {/* List of Fields */}
      <div className="components-base-control__field">
        <label className="components-base-control__label">Fields</label>
      </div>
      {fields.length > 0 && (
        <div className="flow-fields">
          <DragAndDropList nodeId={id} fields={fields} updateFields={updateFields} />
        </div>
      )}
      <Button variant="primary" size="small" icon={<Icon icon={plus}/>} onClick={() => setIsAddingFields(true)}>
        Add field
      </Button>

      {/* Toolbar with Add and Delete */}
      {isAddingFields && (
        <NodeToolbar isVisible={isSelected} position="right">
          <div className="node-meta-container">
            <h3 className="node-meta-title">Select a field to add:</h3>
            <ul className="node-meta-list-container">
              {FIELD_OPTIONS.map((option) => (
                <li className="node-meta-list">
                  <Icon icon={option.icon}/>
                  <span
                    key={option.id}
                    onClick={() => addFieldToNode(option.id)}
                  >
                    {option.label}
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="secondary" onClick={() => setIsAddingFields(false)}>
              Cancelar
            </Button>
          </div>
        </NodeToolbar>
      )}
    </div>
  );
};

export default NodeContent;
