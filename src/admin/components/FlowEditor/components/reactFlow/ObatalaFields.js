import React from "react";

const ObatalaFields = ({ isAdding, setIsAdding, addFieldToNode, options }) => (
  <div
    style={{
      backgroundColor: "#fff",
      padding: "4px 8px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      overflow: "hidden",
      transition: "max-height 0.3s ease-in-out", // Animação de expansão
      maxHeight: isAdding ? "400px" : "40px", // Ajuste de altura
      display: "inline-block",
      maxWidth: isAdding ? "200px" : "40px",
    }}
  >
    {isAdding ? (
      <>
        <b>Adicionar Campo</b>
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
      <div
        style={{
          width: "20px",
          height: "20px",
          cursor: "pointer",
        }}
        onClick={() => setIsAdding(true)}
        className="btn max-btn"
      ></div>
    )}
  </div>
);

export default ObatalaFields;
