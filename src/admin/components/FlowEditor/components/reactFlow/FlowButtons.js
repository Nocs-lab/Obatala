import React, { useRef } from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Button, ButtonGroup, DropdownMenu } from "@wordpress/components";
import { check, closeSmall, fullscreen, menu, plus } from "@wordpress/icons";

const ProcessControls = ({onSave, onCancel, toggleFullScreen}) => {

    const { addNewNode, onExport, onImport } = useFlowContext();

    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const importedData = JSON.parse(e.target.result);
            onImport(importedData); // Chama a função para importar os dados
        };
        reader.readAsText(file);
        }
    };
  
    return (
        <>
            <ButtonGroup>
                <Button icon={check} variant="primary" type="submit" onClick={onSave}>
                    Save
                </Button>
                <Button icon={closeSmall} variant="secondary" onClick={onCancel}>
                    Cancel changes
                </Button>
                <Button icon={plus} variant="secondary" onClick={addNewNode}>
                    Add step
                </Button>
                <Button
                    variant="secondary"
                    onClick={toggleFullScreen}
                    icon={fullscreen}
                >
                    Fullscreen
                </Button>
                <DropdownMenu
                    icon={ menu }
                    label="Select an option"
                    controls={ [
                        {
                            title: 'Exportar JSON',
                            onClick: () => onExport,
                        },
                        {
                            title: 'Importar JSON',
                            onClick: () => handleImportClick,
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
