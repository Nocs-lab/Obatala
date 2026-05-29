import React from 'react';

const ItemCard = ({ item, onSelect, isSelected, isEditable }) => {
  const safe = item && typeof item === 'object' ? item : {};

  const title = typeof safe.title === 'string'
    ? safe.title
    : (safe.title?.rendered ?? safe.name ?? '(sem título)');

  const description = typeof safe.description === 'string'
    ? safe.description
    : (safe.description?.rendered ?? '');

  const thumb = typeof safe.thumbnailUrl === 'string' ? safe.thumbnailUrl : null;

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
        cursor: isEditable ? 'pointer' : 'default',
        backgroundColor: isSelected && isEditable ? '#f0f8ff' : 'white'
      }}
    >
      {thumb && (
        <img
          src={thumb}
          alt={`${title} thumbnail`}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '8px',
            objectFit: 'cover',
            marginRight: '16px'
          }}
        />
      )}

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
        {description ? <p style={{ color: '#555' }}>{description}</p> : null}
        <p><strong>Tipo:</strong> {safe.type ?? 'Item'}</p>

        {safe.metadata && typeof safe.metadata === 'object' && !Array.isArray(safe.metadata) && (
          <details style={{ marginTop: '12px' }} onClick={(e) => e.stopPropagation()}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Metadata</summary>
            <ul style={{ paddingLeft: '20px', margin: '8px 0 0' }}>
              {Object.entries(safe.metadata).map(([key, meta]) => {
                const name = meta?.name ?? key;
                const value =
                  meta?.value_as_string ??
                  meta?.value ??
                  (typeof meta === 'string' ? meta : 'N/A');

                return (
                  <li key={key} style={{ marginBottom: '4px' }}>
                    <strong>{name}:</strong> {String(value)}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
