import React, { useState, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import DragAndDropList from "../dragables/DragAndDropList";
import NodeHandle from "./NodeHandle";
import { NodeToolbar } from "@xyflow/react";
import { Button, Icon, TextControl, ComboboxControl } from "@wordpress/components";
import { useFlowContext } from "../../context/FlowContext";
import { fetchSectors } from "../../../../api/apiRequests";
import { close, file, mobile, mapMarker, paragraph, plus, search, calendar, keyboard, listView, envelope } from '@wordpress/icons';

const FIELD_OPTIONS = [
    { id: "text", label: __("Text", "obatala"), icon: paragraph },
    { id: "email", label: __("Email", "obatala"), icon: envelope },
    { id: "phone", label: __("Phone", "obatala"), icon: mobile },
    { id: "address", label: __("Address", "obatala"), icon: mapMarker },
    { id: "number", label: __("Number", "obatala"), icon: keyboard },
    { id: "datepicker", label: __("Date Picker", "obatala"), icon: calendar },
    { id: "upload", label: __("File upload", "obatala"), icon: file },
    { id: "stage_document", label: __("Stage document", "obatala"), icon: file },
    { id: "select", label: __("Select (Multiple Options)", "obatala"), icon: listView },
    { id: "radio", label: __("Radio (Selection Options)", "obatala"), icon: listView },
    { id: "search", label: __("Busca no Tainacan", "obatala"), icon: search },
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
            title: "",
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
                required
            />

            <ComboboxControl
                label={__('Group responsible', 'obatala')}
                value={sector}
                options={sectors.map(sector => ({
                    label: sector.name,
                    value: sector.id,
                }))}
                placeholder={__('Select a group responsible', 'obatala')}
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
                                <Button variant="primary" size="small" icon={<Icon icon={option.icon} />} onClick={() => addFieldToNode(option.id)}>
                                    {option.label}
                                </Button>
                            ))}
                        </ul>
                    </div>
                </NodeToolbar>
            )}
        </div>
    );
};

export default NodeContent;
