import React from "react";
import { Handle } from "@xyflow/react";
import { __ } from "@wordpress/i18n";
import "../../../../../../css/react-flow.css";

const StartNode = ({ id, data }) => {
    return (
        <div className="bpmn-start-end-node bpmn-start-node custom-drag-handle">
            <span>{id === 'Start' ? __('Start', 'obatala') : id}</span>
            <Handle type="source" position="right" />
        </div>
    );
};

export default StartNode;
