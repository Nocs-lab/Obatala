import React from "react";
import { TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

const FieldNameControl = ({
    value,
    onChange,
    help,
    required = true,
    placeholder = __("Enter the field name", "obatala"),
}) => (
    <TextControl
        label={__("Field name", "obatala")}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        help={help}
        required={required}
    />
);

export default FieldNameControl;
