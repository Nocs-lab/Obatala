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
          {isEditable ? (
            <TextControl
              label={field.title}
              value={value}
              onChange={handleChange}
              disabled={!isEditable}
              required
            />
          ) : (
            <dl>
                    <dt>{field.title}</dt>
                    <dd>{initalValue}</dd>
                </dl>
          )}
        </div>
      );
    case "datepicker":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <DatePicker
              currentDate={value}
              onChange={(date) => handleChange(date)}
              disabled={!isEditable}
              required
            />
          ) : (
            <dl>
                  <dt>{field.title}</dt>
                  <dd>{initalValue}</dd>
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
              label={field.title}
              disabled={!isEditable}
              required
            >
              Upload
            </FormFileUpload>
            ) : (
              <dl>
                    <dt>{field.title}</dt>
                    <dd>{initalValue}</dd>
              </dl>
            )}
        </div>
      );
    case "number":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <TextControl
              label={field.title}
              value={value}
              onChange={(value) => handleChange(value)}
              type="number"
              disabled={!isEditable}
              required
            />
          ) : (
            <dl>
                  <dt>{field.title}</dt>
                  <dd>{initalValue}</dd>
            </dl>
          )}
        </div>
      );
    case "textfield":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
            <TextareaControl
              label={field.title}
              value={value}
              onChange={(newValue) => handleChange(newValue)}
              disabled={!isEditable}
              required
            />
          ) : (
            <dl>
                  <dt>{field.title}</dt>
                  <dd>{initalValue}</dd>
            </dl>
          )}
        </div>
      );
    case "select":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
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
          ) : (
            <dl>
                  <dt>{field.title}</dt>
                  <dd>{initalValue}</dd>
            </dl>
          )}
        </div>
      );
    case "radio":
      return (
        <div className="meta-field-wrapper">
          {isEditable ? (
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
          ) : (
            <dl>
                  <dt>{field.title}</dt>
                  <dd>{initalValue}</dd>
            </dl>
          )}
        </div>
      );
    default:
      return null;
  }
};

export default MetaFieldInputs;

