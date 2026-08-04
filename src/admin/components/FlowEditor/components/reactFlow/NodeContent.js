import React, { useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import DragAndDropList from "../dragables/DragAndDropList";
import NodeHandle from "./NodeHandle";
import { NodeToolbar } from "@xyflow/react";
import { Button, Icon, TextControl, ComboboxControl } from "@wordpress/components";
import { useFlowContext } from "../../context/FlowContext";
import { fetchSectors } from "../../../../api/apiRequests";
import { close, file, mobile, mapMarker, paragraph, plus, search, calendar, keyboard, commentContent, listView } from '@wordpress/icons';

const FIELD_OPTIONS = [
    { id: "text", label: "Texto", icon: paragraph },
    { id: "email", label: "Email", icon: commentContent },
    { id: "phone", label: "Telefone", icon: mobile },
    { id: "address", label: "Endereço", icon: mapMarker },
    { id: "number", label: "Número", icon: keyboard },
    { id: "datepicker", label: "Date Picker", icon: calendar },
    { id: "upload", label: "Upload de Arquivo", icon: file },
    { id: "stage_document", label: __("Stage document", "obatala"), icon: file },
    { id: "select", label: "Select (Múltiplas Opções)", icon: listView },
    { id: "radio", label: "Radio (Opções de Seleção)", icon: listView },
    { id: "search", label: "Busca em Tainacan", icon: search },
];

const NodeContent = ({ id, data = {} }) => {
    const {
        fields = [],
        updateFields = () => { },
    } = data;

    const [sectors, setSectors] = useState([]);

    const { selectedNodes } = useReactFlow();
    const [isAddingFields, setIsAddingFields] = useState(false);
    const [newFieldToEdit, setNewFieldToEdit] = useState('');
    const { updateNodeName } = useFlowContext();
    const { updateNodeTempSector } = useFlowContext();

    const isSelected = selectedNodes?.some((node) => node.id === id);
    const [stageName, setStageName] = useState(data?.stageName || "");
    const { nodes } = useFlowContext();
    const filteredNode = nodes.find(node => node.id === id);
    const [sector, setSector] = useState(filteredNode?.sector_obatala || '');

    useEffect(() => {
        setSector(filteredNode?.tempSector || filteredNode?.sector_obatala || '');
    }, [filteredNode?.tempSector, filteredNode?.sector_obatala]);

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
        const existingIds = new Set(fields.map(field => String(field.id)));
        let uniqueSuffix;
        let newFieldId;

        do {
            uniqueSuffix = typeof globalThis.crypto?.randomUUID === "function"
                ? globalThis.crypto.randomUUID()
                : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
            newFieldId = `${id}_${fieldId}-${uniqueSuffix}`;
        } while (existingIds.has(newFieldId));

        const newField = {
            id: newFieldId,
            type: fieldId,
            title: "Campo sem título",
        };
        updateFields([...fields, newField]);
        setNewFieldToEdit(newFieldId);
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
            <NodeHandle nodeId={id} stageName={stageName} />

            {/* Connection Handles */}
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />

            {/* Node Name */}
            <TextControl
                value={stageName}
                label={__('Step name', 'obatala')}
                onChange={handleStageNameChange}
                placeholder={__('Enter the step name', 'obatala')}
            />

            <ComboboxControl
                label={__('Group responsible', 'obatala')}
                value={sector}
                options={sectors.map(sector => ({
                    label: sector.name,
                    value: sector.id,
                }))}
                onChange={handleStageSectorChange}
            />

            {/* List of Fields */}
            <div className="components-base-control__field">
                <label className="components-base-control__label">{__('Fields', 'obatala')}</label>
            </div>
            {fields.length > 0 && (
                <div className="flow-fields">
                    <DragAndDropList
                        nodeId={id}
                        fields={fields}
                        updateFields={updateFields}
                        autoEditFieldId={newFieldToEdit}
                        onAutoEditOpened={() => setNewFieldToEdit('')}
                    />
                </div>
            )}
            <Button variant="primary" size="small" icon={<Icon icon={plus} />} onClick={() => setIsAddingFields(true)}>
                {__('Add field', 'obatala')}
            </Button>

            {/* Toolbar with Add and Delete */}
            {isAddingFields && (
                <NodeToolbar isVisible={isSelected} position="right">
                    <div className="wp-drawer node-meta-container">
                        <Button className="close-button"
                            icon={<Icon icon={close} size={24} onClick={() => setIsAddingFields(false)} />}
                        ></Button>
                        <h3 className="title">{__('Select a field to add:', 'obatala')}</h3>
                        <ul className="node-meta-list-container">
                            {FIELD_OPTIONS.map((option) => (
                                <li className="node-meta-list" key={option.id}>
                                    <Icon icon={option.icon} />
                                    <span
                                        onClick={() => addFieldToNode(option.id)}
                                    >
                                        {option.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </NodeToolbar>
            )}
        </div>
    );
};

export default NodeContent;
