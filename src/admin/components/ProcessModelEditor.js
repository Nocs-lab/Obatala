import React, { useState, useEffect, useRef } from "react";
import {
  Icon,
  Spinner,
  Notice,
  TextControl,
  Tooltip,
  ButtonGroup,
  Button,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import ProcessFlow from "./FlowEditor/ProcessFlow";
import { FlowProvider } from "./FlowEditor/context/FlowContext";
import { closeSmall, edit, check } from "@wordpress/icons";
import ProcessControls from "./FlowEditor/components/reactFlow/FlowButtons";
import { DrawerProvider } from "./FlowEditor/context/DrawerContext";

const processDataEditor = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("process_type_id");
  const [processData, setProcessData] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const flowRef = useRef(null); // Referência para acessar os dados do fluxo
  const [flowData, setFlowData] = useState({ nodes: [], edges: [] }); // Novo estado para o flowData


  const getProcessIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("process_type_id");
  };

  useEffect(() => {
    setIsLoading(true);

    apiFetch({ path: `/obatala/v1/process_type/${id}` })
      .then((typeData) => {
          console.log("Process model data:", typeData);
          setProcessData(typeData);
          // Extraindo flowData do processo carregado
          const flowData = typeData.meta.flowData || { nodes: [], edges: [] };
          setFlowData(flowData);
          setIsLoading(false);
      })
      .catch((error) => {
          console.error("Error fetching data:", error);
          setNotice({ status: "error", message: "Error fetching process type." });
          setIsLoading(false);
      });
  }, [id]);

  const updateNodeSector = async (nodeId, sectorId) => {
    const process_type_id = getProcessIdFromUrl();
    try {
        const response = await apiFetch({
            path: `/obatala/v1/process_type/${process_type_id}/assosiate_sector`,
            method: 'POST',
            data: {
                sector_id: sectorId,
                node_id: nodeId,
            }
        });

        if (response) {
            console.log('Setor associado com sucesso:', response);
        }
    } catch (error) {
        console.error('Erro ao associar o setor:', error);
    }
  };

  // funçao para verificar se todos os nos estao conectados
  const areAllNodesConnected = (nodes, edges) => {
    if (nodes.length === 0) return true; // Nenhum nó para verificar

    // Criar um mapa de adjacência
    const adjacencyList = new Map();
    nodes.forEach(node => adjacencyList.set(node.id, []));

    edges.forEach(({ source, target }) => {
      adjacencyList.get(source).push(target);
      adjacencyList.get(target).push(source); // Grafo não-direcionado
    });

    // Fazer BFS/DFS para verificar conectividade
    const visited = new Set();
    const stack = [nodes[0].id]; // Começamos pelo primeiro nó

    while (stack.length > 0) {
      const node = stack.pop();
      if (!visited.has(node)) {
        visited.add(node);
        adjacencyList.get(node).forEach(neighbor => {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        });
      }
    }

    return visited.size === nodes.length;
  }; 
  
  const handleSave = async () => {
    try {
      const flowData = flowRef.current.getFlowData(); // Obtém os dados do flow
      
      //verifica se todos os nos estão conectados 
      if (!areAllNodesConnected(flowData.nodes, flowData.edges)) {
        setNotice({
          status: "error",
          message: "There are disconnected nodes. Please connect all nodes before saving.",
        });
        return; // Interrompe a execução caso existam nós isolados
      }

      const updatedData = {
        ...processData,
        meta: {
          flowData, // Armazena os dados de fluxo como meta
        },
      };

      // Evita recarregar a página
      await apiFetch({
        path: `/obatala/v1/process_type/${id}`,
        method: "PUT",
        data: updatedData,
      });

      await apiFetch({
        path: `/obatala/v1/process_type/${id}/meta`,
        method: "PUT",
        data: updatedData.meta,
      });

      for (const node of flowData.nodes) {
        if (node.tempSector) {
          try {
            await updateNodeSector(node.id, node.tempSector);
            //node.tempSector = null;
          } catch (error) {
            console.error(`Erro ao associar setor ao nó ${node.id}:`, error);
          }
        }
      }
        
      setProcessData({
        ...processData,
        meta: updatedData.meta,
      });

      setNotice({
        status: "success",
        message: "Process type and meta updated successfully.",
      });
    } catch (error) {
      console.error(error);
      setNotice({
          status: "error",
          message: `Error updating process type and meta: ${error}`,
      });
    } finally {
      setIsLoading(false);
    }
  };


  
  const handleCancelEditProcessType = () => {
    window.location.href = '?page=process-type-manager';
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!processData) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <span className="brand">
          <strong>Obatala</strong> Curatorial Process Management
      </span>
      <div className="title-container">
       <h2>Manager Process Model</h2>

      </div>
      
      {notice && (
        <div className="notice-container">
            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                {notice.message}
            </Notice>
        </div>
      )}
      
      <FlowProvider>
        <div className ='container-controls' style={{display:'flex', justifyContent:'end', padding:' 0px 40px 24px 0px'}}>
            <ProcessControls
              onSave={handleSave}
              onCancel={handleCancelEditProcessType}
            />
        </div>
       
        <ProcessFlow 
            ref={flowRef} 
            initialData={flowData}
            onSave={handleSave}
            onCancel={handleCancelEditProcessType}
            />
      </FlowProvider>
    </main>
  );
};

export default processDataEditor;
