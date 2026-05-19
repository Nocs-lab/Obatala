import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { useFlowContext } from "../../context/FlowContext";
import { Button, Tooltip } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { close } from "@wordpress/icons";

const NodeConditional = ({ id, data }) => {
    const { edges, nodes, removeNode, setNodes, updateNodeCondition } = useFlowContext();

    const matchedEdgeInput = edges.find(edge => edge?.target === id);
    const matchedEdgeOutput = edges.filter(edge => edge?.source === id);
    const nodeInput = nodes.find(node => node.id === matchedEdgeInput?.source);
    const getNodeLabel = (nodeId) => {
        const node = nodes.find((n) => n.id === nodeId);
        return node?.data?.stageName || nodeId;
    };

    let radioFields = [];
    if (nodeInput?.data?.fields && Array.isArray(nodeInput.data.fields)) {
        radioFields = nodeInput.data.fields.filter(field => field.type === "radio");
    }

    const [selectedField, setSelectedField] = useState("");
    const [selectedFields, setSelectedFields] = useState([]);
    const modalRef = useRef(null);
    const containerRef = useRef(null);
    const [hasError, setHasError] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const isConnectedInput = edges.some(edge => edge.target === id);
        const isConnectedOutput = edges.some(edge => edge.source === id);
        const isValidSelection = selectedField && selectedFields.every(f => f.value);

        const isValid = isValidSelection && isConnectedInput && isConnectedOutput;
        setHasError(!isValid);
    }, [selectedField, selectedFields, edges, id]);

    useEffect(() => {

        if (!isInitialized && matchedEdgeOutput.length > 0) {

            if (data.condition) {
                setSelectedField(data.condition.condition || "");
                setSelectedFields(
                    matchedEdgeOutput.map(edge => ({
                        id: edge.target,
                        value: data.condition.outputNodes?.find(o => o.nodeId === edge.target)?.conditionValue || ""
                    }))
                );
            } else {
                setSelectedField("");
                setSelectedFields(
                    matchedEdgeOutput.map(edge => ({
                        id: edge.target,
                        value: ""
                    }))
                );
            }

            setIsInitialized(true);
        }
    }, [data.condition, matchedEdgeOutput, isInitialized]);

    // Resetar a flag de inicialização quando as conexões mudarem completamente
    const prevEdgesRef = useRef();
    useEffect(() => {
        const currentEdgeIds = edges.map(e => e.id).join(',');
        const prevEdgeIds = prevEdgesRef.current?.join(',');

        if (currentEdgeIds !== prevEdgeIds) {
            setIsInitialized(false);
        }

        prevEdgesRef.current = edges.map(e => e.id);
    }, [edges]);
    
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

            // Atualiza a configuração do campo no node específico
            updateFieldConfig(id, updatedFields[fieldIndex].id, { value });

            return updatedFields;
        });
    };

    // Função para atualizar a configuração do campo no node específico
    const updateFieldConfig = (nodeId, fieldId, newConfig) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            fields: node.data.fields.map((field) =>
                                field.id === fieldId ? { ...field, config: newConfig } : field
                            ),
                        },
                    }
                    : node
            )
        );
    };

    // Função para verificar os campos antes de salvar
    const handleSave = () => {
        // Verifica se todos os selects estão preenchidos
        const areAllFieldsFilled = matchedEdgeOutput.every(
            (edge, index) => selectedFields[index]?.value
        );

        if (!selectedField) {
            alert("Please select a field for the first line.");
            return;
        }

        if (!areAllFieldsFilled) {
            alert("Please fill out all select fields before saving.");
            return;
        }

        const updatedCondition = {
            inputNode: data.condition?.inputNode || matchedEdgeInput?.source,
            condition: selectedField,
            outputNodes: selectedFields.map((field) => ({
                conditionValue: field.value,
                nodeId: field.id,
            })),
        };

        // Atualiza o estado do nó localmente
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === id && JSON.stringify(n.data.condition) !== JSON.stringify(updatedCondition)
                    ? { ...n, data: { ...n.data, condition: updatedCondition } }
                    : n
            )
        );

        updateNodeCondition(id, updatedCondition);

        alert("Changes applied successfully.");
    };

    return (
        <div
            ref={containerRef}
            className={`step-container custom-drag-handle ${hasError ? 'error' : ''}`}
        >
            <div className="step-header">
                <Tooltip text={__('Move step', 'obatala')}>
                    <div className="custom-drag-handle">
                        <span role="img" aria-label="drag">⠿</span>
                    </div>
                </Tooltip>
                <h3 className="title my-0">Conditional</h3>
                <Tooltip text={__('Remove step', 'obatala')}>
                    <Button variant="link" icon={close} onClick={() => removeNode(id)} />
                </Tooltip>
            </div>
            
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
            <dl>
                <dt>{__('Input stage:', 'obatala')}</dt>
                <dd>{matchedEdgeInput?.source ? getNodeLabel(matchedEdgeInput.source) : <span className="false">{__('No input stage', 'obatala')}</span>}</dd>
                <dt>{__('Output stages:', 'obatala')}</dt>
                {matchedEdgeOutput?.length > 0 ? (
                    <>
                        <dd>
                            <select
                                value={selectedField}
                                onChange={(e) => {
                                    setSelectedField(e.target.value);
                                    setSelectedFields((prev) =>
                                        prev.map((field) => ({ ...field, field: e.target.value }))
                                    );
                                }}
                            >
                                <option value="" disabled>{__('Select a field', 'obatala')}</option>
                                {radioFields.map((field, fieldIndex) => (
                                    <option
                                        key={fieldIndex}
                                        value={field.config?.label || field.title || field.id}
                                    >
                                        {field.config?.label || field.title || field.id}
                                    </option>
                                ))}
                            </select>
                        </dd>
                        {matchedEdgeOutput.map((edge, index) => (
                            <dd className="mt-1" key={index}>
                                {__('If receives', 'obatala')}
                                <select
                                    value={selectedFields[index]?.value || ""}
                                    onChange={(e) => handleValueChange(index, e.target.value)}
                                    disabled={!selectedField}
                                >
                                    <option value="" disabled>{__('Select a value', 'obatala')}</option>
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
                                </select> {__('then go to', 'obatala')} <strong>{getNodeLabel(edge.target)}</strong>.
                            </dd>
                        ))}
                    </>
                ) : (
                    <dd className="false">{__('No output stages', 'obatala')}</dd>
                )}
            </dl>

            <hr />
            <div className="components-button-container">
                <Button variant="primary"
                    onClick={handleSave}
                >
                    {__('Apply', 'obatala')}
                </Button>
            </div>
        </div>
    );
};

export default NodeConditional;
