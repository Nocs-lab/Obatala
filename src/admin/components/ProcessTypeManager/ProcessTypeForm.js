import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  TextControl,
  Notice,
  PanelRow,
  SelectControl,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { store as coreStore } from '@wordpress/core-data';

const ProcessTypeForm = ({ onSave, editingProcessType, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [notice, setNotice] = useState(null);
  const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);

  useEffect(() => {
    if (editingProcessType && editingProcessType.meta) {
      setTitle(editingProcessType.title.rendered);
      setDescription(
        Array.isArray(editingProcessType.meta.description)
          ? editingProcessType.meta.description[0]
          : editingProcessType.meta.description || ""
      );
      setStatus(
        Array.isArray(editingProcessType.meta.status)
          ? editingProcessType.meta.status[0]
          : editingProcessType.meta.status || ""
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
        status: editingProcessType ? status : "Active" ,
        updateAt: new Date(),
        user: currentUser.name
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
        <form onSubmit={handleSave}>
            {notice && (
                <div className="notice-container">
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                </div>
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

            {editingProcessType && (
              <SelectControl
                label="Status"
                value={status}
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' }
              ]}
              onChange={(value) => setStatus(value)}    
              />
            )}
    
            <ButtonGroup>
                <Button variant="link" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    Save
                </Button>
            </ButtonGroup>
        </form>
    );
};

export default ProcessTypeForm;