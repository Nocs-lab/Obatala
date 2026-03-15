import React from 'react';
import { Handle } from '@xyflow/react';
import { __ } from '@wordpress/i18n';
import '../../../../../../css/react-flow.css';

const EndNode = ({ id, data }) => {
    return (
        <div className="bpmn-start-end-node bpmn-end-node custom-drag-handle">
            <span>{id === 'End' ? __('End', 'obatala') : id}</span>
            <Handle type="target" position="left" />
        </div>
    );
};

export default EndNode;