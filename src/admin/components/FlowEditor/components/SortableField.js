import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TextFieldControls,
  NumberFieldControls,
  DatePickerControls,
  FileUploadControls,
  SelectRadioControls
} from "./FieldComponents";  // Importando os controles individuais

const SortableField = ({ id, title, type, value, options, updateField }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [isExpanded, setIsExpanded] = useState(false);  // Estado para controle de expansão
  const [fieldValue, setFieldValue] = useState(value);  // Valor do campo
  const [label, setLabel] = useState(title);  // Label do campo
  const [placeholder, setPlaceholder] = useState("");  // Placeholder do campo
  const [min, setMin] = useState("");  // Valor mínimo
  const [max, setMax] = useState("");  // Valor máximo
  const [fieldOptions, setFieldOptions] = useState(options || "");  // Opções para Select/Radio

  const handleFieldChange = (field, value) => {
    if (field === "label") {
      setLabel(value);
    } else if (field === "placeholder") {
      setPlaceholder(value);
    } else if (field === "min") {
      setMin(value);
    } else if (field === "max") {
      setMax(value);
    } else if (field === "options") {
      setFieldOptions(value);
    } else {
      setFieldValue(value);
    }
    updateField(id, value);  // Atualiza o valor do campo
  };

  const toggleExpand = (e) => {
    setIsExpanded(!isExpanded);  // Alterna entre expandido e minimizado
  };

  const stopPropagation = (e) => {
    e.stopPropagation();  // Impede que o evento de clique atinja o contêiner principal
  };

  const renderFieldControls = () => {
    switch (type) {
      case "text":
      case "email":
      case "phone":
      case "address":
        return (
          <TextFieldControls
            label={label}
            placeholder={placeholder}
            onChange={handleFieldChange}
          />
        );
      case "number":
        return (
          <NumberFieldControls
            label={label}
            min={min}
            max={max}
            onChange={handleFieldChange}
          />
        );
      case "datepicker":
        return (
          <DatePickerControls
            label={label}
            onChange={handleFieldChange}
          />
        );
      case "upload":
        return (
          <FileUploadControls
            label={label}
            onChange={handleFieldChange}
          />
        );
      case "select":
      case "radio":
        return (
          <SelectRadioControls
            label={label}
            options={fieldOptions}
            onChange={handleFieldChange}
          />
        );
      default:
        return null;
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease",
    padding: "5px",
    margin: "4px 0",
    backgroundColor: isDragging ? "#e0f7fa" : "#f9f9f9",
    border: "1px solid #ddd",
    fontSize: "10px",
    borderRadius: "4px",
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "pointer",
    boxShadow: isDragging ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
  };

  return (
    <div>
      <li ref={setNodeRef} style={style} {...attributes} onClick={toggleExpand}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label>{label} ({type})</label>
          {/* Drag handle */}
          <div
            {...listeners} // Listeners aplicados ao ícone de arraste
            style={{
              cursor: "grab",
              backgroundColor: "#ccc",
              borderRadius: "4px",
              padding: "4px",
              marginLeft: "10px",
            }}
            onClick={(e) => e.stopPropagation()} // Evita a expansão ao clicar no drag handle
          >
            <span role="img" aria-label="drag">
              ⠿
            </span>
          </div>
        </div>

        {isExpanded && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#f1f1f1",
              borderRadius: "4px",
              width: "150px",
            }}
            onClick={stopPropagation}  // Impede que o clique no contêiner dos controles minimize o campo
          >
            {renderFieldControls()}
          </div>
        )}
      </li>
    </div>
  );
};

export default SortableField;
