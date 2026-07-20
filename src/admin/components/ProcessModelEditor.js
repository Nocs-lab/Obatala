import React, { useState, useEffect, useRef } from "react";
import { __, sprintf } from "@wordpress/i18n";
import {
    Spinner,
    Notice,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import ProcessFlow from "./FlowEditor/ProcessFlow";
import { FlowProvider } from "./FlowEditor/context/FlowContext";
import ProcessControls from "./FlowEditor/components/reactFlow/FlowButtons";
import { DrawerProvider } from "./FlowEditor/context/DrawerContext";
import { fetchMapperProcessModel } from "../api/apiRequests";

import { useSelect } from "@wordpress/data";
import { store as coreStore } from '@wordpress/core-data';
import { update } from "@wordpress/icons";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";

const MAPPER_STATUS_ENABLED = "enabled";
const MAPPER_STATUS_DISABLED = "disabled";

const normalizeMapperStatus = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    return normalized === MAPPER_STATUS_ENABLED || normalized === "habilitado"
        ? MAPPER_STATUS_ENABLED
        : MAPPER_STATUS_DISABLED;
};

const parseMappingData = (mappingData) => {
    if (!mappingData) {
        return null;
    }

    if (typeof mappingData !== "string") {
        return mappingData;
    }

    try {
        return JSON.parse(mappingData);
    } catch (error) {
        console.error("Error parsing mapper data:", error);
        return null;
    }
};

const getMapperStatusFromSavedData = (savedData) => {
    if (!savedData) {
        return MAPPER_STATUS_DISABLED;
    }

    if (savedData.mappings && !Array.isArray(savedData.mappings) && savedData.mappings.status !== undefined) {
        return normalizeMapperStatus(savedData.mappings.status);
    }

    if (savedData.status !== undefined) {
        return normalizeMapperStatus(savedData.status);
    }

    return MAPPER_STATUS_DISABLED;
};

