import React from "react";
import { Button } from "@wordpress/components";
import { download } from "@wordpress/icons";

const MetaFieldDisplay = ({ field, value, handleDownload, fieldId }) => {
    const normalizeArrayLike = (v) => {
        if (!v) return [];
        if (Array.isArray(v)) return v;
        if (typeof v === "object") return Object.values(v); // {0: {...}} -> [{...}]
        return [v]; // string/number -> [v]
    };

    const renderPrimitive = (v) => {
        if (v == null) return "";
        if (Array.isArray(v)) {
            return v.length === 1 ? String(v[0] ?? "") : v.map(String).join(", ");
        }
        if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            return String(v);
        }
        try {
            return JSON.stringify(v);
        } catch {
            return "";
        }
    };


    const renderSearchValue = (v) => {
        const items = normalizeArrayLike(v).filter(Boolean);

        if (items.length === 0) return null;

        const isPrimitiveList = items.every(
            (x) => typeof x === "string" || typeof x === "number" || typeof x === "boolean"
        );
        if (isPrimitiveList) {
            return <span>{items.map(renderPrimitive).join(", ")}</span>;
        }

        return (
            <ul style={{ margin: 0, paddingLeft: "18px" }}>
                {items.map((it, idx) => {
                    const obj = it && typeof it === "object" ? it : {};
                    const title =
                        typeof obj.title === "string"
                            ? obj.title
                            : (obj.title?.rendered ?? obj.name ?? "(sem título)");

                    const url = typeof obj.url === "string" ? obj.url : null;
                    const type = obj.type ? String(obj.type) : "Item";

                    return (
                        <li key={obj.id ?? idx}>
                            {url ? (
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    {title}
                                </a>
                            ) : (
                                <span>{title}</span>
                            )}
                            {" "}
                            <small style={{ opacity: 0.75 }}>({type})</small>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const label = field.config?.label ?? "Unknow title";

    switch (field.type) {
        case "text":
        case "phone":
        case "address":
        case "number":
        case "email":
        case "datepicker": {
            const text = renderPrimitive(value);
            return text ? (
                <div className="list-item">
                    <dt>{label}</dt>
                    <dd>{text}</dd>
                </div>
            ) : null;
        }

        case "upload": {
            const text = renderPrimitive(value);
            return text ? (
                <div>
                    <p><strong>{label}</strong></p>
                    <Button
                        variant="secondary"
                        onClick={() => handleDownload(fieldId)}
                        iconPosition="left"
                        icon={download}
                    >
                        {text}
                    </Button>
                </div>
            ) : null;
        }

        case "radio": {
            const text = renderPrimitive(value);
            return text ? (
                <div className="list-item">
                    <dt>{label}</dt>
                    <dd>{text}</dd>
                </div>
            ) : null;
        }

        case "select": {
            const arr = Array.isArray(value) ? value : normalizeArrayLike(value);
            const text = arr.length ? arr.map(renderPrimitive).join(", ") : "";
            return text ? (
                <div className="list-item">
                    <dt>{label}</dt>
                    <dd>{text}</dd>
                </div>
            ) : null;
        }

        case "search": {
            const rendered = renderSearchValue(value);
            return rendered ? (
                <div className="list-item">
                    <dt>Tainacan</dt>
                    <dd>{rendered}</dd>
                </div>
            ) : null;
        }

        default:
            return null;
    }
};

export default MetaFieldDisplay;
