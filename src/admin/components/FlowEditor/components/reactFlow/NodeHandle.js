import React, { useReducer } from "react";
import { __, sprintf } from "@wordpress/i18n";
import { useFlowContext } from "../../context/FlowContext";
import { Tooltip, __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";
import Reducer, { initialState } from "../../../../redux/reducer";

// custom handle for our nodes
const NodeHandle = (props) => {
    const { removeNode } = useFlowContext();
    const [state, dispatch] = useReducer(Reducer, initialState);

    const handleConfirmDelete = (node) => {
        dispatch({ type: 'OPEN_MODAL_NODE_HANDLE', payload: node })
    }

    const handleCancel = () => {
        dispatch({ type: 'CLOSE_MODAL' });
    };

    return (
        <>
            <ConfirmDialog
                isOpen={state.isOpen}
                onConfirm={() => {
                    removeNode(state.node);
                    dispatch({ type: 'CLOSE_MODAL' })
                }}
                onCancel={handleCancel}
            >
                {sprintf(__('Are you sure you want to delete node %s?', 'obatala'), props?.stageName || '')}
            </ConfirmDialog>
            <div className="step-header">
                <Tooltip text={__('Move step', 'obatala')}>
                    <div className="custom-drag-handle">
                        <span role="img" aria-label="drag">⠿</span>
                    </div>
                </Tooltip>
                <Tooltip text={__('Remove step', 'obatala')}>
                    <div className="btn close-btn" onClick={() => handleConfirmDelete(props?.nodeId)}></div>
                </Tooltip>
            </div>
        </>
    );
};

export default NodeHandle;
