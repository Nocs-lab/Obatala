import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  TextControl,
  Notice,
} from "@wordpress/components";

const ProcessTypeForm = ({ onSave, editingProcessType, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (editingProcessType && editingProcessType.meta) {
      setTitle(editingProcessType.title.rendered);
      setDescription(
        Array.isArray(editingProcessType.meta.description)
          ? editingProcessType.meta.description[0]
          : editingProcessType.meta.description || ""
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
        description
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
          <TextControl
            label="Description"
            value={description}
            onChange={(value) => setDescription(value)}
          />
          <CheckboxControl
            label="Accept Attachments"
            checked={acceptAttachments}
            onChange={(checked) => setAcceptAttachments(checked)}
          />
          <CheckboxControl
            label="Accept Tainacan Items"
            checked={acceptTainacanItems}
            onChange={(checked) => setAcceptTainacanItems(checked)}
          />
          <CheckboxControl
            label="Generate Tainacan Items"
            checked={generateTainacanItems}
            onChange={(checked) => setGenerateTainacanItems(checked)}
          />
        </PanelRow>
        <PanelRow>
          <ButtonGroup>
            <Button variant="link" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save
            </Button>
          </ButtonGroup>
        </PanelRow>
      </form>
    </>
  );
};

export default ProcessTypeForm;
