import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  TextControl,
  Notice,
} from "@wordpress/components";


const SectorCreator = ({onSave, editingSector, onCancel}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [notice, setNotice] = useState(null);

    useEffect(() => {
      if (editingSector) {
          setTitle(editingSector.title.rendered);
          setDescription(
            Array.isArray(editingSector.meta.sector_description)
          ? editingSector.meta.sector_description[0]
          : editingSector.meta.sector_description || "");
      }
    }, [editingSector]);

    const handleSave = async(e) => {
        e.preventDefault();

        if (!title) {
            setNotice({ status: "error", message: "Title is required." });
            return;
        }
        const savedSector = {
            title,
            status: 'publish',
            meta: { description }
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

          <ButtonGroup>
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