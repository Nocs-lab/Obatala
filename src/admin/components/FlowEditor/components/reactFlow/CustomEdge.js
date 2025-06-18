import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    getSmoothStepPath,
    useReactFlow,
} from "@xyflow/react";
import { Tooltip, __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";
import { useReducer } from "react";
import Reducer, { initialState } from "../../../../redux/reducer";

export default function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {
        color: "red"
    },
    markerEnd,
}) {
    const { setEdges } = useReactFlow();
    const [state, dispatch] = useReducer(Reducer, initialState);

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const onEdgeClick = () => {
        setEdges((edges) => edges.filter((edge) => edge.id !== id));
    };

    const handleConfirmDelete = (connection) => {
        dispatch({ type: 'OPEN_MODAL_NODE_CONNECTION', payload: connection })
    }

    const handleCancel = () => {
        dispatch({ type: 'CLOSE_MODAL' });
    };

    return (
        <>
            <ConfirmDialog
                isOpen={state.isOpen}
                onConfirm={() => {
                    onEdgeClick();
                    dispatch({ type: 'CLOSE_MODAL' })
                }}
                onCancel={handleCancel}
            >
                Are you sure you want to delete connection {id}?
            </ConfirmDialog>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 12,
                        pointerEvents: "all",
                    }}
                    className="nodrag nopan"
                >
                    <Tooltip text="Remove connection">
                        <div className="btn close-btn" onClick={handleConfirmDelete}></div>
                    </Tooltip>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
