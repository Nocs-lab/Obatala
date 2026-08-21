import React, { useState, useEffect, useRef } from "react";
import { __, sprintf } from "@wordpress/i18n";
import {
    Spinner,
    Notice,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import ProcessFlow from "./FlowEditor/ProcessFlow";
import { FlowProvider } from "./FlowEditor/context/FlowContext";
import ModelControls from "./FlowEditor/components/reactFlow/ModelControls";
import FlowControls from "./FlowEditor/components/reactFlow/FlowControls";
import { DrawerProvider } from "./FlowEditor/context/DrawerContext";
import { fetchMapperProcessModel } from "../api/apiRequests";

import { useSelect } from "@wordpress/data";
import { store as coreStore } from '@wordpress/core-data';
import { update } from "@wordpress/icons";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";
import {
    TainacanExportProvider,
    useTainacanExport,
} from "./FlowEditor/context/TainacanExportContext";
import TainacanExportPanel from "./FlowEditor/components/TainacanExportPanel";
import TainacanMappingSummary from "./FlowEditor/components/TainacanMappingSummary";
import { Panel, PanelBody, PanelRow } from "@wordpress/components";


const MAPPER_STATUS_ENABLED = "enabled";
const MAPPER_STATUS_DISABLED = "disabled";
const MAPPER_STATUS_DRAFT = "draft";

const normalizeMapperStatus = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    if (normalized === MAPPER_STATUS_DRAFT || normalized === "rascunho") {
        return MAPPER_STATUS_DRAFT;
    }
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

const TainacanExportPanelTitle = () => {
    const { enabled } = useTainacanExport();
    const badgeClassName = enabled ? "success" : "";
    const badgeLabel = enabled ? __("Active", "obatala") : __("Inactive", "obatala");

    return (
        <>
            <span>{__("Tainacan Export", "obatala")}</span>
            <span className={`badge ${badgeClassName}`}>{badgeLabel}</span>
        </>
    );
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
    const canManageMappers = window.obatalaApp?.can_manage_mappers !== false;
    const exportConfigRef = useRef(null);
    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);
    const isTainacanMapperEnabled = mapperStatus !== MAPPER_STATUS_DISABLED;
    const shouldOpenExportPanel = params.get("section") === "export";

    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("process_type_id");
    };

    useEffect(() => {
        setIsLoading(true);

        const mapperStatusRequest = canManageMappers ? fetchMapperProcessModel(id)
            .then((mapperResponse) => {
                return getMapperStatusFromSavedData(parseMappingData(mapperResponse?.mapping_data));
            })
            .catch((error) => {
                console.error("Error fetching mapper status:", error);
                return MAPPER_STATUS_DISABLED;
            }) : Promise.resolve(MAPPER_STATUS_DISABLED);

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
                disconnectedNodes.push(sprintf(__('Step "%s" has no input or output.', 'obatala'), node.data?.stageName));
            } else {
                if (!isStart && !hasInput) {
                    disconnectedNodes.push(sprintf(__('%1$s "%2$s" has no input.', 'obatala'), isEnd || isConditional ? __('Node', 'obatala') : __('Step', 'obatala'), node.data?.stageName));
                }

                if (!isEnd && !hasOutput) {
                    disconnectedNodes.push(sprintf(__('%1$s "%2$s" has no output.', 'obatala'), isStart || isConditional ? __('Node', 'obatala') : __('Step', 'obatala'), node.data?.stageName));
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
            let flowData = flowRef.current.getFlowData();
            if (canManageMappers && exportConfigRef.current?.prepareFlowData) {
                flowData = exportConfigRef.current.prepareFlowData(flowData);
                setFlowData(flowData);
            }
            
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
                    sprintf(
                        nodesWithoutSector.length > 1
                            ? __('The steps %s do not have a group defined.', 'obatala')
                            : __('The step %s does not have a group defined.', 'obatala'),
                        nodesWithoutSector.map(node => node.data?.stageName).join(', ')
                    )
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
                    sprintf(
                        nodesWithoutFields.length > 1
                            ? __('The steps %s do not have fields defined.', 'obatala')
                            : __('The step %s does not have fields defined.', 'obatala'),
                        nodesWithoutFields.map(node => node.data?.stageName).join(', ')
                    )
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
                        __("Some fields have an empty or default name. Check step: %s", "obatala"),
                        detailList
                    )
                );
            }

            const duplicateFieldTitles = getDuplicateFieldTitles(flowData);
            if (duplicateFieldTitles.length > 0) {
                errorMessages.push(
                    sprintf(
                        __("Field names must be unique within each step. Check step: %s", "obatala"),
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

                    const sourceName = sourceNode?.data?.stageName || sourceNode?.id || __('Unknown step', 'obatala');

                    return sprintf(__('The conditional after step "%s" is incomplete.', 'obatala'), sourceName);
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
            await apiFetch({
                path: `/obatala/v1/process_type/${id}/meta`,
                method: "PUT",
                data: {
                    flowData,
                    updateAt: new Date().toISOString(),
                    user: currentUser?.name || "",
                },
            });

            if (canManageMappers && exportConfigRef.current?.save) {
                await exportConfigRef.current.save();
            }

            for (const node of flowData.nodes) {
                if (node.tempSector) {
                    try {
                        await updateNodeSector(node.id, node.tempSector);

                    } catch (error) {
                console.error(sprintf(__('Error associating group to node %s:', 'obatala'), node.id), error);
                    }
                }
            }

            const savedMeta = await apiFetch({
                path: `/obatala/v1/process_type/${id}/meta`,
            });
            const savedFlowData = savedMeta?.flowData;
            if (
                !savedFlowData
                || !Array.isArray(savedFlowData.nodes)
                || !Array.isArray(savedFlowData.edges)
            ) {
                throw new Error(
                    __("Error updating process type and meta.", "obatala")
                );
            }

            setFlowData(savedFlowData);
            setProcessData({
                ...processData,
                meta: {
                    ...processData.meta,
                    ...savedMeta,
                    flowData: savedFlowData,
                },
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
                <TainacanExportProvider
                    ref={exportConfigRef}
                    processTypeId={id}
                    available={canManageMappers}
                    onStatusChange={(status) => setMapperStatus(normalizeMapperStatus(status))}
                    onNotice={setNotice}
                >
                    <div className="title-container">
                        <h2><small>{__('Process model', 'obatala')}</small>{processData.title.rendered}</h2>
                        <ModelControls
                            onSave={handleSave}
                            onCancel={handleCancelEditProcessType}
                        />
                    </div>
                    <main>
                        {notice && (
                            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                {notice.message}
                            </Notice>
                        )}
                        <Panel header={ __('Gerenciar modelo de processo', 'obatala') }>
                            {canManageMappers && (
                                <PanelBody 
                                    title={ <TainacanExportPanelTitle /> } 
                                    initialOpen={ shouldOpenExportPanel }
                                >
                                    <PanelRow>
                                        <form className="control-container">
                                            <TainacanExportPanel />
                                            <TainacanMappingSummary />
                                        </form>
                                    </PanelRow>
                                </PanelBody>
                            )}
                            <PanelBody 
                                title={ __('Manage steps', 'obatala') } 
                                initialOpen={ true }
                            >
                                <PanelRow>
                                    <FlowControls
                                        toggleFullScreen={toggleFullScreen}
                                    />
                                    <ProcessFlow
                                        ref={flowRef}
                                        initialData={flowData}
                                        isTainacanMapperEnabled={isTainacanMapperEnabled}
                                        onSave={handleSave}
                                        onCancel={handleCancelEditProcessType}
                                        toggleFullScreen={toggleFullScreen}
                                    />
                                </PanelRow>
                            </PanelBody>
                        </Panel>
                    </main>
                </TainacanExportProvider>
            </FlowProvider>
            <BrandFooter />
        </>
    );
};

export default processDataEditor;
