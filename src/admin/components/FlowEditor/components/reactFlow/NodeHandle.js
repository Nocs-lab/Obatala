import React, { useReducer } from "react";
import { __, sprintf } from "@wordpress/i18n";
import { useFlowContext } from "../../context/FlowContext";
import { Tooltip, __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";
import Reducer, { initialState } from "../../../../redux/reducer";

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

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
                        <span role="img" aria-label={__('Drag', 'obatala')}>⠿</span>
                    </div>
                </Tooltip>
                <h3 className="title my-0">{props?.stageName || props?.nodeId}</h3>
                <Tooltip text={__('Remove step', 'obatala')}>
                    <button
                        type="button"
                        className="close-btn step-header-remove-btn"
                        onClick={() => handleConfirmDelete(props?.nodeId)}
                        aria-label={__('Remove step', 'obatala')}
                    >
                        <CloseIcon />
                    </button>
                </Tooltip>
            </div>
        </>
    );
};

export default NodeHandle;
