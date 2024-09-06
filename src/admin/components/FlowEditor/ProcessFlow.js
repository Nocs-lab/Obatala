import React, {
  useCallback,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  MiniMap,
  Controls,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import NodeContent from "./components/NodeContent";
import validateInitialData from "./helpers/dataValidator";
import ProcessControls from "./components/FlowButtons";
const nodeTypes = {
  customNode: NodeContent,
};

const ProcessFlow = forwardRef(({ initialData }, ref) => {
  const [mockNodes, setMockNodes] = useState([]);
  const [mockEdges, setMockEdges] = useState([]);
  const [errors, setErrors] = useState([]); // Armazena os erros de validação

  // Função para validar os dados e atualizar o estado inicial
  const initializeData = (data) => {
    const validationResult = validateInitialData(data);

    if (1==1) {
      // Atualiza os mockNodes e mockEdges com os dados válidos
      setMockNodes(data.nodes || []);
      setMockEdges(data.edges || []);

      // Atualiza os estados de nodes e edges para que o ReactFlow use os dados validados
      setNodes(
        data.nodes.map(({ id, position, fields, stageName }) => ({
          id,
          type: "customNode",
          dragHandle: ".custom-drag-handle",
          position,
          data: {
            fields: fields || [],
            stageName: stageName || "",
            updateFields: (newFields) => updateFieldsForNode(id, newFields),
            updateNodeName: (newName) => updateNodeName(id, newName),
            updatePosition: (newPosition) => updateNodePosition(id, newPosition),
          },
        }))
      );

      setEdges(
        data.edges.map(({ id, source, target }) => ({
          id,
          source,
          target,
          type: "smoothstep",
        }))
      );
    } else {
      // Se houver erros de validação, armazene-os e não atualize os dados
      setErrors(validationResult.errors);
      console.error("Validation errors:", validationResult.errors);
    }
  };

  // Definindo os estados dos nós e das arestas
  const [nodes, setNodes, onNodesChange] = useNodesState(
    mockNodes.map(({ id, position, fields, stageName }) => ({
      id,
      type: "customNode",
      dragHandle: ".custom-drag-handle",
      position,
      data: {
        fields: fields || [],
        stageName: stageName || "",
        updateFields: (newFields) => updateFieldsForNode(id, newFields),
        updateNodeName: (newName) => updateNodeName(id, newName),
        updatePosition: (newPosition) => updateNodePosition(id, newPosition),
      },
    }))
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    mockEdges.map(({ id, source, target }) => ({
      id,
      source,
      target,
      type: "smoothstep",
    }))
  );
  
  // Função para atualizar os campos de cada nó
  const updateFieldsForNode = (nodeId, newFields) => {
    setMockNodes((prevMockData) =>
      prevMockData.map((node) =>
        node.id === nodeId ? { ...node, fields: newFields } : node
      )
    );

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, fields: newFields } }
          : node
      )
    );
  };

  // Função para atualizar o nome (stageName) de cada nó
  const updateNodeName = (nodeId, newName) => {
    setMockNodes((prevMockData) =>
      prevMockData.map((node) =>
        node.id === nodeId ? { ...node, stageName: newName } : node
      )
    );

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, stageName: newName } }
          : node
      )
    );
  };

  // Função para atualizar a posição de um nó
  const updateNodePosition = (nodeId, newPosition) => {
    // Atualiza o estado mockNodes com a nova posição do nó
    setMockNodes((prevMockData) =>
      prevMockData.map((node) =>
        node.id === nodeId ? { ...node, position: { ...newPosition } } : node
      )
    );

    // Também atualiza o estado dos nós visíveis em ReactFlow
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === nodeId ? { ...node, position: { ...newPosition } } : node
      )
    );
  };

  // Função para capturar as mudanças de posição dos nós
  const onNodesChangeHandler = (changes) => {
    changes.forEach((change) => {
      if (change.type === "position") {
        // Atualiza a posição quando o tipo de mudança for "position"
        updateNodePosition(change.id, change.position);
      }
    });

    onNodesChange(changes);
  };

  // Função para conectar nós
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => {
        const updatedEdges = addEdge({ ...params, type: "smoothstep" }, eds);
        setMockEdges(updatedEdges); // Atualiza o estado dos edges com as novas conexões
        return updatedEdges;
      }),
    [setEdges]
  );

  // Função para capturar mudanças nos edges
  const onEdgesChangeHandler = (changes) => {
    setMockEdges((prevMockEdges) =>
      prevMockEdges.map((edge) =>
        changes.find((change) => change.id === edge.id) || edge
      )
    );
    onEdgesChange(changes);
  };

  // função para exportar os dados do state
  const onExport = () => {
    const data = {
      nodes: mockNodes,
      edges: mockEdges,
    };

    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "flowData.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // função para importar dados e sobrescrever o state
  const onImport = (importedData) => {
    const validationResult = validateInitialData(importedData);

    if (validationResult.isValid) {
      setMockNodes(importedData.nodes || []);
      setMockEdges(importedData.edges || []);

      setNodes(
        importedData.nodes.map(({ id, position, fields, stageName }) => ({
          id,
          type: "customNode",
          dragHandle: ".custom-drag-handle",
          position,
          data: {
            fields: fields || [],
            stageName: stageName || "",
            updateFields: (newFields) => updateFieldsForNode(id, newFields),
            updateNodeName: (newName) => updateNodeName(id, newName),
            updatePosition: (newPosition) => updateNodePosition(id, newPosition),
          },
        }))
      );

      setEdges(
        importedData.edges.map(({ id, source, target }) => ({
          id,
          source,
          target,
          type: "smoothstep",
        }))
      );
    } else {
      setErrors(validationResult.errors);
      console.error("Validation errors:", validationResult.errors);
    }
  };
  // Função para adicionar novos nós
  const addNewNode = () => {
    const newNodeId = `Etapa ${nodes.length + 1}`;
    const newNode = {
      id: newNodeId,
      type: "customNode",
      position: { x: 200, y: 200 },
      data: {
        fields: [],
        stageName: `${newNodeId}`,
        updateFields: (newFields) => updateFieldsForNode(newNodeId, newFields),
        updateNodeName: (newName) => updateNodeName(newNodeId, newName),
        updatePosition: (newPosition) => updateNodePosition(newNodeId, newPosition),
      },
    };

    setNodes((prevNodes) => [...prevNodes, newNode]);
    setMockNodes((prevData) => [
      ...prevData,
      {
        id: newNodeId,
        position: { x: 200, y: 200 },
        fields: [],
        stageName: `Etapa ${newNodeId}`,
      },
    ]);
  };

  // Expondo os dados do flow e dos nodes para o componente pai
  useImperativeHandle(ref, () => ({
    getFlowData: () => ({
      nodes: mockNodes,
      edges: mockEdges,
    }),
    getNodesData: () => mockNodes, // Função que retorna apenas os nodes
    getEdgesData: () => mockEdges, // Função que retorna apenas os edges
  }));

  // Atualiza os dados iniciais quando o initialData for alterado
  useEffect(() => {
    if (initialData) {
      initializeData(initialData); // Valida e inicializa os dados
    }
  }, [initialData]);

  return (
    <div style={{ width: "100%", height: "650px", position: "relative" }}>
      {errors.length > 0 && (
        <div style={{ color: "red", padding: "10px" }}>
          <strong>Validation Errors:</strong>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler} // Atualiza os edges com as mudanças
        onConnect={onConnect} // Conecta nós e atualiza edges
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
      <ProcessControls onAddNode={addNewNode} onExport={onExport} onImport={onImport} />
    </div>
  );
});

export default ProcessFlow;
