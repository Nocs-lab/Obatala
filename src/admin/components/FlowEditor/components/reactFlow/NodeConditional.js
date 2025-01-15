import React from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Tooltip } from "@wordpress/components";
import NodeHandle from "./NodeHandle";
import { Handle, Position, useReactFlow } from "@xyflow/react";

const NodeConditional = (node) => {
  
  return (
    <div className="bpmn-conditional-operator">

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

      {/* Node Drag Handle */}
      <NodeHandle nodeId={node.id} />
    </div>
  );
};

export default NodeConditional;
