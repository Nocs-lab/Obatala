import React from "react";
import { Button } from "@wordpress/components";
import { download } from "@wordpress/icons";

const MetaFieldDisplay = ({ field, value, handleDownload, fieldId }) => {
    switch (field.type) {
        case "text":
        case "phone":
        case "address":
        case "number":
        case "email":
            return (
                value && (
                    <div className="list-item">
                        <dt>{field.config?.label}</dt>
                        <dd>{value}</dd>
                    </div>
                )
            );
        case "datepicker":
            return (
                value && (
                    <div className="list-item">
                        <dt>{field.config?.label}</dt>
                        <dd>{value}</dd>
                    </div>
                )
            );
        case "upload":
            return (
                value && (
                    <div>
                    <p><strong>{field.config?.label ?? "Unknow title"}</strong></p>
                    <Button
                        variant="secondary"
                        onClick={() => handleDownload(fieldId)}
                        iconPosition="left"
                        icon={download}
                    >
                        {value}
                    </Button>
                </div>
                )
                
            );
        case "select":
        case "radio":
            return (
                value && (
                    <div className="list-item">
                        <dt>{field.config?.label}</dt>
                        <dd>{value}</dd>
                    </div>
                )
            );
        case "search":
            return (
                value && (
                    <div className="list-item">
                        <dt>{field.config?.label}</dt>
                        <dd>{value}</dd>
                    </div>
                )
            );
        default:
            return null;
    }
};

export default MetaFieldDisplay;