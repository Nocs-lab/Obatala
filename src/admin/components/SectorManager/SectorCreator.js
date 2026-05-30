import React, { useState, useEffect } from "react";
import { __ } from '@wordpress/i18n';
import {
  Button,
  TextControl,
  SelectControl,
  Notice,
} from "@wordpress/components";


const SectorCreator = ({onSave, editingSector, onCancel}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [notice, setNotice] = useState(null);

    useEffect(() => {
      if (editingSector) {
          setTitle(editingSector.name);
          setDescription(
            Array.isArray(editingSector.description)
          ? editingSector.description[0]
          : editingSector.description || "");
          setStatus(editingSector.status)
      }
    }, [editingSector]);

    const handleSave = async(e) => {
        e.preventDefault();

        if (!title || !description) {
            setNotice({ status: "error", message: __("Title and description are required.", "obatala") });
            return;
        }
        const savedSector = {
            sector_name: title,
            sector_description: description,
            sector_status: editingSector ? status : "Active"
        }

        try {
            await onSave(savedSector);
            setNotice({
                status: "success",
                message: __("Group saved successfully.", "obatala"),
              });
        } catch (error) {
              setNotice({ status: "error", message: __("Error saving group.", "obatala") });
        }
    };

    const handleCancel = () => {
      onCancel();
      setTitle('');
      setDescription('');
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

            {editingSector && (
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
                <Button variant="tertiary" onClick={handleCancel}>
                    {__('Cancel', 'obatala')}
                </Button>
                <Button variant="primary" type="submit">
                    {__('Save', 'obatala')}
                </Button>
            </div>
        </form>
    )
}

export default SectorCreator;