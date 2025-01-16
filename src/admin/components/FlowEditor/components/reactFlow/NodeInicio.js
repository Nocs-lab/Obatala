import React from 'react';
import { Handle } from '@xyflow/react';
import '../../../../../../css/react-flow.css';

const NodeInicio = ({ id, data }) => {
  return (
    <div className="custom-drag-handle node-inicio">
      <Handle type="target" position="left" />
      <div className="node-content">
        <span>{id}</span>
      </div>
      <Handle type="source" position="right" />
    </div>
  );
};

export default NodeInicio;