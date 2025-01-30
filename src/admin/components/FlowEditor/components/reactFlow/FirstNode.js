import React from "react";
import { Handle } from "@xyflow/react";
import "../../../../../../css/react-flow.css";

const FirstNode = ({ id, data }) => {
  return (
    <div className="custom-drag-handle" 
    style={{ display: 'flex',
      alignItems: 'center',
      justifyContent: 'center' }}>
      <div
        style={{
          borderRadius: "50%",
          width: "100px",
          height: "100px",
          backgroundColor: "var(--white)",
          border: "2px solid var(--black)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          color: "var(--primary-300)",
          fontSize: "14px",
          fontWeight: "bold",
          userSelect: "none",
          position: "relative",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <span>⠿ {id}</span>
      </div>
      <Handle type="source" position="right" />
    </div>
  );
};

export default FirstNode;
