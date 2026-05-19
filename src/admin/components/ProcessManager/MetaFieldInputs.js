import React, { useEffect, useMemo, useState } from "react";
import { __ } from '@wordpress/i18n';
import {
  TextControl,
  FormFileUpload,
  RadioControl,
  ComboboxControl,
  Button,
} from "@wordpress/components";
import { closeSmall, upload } from "@wordpress/icons";
import TainacanSearchControls from "../Tainacan/TainacanSearch";
import { __experimentalSelectControl as SelectControl } from "@wordpress/components";

const MetaFieldInputs = React.memo(
  ({ field, isEditable, onFieldChange, fieldId, initalValue, noHasPermission, fileInfo, stepId, itemIndex = null, labelOverride = null, uploadTemplateAction = null }) => {
    const [value, setValue] = useState(initalValue);

    useEffect(() => {
      setValue(initalValue);
    }, [stepId, fieldId, itemIndex, initalValue]); 

    const normalizeArrayLike = (v) => {
      if (Array.isArray(v)) return v;
      if (v && typeof v === "object") return Object.values(v);
      return [];
    };

    const normalizedSearchInitial = useMemo(() => {
      return normalizeArrayLike(initalValue);
    }, [stepId, fieldId, itemIndex, initalValue]); 

    const handleChange = (newValue) => {
      setValue(newValue);
      onFieldChange(fieldId, newValue, itemIndex);

      const isValid =
        !field.config?.pattern || new RegExp(field.config.pattern).test(newValue);

      if (!isValid) {
        console.log("Valor inválido");
      }
    };

    const fieldLabel = labelOverride || field.config?.label || __("Unknown Title", "obatala");

    switch (field.type) {
      case "text":
      case "phone":
      case "address":
        return (
          <div className={`meta-field ${field.config?.required ? "required" : ""}`}>
            <TextControl
              label={fieldLabel}
              placeholder={field.config?.placeholder ?? __("Enter a value...", "obatala")}
              value={value ?? ""}
              onChange={handleChange}
              disabled={!isEditable || noHasPermission}
              required={field.config?.required ?? false}
              minLength={field.config?.minLength}
              maxLength={field.config?.maxLength}
              help={field.config?.helpText}
              pattern={field.config?.pattern || undefined}
            />
          </div>
        );

      case "datepicker":
        return (
          <div className="meta-field sm">
            <label>{fieldLabel}</label>
            <input
              type="date"
              value={value ? String(value).split("/").reverse().join("-") : ""}
              onChange={(e) => {
                const formattedDate = e.target.value.split("-").reverse().join("/");
                handleChange(formattedDate);
              }}
              disabled={!isEditable || noHasPermission}
              required={field.config?.required ?? false}
            />
          </div>
        );

      case "upload":
        return (
          <div className="meta-field">
            <p>{fieldLabel}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <FormFileUpload
                accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
                onChange={(event) => handleChange(event.currentTarget.files)}
                disabled={!isEditable || noHasPermission}
                required={field.config?.required ?? false}
                help={field.config?.helpText}
                icon={upload}
                style={{ border: "1px dashed #ccc" }}
              >
                {__("Upload", "obatala")}
              </FormFileUpload>

              {uploadTemplateAction?.show && (
                <Button
                  variant="link"
                  onClick={uploadTemplateAction.onClick}
                  isBusy={uploadTemplateAction.isLoading}
                  disabled={uploadTemplateAction.isLoading || noHasPermission}
                >
                  {uploadTemplateAction.label || __("Download spreadsheet template", "obatala")}
                </Button>
              )}
            </div>

            {fileInfo?.[stepId]?.[fieldId] && (
              <div>
                <p>
                  <strong>{__("File", "obatala")}:</strong> {fileInfo[stepId][fieldId].name}
                </p>
              </div>
            )}
          </div>
        );

      case "number":
        return (
          <div className="meta-field sm">
            <TextControl
              label={fieldLabel}
              min={field.config?.min}
              max={field.config?.max}
              step={field.config?.step}
              value={value ?? ""}
              onChange={(v) => handleChange(v)}
              type="number"
              disabled={!isEditable || noHasPermission}
              required={field.config?.required ?? false}
              help={field.config?.helpText}
            />
          </div>
        );

      case "select":
        return (
          <div className="meta-field">
            <ComboboxControl
              label={fieldLabel}
              value={Array.isArray(value) ? value : []}
              options={field.config?.options.split(",").map((option) => ({
                label: option.trim(),
                value: option.trim(),
              }))}
              onChange={(selectedValue) => {
                const arr = Array.isArray(value) ? value : [];
                if (selectedValue && !arr.includes(selectedValue)) {
                  handleChange([...arr, selectedValue]);
                }
              }}
              disabled={!isEditable || noHasPermission}
            />

            {Array.isArray(value) && value.length > 0 && (
              <div className="combobox-selection">
                {value.map((selected) => (
                  <div key={selected} className="combobox-selected">
                    {selected}
                    <Button
                      icon={closeSmall}
                      onClick={() => handleChange(value.filter((v) => v !== selected))}
                      className="remove-option-button"
                      disabled={!isEditable || noHasPermission}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "radio":
        return (
          <div className="meta-field">
            <RadioControl
              label={fieldLabel}
              selected={value ?? ""}
              onChange={(v) => handleChange(v)}
              options={field.config?.options
                .split(",")
                .map((option) => ({ label: option, value: option }))}
              disabled={!isEditable || noHasPermission}
              required={field.config?.required ?? false}
              help={field.config?.helpText}
            />
          </div>
        );

      case "search":
        return (
          <TainacanSearchControls
            onFieldChange={(selectedItems) => onFieldChange(fieldId, selectedItems, itemIndex)}
            initialValue={normalizedSearchInitial}
            isEditable={isEditable}
            noHasPermission={noHasPermission}
            key={`${stepId}-${fieldId}-${itemIndex ?? 'single'}`}
          />
        );

      case "email":
        return (
          <div className={`meta-field md ${field.config?.required ? "required" : ""}`}>
            <TextControl
              label={fieldLabel}
              placeholder={field.config?.placeholder ?? __("Enter a value...", "obatala")}
              value={value ?? ""}
              type="email"
              onChange={handleChange}
              disabled={!isEditable || noHasPermission}
              required={field.config?.required ?? false}
              minLength={field.config?.minLength}
              maxLength={field.config?.maxLength}
              help={field.config?.helpText}
            />
          </div>
        );

      default:
        return null;
    }
  }
);

export default MetaFieldInputs;
