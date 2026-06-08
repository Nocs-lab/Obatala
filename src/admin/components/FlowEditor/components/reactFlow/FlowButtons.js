import React, { useRef } from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Button } from "@wordpress/components";
import { check, closeSmall, download, fullscreen, image, plus, upload } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

const ProcessControls = ({onSave, onCancel, toggleFullScreen}) => {
const { addNewNode, addNewNodeConditional, onExport, onImport, exportFlowImage } = useFlowContext();

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
            <div className="group-button">
                <Button icon={check} variant="primary" size="small" type="submit" onClick={onSave}>
                    {__('Save', 'obatala')}
                </Button>
                <Button icon={plus} variant="secondary" size="small" onClick={addNewNode}>
                    {__('Add step', 'obatala')}
                </Button>
                <Button icon={plus} variant="secondary" size="small" onClick={addNewNodeConditional}>
                    {__('Add conditional', 'obatala')}
                </Button>
                <Button icon={closeSmall} variant="secondary" size="small" onClick={onCancel}>
                    {__('Cancel changes', 'obatala')}
                </Button>
                <Button icon={fullscreen} variant="secondary" size="small" onClick={toggleFullScreen}>
                    {__('Fullscreen', 'obatala')}
                </Button>
                <Button icon={image} variant="secondary" size="small" onClick={exportFlowImage}>
                    {__('Export', 'obatala')}
                </Button>
                <Button icon={download} variant="secondary" size="small" onClick={handleExport}>
                    {__('Export JSON', 'obatala')}
                </Button>
                <Button icon={upload} variant="secondary" size="small" onClick={handleImportClick}>
                    {__('Import JSON', 'obatala')}
                </Button>            
            </div>
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
