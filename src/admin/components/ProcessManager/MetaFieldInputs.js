import React, { useState} from "react";
import {
  TextControl,
  DatePicker,
  FormFileUpload,
  SelectControl,
  RadioControl,
  TextareaControl,
} from "@wordpress/components";

const MetaFieldInputs = ({ field, isEditable, onFieldChange, fieldId, initalValue}) => {
  const [value, setValue] = useState(initalValue);

  const handleChange = (newValue) => {
    setValue(newValue);
    onFieldChange(fieldId, newValue);

  };

  switch (field.type) {
    case "text":
      return (
        <div className="meta-field-wrapper">
          <TextControl
            label={field.title}
            value={value}
            onChange={handleChange}
            disabled={!isEditable}
            required
          />
        </div>
      );
    case "datepicker":
      return (
        <div className="meta-field-wrapper">
          <DatePicker
            currentDate={value}
            onChange={(date) => handleChange(date)}
            disabled={!isEditable}
            required
          />
        </div>
      );
    case "upload":
      return (
        <div className="meta-field-wrapper">
          <FormFileUpload
            accept="image/*"
            onChange={(event) => console.log(event.currentTarget.files)}
            label={field.title}
            disabled={!isEditable}
            required
          >
            Upload
          </FormFileUpload>
        </div>
      );
    case "number":
      return (
        <div className="meta-field-wrapper">
          <TextControl
            label={field.title}
            value={value}
            onChange={(value) => handleChange(value)}
            type="number"
            disabled={!isEditable}
            required
          />
        </div>
      );
    case "textfield":
      return (
        <div className="meta-field-wrapper">
          <TextareaControl
            label={field.title}
            value={value}
            onChange={(newValue) => handleChange(newValue)}
            disabled={!isEditable}
            required
          />
        </div>
      );
    case "select":
      return (
        <div className="meta-field-wrapper">
          <SelectControl
            label={field.title}
            value={value}
            onChange={(newValue) => handleChange(newValue)}
            options={field.value
              .split(",")
              .map((option) => ({ label: option, value: option }))}
            disabled={!isEditable}
            required
          />
        </div>
      );
    case "radio":
      return (
        <div className="meta-field-wrapper">
          <RadioControl
            label={field.title}
            selected={value}
            onChange={(newValue) => handleChange(newValue)}
            options={field.value
              .split(",")
              .map((option) => ({ label: option, value: option }))}
            disabled={!isEditable}
            required
          />
        </div>
      );
    default:
      return null;
  }
};

export default MetaFieldInputs;

