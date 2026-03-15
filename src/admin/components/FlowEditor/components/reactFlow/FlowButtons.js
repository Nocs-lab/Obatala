import React, { useRef } from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Button, ButtonGroup, DropdownMenu } from "@wordpress/components";
import { check, closeSmall, fullscreen, menu, plus } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

const ProcessControls = ({onSave, onCancel, toggleFullScreen}) => {
const { addNewNode, addNewNodeConditional, onExport, onImport } = useFlowContext();

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
                        console.error('Formato de arquivo inválido. O JSON deve conter nodes e edges.');
                        alert('Formato de arquivo inválido. O JSON deve conter nodes e edges.');
                    }
                } catch (error) {
                    console.error('Erro ao analisar o arquivo JSON:', error);
                    alert('Erro ao ler o arquivo. Certifique-se de que é um JSON válido.');
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
            <ButtonGroup>
                <Button icon={check} variant="primary" type="submit" onClick={onSave}>
                    {__('Save', 'obatala')}
                </Button>
                <Button icon={closeSmall} onClick={onCancel}>
                    {__('Cancel changes', 'obatala')}
                </Button>
                <Button icon={plus} onClick={addNewNode}>
                    {__('Add step', 'obatala')}
                </Button>
                <Button icon={plus} onClick={addNewNodeConditional}>
                    {__('Add conditional', 'obatala')}
                </Button>
                <Button icon={fullscreen} onClick={toggleFullScreen}>
                    {__('Fullscreen', 'obatala')}
                </Button>
                <DropdownMenu
                    icon={menu}
                    label={__('Select an option', 'obatala')}
                    controls={ [
                        {
                            title: __('Export JSON', 'obatala'),
                            onClick: handleExport,
                        },
                        {
                            title: __('Import JSON', 'obatala'),
                            onClick: handleImportClick,
                        },
                    ] }
                />              
            </ButtonGroup>
            {/* Input invisível para carregar o arquivo JSON */}
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

export default ProcessControls;
