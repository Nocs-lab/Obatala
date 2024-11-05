
import React, { useState} from "react";
import {
  TextControl,
  DatePicker,
  FormFileUpload,
  SelectControl,
  RadioControl,
} from "@wordpress/components";
import { upload } from "@wordpress/icons";
import TainacanSearchControls from "../Tainacan/TainacanSearch";

const MetaFieldInputs = React.memo(({ field, isEditable, onFieldChange, fieldId, initalValue}) => {
  const [value, setValue] = useState(initalValue);

  const handleChange = (newValue) => {
    setValue(newValue);
    onFieldChange(fieldId, newValue);

  };

    switch (field.type) {
        case "text":
        case "email":
        case "phone":
        case "address":
            return (
                <div className="meta-field-wrapper">
                    {isEditable ? (
                        <TextControl
                        label={field.config?.label ?? 'Unknow Title'}
                        placeholder={field.config?.placeholder ?? 'Enter a value...'}
                        value={value}
                        onChange={handleChange}
                        disabled={!isEditable}
                        required={field.config?.required ?? false}
                        minLength={field.config?.minLength }
                        maxLength={field.config?.maxLength }
                        help={field.config?.helpText}
                        />
                    ) : (
                        <dl className="description-list">
                            <div className="list-item">
                                <dt>{field.config?.label}</dt>
                                <dd>{initalValue}</dd>
                            </div>
                        </dl>
                    )}
                </div>
            );
    case "datepicker":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <DatePicker
              label={field.config?.label ?? 'Unknow Title'}
              currentDate={field.config?.dateValue}
              onChange={(date) => handleChange(date)}
              disabled={!isEditable}
              required={field.config?.required ?? false}
              help={field.config?.helpText}
            />
          ) : (
            <dl className="description-list">
                <div className="list-item">
                    <dt>{field.config?.label}</dt>
                    <dd>{initalValue}</dd>
                  </div>
            </dl>
          )}
        </div>
      );
    case "upload":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <FormFileUpload
              accept="image/*"
              onChange={(event) => console.log(event.currentTarget.files)}
              label={field.config?.label ?? 'Unknow title'}
              disabled={!isEditable}
              required={field.config?.required ?? false}
              help={field.config?.helpText}
              icon={upload}
              style={{
                border: "1px dashed #ccc",
              }}
            >
              Upload
            </FormFileUpload>
            ) : (
              <dl className="description-list">
                    <div className="list-item">
                        <dt>{field.config?.label}</dt>
                        <dd>{initalValue}</dd>
                    </div>
              </dl>
            )}
        </div>
      );
    case "number":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <TextControl
              label={field.config?.label  ?? 'Unknow title'}
              min={field.config?.min}
              max={field.config?.max}
              step={field.config?.step}
              value={value}
              onChange={(value) => handleChange(value)}
              type="number"
              disabled={!isEditable}
              required={field.config?.required ?? false}
              help={field.config?.helpText}
            />
          ) : (
            <dl className="description-list">
                <div className="list-item">
                    <dt>{field.config?.label}</dt>
                    <dd>{initalValue}</dd>
                </div>
            </dl>
          )}
        </div>
      );
    case "select":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <SelectControl
              label={field.config?.label  ?? 'Unknow title'}
              value={value}
              onChange={(newValue) => handleChange(newValue)}
              options={field.config?.options
                .split(",")
                .map((option) => (
                  { label: option, value: option }))}
              disabled={!isEditable}
              required={field.config?.required ?? false}
              help={field.config?.helpText}
            />
          ) : (
            <dl className="description-list">
                <div className="list-item">
                  <dt>{field.config?.label}</dt>
                  <dd>{initalValue}</dd>
                  </div>
            </dl>
          )}
        </div>
      );
    case "radio":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <RadioControl
              label={field.config?.label  ?? 'Unknow Title'}
              selected={value}
              onChange={(newValue) => handleChange(newValue)}
              options={field.config?.options
                .split(",")
                .map((option) => ({ label: option, value: option }))}
              disabled={!isEditable}
              required={field.config?.required ?? false}
              help={field.config?.helpText}
            />
          ) : (
            <dl className="description-list">
                <div className="list-item">
                    <dt>{field.config?.label}</dt>
                    <dd>{initalValue}</dd>
                </div>
            </dl>
          )}
        </div>
      );
      case "search":
          return (
            <TainacanSearchControls />
          )
    default:
      return null;
  }
});

export default MetaFieldInputs;