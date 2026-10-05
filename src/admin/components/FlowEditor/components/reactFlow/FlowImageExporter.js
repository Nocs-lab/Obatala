import { useCallback, useEffect } from 'react';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { __ } from '@wordpress/i18n';
import { useFlowContext } from '../../context/FlowContext';

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;

const FlowImageExporter = () => {
    const { getNodes } = useReactFlow();
    const { registerExportFlowImage } = useFlowContext();

    const exportImage = useCallback(async () => {
        const flowNodes = getNodes();
        if (!flowNodes.length) {
            window.alert(__('No steps to export.', 'obatala'));
            return;
        }

        const viewportElement = document.querySelector('.react-flow__viewport');
        if (!viewportElement) {
            window.alert(__('Error exporting diagram.', 'obatala'));
            return;
        }

        const nodesBounds = getNodesBounds(flowNodes);
        const viewport = getViewportForBounds(
            nodesBounds,
            IMAGE_WIDTH,
            IMAGE_HEIGHT,
            0.5,
            2,
            0.1
        );

        try {
            const dataUrl = await toPng(viewportElement, {
                backgroundColor: '#f8fafc',
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                style: {
                    width: `${IMAGE_WIDTH}px`,
                    height: `${IMAGE_HEIGHT}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            });

            const link = document.createElement('a');
            link.download = `process-flow-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting flow diagram:', error);
            window.alert(__('Error exporting diagram.', 'obatala'));
        }
    }, [getNodes]);

    useEffect(() => {
        registerExportFlowImage(exportImage);
        return () => registerExportFlowImage(null);
    }, [exportImage, registerExportFlowImage]);

    return null;
};

export default FlowImageExporter;
