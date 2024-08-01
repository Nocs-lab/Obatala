import React, { useState } from "react";
import {
  TextControl,
  DatePicker,
  FormFileUpload,
  NumberControl,
  SelectControl,
  RadioControl,
  TextareaControl,
} from "@wordpress/components";

const MetaFieldInputs = ({ field }) => {
  const [value, setValue] = useState(field.value);

  const handleChange = (newValue) => {
    setValue(newValue);
    console.log(newValue);
  };

  switch (field.type) {
    case "text":
      return (
        <div className="meta-field-wrapper">
          <TextControl
            label={field.title}
            value={value}
            onChange={handleChange}
          />
        </div>
      );
    case "datepicker":
      return (
        <div className="meta-field-wrapper">
          <DatePicker
            currentDate={value}
            onChange={(date) => handleChange(date)}
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
            value={field.value}
            onChange={(value) => setClassName(value)}
            type="number"
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
          />
        </div>
      );
    default:
      return null;
  }
};

export default MetaFieldInputs;
