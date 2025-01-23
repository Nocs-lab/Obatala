import React from 'react';
import { Handle } from '@xyflow/react';
import '../../../../../../css/react-flow.css';

const FirstNode = ({ id, data }) => {
  return (
    <div className="custom-drag-handle2 node-inicio">
      <div role="img" aria-label="drag" className="node-content">
        <span>⠿{id}</span>
      </div>
      <Handle type="source" position="right" />
    </div>
  );
};

export default FirstNode;