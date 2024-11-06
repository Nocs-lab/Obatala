import React from 'react';

const ItemCard = ({ item, onSelect, isSelected, isEditable }) => {
    return (
        <div
            onClick={isEditable ? onSelect : undefined}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '16px',
                borderRadius: '8px',
                border: isSelected && isEditable ? '2px solid blue' : '1px solid #ddd',
                marginBottom: '16px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                cursor: isEditable ? 'default' :'pointer',
                backgroundColor: isSelected && isEditable ? '#f0f8ff' : 'white'
            }}
        >
            {/* Imagem à Esquerda */}
            {item.thumbnailUrl && (
                <img
                    src={item.thumbnailUrl}
                    alt={`${item.title} thumbnail`}
                    style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        marginRight: '16px'
                    }}
                />
            )}
            
            {/* Informações à Direita */}
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px' }}>{item.title}</h3>
                {item.description && <p style={{ color: '#555' }}>{item.description}</p>}
                <p><strong>Tipo:</strong> {item.type}</p>

                {/* Exibição de Metadata */}
                {item.metadata && (
                    <details 
                        style={{ marginTop: '12px' }}
                        onClick={(e) => e.stopPropagation()} // Evita que o clique propague para o card
                    >
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            Metadata
                        </summary>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0 0' }}>
                            {Object.entries(item.metadata).map(([key, meta]) => (
                                <li key={key} style={{ marginBottom: '4px' }}>
                                    <strong>{meta.name}:</strong> {meta.value_as_string || meta.value || 'N/A'}
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
            </div>
        </div>
    );
};

export default ItemCard;
