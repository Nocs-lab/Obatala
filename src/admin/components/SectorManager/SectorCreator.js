import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
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
        console.log(editingSector)
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
            setNotice({ status: "error", message: "Title and description is required." });
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
                message: "Sector saved successfully.",
              });
        } catch (error) {
              console.log(error);
              setNotice({ status: "error", message: "Error saving sector." });
        }
    };

    const handleCancel = () => {
      onCancel();
      setTitle('');
      setDescription('');
    };

    return ( 
       <>
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

            {editingSector && (
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

          <ButtonGroup style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px'}}>
            <Button variant="link" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </ButtonGroup>
      </>
    )
}

export default SectorCreator;