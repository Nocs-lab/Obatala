import { useState, useEffect } from 'react';
import { Button, TextControl, TextareaControl, CheckboxControl, Panel, PanelBody, PanelRow } from '@wordpress/components';

const ProcessTypeForm = ({ onSave, onCancel, editingProcessType }) => {
    const [processTypeName, setProcessTypeName] = useState('');
    const [processTypeDescription, setProcessTypeDescription] = useState('');
    const [acceptAttachments, setAcceptAttachments] = useState(false);
    const [acceptTainacanItems, setAcceptTainacanItems] = useState(false);
    const [generateTainacanItems, setGenerateTainacanItems] = useState(false);

    useEffect(() => {
        if (editingProcessType) {
            setProcessTypeName(editingProcessType.title.rendered);
            setProcessTypeDescription(editingProcessType.description || '');
            setAcceptAttachments(editingProcessType.accept_attachments ?? false);
            setAcceptTainacanItems(editingProcessType.accept_tainacan_items ?? false);
            setGenerateTainacanItems(editingProcessType.generate_tainacan_items ?? false);
        }
    }, [editingProcessType]);

    const handleSave = () => {
        if (!processTypeName || !processTypeDescription) {
            alert('Field Name and Description cannot be empty.');
            return;
        }

        const processType = {
            status: 'publish',
            title: processTypeName,
            description: processTypeDescription,
            accept_attachments: acceptAttachments,
            accept_tainacan_items: acceptTainacanItems,
            generate_tainacan_items: generateTainacanItems,
        };
        onSave(processType);

        if (!editingProcessType) {
            handleResetForm();
        }
        
    };

    const handleResetForm = () => {
        setProcessTypeName('');
        setProcessTypeDescription('');
        setAcceptAttachments(false);
        setAcceptTainacanItems(false);
        setGenerateTainacanItems(false);
    }

    const handleCancel = () => {
        onCancel();
        setProcessTypeName('');
        setProcessTypeDescription('');
        setAcceptAttachments(false);
        setAcceptTainacanItems(false);
        setGenerateTainacanItems(false);
    };
    

    return (
        <Panel>
            <PanelBody title="Add Process Type" initialOpen={ true }>
                <PanelRow>
                    <TextControl
                        label="Process Type Name"
                        value={processTypeName}
                        onChange={(value) => setProcessTypeName(value)}
                    />
                    <TextareaControl
                        label="Process Type Description"
                        value={processTypeDescription}
                        onChange={(value) => setProcessTypeDescription(value)}
                    />
                    <CheckboxControl
                        label="Accept Attachments"
                        checked={acceptAttachments}
                        onChange={(value) => setAcceptAttachments(value)}
                    />
                    <CheckboxControl
                        label="Accept Tainacan Items"
                        checked={acceptTainacanItems}
                        onChange={(value) => setAcceptTainacanItems(value)}
                    />
                    <CheckboxControl
                        label="Generate Tainacan Items"
                        checked={generateTainacanItems}
                        onChange={(value) => setGenerateTainacanItems(value)}
                    />
                    {editingProcessType ? (
                        <>
                            <Button isPrimary onClick={handleSave}>
                                Update Process Type
                            </Button>
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button isPrimary onClick={handleSave}>
                            Add Process Type
                        </Button>
                    )}
                </PanelRow>
            </PanelBody>
        </Panel>
    );
};

export default ProcessTypeForm;
