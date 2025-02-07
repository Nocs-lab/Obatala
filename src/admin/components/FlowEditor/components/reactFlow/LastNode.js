import React from 'react';
import { Handle } from '@xyflow/react';
import '../../../../../../css/react-flow.css';

const LastNode = ({ id, data }) => {
    return (
        <div className="bpmn-start-end-node bpmn-end-node custom-drag-handle">
            <span>{id}</span>
            <Handle type="target" position="left" style={{ left: '-1px' }} />
        </div>
    );
};

export default LastNode;