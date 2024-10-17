import React from "react";

const CollectionCard = ({ collection, onSelect, isSelected }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "16px",
        borderRadius: "8px",
        border: isSelected ? "2px solid blue" : "1px solid #ddd",
        marginBottom: "16px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        alignItems: "flex-start",
        cursor: "pointer",
        backgroundColor: isSelected ? "#f0f8ff" : "white",
      }}
    >
      {collection.thumbnailUrl && (
        <div>
          <img
            src={collection.thumbnailUrl}
            alt={`${collection.title} thumbnail`}
            style={{
              width: "100%",
              maxWidth: "300px",
              borderRadius: "4px",
              objectFit: "cover",
              marginBottom: "16px",
            }}
          />
        </div>
      )}
      <div>
        <h3 style={{ margin: "0 0 8px" }}>
          <a href={collection.url} target="_blank" rel="noopener noreferrer">
            {collection.title}
          </a>
        </h3>
        <ul>
          <li>
            <strong>Autor:</strong> {collection.author}
          </li>
          <li>
            <strong>Data de criação:</strong> {collection.creationDate}
          </li>
          <li>
            <strong>Última modificação:</strong> {collection.modificationDate}
          </li>
          <li>
            <strong>Total de itens publicados:</strong>{" "}
            {collection.totalPublishedItems}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CollectionCard;
