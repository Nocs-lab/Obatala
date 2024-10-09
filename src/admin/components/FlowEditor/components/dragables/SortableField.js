import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TextFieldControls } from "../inputControls/TextFieldControls";
import { NumberFieldControls } from "../inputControls/NumberFieldControls";
import { DatePickerControls } from "../inputControls/DatePickerControls";
import { FileUploadControls } from "../inputControls/FileUploadControls";
import { SelectRadioControls } from "../inputControls/SelectRadioControls";
import { Icon } from "@wordpress/components";
import { edit, trash } from "@wordpress/icons";
import { useDrawer } from "../../context/DrawerContext";
import LabelWithIcon from "../inputControls/LabelWithIcon";
import { useFlowContext } from "../../context/FlowContext";

const SortableField = ({ id, nodeId, title, type, config }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { removeFieldFromNode } = useFlowContext(); // Pega a função do FlowContext
  const [label, setLabel] = useState(title); // Label do campo

  const { toggleDrawer } = useDrawer();

  const handleFieldChange = (field, value) => {
    if (field === "label") {
      setLabel(value);
    }
  };

  const renderFieldControls = () => {
    switch (type) {
      case "text":
      case "email":
      case "phone":
      case "address":
        return (
          <TextFieldControls
            nodeId={nodeId}
            fieldId={id}
            fieldType={type}
            label={label}
            setLabel={setLabel}
            config={config}
          />
        );
      case "number":
        return (
          <NumberFieldControls
            nodeId={nodeId}
            fieldId={id}
            fieldType={type}
            label={label}
            setLabel={setLabel}
            config={config}
          />
        );
      case "datepicker":
        return (
          <DatePickerControls
            nodeId={nodeId}
            fieldId={id}
            fieldType={type}
            label={label}
            setLabel={setLabel}
            config={config}
          />
        );
      case "upload":
        return (
          <FileUploadControls
            nodeId={nodeId}
            fieldId={id}
            fieldType={type}
            label={label}
            setLabel={setLabel}
            config={config}
          />
        );
      case "select":
      case "radio":
        return (
          <SelectRadioControls
            nodeId={nodeId}
            fieldId={id}
            fieldType={type}
            label={label}
            setLabel={setLabel}
            config={config}
          />
        );
      default:
        return null;
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease",
    padding: "2px",
    margin: "4px 0",
    backgroundColor: isDragging ? "#e0f7fa" : "#f9f9f9",
    border: "1px solid #ddd",
    fontSize: "10px",
    borderRadius: "3px",
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "pointer",
    boxShadow: isDragging ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <LabelWithIcon label={config ? config.label : label} type={type} />
        <div
          style={{
            display: "flex",
            justifyContent: "end",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Icon
            icon={edit}
            size={16}
            onClick={() => toggleDrawer(renderFieldControls())}
          />
          {/* Passa o nodeId e o id do campo para remover */}
          <Icon
            icon={trash}
            size={16}
            onClick={() => removeFieldFromNode(nodeId, id)} // Aqui você passa o nodeId e o id do campo
          />
        </div>

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
    </li>
  );
};

export default SortableField;
