import React, { useState, useEffect } from "react";
import {
  Button,
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
        {notice && (
          <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
            {notice.message}
          </Notice>
        )}
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button isPrimary type="submit">
            Save
          </Button>
          <Button isSecondary onClick={onCancel}>
            Cancel
          </Button>

        </div>

      </form>
    </>
  );
};

export default ProcessTypeForm;
