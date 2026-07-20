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

const TAINACAN_CONTROL_FIELDS = [
    {
        id: "obatala_ctrl_collection_selector",
        type: "radio",
        label: "Coleção de exportação",
        options: "Coleção A, Coleção B",
        helpText: "Selecione a coleção de exportação que será usada neste processo.",
    },
    {
        id: "obatala_ctrl_multi_or_single",
        type: "radio",
        label: "Trata vários itens?",
        required: true,
        options: "Sim, Não",
        helpText: "Escolha Sim para múltiplos itens ou Não para item único.",
    },
    {
        id: "obatala_ctrl_quantity",
        type: "number",
        label: "Quantidade de itens",
        required: true,
        conditional: {
            dependsOnFieldId: "obatala_ctrl_multi_or_single",
            operator: "equals",
            value: "Sim",
        },
        helpText: "Informe a quantidade de itens para exportação.",
    },
    {
        id: "obatala_ctrl_entry_mode",
        type: "radio",
        label: "Origem dos dados",
        options: "Manual, Planilha",
        conditional: {
            dependsOnFieldId: "obatala_ctrl_multi_or_single",
            operator: "equals",
            value: "Sim",
        },
        helpText: "Escolha Manual para formulário ou Planilha para upload.",
    },
    {
        id: "obatala_ctrl_spreadsheet_upload",
        type: "upload",
        label: "Upload da planilha",
        conditional: {
            dependsOnFieldId: "obatala_ctrl_multi_or_single",
            operator: "equals",
            value: "Sim",
        },
        helpText: "Faça upload da planilha quando a origem for Planilha.",
    },
    {
        id: "obatala_ctrl_same_values_mode",
        type: "radio",
        label: "Repetir dados base?",
        options: "Sim, Não",
        conditional: {
            dependsOnFieldId: "obatala_ctrl_multi_or_single",
            operator: "equals",
            value: "Sim",
        },
        helpText: "Use Sim quando vários itens compartilham os mesmos dados base.",
    },
    {
        id: "obatala_ctrl_unique_id",
        type: "text",
        label: "Identificador",
        helpText: "Informe o campo que diferencia cada item na repetição.",
    },
];

const NodeContent = ({ id, data = {} }) => {
    const {
        fields = [],
        updateFields = () => { },
    } = data;

    const [sectors, setSectors] = useState([]);

    const { selectedNodes } = useReactFlow();
    const [isAddingFields, setIsAddingFields] = useState(false);
    const [isDefaultFieldsExpanded, setIsDefaultFieldsExpanded] = useState(false);
    const [isTainacanControlsExpanded, setIsTainacanControlsExpanded] = useState(false);
    const { updateNodeName } = useFlowContext();
    const { updateNodeTempSector } = useFlowContext();
    const isTainacanMapperEnabled = data?.isTainacanMapperEnabled !== false;

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

    useEffect(() => {
        if (!isAddingFields) {
            setIsDefaultFieldsExpanded(false);
            setIsTainacanControlsExpanded(false);
        }
    }, [isAddingFields]);

    useEffect(() => {
        if (!isTainacanMapperEnabled) {
            setIsTainacanControlsExpanded(false);
        }
    }, [isTainacanMapperEnabled]);

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
        setIsAddingFields(false);
    };

    const getControlFieldLocation = (fieldId) => {
        for (const node of nodes) {
            const nodeId = String(node?.id || "");
            const nodeFields = Array.isArray(node?.data?.fields) ? node.data.fields : [];
            const exists = nodeFields.some((field) => String(field?.id || "") === String(fieldId));
            if (exists) {
                const stageName = String(node?.data?.stageName || nodeId);
                return { nodeId, stageName };
            }
        }

        return null;
    };

    const addTainacanControlFieldToNode = (field) => {
        if (!isTainacanMapperEnabled) {
            return;
        }

        const fieldId = String(field?.id || "");
        if (!fieldId) return;

        const existingLocation = getControlFieldLocation(fieldId);
        if (existingLocation) {
            return;
        }

        const newFieldConfig = {
            label: field.label,
            required: field.required === true,
            helpText: field.helpText || "",
        };

        if (field.options) {
            newFieldConfig.options = field.options;
        }

        if (field.conditional) {
            newFieldConfig.conditional = {
                dependsOnFieldId: String(field.conditional.dependsOnFieldId || ""),
                operator: String(field.conditional.operator || "equals"),
                value: String(field.conditional.value || ""),
            };
        }

        const newField = {
            id: fieldId,
            type: field.type,
            title: "Campo sem título",
            config: newFieldConfig,
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
                    <DragAndDropList nodeId={id} fields={fields} updateFields={updateFields} />
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
                            {isTainacanMapperEnabled && (
                                <li className="node-meta-list">
                                    <button
                                        type="button"
                                        onClick={() => setIsDefaultFieldsExpanded((previous) => !previous)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <strong>{__('Default fields', 'obatala')}</strong>
                                        <span>{isDefaultFieldsExpanded ? '[-]' : '[+]'}</span>
                                    </button>
                                </li>
                            )}
                            {(!isTainacanMapperEnabled || isDefaultFieldsExpanded) && FIELD_OPTIONS.map((option) => (
                                <li className="node-meta-list" key={option.id}>
                                    <Icon icon={option.icon} />
                                    <span
                                        onClick={() => addFieldToNode(option.id)}
                                    >
                                        {option.label}
                                    </span>
                                </li>
                            ))}
                            {isTainacanMapperEnabled && (
                                <li className="node-meta-list">
                                    <button
                                        type="button"
                                        onClick={() => setIsTainacanControlsExpanded((previous) => !previous)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            background: "none",
                                            border: "none",
                                            padding: 0,
                                            cursor: "pointer",
                                            textAlign: "left",
                                        }}
                                    >
                                        <strong>{__('Tainacan control fields', 'obatala')}</strong>
                                        <span>{isTainacanControlsExpanded ? '[-]' : '[+]'}</span>
                                    </button>
                                </li>
                            )}
                            {isTainacanMapperEnabled && isTainacanControlsExpanded && TAINACAN_CONTROL_FIELDS.map((option) => {
                                const existingLocation = getControlFieldLocation(option.id);
                                const isDisabled = Boolean(existingLocation);

                                return (
                                    <li className="node-meta-list" key={option.id}>
                                        <Icon icon={option.type === "upload" ? file : (option.type === "number" ? keyboard : listView)} />
                                        <span
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    addTainacanControlFieldToNode(option);
                                                }
                                            }}
                                            style={isDisabled ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                                        >
                                            {option.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </NodeToolbar>
            )}
        </div>
    );
};

export default NodeContent;
