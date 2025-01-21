import React from 'react';
import { Handle } from '@xyflow/react';
import '../../../../../../css/react-flow.css';

const LastNode = ({ id, data }) => {
  return (
    <div className="custom-drag-handle2 node-last">
      <div role="img" aria-label="drag" className="node-content">
        <span>⠿{id}</span>
      </div>
      <Handle type="target" position="left" style={{ left: '-1px' }}/>
    </div>
  );
};

export default LastNode;