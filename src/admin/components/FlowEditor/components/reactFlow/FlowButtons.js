import React, { useRef } from "react";
import { useFlowContext } from "../../context/FlowContext";


const ProcessControls = () => {

  const { addNewNode, onExport, onImport } = useFlowContext();

  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const importedData = JSON.parse(e.target.result);
        onImport(importedData); // Chama a função para importar os dados
      };
      reader.readAsText(file);
    }
  };
  return (
    <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
      {/* Botão para adicionar nova etapa */}
      <button
        onClick={addNewNode}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "10px",
          display: "block",
        }}
      >
        Adicionar Etapa
      </button>
      {/* Botão para exportar JSON */}
      <button
        onClick={onExport}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "10px",
          display: "block",
        }}
      >
        Exportar JSON
      </button>
      {/* Botão para importar JSON */}
      <button
        onClick={handleImportClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ffc107",
          color: "black",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Importar JSON
      </button>
      {/* Input invisível para carregar o arquivo JSON */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ProcessControls;
