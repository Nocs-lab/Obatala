import React from "react";
import { useFlowContext } from "../../context/FlowContext";
import { Button } from "@wordpress/components";
import { addCard, fullscreen } from "@wordpress/icons";
import { __ } from "@wordpress/i18n";

const FlowControls = ({ toggleFullScreen }) => {
    const { addNewNode, addNewNodeConditional } = useFlowContext();

    return (
        <div className="group-button justify-content-end mb-1 w-100">
            <Button icon={addCard} variant="tertiary" size="small" onClick={addNewNode}>
                {__('Add step', 'obatala')}
            </Button>
            <Button icon={addCard} variant="tertiary" size="small" onClick={addNewNodeConditional}>
                {__('Add conditional', 'obatala')}
            </Button>
            <Button icon={fullscreen} variant="tertiary" size="small" onClick={toggleFullScreen}>
                {__('Fullscreen', 'obatala')}
            </Button>
        </div>
    );
};

export default FlowControls;
