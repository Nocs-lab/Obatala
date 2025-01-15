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

  const handleSave = async () => {
    try {
      const flowData = flowRef.current.getFlowData(); // Obtém os dados do flow
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
  
  // Função para alternar para tela cheia
  const toggleFullScreen = () => {
    const element = document.getElementById('flow-container'); 
    
     if(document.fullscreenElement) {
      document.exitFullscreen();
    }else {     
      element.requestFullscreen();
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
       <h2>Manage steps: {processData.title.rendered}</h2>

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
                toggleFullScreen={toggleFullScreen}
              />
          </div>
       
          <ProcessFlow 
              ref={flowRef} 
              initialData={flowData}
              onSave={handleSave}
              onCancel={handleCancelEditProcessType}
              toggleFullScreen={toggleFullScreen}
          />
      </FlowProvider>
    </main>
  );
};

export default processDataEditor;
