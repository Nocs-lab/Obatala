import React from "react";
import { useFlowContext } from "../../context/FlowContext";
// custom handle for our nodes
const NodeHandle = (id) => {
  const {removeNode} = useFlowContext();
  return (
    <div
      className="custom-drag-handle"
    >
      <span role="img" aria-label="drag">
        ⠿
      </span>
      <div className="btn close-btn" onClick={() => removeNode(id.nodeId)}></div>
    </div>
  );
};

export default NodeHandle;
