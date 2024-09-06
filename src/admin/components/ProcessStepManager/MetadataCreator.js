import React, { useState, useEffect } from "react";
import {
  Button,
  TextControl,
  SelectControl,
  Panel,
  PanelHeader,
  PanelBody,
  PanelRow,
  Notice,
  DateTimePicker,
  CheckboxControl,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";

const MetadataCreator = ({ stepId, onMetaFieldAdded }) => {
  const [fieldTitle, setFieldTitle] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [fieldValue, setFieldValue] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notice, setNotice] = useState(null);
  const [currentMetaFields, setCurrentMetaFields] = useState([]);

  useEffect(() => {
    fetchCurrentMetaFields();
  }, []);

  const fetchCurrentMetaFields = () => {
    apiFetch({ path: `/obatala/v1/process_step/${stepId}/meta` })
      .then((data) => {
        // Garantir que data é um array
        setCurrentMetaFields(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching current metadata:", error);
      });
  };

  const handleAddMetaField = () => {
    if (!fieldTitle) {
      setNotice({ status: "error", message: "Field title cannot be empty." });
      return;
    }

    const newField = {
      title: fieldTitle,
      type: fieldType,
      value: fieldValue,
      ...(fieldType === "datepicker" && { dateFormat, startDate, endDate }),
    };

    const updatedFields = [...currentMetaFields, newField];

    apiFetch({
      path: `/obatala/v1/process_step/${stepId}/meta`,
      method: "POST",
      data: { meta_fields: updatedFields },
    })
      .then(() => {
        onMetaFieldAdded(newField);
        setFieldTitle("");
        setFieldType("text");
        setFieldValue("");
        setDateFormat("");
        setStartDate(null);
        setEndDate(null);
        setNotice({ status: "success", message: "Field added successfully." });
        setCurrentMetaFields(updatedFields);
      })
      .catch((error) => {
        console.error("Error adding field:", error);
        setNotice({ status: "error", message: "Error adding field." });
      });
  };

  const renderConditionalFields = () => {
    switch (fieldType) {
      case "datepicker":
        return (
          <>
            <TextControl
              label="Date Format"
              value={dateFormat}
              onChange={(value) => setDateFormat(value)}
              help="Enter the date format (e.g., YYYY-MM-DD)"
            />
            <DateTimePicker
              currentDate={startDate}
              onChange={(date) => setStartDate(date)}
              is24Hour={true}
              __nextRemoveHelpButton
              __nextRemoveResetButton
            />
            <DateTimePicker
              currentDate={endDate}
              onChange={(date) => setEndDate(date)}
              is24Hour={true}
              __nextRemoveHelpButton
              __nextRemoveResetButton
            />
          </>
        );
      case "upload":
        return (
          <TextControl
            label="File URL"
            value={fieldValue}
            onChange={(value) => setFieldValue(value)}
            help="Enter the URL of the file"
          />
        );
      case "number":
        return (
          <>
            <TextControl
              label="Min Value"
              type="number"
              value={fieldValue}
              onChange={(value) => setFieldValue(value)}
            />
            <TextControl
              label="Max Value"
              type="number"
              value={fieldValue}
              onChange={(value) => setFieldValue(value)}
            />
          </>
        );
      case "select":
      case "radio":
        return (
          <TextControl
            label="Options"
            value={fieldValue}
            onChange={(value) => setFieldValue(value)}
            help="Enter the options separated by commas"
          />
        );
      default:
        return null;
    }
  };

  return (
    <PanelBody title="Add Metadata Field">
      {notice && (
        <Notice
          status={notice.status}
          isDismissible
          onRemove={() => setNotice(null)}
        >
          {notice.message}
        </Notice>
      )}
      <PanelRow>
        <TextControl
          label="Field Title"
          value={fieldTitle}
          onChange={(value) => setFieldTitle(value)}
        />
        <SelectControl
          label="Field Type"
          value={fieldType}
          options={[
            { label: "Text", value: "text" },
            { label: "Date Picker", value: "datepicker" },
            { label: "Upload", value: "upload" },
            { label: "Number", value: "number" },
            { label: "Text Field", value: "textfield" },
            { label: "Select", value: "select" },
            { label: "Radio", value: "radio" },
          ]}
          onChange={(value) => setFieldType(value)}
        />
        {renderConditionalFields()}
        <Button isPrimary onClick={handleAddMetaField}>
          Save
        </Button>
      </PanelRow>
    </PanelBody>
  );
};

export default MetadataCreator;
