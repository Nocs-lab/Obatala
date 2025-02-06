import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
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
  
  // Utilizando estados diretamente para nodes e edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  //Função para adicionar um nó inicial
  const addFirstNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const newNodePosition = lastNode
      ? { x: lastNode.position.x - 50, y: lastNode.position.y + 50 }
      : { x: -200, y: 130 };
    const First = {
      id: "First",
      type: "firstNode",
      dragHandle: ".custom-drag-handle",
      position: newNodePosition,
      data: {
        fields: [],
        stageName: "First",
        updateFields: (newFields) => updateFieldsForNode("First", newFields),
        updateNodeName: (newName) => updateNodeName("First", newName),
        updatePosition: (newPosition) =>
          updateNodePosition("First", newPosition),
      },
    };
    setNodes((prevNodes) => [...prevNodes, First]);
  };

  const addLastNode = () => {
    const lastNode = nodes[nodes.length - 1];
    const newNodePosition = lastNode
      ? { x: lastNode.position.x + 50, y: lastNode.position.y + 50 }
      : { x: 460, y: 130 };
    const Last = {
      id: "Last",
      type: "lastNode",
      dragHandle: ".custom-drag-handle",
      position: newNodePosition,
      data: {
        fields: [],
        stageName: "Last",
        updateFields: (newFields) => updateFieldsForNode("Last", newFields),
        updateNodeName: (newName) => updateNodeName("Last", newName),
        updatePosition: (newPosition) =>
          updateNodePosition("Last", newPosition),
      },
    };
    setNodes((prevNodes) => [...prevNodes, Last]);
  };

  // Verifica se é necessário adicionar o nó inicial
  useEffect(() => {
    if (!isLoaded) {
      setIsLoaded(true);
    } else if (nodes.length === 0) {
      addFirstNode();
      addLastNode();
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
    if (confirm(`Tem certeza que deseja remover o campo ${fieldId} do ${nodeId}?`)) {
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
    ); }
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

  const updateNodeTempSector = (nodeId, newValue) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, tempSector: newValue[0]  }
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
    if (confirm(`Tem certeza que deseja remover o nó ${nodeId}?`)) {
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
      setEdges((prevEdges) =>
        prevEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    }
  };

  // Função para validar e inicializar dados
  const initializeData = (data) => {
    const validationResult = validateInitialData(data);
  
    if (validationResult.isValid || 1 === 1) {
      setNodes(
        data.nodes.map(
          ({
            id,
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
            type: type, 
            dragHandle: ".custom-drag-handle",
            position,
            data: {
              fields: nodeData.fields || [],
              stageName: nodeData.stageName || "",
              updateFields: (newFields) => updateFieldsForNode(id, newFields),
              updateNodeName: (newName) => updateNodeName(id, newName),
              updatePosition: (newPosition) => updateNodePosition(id, newPosition),
            },
            sector_obatala: sector_obatala || "",
            sector_history: sector_history || [],
            tempSector: sector_obatala ? null : tempSector,
            measured: measured || { width: 0, height: 0 }, // Inclui a medida
            selected: selected || false, // Inclui o estado de seleção
          })
        )
      );
      setEdges(
        data.edges.map(({ id, source, target }) => ({
          id,
          source,
          target,
          type: "buttonedge",
        }))
      );
    } else {
      setErrors(validationResult.errors);
    }
  };

  // Função para exportar os dados do fluxo
  const onExport = () => {
    const data = {
      nodes,
      edges,
    };

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "flowData.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Função para importar dados e sobrescrever o estado
  const onImport = (importedData) => {
    const validationResult = validateInitialData(importedData);

    if (validationResult.isValid) {
      initializeData(importedData);
    } else {
      setErrors(validationResult.errors);
    }
  };

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
    addFirstNode,
    addLastNode,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};
