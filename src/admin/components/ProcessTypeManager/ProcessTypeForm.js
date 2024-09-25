import React, { useState, useEffect } from "react";
import {
  Button,
  TextControl,
  Notice,
} from "@wordpress/components";

const ProcessTypeForm = ({ onSave, editingProcessType, onCancel }) => {
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (editingProcessType && editingProcessType.meta) {
      setTitle(editingProcessType.title.rendered);
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
        <div className="notice-container">
          {notice && (
            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
              {notice.message}
            </Notice>
          )}

        </div>

          <TextControl
            label="Title"
            value={title}
            onChange={(value) => setTitle(value)}
          />
          <Button isPrimary onClick={handleSave}>
            Save
          </Button>
          <Button isSecondary onClick={onCancel}>
            Cancel
          </Button>
    
    </>
  );
};

export default ProcessTypeForm;