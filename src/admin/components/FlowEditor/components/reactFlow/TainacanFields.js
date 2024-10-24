import React from "react";
import TainacanLogo from "./media/tainacan_logo_symbol.svg";

const TainacanFields = ({ isAdding, setIsAdding, addFieldToNode, options }) => (
  <div
    style={{
      backgroundColor: "#fff",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      overflow: "hidden",
      transition: "max-height 0.3s ease-in-out", // Animação de expansão
      maxHeight: isAdding ? "200px" : "40px", // Ajuste de altura
      display: "inline-block",
      maxWidth: isAdding ? "200px" : "40px",

    }}
  >
    {isAdding ? (
      <>
        <b>Tainacan Integrations</b>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {options.map((option) => (
            <li
              className="node-meta-list"
              key={option.id}
              onClick={() => addFieldToNode(option.id)}
              style={{ padding: "5px", cursor: "pointer" }}
            >
              {option.label}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setIsAdding(false)}
          style={{
            marginTop: "10px",
            backgroundColor: "#ddd",
            color: "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </>
    ) : (
      <img
        src={TainacanLogo}
        className="btn tainacan-btn"
        alt="Tainacan"
        onClick={() => setIsAdding(true)}
        style={{ width: "20px", height: "20px", padding: "1px", maxWidth: "40px" }}
      />
    )}
  </div>
);

export default TainacanFields;
