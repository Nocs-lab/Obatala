import React, { useRef } from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Button, DropdownMenu, Icon } from "@wordpress/components";
import { check, chevronDown, closeSmall, download, image } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

const ModelControls = ({ onSave, onCancel }) => {
    const { onExport, onImport, exportFlowImage } = useFlowContext();
    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    if (importedData && importedData.nodes && importedData.edges) {
                        onImport(importedData);
                    } else {
                        console.error(__('Invalid file format. The JSON must contain nodes and edges.', 'obatala'));
                        alert(__('Invalid file format. The JSON must contain nodes and edges.', 'obatala'));
                    }
                } catch (error) {
                    console.error(__('Error parsing JSON file:', 'obatala'), error);
                    alert(__('Error reading the file. Make sure it is a valid JSON file.', 'obatala'));
                }
            };
            reader.readAsText(file);
        }
    };

    const handleExport = () => {
        if (typeof onExport === 'function') {
            onExport();
        }
    };

    return (
        <>
            <div className="group-button">
                <Button icon={check} variant="primary" size="small" type="submit" onClick={onSave}>
                    {__('Salvar modelo', 'obatala')}
                </Button>
                <DropdownMenu
                    icon={download}
                    label={__('Data', 'obatala')}
                    variant="secondary"
                    toggleProps={{
                        variant: 'secondary',
                        size: 'small',
                        className: 'has-text',
                        children: (
                            <>
                                <span>{__('Data', 'obatala')}</span>
                                <Icon icon={chevronDown} />
                            </>
                        ),
                    }}
                    controls={[
                        {
                            title: __('Import steps', 'obatala'),
                            onClick: () => handleImportClick(),
                        },
                        {
                            title: __('Export steps', 'obatala'),
                            onClick: () => handleExport(),
                        },
                    ]}
                />
                <Button icon={image} variant="secondary" size="small" onClick={exportFlowImage}>
                    {__('Export image', 'obatala')}
                </Button>
                <Button icon={closeSmall} variant="secondary" size="small" onClick={onCancel}>
                    {__('Cancelar alterações', 'obatala')}
                </Button>
            </div>
            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </>
    );
};

export default ModelControls;
