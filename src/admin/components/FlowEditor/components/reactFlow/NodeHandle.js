import React from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Tooltip } from "@wordpress/components";

// custom handle for our nodes
const NodeHandle = (id) => {
    const {removeNode} = useFlowContext();
    return (
        <div className="step-header custom-drag-handle">
            <span role="img" aria-label="drag">⠿</span>
            <Tooltip text="Remove step">
                <div className="btn close-btn" onClick={() => removeNode(id.nodeId)}></div>
            </Tooltip>
        </div>
    );
};

export default NodeHandle;
