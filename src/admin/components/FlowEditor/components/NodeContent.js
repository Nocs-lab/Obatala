import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import DragAndDropList from './DragAndDropList';  // Usando o componente de drag-and-drop com @dnd-kit
import NodeHandle from './NodeHandle';  // Handle de arraste
import { NodeToolbar } from '@xyflow/react';  // Importando a barra de ferramentas do nó

const nodeStyle = {
  border: '1px solid #ddd',
  backgroundColor: 'white',
  borderRadius: '4px',
  position: 'relative',
  fontSize: '10px',
  minWidth: '100px',
};

// Opções de campos que podem ser adicionados, refletindo todos os tipos suportados pelo NodeMetadataCreator
const FIELD_OPTIONS = [
  { id: 'text', label: 'Texto' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Telefone' },
  { id: 'address', label: 'Endereço' },
  { id: 'number', label: 'Número' },
  { id: 'datepicker', label: 'Date Picker' },
  { id: 'upload', label: 'Upload de Arquivo' },
  { id: 'select', label: 'Select (Múltiplas Opções)' },
  { id: 'radio', label: 'Radio (Opções de Seleção)' }
];

const NodeContent = ({ id, data = {} }) => {
  const { fields = [], updateFields = () => {}, updateNodeName = () => {}, stageName = 'Nó sem título' } = data; // Garantindo que updateNodeName tenha um valor padrão
  const { selectedNodes } = useReactFlow();  // Hook do ReactFlow para acessar o estado

  const [isAddingFields, setIsAddingFields] = useState(false);

  // Verifica se o nó está selecionado
  const isSelected = selectedNodes?.some(node => node.id === id);

  // Função para adicionar um campo ao nó
  const addFieldToNode = (fieldId) => {
    const newField = { id: `${fieldId}-${fields.length + 1}`, type: fieldId, value: '' };
    updateFields([...fields, newField]);
    setIsAddingFields(false);  // Fecha o menu após adicionar o campo
  };

  const handleStageNameChange = (e) => {
    updateNodeName(e.target.value);
  };

  return (
    <div style={nodeStyle}>
      {/* Handle separado, que pode mover o nó */}
      <NodeHandle />

      {/* Handles de conexão nas laterais */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      
      {/* Título do nó com campo editável */}
      <input
        type="text"
        value={stageName}
        onChange={handleStageNameChange}
        placeholder="Digite o nome da etapa"
        style={{
          width: '100%',
          padding: '5px',
          marginBottom: '10px',
          fontSize: '10px',
          border: 'none',
          borderBottom: '1px solid #ccc',
          outline: 'none',
        }}
      />

      {/* Lista de campos ordenáveis */}
      <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
        <DragAndDropList fields={fields} updateFields={updateFields} />
      </div>

      {/* NodeToolbar que alterna entre o botão "+" e as opções de adicionar campo */}
      <NodeToolbar isVisible={isSelected} position="right">
        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
          {isAddingFields ? (
            <>
              <h4>Adicionar Campo</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {FIELD_OPTIONS.map((option) => (
                  <li 
                    key={option.id} 
                    onClick={() => addFieldToNode(option.id)} 
                    style={{ padding: '5px', cursor: 'pointer' }}>
                    {option.label}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => setIsAddingFields(false)} 
                style={{ 
                  marginTop: '10px', 
                  backgroundColor: '#ddd', 
                  color: '#333', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '5px 10px', 
                  cursor: 'pointer'
                }}>
                Cancelar
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsAddingFields(true)} 
              style={{ 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                cursor: 'pointer',
              }}>
              +
            </button>
          )}
        </div>
      </NodeToolbar>
    </div>
  );
};

export default NodeContent;
