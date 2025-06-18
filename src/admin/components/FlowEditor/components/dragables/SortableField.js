import React, { useReducer, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TextFieldControls } from "../inputControls/TextFieldControls";
import { NumberFieldControls } from "../inputControls/NumberFieldControls";
import { DatePickerControls } from "../inputControls/DatePickerControls";
import { FileUploadControls } from "../inputControls/FileUploadControls";
import { SelectRadioControls } from "../inputControls/SelectRadioControls";
import { Button, ButtonGroup, Icon, Tooltip, __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";
import { edit, dragHandle, trash } from "@wordpress/icons";
import { useDrawer } from "../../context/DrawerContext";
import LabelWithIcon from "../inputControls/LabelWithIcon";
import { useFlowContext } from "../../context/FlowContext";
import TainacanSearchDetails from "../inputControls/TainacanSearch";
import Reducer, { initialState } from "../../../../redux/reducer";

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
  const [state, dispatch] = useReducer(Reducer, initialState);

  const handleConfirmDelete = (nodeId, field) => {
    dispatch({ type: 'OPEN_MODAL_NODE_FIELD', payload: { field: field, nodeId: nodeId } })
  }

  const handleCancel = () => {
    dispatch({ type: 'CLOSE_MODAL' });
  };
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
            isSelect={type === 'select'}
          />
        );
      case "search":
        return (
          <TainacanSearchDetails />
        )
      default:
        return null;
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 250ms ease",
    opacity: isDragging ? 0.8 : 1,
    cursor: isDragging ? "grabbing" : "pointer",
    boxShadow: isDragging ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
  };
  console.log(state.field?.field);

  return (
    <>
      <ConfirmDialog
        isOpen={state.isOpen}
        onConfirm={() => {
          removeFieldFromNode(state.field.nodeId, state.field.field);
          dispatch({ type: 'CLOSE_MODAL' })
        }}
        onCancel={handleCancel}
      >
        Are you sure you want to delete field {id}?
      </ConfirmDialog>
      <li ref={setNodeRef} style={style} {...attributes}>
        <LabelWithIcon label={config ? config.label : label} type={type} />
        <ButtonGroup>
          <Tooltip text="Edit">
            <Button
              icon={<Icon icon={edit} />}
              onClick={() => toggleDrawer(renderFieldControls())}
              size="small"
            />
          </Tooltip>
          {/* Passa o nodeId e o id do campo para remover */}
          <Tooltip text="Remove">
            <Button
              icon={<Icon icon={trash} />}
              onClick={() => handleConfirmDelete(nodeId, id)} // Aqui você passa o nodeId e o id do campo
              size="small"
            />
          </Tooltip>
          {/* Drag handle */}
          <Tooltip text="Reorder">
            <Button
              {...listeners} // Listeners aplicados ao ícone de arraste
              icon={<Icon icon={dragHandle} />}
              onClick={(e) => e.stopPropagation()} // Evita a expansão ao clicar no drag handle
              size="small"
            />
          </Tooltip>
        </ButtonGroup>
      </li>
    </>
  );
};

export default SortableField;
