import React from "react";
import { Handle, Position } from '@xyflow/react';
const handleStyle = {
  height: "20px",
  width: "100%",
  background:
    "linear-gradient(45deg, #fff 22.22%, #e5e5e5 22.22%, #e5e5e5 50%,#fff 50%, #fff 72.22%, #e5e5e5 72.22%, #e5e5e5 100%)",
  backgroundSize: "12.73px 12.73px",
  cursor: "move",
  textAlign: "center",
  color: "white",
  borderTopLeftRadius: "4px",
  borderTopRightRadius: "4px",
  userSelect: "none", // Previne a seleção de texto ao arrastar
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.3s ease", // Adiciona uma transição suave ao hover
};

const hoverStyle = {
  background:
    "linear-gradient(45deg, #ddd 22.22%, #ccc 22.22%, #ccc 50%,#ddd 50%, #ddd 72.22%, #ccc 72.22%, #ccc 100%)",
};

const NodeHandle = () => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="custom-drag-handle"
      style={{ ...handleStyle, ...(isHovered ? hoverStyle : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Adicionando um ícone opcional */}
      <span role="img" aria-label="drag">
        ⠿
      </span>
    </div>
  );
};

export default NodeHandle;
