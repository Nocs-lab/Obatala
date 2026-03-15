import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    getSmoothStepPath,
    useReactFlow,
} from "@xyflow/react";
import { Tooltip, __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import { useReducer } from "react";
import Reducer, { initialState } from "../../../../redux/reducer";

export default function CustomEdge({
    id,
    source,
    target,
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
    const { getNodes, setEdges } = useReactFlow();
    const [state, dispatch] = useReducer(Reducer, initialState);

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const nodes = getNodes()
    const sourceNode = nodes.find((node) => node.id === source)?.data?.stageName || `Etapa ${source}`;
    const targetNode = nodes.find((node) => node.id === target)?.data?.stageName || `Etapa ${target}`;

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
                {sprintf(__('Are you sure you want to delete connection between %s and %s?', 'obatala'), sourceNode, targetNode)}
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
                    <Tooltip text={__('Remove connection', 'obatala')}>
                        <div className="btn close-btn" onClick={handleConfirmDelete}></div>
                    </Tooltip>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
