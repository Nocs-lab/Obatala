import React from 'react';
import { Handle } from '@xyflow/react';
import '../../../../../../css/react-flow.css';

const LastNode = ({ id, data }) => {
  return (
    <div className="custom-drag-handle">
      <div
        style={{
          borderRadius: '50%',
          width: '100px',
          height: '100px',
          backgroundColor: 'var(--white)',
          border: '2px solid var(--black)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          position: 'relative',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            width: '60%', // Reduzi o tamanho do anel interno
            height: '60%',
            borderRadius: '50%',
            border: '3px solid var(--black)', // Diminuí a espessura do anel interno
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-300)',
            fontSize: '14px',
            fontWeight: 'bold',
            userSelect: 'none',
          }}
        >
          <span>⠿ {id}</span>
        </div>
      </div>
      <Handle type="target" position="left" style={{ left: '-1px' }} />
    </div>
  );
};

export default LastNode;