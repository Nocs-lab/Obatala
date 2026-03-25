import React, { useState, useEffect } from "react";
import { Button, TextControl, Notice, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
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

        if (!title || !description) {
            setNotice({ status: "error", message: __("Title and description are required.", "obatala") });
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
                message: __("Process type saved successfully.", "obatala"),
            });
            // Não limpe os campos após o salvamento, apenas exiba o aviso de sucesso.
        } catch (error) {
            setNotice({ status: "error", message: __("Error saving process type.", "obatala") });
        }
    };

    return (
        <form onSubmit={handleSave}>
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}
            <TextControl
                label={__("Title", "obatala")}
                value={title}
                onChange={(value) => setTitle(value)}
            />
            <TextControl
                label={__("Description", "obatala")}
                value={description}
                onChange={(value) => setDescription(value)}
            />

            {editingProcessType && (
                <SelectControl
                    label={__("Status", "obatala")}
                    value={status}
                    options={[
                    { label: __('Active', 'obatala'), value: 'Active' },
                    { label: __('Inactive', 'obatala'), value: 'Inactive' }
                ]}
                onChange={(value) => setStatus(value)}    
                />
            )}
    
            <div className="group-button">
                <Button variant="secondary" onClick={onCancel}>
                    {__('Cancel', 'obatala')}
                </Button>
                <Button variant="primary" type="submit">
                    {__('Save', 'obatala')}
                </Button>
            </div>
        </form>
    );
};

export default ProcessTypeForm;