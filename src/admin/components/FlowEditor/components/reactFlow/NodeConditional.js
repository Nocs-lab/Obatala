import React, { useState, useEffect, useRef } from "react";
import NodeHandle from "./NodeHandle";
import { Handle, Position, useReactFlow } from "@xyflow/react";

const NodeConditional = (node) => {
  
  console.log("Condicional: " + node);
  
  const [isVisibleToolbar, setIsVisibleToolbar] = useState(false); // Estado para exibir a toolbar
  const modalRef = useRef(null); // Referência para o modal
  const containerRef = useRef(null); // Referência para o nó condicional

  // Função para alternar a visibilidade da barra de ferramentas do nó
  const handleClick = (event) => {
    // Se clicar no nó condicional, alterna a visibilidade da toolbar
    if (containerRef.current && containerRef.current.contains(event.target)) {
      setIsVisibleToolbar((prev) => !prev); // Alterna entre mostrar ou esconder
    } else {
      // Caso contrário, fecha a toolbar
      setIsVisibleToolbar(false);
    }
  };

  // Fechar o modal quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Fecha a toolbar se o clique for fora do modal e do nó condicional
      if (modalRef.current && !modalRef.current.contains(event.target) && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsVisibleToolbar(false); // Fecha o modal se clicar fora dele
      }
    };

    // Adiciona o listener de clique no documento
    document.addEventListener("mousedown", handleClickOutside);

    // Remove o listener quando o componente for desmontado
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 

  return (
    <div 
      ref={containerRef} // Referência para o nó condicional
      className="bpmn-conditional-operator" 
      onClick={handleClick} // Ativa a alternância de visibilidade da toolbar
    >

      {/* Connection Handles */}
      <Handle type="target" position={Position.Left}
        style={{
          top: "100%", // Ajuste vertical para ficar entre bottom e right
          right: "-8px", // Ajuste horizontal para alinhar ao lado direito
        }} />

      <Handle type="source" position={Position.Right}
        style={{
          top: "0", // Ajuste vertical para ficar entre bottom e right
          right: "0px", // Ajuste horizontal para alinhar ao lado direito
        }} />

      {/* Node Drag Handle */
      console.log(node)
      }
      <NodeHandle nodeId={node.id} />

      {/* Toolbar */}
      {isVisibleToolbar && (
        <div 
          ref={modalRef} // Referência para o modal
          className="node-toolbar"
          style={{
            position: "absolute",
            top: "50px", // Ajuste a altura do NodeToolbar
            right: "10px",
            width: "600px", // Ajuste o tamanho da largura
            backgroundColor: "#fff",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 10, // Garante que a barra de ferramentas sobreponha o nó
            borderRadius: "8px",
            maxHeight: "400px", // Limite máximo de altura se necessário
            overflowY: "auto", // Caso a lista de campos seja grande
            transform: "rotate(-45deg)", // Apenas o nó condicional é rotacionado
            transition: "transform 0.3s ease" // Animação suave           
          }}>
          
          <h2>Condition Settings</h2>
          <hr />
          <h1>Input Stage: Stage 1 </h1>
          <h1>Output Stages: Stage 2 && Stage 3</h1>
          <hr />
          <h1>If Field 1 receives value 1, go to Stage 2</h1>
          <h1>If Field 1 receives value 2, go to Stage 3</h1>
        </div>
      )}
    </div>
  );
};

export default NodeConditional;