const processDataEditor = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("process_type_id");
    const [processData, setProcessData] = useState(null);
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mapperStatus, setMapperStatus] = useState(MAPPER_STATUS_DISABLED);
    const flowRef = useRef(null); 
    const [flowData, setFlowData] = useState({ nodes: [], edges: [] }); 
    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);
    const isTainacanMapperEnabled = mapperStatus === MAPPER_STATUS_ENABLED;

    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("process_type_id");
    };

    useEffect(() => {
        setIsLoading(true);

        const mapperStatusRequest = fetchMapperProcessModel(id)
            .then((mapperResponse) => {
                return getMapperStatusFromSavedData(parseMappingData(mapperResponse?.mapping_data));
            })
            .catch((error) => {
                console.error("Error fetching mapper status:", error);
                return MAPPER_STATUS_DISABLED;
            });

        Promise.all([
            apiFetch({ path: `/obatala/v1/process_type/${id}` }),
            mapperStatusRequest,
        ])
            .then(([typeData, loadedMapperStatus]) => {
                setProcessData(typeData);
                const flowData = typeData.meta.flowData || { nodes: [], edges: [] };
                setFlowData(flowData);
                setMapperStatus(normalizeMapperStatus(loadedMapperStatus));
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                setNotice({ status: "error", message: __("Error fetching process type.", "obatala") });
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

    const areAllNodesConnected = (nodes, edges) => {
        if (nodes.length === 0) return true; 

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

    const normalizeArrayLike = (v) => {
        if (Array.isArray(v)) return v;
        if (v && typeof v === "object") return Object.values(v);
        return [];
    };

    const isFilled = (v) => v !== null && v !== undefined && String(v).trim() !== "";

    /** Default label when adding a field — must match `NodeContent` / invalid if still unchanged */
    const DEFAULT_FIELD_TITLE = "Campo sem título";

    const getFieldDisplayTitle = (field) => {
        const cfg = field?.config?.label;
        if (typeof cfg === "string" && cfg.trim() !== "") {
            return cfg.trim();
        }
        return (field?.title ?? "").toString().trim();
    };

    const isFieldMissingTitle = (field) => {
        const t = getFieldDisplayTitle(field);
        return t === "" || t === DEFAULT_FIELD_TITLE;
    };

    const getFieldTitleProblems = (flowData) => {
        const problems = [];
        flowData.nodes.forEach((node) => {
            const nid = node.id;
            if (nid === "Start" || nid === "End" || (typeof nid === "string" && nid.startsWith("Condicional"))) {
                return;
            }
            const fields = node?.data?.fields;
            if (!Array.isArray(fields)) {
                return;
            }
            const stageName = node.data?.stageName || nid;
            fields.forEach((field, fieldIndex) => {
                if (isFieldMissingTitle(field)) {
                    problems.push({ stageName, fieldPosition: fieldIndex + 1 });
                }
            });
        });
        return problems;
    };

    const getDuplicateFieldTitles = (flowData) => {
        const duplicates = [];

        flowData.nodes.forEach((node) => {
            const nodeId = String(node?.id || "");
            if (nodeId === "Start" || nodeId === "End" || nodeId.startsWith("Condicional")) {
                return;
            }

            const seenTitles = new Set();
            const duplicateTitles = new Set();
            (Array.isArray(node?.data?.fields) ? node.data.fields : []).forEach((field) => {
                const title = getFieldDisplayTitle(field);
                if (!title || title === DEFAULT_FIELD_TITLE) {
                    return;
                }

                const normalizedTitle = title
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLocaleLowerCase();
                if (seenTitles.has(normalizedTitle)) {
                    duplicateTitles.add(title);
                }
                seenTitles.add(normalizedTitle);
            });

            duplicateTitles.forEach((title) => {
                duplicates.push({
                    stageName: node?.data?.stageName || nodeId,
                    title,
                });
            });
        });

        return duplicates;
    };

    const getInvalidConditionalNodes = (flowData) => {
        return flowData.nodes.filter((node) => {
            if (node.type !== "customNodeConditional") return false;

            const condition = node.data?.condition;

            const inputNode = condition?.inputNode ?? node.data?.inputNode;

            const outputNodesRaw = condition?.outputNodes ?? node.data?.outputNodes;
            const outputNodes = normalizeArrayLike(outputNodesRaw);

            const hasValidInput = isFilled(inputNode);

            const hasAtLeastTwoOutputs = outputNodes.length >= 2;

            const outputsAreValid =
                hasAtLeastTwoOutputs &&
                outputNodes.every((out) => isFilled(out?.conditionValue) && isFilled(out?.nodeId));

            return !(condition && hasValidInput && outputsAreValid);
        });
    };



    const handleSave = async () => {
        try {
            const flowData = flowRef.current.getFlowData(); 
            
            const errorMessages = [];

            const veriftyConnectivity = areAllNodesConnected(flowData.nodes, flowData.edges);
            if (!veriftyConnectivity.valid) {
                errorMessages.push(...veriftyConnectivity.messages);

            }

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

            const fieldTitleProblems = getFieldTitleProblems(flowData);
            if (fieldTitleProblems.length > 0) {
                const detailList = fieldTitleProblems
                    .map((p) =>
                        sprintf(
                            /* translators: 1: step name, 2: field position within the step */
                            __("%1$s (field %2$d)", "obatala"),
                            p.stageName,
                            p.fieldPosition
                        )
                    )
                    .join("; ");
                errorMessages.push(
                    sprintf(
                        /* translators: %s: semicolon-separated list, e.g. "Step A (field 1); Step B (field 2)" */
                        __("Some fields have an empty or default name. Check: %s", "obatala"),
                        detailList
                    )
                );
            }

            const duplicateFieldTitles = getDuplicateFieldTitles(flowData);
            if (duplicateFieldTitles.length > 0) {
                errorMessages.push(
                    sprintf(
                        __("Field names must be unique within each step. Check: %s", "obatala"),
                        duplicateFieldTitles
                            .map(({ stageName, title }) => `${stageName}: ${title}`)
                            .join("; ")
                    )
                );
            }

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

            if (errorMessages.length > 0) {
                setNotice({
                    status: "error",
                    message: (
                        <ol>
                            {errorMessages.map((msg, i) => (
                                <li key={i}>{msg}</li>
                            ))}
                        </ol>
                    ),
                });
                return;
            }
            const updatedData = {
                ...processData,
                meta: {
                    flowData, 
                    updateAt: new Date(),
                    user: currentUser?.name
                },
            };

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
                message: __("Process type and meta updated successfully.", "obatala"),
            });
        } catch (error) {
            console.error(error);
            setNotice({
                status: "error",
                message: __("Error updating process type and meta.", "obatala") + ` ${error}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

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
        return <div>{__('Loading...', 'obatala')}</div>;
    }

    return (
        <>
            <BrandHeader />
            <FlowProvider>
                <div className="title-container">
                    <h2><small>{__('Manage steps', 'obatala')}</small>{processData.title.rendered}</h2>
                    <ProcessControls
                        onSave={handleSave}
                        onCancel={handleCancelEditProcessType}
                        toggleFullScreen={toggleFullScreen}
                    />
                </div>
                <main>
                    {notice && (
                        <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                            {notice.message}
                        </Notice>
                    )}
                    <ProcessFlow
                        ref={flowRef}
                        initialData={flowData}
                        isTainacanMapperEnabled={isTainacanMapperEnabled}
                        onSave={handleSave}
                        onCancel={handleCancelEditProcessType}
                        toggleFullScreen={toggleFullScreen}
                    />
                </main>
            </FlowProvider>
            <BrandFooter />
        </>
    );
};

export default processDataEditor;
