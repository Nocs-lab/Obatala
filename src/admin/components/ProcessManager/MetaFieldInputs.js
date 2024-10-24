import React, { useState } from "react";
import {
  TextControl,
  DatePicker,
  FormFileUpload,
  SelectControl,
  RadioControl,
  TextareaControl,
} from "@wordpress/components";
import { upload } from "@wordpress/icons";
import TainacanSearchControls from "../Tainacan/TainacanSearch";
import TainacanTodoList from "../Tainacan/TainacaTodoList";
const MetaFieldInputs = ({
  field,
  isEditable,
  onFieldChange,
  fieldId,
  initalValue,
}) => {
  const [value, setValue] = useState(initalValue);
  console.log(initalValue, "for field", field);
  const handleChange = (newValue) => {
    setValue(newValue);
    onFieldChange(fieldId, newValue);
  };

  switch (field.type) {
    case "text":
      return (
        <div className="meta-field-wrapper">
          <TextControl
            label={field.config.label}
            value={value}
            onChange={handleChange}
            disabled={!isEditable}
            required={field.config.required}
            help={field.config.helpText}
            min={field.config.min}
            max={field.config.max}
          />
        </div>
      );
    case "datepicker":
      return (
        <div className="meta-field-wrapper">
          {field.config.label}
          {isEditable ? (
            <DatePicker
              currentDate={value}
              onChange={(date) => handleChange(date)}
              disabled={!isEditable}
              required={field.config.required}
              help={field.config.helpText}
            />
          ) : (
            <dl className="description-list">
              <div className="list-item">
                <dt>{field.config.label}</dt>
                <dd>{initalValue}</dd>
              </div>
            </dl>
          )}
          {field.config.helpText}
        </div>
      );
    case "upload":
      return (
        <div className="meta-field-wrapper">
          {field.config.label}
          {isEditable ? (
            <FormFileUpload
              accept="image/*"
              onChange={(event) => console.log(event.currentTarget.files)}
              label={field.config.label}
              disabled={!isEditable}
              required={field.config.required}
              help={field.config.helpText}
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
                <dt>{field.config.label}</dt>
                <dd>{initalValue}</dd>
              </div>
            </dl>
          )}
          {field.config.helpText}
        </div>
      );
    case "number":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <TextControl
              label={field.config.label}
              value={value}
              onChange={(value) => handleChange(value)}
              type="number"
              disabled={!isEditable}
              required={field.config.required}
              help={field.config.helpText}
              min={field.config.min}
              max={field.config.max}
              step={field.config.step}
            />
          ) : (
            <dl className="description-list">
              <div className="list-item">
                <dt>{field.config.label}</dt>
                <dd>{initalValue}</dd>
              </div>
            </dl>
          )}
        </div>
      );
    case "textfield":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <TextareaControl
              label={field.config.label}
              value={value}
              onChange={(newValue) => handleChange(newValue)}
              disabled={!isEditable}
              required={field.config.required}
              help={field.config.helpText}
            />
          ) : (
            <dl className="description-list">
              <div className="list-item">
                <dt>{field.config.label}</dt>
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
              label={field.config.label}
              value={value}
              onChange={(newValue) => handleChange(newValue)}
              options={field.config.options
                .split(",")
                .map((option) => ({ label: option, value: option }))}
              disabled={!isEditable}
              required={field.config.required}
              help={field.config.helpText}
            />
          ) : (
            <dl className="description-list">
              <div className="list-item">
                <dt>{field.config.label}</dt>
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
              label={field.config.label}
              selected={value}
              onChange={(newValue) => handleChange(newValue)}
              options={field.value
                .split(",")
                .map((option) => ({ label: option, value: option }))}
              disabled={!isEditable}
              required={field.config.required}
              help={field.config.helpText}
            />
          ) : (
            <dl className="description-list">
              <div className="list-item">
                <dt>{field.config.label}</dt>
                <dd>{initalValue}</dd>
              </div>
            </dl>
          )}
        </div>
      );
    case "search":
      return (
        <TainacanSearchControls />
      );
    case "tainacan-list":
      return (
        <TainacanTodoList />
      );
    default:
      return null;
  }
};

export default MetaFieldInputs;
