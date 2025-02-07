
import React, { useState} from "react";
import {
  TextControl,
  DatePicker,
  FormFileUpload,
  //SelectControl,
  RadioControl,
  ComboboxControl,
  Button,
} from "@wordpress/components";
import {  closeSmall, upload } from "@wordpress/icons";
import TainacanSearchControls from "../Tainacan/TainacanSearch";
import { __experimentalSelectControl as SelectControl } from '@wordpress/components';

const MetaFieldInputs = React.memo(({ field, isEditable, onFieldChange, fieldId, initalValue, noHasPermission, fileInfo, stepId}) => {
  const [value, setValue] = useState(initalValue);

    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleChange = (newValue) => {
        setValue(newValue); 
        onFieldChange(fieldId, newValue); 
    
        // Validação posterior, para indicar erro ao usuário
        const isValid =
        !field.config?.pattern || new RegExp(field.config.pattern).test(newValue);
    
        if (!isValid) {
            // Exibir mensagem de erro
            console.log("Valor inválido");
        }
    };

    switch (field.type) {
        case "text":
        case "phone":
        case "address":
            return (
                <div className={`meta-field ${field.config?.required ? "required" : ""}`}>
                    <TextControl
                        label={field.config?.label ?? "Unknow Title"}
                        placeholder={field.config?.placeholder ?? "Enter a value..."}
                        value={value}
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
                    <DatePicker
                        label={field.config?.label ?? "Unknow Title"}
                        currentDate={field.config?.dateValue}
                        onChange={(date) => handleChange(formatDate(date))}
                        disabled={!isEditable || noHasPermission}
                        required={field.config?.required ?? false}
                        help={field.config?.helpText}
                    />
                </div>
            );
            case "upload":
              return (
                <div class="meta-field">
                    <p>{field.config?.label ?? "Unknow title"}</p>
                    <FormFileUpload
                        accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"
                        value={value}
                        onChange={(event) => handleChange(event.currentTarget.files)}
                        
                        disabled={!isEditable || noHasPermission}
                        required={field.config?.required ?? false}
                        help={field.config?.helpText}
                        icon={upload}
                        style={{
                            border: "1px dashed #ccc",
                        }}
                    >
                        Upload
                    </FormFileUpload>
    
                    {fileInfo[stepId]?.[fieldId] && (
                        <div>
                            <p><strong>Arquivo:</strong> {fileInfo[stepId][fieldId].name}</p>
                        </div>
                    )}
                </div>
              );
        case "number":
            return (
                <div className="meta-field sm">
                    <TextControl
                        label={field.config?.label ?? "Unknow title"}
                        min={field.config?.min}
                        max={field.config?.max}
                        step={field.config?.step}
                        value={value}
                        onChange={(value) => handleChange(value)}
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
                        label={field.config?.label ?? "Select Options"}
                        value={value || []}
                        options={field.config?.options.split(",").map((option) => ({
                            label: option.trim(),
                            value: option.trim(),
                        }))}
                        onChange={(selectedValue) => {
                            if (selectedValue && !value?.includes(selectedValue)) {
                                handleChange([...(value || []), selectedValue]);
                            }
                        }}
                    />
                    {Array.isArray(value) && value.length > 0 && (
                        <div className="combobox-selection">
                            {value.map((selected) => (
                                <div key={selected} className="combobox-selected">
                                    {selected}
                                    <Button
                                        icon={closeSmall}
                                        onClick={() => {
                                            const updatedValues = value.filter((v) => v !== selected);
                                            handleChange(updatedValues);
                                        }}
                                        className="remove-option-button"
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
                        label={field.config?.label ?? "Unknow Title"}
                        selected={value}
                        onChange={(newValue) => handleChange(newValue)}
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
                    onFieldChange={(selectedItems) =>
                    onFieldChange(fieldId, selectedItems)
                    }
                    initialValue={initalValue}
                    isEditable={isEditable}
                        noHasPermission={noHasPermission}
                />
            );
        case "email":
            return (
                <div className={`meta-field md ${field.config?.required ? "required" : ""}`}>
                    <TextControl
                        label={field.config?.label ?? "Unknow Title"}
                        placeholder={field.config?.placeholder ?? "Enter a value..."}
                        value={value}
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
});

export default MetaFieldInputs;