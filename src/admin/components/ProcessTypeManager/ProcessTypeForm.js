import React, { useState, useEffect } from "react";
import {
  Button,
  TextControl,
  CheckboxControl,
  PanelRow,
  Notice,
} from "@wordpress/components";

const ProcessTypeForm = ({ onSave, editingProcessType, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [acceptAttachments, setAcceptAttachments] = useState(false);
  const [acceptTainacanItems, setAcceptTainacanItems] = useState(false);
  const [generateTainacanItems, setGenerateTainacanItems] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (editingProcessType && editingProcessType.meta) {
      setTitle(editingProcessType.title.rendered);
      setDescription(
        Array.isArray(editingProcessType.meta.description)
          ? editingProcessType.meta.description[0]
          : editingProcessType.meta.description || ""
      );
      setAcceptAttachments(
        Array.isArray(editingProcessType.meta.accept_attachments)
          ? !!editingProcessType.meta.accept_attachments[0]
          : !!editingProcessType.meta.accept_attachments
      );
      setAcceptTainacanItems(
        Array.isArray(editingProcessType.meta.accept_tainacan_items)
          ? !!editingProcessType.meta.accept_tainacan_items[0]
          : !!editingProcessType.meta.accept_tainacan_items
      );
      setGenerateTainacanItems(
        Array.isArray(editingProcessType.meta.generate_tainacan_items)
          ? !!editingProcessType.meta.generate_tainacan_items[0]
          : !!editingProcessType.meta.generate_tainacan_items
      );
    }
  }, [editingProcessType]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!title) {
      setNotice({ status: "error", message: "Title is required." });
      return;
    }

    const updatedProcessType = {
      title,
      status: "publish",
      meta: {
        description,
        accept_attachments: acceptAttachments,
        accept_tainacan_items: acceptTainacanItems,
        generate_tainacan_items: generateTainacanItems,
      },
    };

    try {
      await onSave(updatedProcessType);
      setNotice({
        status: "success",
        message: "Process type saved successfully.",
      });
      // Não limpe os campos após o salvamento, apenas exiba o aviso de sucesso.
    } catch (error) {
      setNotice({ status: "error", message: "Error saving process type." });
    }
  };

  return (
    <>
      <form onSubmit={handleSave}>
        <PanelRow>
          <TextControl
            label="Title"
            value={title}
            onChange={(value) => setTitle(value)}
          />
        </PanelRow>
        <PanelRow>
          <Button isPrimary type="submit">
            Save
          </Button>
          <Button isSecondary onClick={onCancel}>
            Cancel
          </Button>
        </PanelRow>
      </form>
    </>
  );
};

export default ProcessTypeForm;
