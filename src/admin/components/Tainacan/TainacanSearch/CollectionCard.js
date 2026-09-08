import React from "react";
import { __, sprintf } from '@wordpress/i18n';

const CollectionCard = ({ collection, onSelect, isSelected, isEditable }) => {
    return (
        <div
            onClick={isEditable ? onSelect : undefined}
            style={{
                padding: "16px",
                borderRadius: "8px",
                border: isSelected && isEditable ? "2px solid blue" : "1px solid #ddd",
                marginBottom: "16px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                alignItems: "flex-start",
                cursor: "pointer",
                backgroundColor: isSelected && isEditable ? "#f0f8ff" : "white",
            }}
            >
            {collection.thumbnailUrl && (
                <div>
                <img
                    src={collection.thumbnailUrl}
                    alt={sprintf(__('%s thumbnail', 'obatala'), collection.title)}
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
                    <strong>{__('Author:', 'obatala')}</strong> {collection.author}
                </li>
                <li>
                    <strong>{__('Creation date:', 'obatala')}</strong> {collection.creationDate}
                </li>
                <li>
                    <strong>{__('Last modification:', 'obatala')}</strong> {collection.modificationDate}
                </li>
                <li>
                    <strong>{__('Total published items:', 'obatala')}</strong>{" "}
                    {collection.totalPublishedItems}
                </li>
                </ul>
            </div>
        </div>
    );
};

export default CollectionCard;
