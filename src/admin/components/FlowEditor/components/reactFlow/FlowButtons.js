import React, { useRef } from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Button, DropdownMenu, Icon } from "@wordpress/components";
import { addCard, check, chevronDown, closeSmall, fullscreen, menu } from "@wordpress/icons";
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
                <DropdownMenu
                    icon={addCard}
                    label={__('Elements', 'obatala')}
                    variant="secondary"
                    toggleProps={ {
                        variant: 'secondary',
                        size: 'small',
                        className: 'has-text',
                        children: (
                            <>
                                <span>{ __('Elements', 'obatala') }</span>
                                <Icon icon={ chevronDown } />
                            </>
                        ),
                    } }
                    controls={ [
                        {
                            title: __('Add step', 'obatala'),
                            onClick: () => addNewNode(),
                        },
                        {
                            title: __('Add conditional', 'obatala'),
                            onClick: () => addNewNodeConditional(),
                        },
                    ] }
                />
                <Button icon={fullscreen} variant="secondary" size="small" onClick={toggleFullScreen}>
                    {__('Fullscreen', 'obatala')}
                </Button>
                <DropdownMenu
                    icon={menu}
                    label={__('Actions', 'obatala')}
                    variant="secondary"
                    toggleProps={ {
                        variant: 'secondary',
                        size: 'small',
                        className: 'has-text',
                        children: (
                            <>
                                <span>{ __('Actions', 'obatala') }</span>
                                <Icon icon={ chevronDown } />
                            </>
                        ),
                    } }
                    controls={ [
                        {
                            title: __('Export image', 'obatala'),
                            onClick: () => exportFlowImage(),
                        },
                        {
                            title: __('Export JSON', 'obatala'),
                            onClick: () => handleExport(),
                        },
                        {
                            title: __('Import JSON', 'obatala'),
                            onClick: () => handleImportClick(),
                        },
                    ] }
                />
                <Button icon={closeSmall} variant="secondary" size="small" onClick={onCancel}>
                    {__('Cancel changes', 'obatala')}
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
