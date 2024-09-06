import React, { useState } from "react";
import { Button, TextControl, SelectControl, DateTimePicker } from "@wordpress/components";

const NodeMetadataCreator = ({ onFieldAdded }) => {
  const [fieldTitle, setFieldTitle] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [fieldValue, setFieldValue] = useState("");
  const [dateFormat, setDateFormat] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Função para lidar com a adição de um novo campo
  const handleAddField = () => {
    if (!fieldTitle) {
      alert("O título do campo é obrigatório.");
      return;
    }

    const newField = {
      title: fieldTitle,
      type: fieldType,
      value: fieldValue,
      ...(fieldType === "datepicker" && { dateFormat, startDate, endDate }),
    };

    onFieldAdded(newField); // Chama o callback para adicionar o campo ao nó

    // Limpa os inputs após adicionar
    setFieldTitle("");
    setFieldType("text");
    setFieldValue("");
    setDateFormat("");
    setStartDate(null);
    setEndDate(null);
  };

  // Renderiza os inputs extras com base no tipo de campo
  const renderConditionalFields = () => {
    switch (fieldType) {
      case "datepicker":
        return (
          <>
            <TextControl
              label="Formato da Data"
              value={dateFormat}
              onChange={(value) => setDateFormat(value)}
              help="Formato da data (e.g., YYYY-MM-DD)"
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
            label="URL do Arquivo"
            value={fieldValue}
            onChange={(value) => setFieldValue(value)}
            help="Informe a URL do arquivo"
          />
        );
      case "number":
        return (
          <>
            <TextControl
              label="Valor Mínimo"
              type="number"
              value={fieldValue}
              onChange={(value) => setFieldValue(value)}
            />
            <TextControl
              label="Valor Máximo"
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
            label="Opções"
            value={fieldValue}
            onChange={(value) => setFieldValue(value)}
            help="Informe as opções separadas por vírgulas"
          />
        );
      default:
        return (
          <TextControl
            label="Valor"
            value={fieldValue}
            onChange={(value) => setFieldValue(value)}
          />
        );
    }
  };

  return (
    <div style={{ padding: "10px", border: "1px solid #ddd", borderRadius: "4px" }}>
      <div style={{ marginBottom: "10px" }}>
        <TextControl
          label="Título do Campo"
          value={fieldTitle}
          onChange={(value) => setFieldTitle(value)}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        <SelectControl
          label="Tipo de Campo"
          value={fieldType}
          options={[
            { label: "Texto", value: "text" },
            { label: "Email", value: "email" },
            { label: "Telefone", value: "phone" },
            { label: "Endereço", value: "address" },
            { label: "Número", value: "number" },
            { label: "Date Picker", value: "datepicker" },
            { label: "Upload", value: "upload" },
            { label: "Select", value: "select" },
            { label: "Radio", value: "radio" },
          ]}
          onChange={(value) => setFieldType(value)}
        />
      </div>
      <div style={{ marginBottom: "10px" }}>
        {renderConditionalFields()}
      </div>
      <Button isPrimary onClick={handleAddField}>
        Adicionar Campo
      </Button>
    </div>
  );
};

export default NodeMetadataCreator;
