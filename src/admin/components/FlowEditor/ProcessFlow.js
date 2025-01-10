import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { ReactFlow, Background, MiniMap, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import NodeContent from "./components/reactFlow/NodeContent";
import ButtonEdge from "./components/reactFlow/CustomEdge";
import ProcessControls from "./components/reactFlow/FlowButtons";
import SlidingDrawer from "./components/SlidingDrawer";
import { DrawerProvider } from "./context/DrawerContext";
import { useFlowContext } from "./context/FlowContext";
import { Button, Icon, Tooltip } from "@wordpress/components";
import { fullscreen } from "@wordpress/icons";


const nodeTypes = {
  customNode: NodeContent,
};

const edgeTypes = {
  buttonedge: ButtonEdge,
};

const ProcessFlow = forwardRef(({ initialData, onSave, onCancel}, ref,) => {
  const {
    nodes,
    edges,
    onNodesChangeHandler,
    onEdgesChangeHandler,
    onConnect,
    initializeData,
  } = useFlowContext();

  const [errors, setErrors] = useState([]); // Armazena os erros de validação
  const [isOpen, setIsOpen] = useState(false);
  const [openFullScreen, setOpenFullScreen] = useState(false);


  // Função para alternar para tela cheia
  const toggleFullScreen = () => {
    const element = document.getElementById('flow-container'); 
    
     if(document.fullscreenElement) {
      document.exitFullscreen();
    }else {     
      element.requestFullscreen();
    }
    
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isFullScreen = !!document.fullscreenElement;
      setOpenFullScreen(isFullScreen);
    }
    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  

  // Função para abrir/fechar a gaveta
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Expondo os dados do flow e dos nodes para o componente pai
  useImperativeHandle(ref, () => ({
    getFlowData: () => ({
      nodes,
      edges,
    }),
    getNodesData: () => nodes, // Função que retorna apenas os nodes
    getEdgesData: () => edges, // Função que retorna apenas os edges
  }));

  // Atualiza os dados iniciais quando o initialData for alterado
  useEffect(() => {
    if (initialData) {
      initializeData(initialData); // Valida e inicializa os dados
    }
  }, [initialData]);

  useEffect(() => {
    console.log("Nodes:", nodes, "Edges:", edges);
  }, [nodes, edges]);

  return (
    <div className="flow-container" id="flow-container" >
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
      {openFullScreen && (
          <ProcessControls
              onSave={onSave}
              onCancel={onCancel}
          />
      )}
      <Tooltip
        text="Alternar tela cheia"
      >
          <Icon
              onClick={() => toggleFullScreen()}
              icon={fullscreen}
              style={{cursor:'pointer'}}
          />  
      </Tooltip>
      
      <div className="flow-content">
        <DrawerProvider>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
              ...node.data,
              },
            }))}
            edges={edges}
            onNodesChange={onNodesChangeHandler}
            onEdgesChange={onEdgesChangeHandler} // Atualiza os edges com as mudanças
            onConnect={onConnect} // Conecta nós e atualiza edges
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            >
            <SlidingDrawer toggleDrawer={toggleDrawer} />
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </DrawerProvider>
      </div>
    </div>
  );
});

export default ProcessFlow;
