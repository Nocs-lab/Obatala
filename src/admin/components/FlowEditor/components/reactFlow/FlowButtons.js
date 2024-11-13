import React, { useRef } from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Button, ButtonGroup } from "@wordpress/components";

const ProcessControls = ({onSave, onCancel}) => {

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
                <Button variant="primary" type="submit" onClick={onSave}>
                    Save changes
                </Button>
                <Button variant="secondary" onClick={onCancel}>
                    Cancel changes
                </Button>
                <Button variant="secondary" onClick={addNewNode}>
                    Add step
                </Button>
                <Button variant="secondary" onClick={onExport}>
                    Exportar JSON
                </Button>
                <Button variant="secondary" onClick={handleImportClick}>
                    Importar JSON
                </Button>
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
