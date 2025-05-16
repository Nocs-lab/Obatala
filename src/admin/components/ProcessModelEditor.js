import React, { useState, useEffect, useRef } from "react";
import {
    Spinner,
    Notice,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import ProcessFlow from "./FlowEditor/ProcessFlow";
import { FlowProvider } from "./FlowEditor/context/FlowContext";
import ProcessControls from "./FlowEditor/components/reactFlow/FlowButtons";
import { DrawerProvider } from "./FlowEditor/context/DrawerContext";

import { useSelect } from "@wordpress/data";
import { store as coreStore } from '@wordpress/core-data';
import { update } from "@wordpress/icons";
import BrandHeader from "./BrandHeader";

const processDataEditor = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("process_type_id");
    const [processData, setProcessData] = useState(null);
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const flowRef = useRef(null); // Referência para acessar os dados do fluxo
    const [flowData, setFlowData] = useState({ nodes: [], edges: [] }); // Novo estado para o flowData
    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);

    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("process_type_id");
    };

    useEffect(() => {
        setIsLoading(true);

        apiFetch({ path: `/obatala/v1/process_type/${id}` })
            .then((typeData) => {
                setProcessData(typeData);
                // Extraindo flowData do processo carregado
                const flowData = typeData.meta.flowData || { nodes: [], edges: [] };
                setFlowData(flowData);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setNotice({ status: "error", message: "Error fetching process type." });
                setIsLoading(false);
            });
    }, [id]);

    const updateNodeSector = async (nodeId, sectorId) => {
        const process_type_id = getProcessIdFromUrl();
        try {
            const response = await apiFetch({
                path: `/obatala/v1/process_type/${process_type_id}/assosiate_sector`,
                method: 'POST',
                data: {
                    sector_id: sectorId,
                    node_id: nodeId,
                }
            });
        } catch (error) {
            console.error('Erro ao associar o setor:', error);
        }
    };

    // funçao para verificar se todos os nos estao conectados
    const areAllNodesConnected = (nodes, edges) => {
        if (nodes.length === 0) return true; // Nenhum nó para verificar

        // Mapeia entradas e saídas de cada nó
        const nodeInputs = new Map();
        const nodeOutputs = new Map();

        nodes.forEach(node => {
            nodeInputs.set(node.id, []);
            nodeOutputs.set(node.id, []);
        });

        edges.forEach(({ source, target }) => {
            if (nodeOutputs.has(source)) nodeOutputs.get(source).push(target);
            if (nodeInputs.has(target)) nodeInputs.get(target).push(source);
        });

        const disconnectedNodes = [];

        nodes.forEach(node => {
            const isStart = node.type === 'startNode';
            const isEnd = node.type === 'endNode';
            const isConditional = node.type === 'customNodeConditional';

            const hasInput = nodeInputs.get(node.id).length > 0;
            const hasOutput = nodeOutputs.get(node.id).length > 0;

            if (!isStart && !isEnd && !hasInput && !hasOutput) {
                disconnectedNodes.push(`Etapa "${node.data?.stageName}" não possui entrada nem saída.`);
            } else {
                if (!isStart && !hasInput) {
                    disconnectedNodes.push((isEnd || isConditional ? 'Nó ' : 'Etapa ') + `"${node.data?.stageName}" não possui entrada.`);
                }

                if (!isEnd && !hasOutput) {
                    disconnectedNodes.push((isStart || isConditional ? 'Nó ' : 'Etapa ') + `"${node.data?.stageName}" não possui saída.`);
                }
            }
        });

        return {
            valid: disconnectedNodes.length === 0,
            messages: disconnectedNodes,
        };
    };

    const getInvalidConditionalNodes = (flowData) => {
        return flowData.nodes.filter(node => {
            if (node.type !== "customNodeConditional") return false;

            const condition = node.data?.condition;
            const inputNode = node.data?.condition?.inputNode;
            const outputNodes = node.data?.condition?.outputNodes;

            const hasValidInput = !!inputNode;
            const hasTwoOutputs = Array.isArray(outputNodes) && outputNodes.length === 2;
            const outputsAreValid = hasTwoOutputs && outputNodes.every(out => out.conditionValue && out.nodeId);

            return !(condition && hasValidInput && outputsAreValid);
        });
    };

    const handleSave = async () => {
        try {
            const flowData = flowRef.current.getFlowData(); // Obtém os dados do flow
            // Cria lista com mensagens de erro
            const errorMessages = [];

            //verifica se todos os nos estão conectados 
            const veriftyConnectivity = areAllNodesConnected(flowData.nodes, flowData.edges);
            if (!veriftyConnectivity.valid) {
                errorMessages.push(...veriftyConnectivity.messages);

            }

            // verifica se todos os nós possuem tempSector definido
            const nodesWithoutSector = flowData.nodes.filter(node => {
                const isIgnored =
                    node.id === "Start" ||
                    node.id === "End" ||
                    node.id.startsWith("Condicional");
                return !isIgnored && !node.tempSector;
            });

            if (nodesWithoutSector.length > 0) {
                errorMessages.push(
                    (nodesWithoutSector.length > 1 ? 'As etapas:' : 'A etapa: ') + `${nodesWithoutSector.map(node => node.data?.stageName).join(', ')} não têm grupo definido.`
                );
            }

            // verifica se todos os nós possuem campos definidos
            const nodesWithoutFields = flowData.nodes.filter(node => {
                const isIgnored =
                    node.id === "Start" ||
                    node.id === "End" ||
                    node.id.startsWith("Condicional");
                const fields = node?.data?.fields;
                return !isIgnored && (!Array.isArray(fields) || fields.length === 0);
            });

            if (nodesWithoutFields.length > 0) {
                errorMessages.push(
                    (nodesWithoutFields.length > 1 ? 'As etapas:' : 'A etapa: ') +
                    `${nodesWithoutFields.map(node => node.data?.stageName).join(', ')} não têm campos definidos.`
                );
            }

            // verifica se todos os nós condicionais possuem campos definidos
            const nodesConditionalWhitoutFields = getInvalidConditionalNodes(flowData);
            if (nodesConditionalWhitoutFields.length > 0) {
                const conditionalErrors = nodesConditionalWhitoutFields.map(condNode => {
                    const incomingEdge = flowData.edges.find(edge => edge.target === condNode.id);

                    const sourceNode = flowData.nodes.find(node => node.id === incomingEdge?.source);

                    const sourceName = sourceNode?.data?.stageName || sourceNode?.id || "Etapa desconhecida";

                    return `A condicional após a etapa "${sourceName}" está incompleta.`;
                });

                errorMessages.push(...conditionalErrors);

            }

            // Se tiver qualquer erro, exibe tudo numerado
            if (errorMessages.length > 0) {
                setNotice({
                    status: "error",
                    message: errorMessages.map((msg, i) => `${i + 1}. ${msg}`).join('\n'),
                });
                return;
            }

            const updatedData = {
                ...processData,
                meta: {
                    flowData, // Armazena os dados de fluxo como meta
                    updateAt: new Date(),
                    user: currentUser?.name
                },
            };

            // Evita recarregar a página
            await apiFetch({
                path: `/obatala/v1/process_type/${id}`,
                method: "PUT",
                data: updatedData,
            });

            await apiFetch({
                path: `/obatala/v1/process_type/${id}/meta`,
                method: "PUT",
                data: updatedData.meta,
            });

            for (const node of flowData.nodes) {
                if (node.tempSector) {
                    try {
                        await updateNodeSector(node.id, node.tempSector);

                        //node.tempSector = null;
                    } catch (error) {
                        console.error(`Erro ao associar setor ao nó ${node.id}:`, error);
                    }
                }
            }

            setProcessData({
                ...processData,
                meta: updatedData.meta,
            });

            setNotice({
                status: "success",
                message: "Process type and meta updated successfully.",
            });
        } catch (error) {
            console.error(error);
            setNotice({
                status: "error",
                message: `Error updating process type and meta: ${error}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Função para alternar para tela cheia
    const toggleFullScreen = () => {
        const element = document.getElementById('flow-container');

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen();
        }
    };

    const handleCancelEditProcessType = () => {
        window.location.href = '?page=process-type-manager';
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (!processData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <BrandHeader />
            <main>
                {notice && (
                    <div className="notice-container">
                        <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                            {notice.message}
                        </Notice>
                    </div>
                )}

                <FlowProvider>
                    <div className="title-container">
                        <h2><small>Manage steps</small>{processData.title.rendered}</h2>
                        <ProcessControls
                            onSave={handleSave}
                            onCancel={handleCancelEditProcessType}
                            toggleFullScreen={toggleFullScreen}
                        />
                    </div>

                    <ProcessFlow
                        ref={flowRef}
                        initialData={flowData}
                        onSave={handleSave}
                        onCancel={handleCancelEditProcessType}
                        toggleFullScreen={toggleFullScreen}
                    />
                </FlowProvider>
            </main>
        </>
    );
};

export default processDataEditor;
