import React, { useState, useEffect } from 'react';
import { Button, TextControl, CheckboxControl, PanelBody, PanelRow, Notice } from '@wordpress/components';

const ProcessTypeForm = ({ onSave, editingProcessType, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [acceptAttachments, setAcceptAttachments] = useState(false);
    const [acceptTainacanItems, setAcceptTainacanItems] = useState(false);
    const [generateTainacanItems, setGenerateTainacanItems] = useState(false);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        if (editingProcessType) {
            setTitle(editingProcessType.title.rendered || '');
            setDescription(editingProcessType.meta.description || '');
            setAcceptAttachments(!!editingProcessType.meta.accept_attachments[0]);
            setAcceptTainacanItems(!!editingProcessType.meta.accept_tainacan_items[0]);
            setGenerateTainacanItems(!!editingProcessType.meta.generate_tainacan_items[0]);
        }
    }, [editingProcessType]);

    const handleSave = async (event) => {
        event.preventDefault();
        
        if (!title) {
            setNotice({ status: 'error', message: 'Title is required.' });
            return;
        }

        const updatedProcessType = {
            title,
            meta: {
                description,
                accept_attachments: acceptAttachments,
                accept_tainacan_items: acceptTainacanItems,
                generate_tainacan_items: generateTainacanItems,
            },
        };

        try {
            await onSave(updatedProcessType);
            setNotice({ status: 'success', message: 'Process type saved successfully.' });
        } catch (error) {
            setNotice({ status: 'error', message: 'Error saving process type.' });
        }
    };

    return (
        <PanelBody title="Process Type Details" initialOpen={true}>
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}
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
                    <Button isPrimary type="submit">Save</Button>
                    <Button isSecondary onClick={onCancel}>Cancel</Button>
                </PanelRow>
            </form>
        </PanelBody>
    );
};

export default ProcessTypeForm;
