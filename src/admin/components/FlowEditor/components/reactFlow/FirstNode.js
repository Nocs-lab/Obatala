import React from "react";
import { Handle } from "@xyflow/react";
import "../../../../../../css/react-flow.css";

const FirstNode = ({ id, data }) => {
    return (
        <div className="bpmn-start-end-node bpmn-start-node custom-drag-handle">
            <span>{id}</span>
            <Handle type="source" position="right" />
        </div>
    );
};

export default FirstNode;
