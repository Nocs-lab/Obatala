import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { addEdge, useNodesState, useEdgesState } from "@xyflow/react";
import validateInitialData from "../helpers/dataValidator";

// Cria o contexto para o fluxo
const FlowContext = createContext();

export const useFlowContext = () => {
    return useContext(FlowContext);
};

export const FlowProvider = ({ children }) => {
    const [errors, setErrors] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const exportFlowImageRef = useRef(null);

    const registerExportFlowImage = useCallback((fn) => {
        exportFlowImageRef.current = fn;
    }, []);

    const exportFlowImage = useCallback(async () => {
        if (typeof exportFlowImageRef.current === 'function') {
            await exportFlowImageRef.current();
        }
    }, []);

    // Utilizando estados diretamente para nodes e edges
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    //Função para adicionar um nó inicial
    const addStartNode = () => {
        const startNode = nodes[nodes.length - 1];
        const newNodePosition = startNode
            ? { x: startNode.position.x - 50, y: startNode.position.y + 50 }
            : { x: -200, y: 130 };
        const Start = {
            id: "Start",
            type: "startNode",
            dragHandle: ".custom-drag-handle",
            position: newNodePosition,
            data: {
                fields: [],
                stageName: "Start",
                updateFields: (newFields) => updateFieldsForNode("Start", newFields),
                updateNodeName: (newName) => updateNodeName("Start", newName),
                updatePosition: (newPosition) =>
                    updateNodePosition("Start", newPosition),
            },
        };
        setNodes((prevNodes) => [...prevNodes, Start]);
    };

    const addEndNode = () => {
        const endNode = nodes[nodes.length - 1];
        const newNodePosition = endNode
            ? { x: endNode.position.x + 50, y: endNode.position.y + 50 }
            : { x: 460, y: 130 };
        const End = {
            id: "End",
            type: "endNode",
            dragHandle: ".custom-drag-handle",
            position: newNodePosition,
            data: {
                fields: [],
                stageName: "End",
                updateFields: (newFields) => updateFieldsForNode("End", newFields),
                updateNodeName: (newName) => updateNodeName("End", newName),
                updatePosition: (newPosition) =>
                    updateNodePosition("End", newPosition),
            },
        };
        setNodes((prevNodes) => [...prevNodes, End]);
    };

    // Verifica se é necessário adicionar o nó inicial
    useEffect(() => {
        if (!isLoaded) {
            setIsLoaded(true);
        } else if (nodes.length === 0) {
            addStartNode();
            addEndNode();
            addNewNode();
        }
    }, [isLoaded, nodes]);

    // Função para atualizar os campos de cada nó
    const updateFieldsForNode = (nodeId, newFields) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, fields: newFields } }
                    : node
            )
        );
    };

    // Função para remover um campo específico de um nó
    const removeFieldFromNode = (nodeId, fieldId) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            fields: node.data.fields.filter((field) => field.id !== fieldId),
                        },
                    }
                    : node
            )
        );

    };

    // Função para gravar as configurações de um campo específico
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

    // Função para atualizar o nome (stageName) de cada nó
    const updateNodeName = (nodeId, newName) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId
                    ? { ...node, data: { ...node.data, stageName: newName } }
                    : node
            )
        );
    };

    const updateNodeCondition = (nodeId, conditionData) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            condition: conditionData
                        }
                    }
                    : node
            )
        );
    };

    const updateNodeTempSector = (nodeId, newValue) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId
                    ? { ...node, tempSector: newValue[0] }
                    : node
            )
        );
    }

    // Função para atualizar a posição de um nó
    const updateNodePosition = (nodeId, newPosition) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, position: newPosition } : node
            )
        );
    };

    // Função para capturar mudanças de posição dos nós
    const onNodesChangeHandler = (changes) => {
        changes.forEach((change) => {
            if (change.type === "position") {
                updateNodePosition(change.id, change.position);
            }
        });
        onNodesChange(changes);
    };

    // Função para conectar nós
    const onConnect = useCallback(
        (params) =>
            setEdges((eds) => addEdge({ ...params, type: "buttonedge" }, eds)),
        [setEdges]
    );

    // Função para capturar mudanças nos edges
    const onEdgesChangeHandler = (changes) => {
        onEdgesChange(changes);
    };


    // Função para adicionar novos nós
    const addNewNode = () => {
        const count = nodes.filter((node) => node.id.startsWith("Etapa")).length;

        const newNodeId = `Etapa ${count + 1}`;
        const lastNode = nodes[nodes.length - 1];
        const newNodePosition = lastNode
            ? { x: lastNode.position.x + 50, y: lastNode.position.y + 50 }
            : { x: 50, y: 50 };

        const newNode = {
            id: newNodeId,
            node_status: "Stopped",
            type: "customNode",
            dragHandle: ".custom-drag-handle",
            position: newNodePosition,
            data: {
                fields: [],
                stageName: `${newNodeId}`,
                updateFields: (newFields) => updateFieldsForNode(newNodeId, newFields),
                updateNodeName: (newName) => updateNodeName(newNodeId, newName),
                updatePosition: (newPosition) =>
                    updateNodePosition(newNodeId, newPosition),
            },
        };

        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    // Função para adicionar novos nós
    const addNewNodeConditional = () => {
        const count = nodes.filter((node) => node.id.startsWith("Condicional")).length;

        const newNodeId = `Condicional ${count + 1}`;
        const lastNode = nodes[nodes.length - 1];
        const newNodePosition = lastNode
            ? { x: lastNode.position.x + 350, y: lastNode.position.y + 50 }
            : { x: 50, y: 50 };

        const newNode = {
            id: newNodeId,
            type: "customNodeConditional",
            dragHandle: ".custom-drag-handle",
            position: newNodePosition,
            data: {
                fields: [],
                stageName: `${newNodeId}`,
                updateFields: (newFields) => updateFieldsForNode(newNodeId, newFields),
                updateNodeName: (newName) => updateNodeName(newNodeId, newName),
                updatePosition: (newPosition) =>
                    updateNodePosition(newNodeId, newPosition),
            },
        };

        setNodes((prevNodes) => [...prevNodes, newNode]);
    };

    // Função para remover um nó e suas arestas associadas
    const removeNode = (nodeId) => {
        setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
        setEdges((prevEdges) =>
            prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
        );
    };

    // Função para validar e inicializar dados
    const initializeData = useCallback((data) => {
        const validationResult = validateInitialData(data);

        if (validationResult.isValid || 1 === 1) {
            if (!data || !data.nodes) {
                addStartNode();
                addEndNode();
                addNewNode();
                return;
            }

            setNodes(
                data.nodes.map(
                    ({
                        id,
                        node_status,
                        position,
                        type,
                        data: nodeData,
                        measured,
                        selected,
                        sector_obatala,
                        sector_history,
                        tempSector,
                    }) => ({
                        id,
                        node_status: node_status || "Stopped",
                        type: type,
                        dragHandle: ".custom-drag-handle",
                        position: position || { x: 0, y: 0 },
                        data: {
                            fields: Array.isArray(nodeData?.fields) ? nodeData.fields : [],
                            stageName: nodeData?.stageName || id,
                            condition: nodeData?.condition || {},
                            updateFields: (newFields) => updateFieldsForNode(id, newFields),
                            updateNodeName: (newName) => updateNodeName(id, newName),
                            updatePosition: (newPosition) => updateNodePosition(id, newPosition),
                        },
                        sector_obatala: sector_obatala || null,
                        sector_history: sector_history || [],
                        tempSector: sector_obatala ? sector_obatala : tempSector || null,
                        measured: measured || { width: 244, height: 320 },
                        selected: selected || false,
                    })
                )
            );
            setEdges(data.edges || []);

            // Carrega o grupo selecionado se existir nos metadados
            if (data.metadata?.selectedGroup) {
                setSelectedGroup(data.metadata.selectedGroup);
            }
        } else {
            setErrors(validationResult.errors);
        }
    }, [addStartNode, addEndNode, addNewNode, updateFieldsForNode, updateNodeName, updateNodePosition]);

    // Função para exportar os dados do fluxo
    const onExport = useCallback(() => {
        try {
            const exportData = {
                nodes: nodes.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        // Remove funções que não podem ser serializadas
                        updateFields: undefined,
                        updateNodeName: undefined,
                        updatePosition: undefined
                    }
                })),
                edges: edges.map(edge => ({ ...edge })),
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            // Cria um link temporário para download
            const a = document.createElement('a');
            a.href = url;
            a.download = `process-flow-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();

            // Limpeza
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            setErrors([{ message: 'Erro ao exportar dados do fluxo' }]);
        }
    }, [nodes, edges]);

    // Função para importar dados e sobrescrever o estado
    const onImport = useCallback((importedData) => {

        try {
            const flowData = importedData.meta?.flowData || importedData;

            const validationErrors = [];

            if (!flowData.nodes || !Array.isArray(flowData.nodes)) {
                validationErrors.push("Estrutura inválida: nodes deve existir e ser um array");
            } else {
                flowData.nodes.forEach((node, index) => {
                    if (!Array.isArray(node.data?.fields)) {
                        validationErrors.push(`Node ${node.id} tem fields inválido (deveria ser array)`);
                    }
                });
            }

            if (validationErrors.length > 0) {
                console.error('Erros de validação:', validationErrors);
                setErrors(validationErrors);
                return false;
            }

            const processedNodes = flowData.nodes.map(node => ({
                ...node,
                type: node.type || 'customNode',
                dragHandle: ".custom-drag-handle",
                position: node.position || { x: 0, y: 0 },
                data: {
                    ...node.data,
                    fields: node.data?.fields || [],
                    stageName: node.data?.stageName || node.id || "Sem nome",
                    condition: node.data?.condition || {},
                    updateFields: (newFields) => updateFieldsForNode(node.id, newFields),
                    updateNodeName: (newName) => updateNodeName(node.id, newName),
                    updatePosition: (newPosition) => updateNodePosition(node.id, newPosition),
                },
                measured: node.measured || { width: 244, height: 320 },
                selected: false
            }));

            setNodes(processedNodes);
            setEdges(flowData.edges || []);

            setErrors([]);
            return true;

        } catch (error) {
            console.error('Erro na importação:', error);
            setErrors([`Erro ao importar: ${error.message}`]);

            if (nodes.length === 0) {
                addStartNode();
                addEndNode();
                addNewNode();
            }
            return false;
        }
    }, [addStartNode, addEndNode, addNewNode, nodes.length, updateFieldsForNode, updateNodeName, updateNodePosition]);

    const value = {
        nodes,
        edges,
        onNodesChangeHandler,
        onEdgesChangeHandler,
        onConnect,
        addNewNode,
        addNewNodeConditional,
        removeNode,
        initializeData,
        updateFieldsForNode,
        removeFieldFromNode,
        updateFieldConfig,
        updateNodeName,
        updateNodeTempSector,
        updateNodePosition,
        errors,
        onExport,
        onImport,
        exportFlowImage,
        registerExportFlowImage,
        setNodes,
        updateNodeCondition,
        addStartNode,
        addEndNode,
    };
    return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}