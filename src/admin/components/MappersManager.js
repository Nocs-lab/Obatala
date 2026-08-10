import React, { useEffect, useMemo, useState } from "react";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";
import apiFetch from "@wordpress/api-fetch";
import Select from 'react-select';
import { __, sprintf } from "@wordpress/i18n";
import { BaseControl, Button, CheckboxControl, Icon, Notice, Panel, PanelRow, SelectControl, Spinner, ToggleControl } from '@wordpress/components';
import { fetchMapperProcessModel, fetchMetadataCollectionsTainacan, fetchProcessModels, fetchFieldsProcessModels, fetchCollectionsTainacan, fetchProcessTypeById, updateProcessTypeMeta } from '../api/apiRequests';

const DEFAULT_DECISION_CONFIG = {
    quantity_field_id: '',
    quantity_fallback: '1',
    multi_or_single_field_id: '',
    data_entry_mode_field_id: '',
    spreadsheet_upload_field_id: '',
    same_values_mode_field_id: '',
    same_values_unique_id_field_id: '',
    same_values_prefix_mode_field_id: '',
    same_values_prefix_text_field_id: '',
    same_values_id_prefix: '',
};

const MAPPER_STATUS_ENABLED = 'enabled';
const MAPPER_STATUS_DISABLED = 'disabled';

const DECISION_FIELD_TYPES = ['radio'];
const PROFILE_SELECTOR_HELP_TEXT = __('Select the export collection that will be used in this process.', 'obatala');
const FIXED_DECISION_VALUES = {
    multi_items_value: 'Sim',
    single_item_value: 'Não',
    upload_mode_value: 'Planilha',
    fill_mode_value: 'Manual',
    same_values_enabled_value: 'Sim',
};

const CONTROL_FIELD_IDS = {
    profile_selector_field_id: 'obatala_ctrl_collection_selector',
    multi_or_single_field_id: 'obatala_ctrl_multi_or_single',
    quantity_field_id: 'obatala_ctrl_quantity',
    data_entry_mode_field_id: 'obatala_ctrl_entry_mode',
    spreadsheet_upload_field_id: 'obatala_ctrl_spreadsheet_upload',
    same_values_mode_field_id: 'obatala_ctrl_same_values_mode',
    same_values_unique_id_field_id: 'obatala_ctrl_unique_id',
    same_values_prefix_mode_field_id: 'obatala_ctrl_use_prefix',
    same_values_prefix_text_field_id: 'obatala_ctrl_prefix_text',
};
const FIXED_PROFILE_SELECTOR_FIELD_ID = CONTROL_FIELD_IDS.profile_selector_field_id;

const CONTROL_FIELD_BLUEPRINTS = [
    {
        decisionKey: 'profile_selector_field_id',
        id: CONTROL_FIELD_IDS.profile_selector_field_id,
        type: 'radio',
        label: __('Export collection', 'obatala'),
        options: __('Collection A, Collection B', 'obatala'),
        helpText: PROFILE_SELECTOR_HELP_TEXT,
    },
    {
        decisionKey: 'multi_or_single_field_id',
        id: CONTROL_FIELD_IDS.multi_or_single_field_id,
        type: 'radio',
        label: __('Handle multiple items?', 'obatala'),
        required: true,
        options: 'Sim, Não',
        helpText: __('Choose Sim for multiple items or Não for a single item.', 'obatala'),
    },
    {
        decisionKey: 'quantity_field_id',
        id: CONTROL_FIELD_IDS.quantity_field_id,
        type: 'number',
        label: __('Number of items', 'obatala'),
        required: true,
        conditional: {
            dependsOnFieldId: CONTROL_FIELD_IDS.multi_or_single_field_id,
            operator: 'equals',
            value: 'Sim',
        },
        helpText: __('Enter the number of items to export.', 'obatala'),
    },
    {
        decisionKey: 'data_entry_mode_field_id',
        id: CONTROL_FIELD_IDS.data_entry_mode_field_id,
        type: 'radio',
        label: __('Data source', 'obatala'),
        conditional: {
            dependsOnFieldId: CONTROL_FIELD_IDS.multi_or_single_field_id,
            operator: 'equals',
            value: 'Sim',
        },
        options: 'Manual, Planilha',
        helpText: __('Choose Manual for form entry or Planilha for upload.', 'obatala'),
    },
    {
        decisionKey: 'spreadsheet_upload_field_id',
        id: CONTROL_FIELD_IDS.spreadsheet_upload_field_id,
        type: 'upload',
        label: __('Spreadsheet upload', 'obatala'),
        conditional: {
            dependsOnFieldId: CONTROL_FIELD_IDS.multi_or_single_field_id,
            operator: 'equals',
            value: 'Sim',
        },
        helpText: __('Upload the spreadsheet when the source is Planilha.', 'obatala'),
    },
    {
        decisionKey: 'same_values_mode_field_id',
        id: CONTROL_FIELD_IDS.same_values_mode_field_id,
        type: 'radio',
        label: __('Repeat base data?', 'obatala'),
        conditional: {
            dependsOnFieldId: CONTROL_FIELD_IDS.multi_or_single_field_id,
            operator: 'equals',
            value: 'Sim',
        },
        options: 'Sim, Não',
        helpText: __('Use Sim when multiple items share the same base data.', 'obatala'),
    },
    {
        decisionKey: 'same_values_unique_id_field_id',
        id: CONTROL_FIELD_IDS.same_values_unique_id_field_id,
        type: 'text',
        label: __('Identifier', 'obatala'),
        helpText: __('Enter the field that differentiates each item in the repetition.', 'obatala'),
    },
    {
        decisionKey: 'same_values_prefix_mode_field_id',
        id: CONTROL_FIELD_IDS.same_values_prefix_mode_field_id,
        type: 'radio',
        label: __('Use base prefix?', 'obatala'),
        options: 'Sim, Não',
        conditional: {
            dependsOnFieldId: CONTROL_FIELD_IDS.same_values_mode_field_id,
            operator: 'equals',
            value: 'Sim',
        },
        helpText: __('Choose Sim to automatically fill a base prefix in the identifiers.', 'obatala'),
    },
    {
        decisionKey: 'same_values_prefix_text_field_id',
        id: CONTROL_FIELD_IDS.same_values_prefix_text_field_id,
        type: 'text',
        label: __('Base prefix', 'obatala'),
        conditional: {
            dependsOnFieldId: CONTROL_FIELD_IDS.same_values_prefix_mode_field_id,
            operator: 'equals',
            value: 'Sim',
        },
        helpText: __('Enter the prefix base text (for example: MOEDA-).', 'obatala'),
    },
];

const CONTROL_FIELD_LABEL_BY_ID = CONTROL_FIELD_BLUEPRINTS.reduce((acc, blueprint) => {
    acc[String(blueprint.id)] = String(blueprint.label || '');
    return acc;
}, {});

const enforceFixedDecisionFields = (rawDecisionConfig = {}) => {
    const normalized = normalizeDecisionConfig(rawDecisionConfig);

    return {
        ...normalized,
        multi_or_single_field_id: CONTROL_FIELD_IDS.multi_or_single_field_id,
        quantity_field_id: CONTROL_FIELD_IDS.quantity_field_id,
        data_entry_mode_field_id: CONTROL_FIELD_IDS.data_entry_mode_field_id,
        spreadsheet_upload_field_id: CONTROL_FIELD_IDS.spreadsheet_upload_field_id,
        same_values_mode_field_id: CONTROL_FIELD_IDS.same_values_mode_field_id,
        same_values_unique_id_field_id: CONTROL_FIELD_IDS.same_values_unique_id_field_id,
        same_values_prefix_mode_field_id: CONTROL_FIELD_IDS.same_values_prefix_mode_field_id,
        same_values_prefix_text_field_id: CONTROL_FIELD_IDS.same_values_prefix_text_field_id,
    };
};

const getDefaultControlDecisionConfig = () => ({
    ...enforceFixedDecisionFields(),
});

const normalizeOptionLabel = (value = '') => {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
};

export const buildCollectionSelectorOptionsFromProfiles = (profiles, resolveCollectionLabel) => {
    if (!Array.isArray(profiles)) {
        return [];
    }

    const usedLabels = new Set();

    return profiles
        .map((profile, index) => {
            const collectionId = String(profile?.collection_id || '0');
            if (!collectionId || collectionId === '0') {
                return '';
            }

            const fallbackLabel = String(
                profile?.collection_name
                || sprintf(__('Collection %s', 'obatala'), collectionId || index + 1)
            ).trim();
            const resolved = typeof resolveCollectionLabel === 'function'
                ? String(resolveCollectionLabel(collectionId, fallbackLabel) || '').trim()
                : fallbackLabel;

            return resolved;
        })
        .filter((label) => {
            const normalized = normalizeOptionLabel(label);
            if (!normalized || usedLabels.has(normalized)) {
                return false;
            }

            usedLabels.add(normalized);
            return true;
        });
};

export const syncCollectionSelectorOptionsInFlowData = (rawFlowData, selectorFieldIds, optionLabels) => {
    const normalizedFlowData = normalizeFlowDataShape(rawFlowData);
    const flowData = JSON.parse(JSON.stringify(normalizedFlowData));
    const uniqueFieldIds = [...new Set(
        (Array.isArray(selectorFieldIds) ? selectorFieldIds : [selectorFieldIds])
            .map((fieldId) => String(fieldId || '').trim())
            .filter(Boolean)
    )];
    const normalizedOptionLabels = Array.isArray(optionLabels)
        ? optionLabels.map((label) => String(label || '').trim()).filter(Boolean)
        : [];

    if (!uniqueFieldIds.length || !normalizedOptionLabels.length) {
        return {
            flowData,
            changed: false,
        };
    }

    const optionsAsString = normalizedOptionLabels.join(', ');
    let changed = false;

    flowData.nodes = (Array.isArray(flowData.nodes) ? flowData.nodes : []).map((node) => {
        const nodeData = node?.data && typeof node.data === 'object'
            ? node.data
            : null;
        const nodeFields = Array.isArray(nodeData?.fields)
            ? nodeData.fields
            : null;

        if (!nodeData || !nodeFields) {
            return node;
        }

        let localChanged = false;
        const nextFields = nodeFields.map((field) => {
            const fieldId = String(field?.id || '');
            if (!uniqueFieldIds.includes(fieldId)) {
                return field;
            }

            const fieldCopy = (field && typeof field === 'object') ? { ...field } : {};
            const fieldConfig = (fieldCopy.config && typeof fieldCopy.config === 'object')
                ? { ...fieldCopy.config }
                : {};
            let fieldChanged = false;

            if (String(fieldConfig.options || '') !== optionsAsString) {
                fieldConfig.options = optionsAsString;
                fieldChanged = true;
            }

            if (fieldConfig.required !== true) {
                fieldConfig.required = true;
                fieldChanged = true;
            }

            if (!fieldConfig.helpText) {
                fieldConfig.helpText = PROFILE_SELECTOR_HELP_TEXT;
                fieldChanged = true;
            }

            if (fieldChanged) {
                fieldCopy.config = fieldConfig;
            }

            if (fieldChanged) {
                localChanged = true;
            }

            return fieldCopy;
        });

        if (!localChanged) {
            return node;
        }

        changed = true;
        return {
            ...node,
            data: {
                ...nodeData,
                fields: nextFields,
            },
        };
    });

    return {
        flowData,
        changed,
    };
};

const normalizeDecisionConfig = (raw = {}) => {
    return {
        ...DEFAULT_DECISION_CONFIG,
        ...Object.keys(DEFAULT_DECISION_CONFIG).reduce((acc, key) => {
            if (raw[key] !== undefined && raw[key] !== null) {
                acc[key] = String(raw[key]);
            }
            return acc;
        }, {}),
    };
};

const getFieldMappingsFromSavedData = (savedData) => {
    if (!savedData || !savedData.mappings) return [];
    if (Array.isArray(savedData.mappings)) return savedData.mappings;
    if (savedData.mappings?.field_mappings && Array.isArray(savedData.mappings.field_mappings)) {
        return savedData.mappings.field_mappings;
    }
    return [];
};

const getDecisionRulesFromSavedData = (savedData) => {
    if (!savedData) return normalizeDecisionConfig();
    if (savedData.mappings && !Array.isArray(savedData.mappings) && savedData.mappings.decision_rules) {
        return normalizeDecisionConfig(savedData.mappings.decision_rules);
    }
    if (savedData.decision_rules) {
        return normalizeDecisionConfig(savedData.decision_rules);
    }
    if (savedData.mappings && !Array.isArray(savedData.mappings) && Array.isArray(savedData.mappings.profiles)) {
        const firstProfileWithRules = savedData.mappings.profiles.find(
            (profile) => profile?.decision_rules && typeof profile.decision_rules === 'object'
        );
        if (firstProfileWithRules?.decision_rules) {
            return normalizeDecisionConfig(firstProfileWithRules.decision_rules);
        }
    }
    return normalizeDecisionConfig();
};

const getProfileSelectorFieldIdFromSavedData = (savedData) => {
    if (!savedData) return '';
    if (savedData.mappings && !Array.isArray(savedData.mappings) && savedData.mappings.profile_selector_field_id) {
        return String(savedData.mappings.profile_selector_field_id);
    }
    if (savedData.profile_selector_field_id) {
        return String(savedData.profile_selector_field_id);
    }
    return '';
};

const normalizeMapperStatus = (status) => {
    const normalized = String(status || '').trim().toLowerCase();
    return normalized === MAPPER_STATUS_ENABLED || normalized === 'habilitado'
        ? MAPPER_STATUS_ENABLED
        : MAPPER_STATUS_DISABLED;
};

const getMapperStatusFromSavedData = (savedData) => {
    if (!savedData) return MAPPER_STATUS_DISABLED;

    if (savedData.mappings && !Array.isArray(savedData.mappings) && savedData.mappings.status !== undefined) {
        return normalizeMapperStatus(savedData.mappings.status);
    }

    if (savedData.status !== undefined) {
        return normalizeMapperStatus(savedData.status);
    }

    return MAPPER_STATUS_DISABLED;
};

const normalizeProfileKey = (value = '') => {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
};

const buildUniqueProfileKey = (baseKey, existingKeys = []) => {
    const normalizedExisting = existingKeys.map((key) => String(key));
    let nextKey = normalizeProfileKey(baseKey) || 'perfil';

    if (!normalizedExisting.includes(nextKey)) {
        return nextKey;
    }

    let suffix = 2;
    while (normalizedExisting.includes(`${nextKey}_${suffix}`)) {
        suffix += 1;
    }

    return `${nextKey}_${suffix}`;
};

const normalizeSavedFieldMappings = (fieldMappings) => {
    if (!Array.isArray(fieldMappings)) {
        return [];
    }

    return fieldMappings
        .filter((mapping) => mapping && typeof mapping === 'object')
        .map((mapping) => ({
            obatala_field: mapping?.obatala_field || {},
            tainacan_metadata_id: String(mapping?.tainacan_metadata_id || ''),
        }))
        .filter((mapping) => mapping?.obatala_field?.value);
};

const createProfileFromCollection = (collectionId, collectionName = '', existingKeys = []) => {
    const normalizedCollectionId = String(collectionId || '0');
    const normalizedCollectionName = String(collectionName || '').trim();
    const keySeed = `colecao_${normalizedCollectionId || existingKeys.length + 1}`;

    return {
        key: buildUniqueProfileKey(keySeed, existingKeys),
        collection_id: normalizedCollectionId,
        collection_name: normalizedCollectionName,
        field_mappings: [],
    };
};

const getProfilesFromSavedData = (savedData) => {
    const mappings = savedData?.mappings;
    const savedProfiles = mappings && !Array.isArray(mappings) && Array.isArray(mappings.profiles)
        ? mappings.profiles
        : null;

    const existingKeys = [];

    if (savedProfiles && savedProfiles.length > 0) {
        return savedProfiles.map((profile, index) => {
            const collectionName = String(
                profile?.collection_name
                || profile?.collection_label
                || profile?.label
                || ''
            ).trim();
            const key = buildUniqueProfileKey(profile?.key || collectionName || `perfil_${index + 1}`, existingKeys);
            existingKeys.push(key);

            return {
                key,
                collection_id: String(profile?.collection_id || '0'),
                collection_name: collectionName,
                field_mappings: normalizeSavedFieldMappings(profile?.field_mappings),
            };
        });
    }

    const legacyMappings = normalizeSavedFieldMappings(getFieldMappingsFromSavedData(savedData));
    const legacyCollectionId = String(savedData?.collection_id || '0');

    if (legacyCollectionId !== '0' || legacyMappings.length > 0) {
        return [{
            key: 'perfil_padrao',
            collection_id: legacyCollectionId,
            collection_name: String(savedData?.collection_name || savedData?.label || __('Default collection', 'obatala')),
            field_mappings: legacyMappings,
        }];
    }

    return [];
};

const extractFieldsFromFlowData = (flowData) => {
    const nodes = Array.isArray(flowData?.nodes) ? flowData.nodes : [];

    return nodes
        .filter((node) => {
            const nodeId = String(node?.id || '');
            return nodeId !== 'Start'
                && nodeId !== 'End'
                && !nodeId.startsWith('Condicional');
        })
        .flatMap((node) => {
            const fields = Array.isArray(node?.data?.fields) ? node.data.fields : [];
            return fields.map((field) => ({
                ...field,
                stage: String(node?.data?.stageName || node?.id || ''),
            }));
        });
};

const normalizeProcessModelFields = (fields) => {
    if (!Array.isArray(fields)) {
        return [];
    }

    return fields
        .filter((field) => field && typeof field === 'object' && field.id)
        .map((field) => ({
            value: String(field.id),
            label: `${field?.config?.label || field?.title || field.id} - ${field.stage || ''}`,
            type: field?.type || '',
            stage: field?.stage || '',
            fieldOptions: field?.config?.options || [],
        }));
};

const mergeProcessModelFields = (...fieldGroups) => {
    const merged = new Map();

    fieldGroups
        .flat()
        .forEach((field) => {
            if (!field || typeof field !== 'object' || !field.id) {
                return;
            }

            const fieldId = String(field.id);
            const existing = merged.get(fieldId) || {};

            merged.set(fieldId, {
                ...existing,
                ...field,
                config: {
                    ...(existing.config || {}),
                    ...(field.config || {}),
                },
                stage: field.stage || existing.stage || '',
            });
        });

    return Array.from(merged.values());
};

const isBusinessNode = (nodeId) => {
    const normalizedId = String(nodeId || '');
    return normalizedId !== 'Start'
        && normalizedId !== 'End'
        && !normalizedId.startsWith('Condicional');
};

const sanitizeForId = (value = '') => {
    return String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();
};

const buildUniqueId = (baseId, usedIds = []) => {
    const usedSet = new Set(usedIds.map((id) => String(id)));
    let candidate = String(baseId || '').trim() || 'item';

    if (!usedSet.has(candidate)) {
        return candidate;
    }

    let suffix = 2;
    while (usedSet.has(`${candidate}_${suffix}`)) {
        suffix += 1;
    }
    return `${candidate}_${suffix}`;
};

const buildControlFieldFromBlueprint = (blueprint) => {
    const config = {
        label: blueprint.label,
        required: blueprint.required === true,
        helpText: blueprint.helpText,
    };

    if (blueprint.options) {
        config.options = blueprint.options;
    }

    if (blueprint.conditional && typeof blueprint.conditional === 'object') {
        config.conditional = {
            dependsOnFieldId: String(blueprint.conditional.dependsOnFieldId || ''),
            operator: String(blueprint.conditional.operator || 'equals'),
            value: String(blueprint.conditional.value || ''),
        };
    }

    return {
        id: blueprint.id,
        type: blueprint.type,
        title: 'Campo sem título',
        config,
    };
};

const normalizeFlowDataShape = (flowData) => {
    let source = flowData;

    if (typeof source === 'string') {
        try {
            source = JSON.parse(source);
        } catch (error) {
            source = {};
        }
    }

    if (Array.isArray(source)) {
        source = source[0] && typeof source[0] === 'object' ? source[0] : {};
    }

    const normalized = (source && typeof source === 'object') ? { ...source } : {};
    normalized.nodes = Array.isArray(normalized.nodes) ? normalized.nodes : [];
    normalized.edges = Array.isArray(normalized.edges) ? normalized.edges : [];
    return normalized;
};

export const ensureControlFieldsInFlowData = (rawFlowData) => {
    const flowData = JSON.parse(JSON.stringify(normalizeFlowDataShape(rawFlowData)));
    let changed = false;
    let createdDefaultStage = false;

    const nodes = Array.isArray(flowData.nodes) ? flowData.nodes : [];
    const edges = Array.isArray(flowData.edges) ? flowData.edges : [];
    flowData.nodes = nodes;
    flowData.edges = edges;

    const getEdgeIds = () => flowData.edges.map((edge) => String(edge?.id || '')).filter(Boolean);
    const edgeExists = (source, target) => flowData.edges.some((edge) => (
        String(edge?.source || '') === String(source)
        && String(edge?.target || '') === String(target)
    ));
    const ensureEdge = (source, target, baseId) => {
        if (edgeExists(source, target)) {
            return false;
        }

        flowData.edges.push({
            id: buildUniqueId(baseId, getEdgeIds()),
            source: String(source),
            target: String(target),
            type: 'buttonedge',
        });
        return true;
    };

    let startNode = nodes.find((node) => String(node?.id || '') === 'Start');
    let endNode = nodes.find((node) => String(node?.id || '') === 'End');

    if (!startNode) {
        const startNodeByType = nodes.find((node) => String(node?.type || '') === 'startNode');
        if (startNodeByType) {
            const previousId = String(startNodeByType?.id || '');
            if (previousId && previousId !== 'Start') {
                startNodeByType.id = 'Start';
                flowData.edges.forEach((edge) => {
                    if (String(edge?.source || '') === previousId) {
                        edge.source = 'Start';
                    }
                    if (String(edge?.target || '') === previousId) {
                        edge.target = 'Start';
                    }
                });
                changed = true;
            }
            startNode = startNodeByType;
        }
    }

    if (!endNode) {
        const endNodeByType = nodes.find((node) => String(node?.type || '') === 'endNode');
        if (endNodeByType) {
            const previousId = String(endNodeByType?.id || '');
            if (previousId && previousId !== 'End') {
                endNodeByType.id = 'End';
                flowData.edges.forEach((edge) => {
                    if (String(edge?.source || '') === previousId) {
                        edge.source = 'End';
                    }
                    if (String(edge?.target || '') === previousId) {
                        edge.target = 'End';
                    }
                });
                changed = true;
            }
            endNode = endNodeByType;
        }
    }

    if (!startNode) {
        const fallbackBusinessNode = nodes.find((node) => isBusinessNode(node?.id));
        const position = fallbackBusinessNode?.position
            ? { x: Number(fallbackBusinessNode.position.x || 0) - 260, y: Number(fallbackBusinessNode.position.y || 0) }
            : { x: -200, y: 130 };

        startNode = {
            id: 'Start',
            type: 'startNode',
            dragHandle: '.custom-drag-handle',
            position,
            data: {
                fields: [],
                stageName: 'Start',
            },
        };

        flowData.nodes.unshift(startNode);
        changed = true;
    }

    if (!endNode) {
        const fallbackBusinessNode = nodes.find((node) => isBusinessNode(node?.id));
        const position = fallbackBusinessNode?.position
            ? { x: Number(fallbackBusinessNode.position.x || 0) + 260, y: Number(fallbackBusinessNode.position.y || 0) }
            : { x: 460, y: 130 };

        endNode = {
            id: 'End',
            type: 'endNode',
            dragHandle: '.custom-drag-handle',
            position,
            data: {
                fields: [],
                stageName: 'End',
            },
        };

        flowData.nodes.push(endNode);
        changed = true;
    }

    const existingNodeIds = flowData.nodes.map((node) => String(node?.id || '')).filter(Boolean);

    const businessNodes = nodes.filter((node) => isBusinessNode(node?.id));
    const startEdge = edges.find((edge) => (
        String(edge?.source || '') === 'Start'
        && businessNodes.some((node) => String(node?.id || '') === String(edge?.target || ''))
    ));

    let targetNode = startEdge
        ? businessNodes.find((node) => String(node?.id || '') === String(startEdge?.target || ''))
        : businessNodes[0];

    if (!targetNode) {
        const stageBaseId = 'Etapa Controle';
        const stageId = buildUniqueId(stageBaseId, existingNodeIds);
        const stagePosition = startNode?.position
            ? { x: Number(startNode.position.x || 0) + 260, y: Number(startNode.position.y || 0) }
            : { x: 120, y: 120 };

        targetNode = {
            id: stageId,
            node_status: 'Stopped',
            type: 'customNode',
            dragHandle: '.custom-drag-handle',
            position: stagePosition,
            data: {
                fields: [],
                stageName: stageId,
            },
        };

        flowData.nodes.push(targetNode);
        changed = true;
        createdDefaultStage = true;

        if (startNode && ensureEdge('Start', stageId, `edge_start_${sanitizeForId(stageId)}`)) {
            changed = true;
        }

        if (endNode && ensureEdge(stageId, 'End', `edge_${sanitizeForId(stageId)}_end`)) {
            changed = true;
        }
    }

    const targetNodeIndex = flowData.nodes.findIndex((node) => String(node?.id || '') === String(targetNode?.id || ''));
    if (targetNodeIndex === -1) {
        return {
            flowData,
            changed,
            createdDefaultStage,
            fixedFieldIds: CONTROL_FIELD_IDS,
        };
    }

    const nodeCopy = { ...flowData.nodes[targetNodeIndex] };
    const nodeDataCopy = (nodeCopy.data && typeof nodeCopy.data === 'object') ? { ...nodeCopy.data } : {};
    const currentFields = Array.isArray(nodeDataCopy.fields) ? [...nodeDataCopy.fields] : [];
    let localFieldChanges = false;
    const controlFieldIds = new Set(CONTROL_FIELD_BLUEPRINTS.map((blueprint) => String(blueprint.id || '')));
    const controlFieldsPresentInOtherNodes = new Set();

    flowData.nodes.forEach((node, nodeIndex) => {
        if (nodeIndex === targetNodeIndex) {
            return;
        }

        const nodeFields = Array.isArray(node?.data?.fields) ? node.data.fields : [];
        nodeFields.forEach((field) => {
            const fieldId = String(field?.id || '');
            if (controlFieldIds.has(fieldId)) {
                controlFieldsPresentInOtherNodes.add(fieldId);
            }
        });
    });

    CONTROL_FIELD_BLUEPRINTS.forEach((blueprint) => {
        const existingIndex = currentFields.findIndex((field) => String(field?.id || '') === blueprint.id);

        if (existingIndex === -1) {
            if (controlFieldsPresentInOtherNodes.has(String(blueprint.id))) {
                return;
            }
            currentFields.push(buildControlFieldFromBlueprint(blueprint));
            localFieldChanges = true;
            return;
        }

        const existingField = currentFields[existingIndex] && typeof currentFields[existingIndex] === 'object'
            ? { ...currentFields[existingIndex] }
            : {};
        const existingConfig = (existingField.config && typeof existingField.config === 'object')
            ? { ...existingField.config }
            : {};
        let fieldChanged = false;

        if (!existingField.type) {
            existingField.type = blueprint.type;
            fieldChanged = true;
        }

        if (!existingField.title) {
            existingField.title = 'Campo sem título';
            fieldChanged = true;
        }

        if (!existingConfig.label) {
            existingConfig.label = blueprint.label;
            fieldChanged = true;
        }

        if (blueprint.options && !existingConfig.options) {
            existingConfig.options = blueprint.options;
            fieldChanged = true;
        }

        const blueprintRequired = blueprint.required === true;
        if (existingConfig.required !== blueprintRequired) {
            existingConfig.required = blueprintRequired;
            fieldChanged = true;
        }

        if (!existingConfig.helpText && blueprint.helpText) {
            existingConfig.helpText = blueprint.helpText;
            fieldChanged = true;
        }

        if (blueprint.conditional && typeof blueprint.conditional === 'object') {
            const nextConditional = {
                dependsOnFieldId: String(blueprint.conditional.dependsOnFieldId || ''),
                operator: String(blueprint.conditional.operator || 'equals'),
                value: String(blueprint.conditional.value || ''),
            };
            const currentConditional = (existingConfig.conditional && typeof existingConfig.conditional === 'object')
                ? existingConfig.conditional
                : null;

            if (
                !currentConditional
                || String(currentConditional.dependsOnFieldId || '') !== nextConditional.dependsOnFieldId
                || String(currentConditional.operator || 'equals') !== nextConditional.operator
                || String(currentConditional.value || '') !== nextConditional.value
            ) {
                existingConfig.conditional = nextConditional;
                fieldChanged = true;
            }
        }

        if (fieldChanged) {
            existingField.config = existingConfig;
            currentFields[existingIndex] = existingField;
            localFieldChanges = true;
        }
    });

    if (localFieldChanges) {
        nodeDataCopy.fields = currentFields;
        nodeCopy.data = nodeDataCopy;
        flowData.nodes[targetNodeIndex] = nodeCopy;
        changed = true;
    }

    return {
        flowData,
        changed,
        createdDefaultStage,
        fixedFieldIds: CONTROL_FIELD_IDS,
    };
};

const applyAutomaticControlDefaults = (decisionConfig, selectorFieldId, availableFieldIds = []) => {
    const availableIds = new Set((availableFieldIds || []).map((id) => String(id)));
    const nextDecisionConfig = normalizeDecisionConfig(decisionConfig || {});
    let nextSelectorFieldId = String(selectorFieldId || '');
    let changed = false;

    const resolveFieldId = (decisionKey) => String(CONTROL_FIELD_IDS[decisionKey] || '');
    const shouldAutoSet = (value) => {
        const normalizedValue = String(value || '');
        if (normalizedValue === '') return true;
        return !availableIds.has(normalizedValue);
    };

    const selectorFixedId = resolveFieldId('profile_selector_field_id');
    if (selectorFixedId && availableIds.has(selectorFixedId) && shouldAutoSet(nextSelectorFieldId)) {
        nextSelectorFieldId = selectorFixedId;
        changed = true;
    }

    [
        'multi_or_single_field_id',
        'quantity_field_id',
        'data_entry_mode_field_id',
        'spreadsheet_upload_field_id',
        'same_values_mode_field_id',
        'same_values_unique_id_field_id',
        'same_values_prefix_mode_field_id',
        'same_values_prefix_text_field_id',
    ].forEach((decisionKey) => {
        const fixedFieldId = resolveFieldId(decisionKey);
        if (!fixedFieldId || !availableIds.has(fixedFieldId)) {
            return;
        }

        if (shouldAutoSet(nextDecisionConfig[decisionKey])) {
            nextDecisionConfig[decisionKey] = fixedFieldId;
            changed = true;
        }
    });

    return {
        changed,
        selectorFieldId: nextSelectorFieldId,
        decisionConfig: nextDecisionConfig,
    };
};

const extractFieldIdsFromFlowData = (flowData) => {
    return extractFieldsFromFlowData(flowData)
        .map((field) => String(field?.id || ''))
        .filter(Boolean);
};

const MappersManager = ({
    embedded = false,
    processTypeId = null,
    processModel = null,
    flowData = null,
    onMappingSaved = null,
    onCancel = null,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProcessModel, setSelectedProcessModel] = useState(null);
    const [stepsProcessModel, setStepsProcessModel] = useState([]);
    const [collectionsTainacan, setCollectionsTainacan] = useState([]);
    const [metadataTainacan, setMetadaTainacan] = useState([]);
    const [mapperStatus, setMapperStatus] = useState(MAPPER_STATUS_DISABLED);
    const [profileSelectorFieldId, setProfileSelectorFieldId] = useState(FIXED_PROFILE_SELECTOR_FIELD_ID);
    const [decisionConfig, setDecisionConfig] = useState(getDefaultControlDecisionConfig());
    const [profiles, setProfiles] = useState([]);
    const [activeProfileKey, setActiveProfileKey] = useState('');
    const isMapperEnabled = mapperStatus === MAPPER_STATUS_ENABLED;
    const selectedProfiles = useMemo(() => {
        return profiles.filter((profile) => String(profile?.collection_id || '0') !== '0');
    }, [profiles]);

    const ensureControlFieldsOnProcessModel = async (processModel) => {
        if (!processModel?.id) {
            return {
                model: processModel,
                availableFieldIds: [],
            };
        }

        const normalizedFlowData = normalizeFlowDataShape(processModel?.meta?.flowData);
        const ensureResult = ensureControlFieldsInFlowData(normalizedFlowData);

        if (ensureResult.changed) {
            await updateProcessTypeMeta(processModel.id, { flowData: ensureResult.flowData });
        }

        const updatedModel = {
            ...processModel,
            meta: {
                ...(processModel.meta || {}),
                flowData: ensureResult.flowData,
            },
        };

        return {
            model: updatedModel,
            availableFieldIds: extractFieldIdsFromFlowData(ensureResult.flowData),
        };
    };

    useEffect(() => {
        const idModel = Number(
            processTypeId || new URLSearchParams(window.location.search).get('process_type_id')
        );

        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [models, collections, mapperResponse] = await Promise.all([
                    fetchProcessModels(),
                    fetchCollectionsTainacan(),
                    fetchMapperProcessModel(idModel),
                ]);

                const filtered = models.find((model) => model.id === idModel);
                const fullModel = filtered?.id ? await fetchProcessTypeById(filtered.id) : null;
                const resolvedModel = processModel || fullModel || filtered || null;
                const resolvedFlowData = flowData || resolvedModel?.meta?.flowData;
                const modelWithCurrentFlow = resolvedModel
                    ? {
                        ...resolvedModel,
                        meta: {
                            ...(resolvedModel.meta || {}),
                            ...(resolvedFlowData ? { flowData: resolvedFlowData } : {}),
                        },
                    }
                    : null;
                let parsedData = null;
                if (mapperResponse?.mapping_data) {
                    parsedData = mapperResponse.mapping_data;
                    if (typeof mapperResponse.mapping_data === 'string') {
                        parsedData = JSON.parse(mapperResponse.mapping_data);
                    }
                }

                const savedMapperStatus = getMapperStatusFromSavedData(parsedData);
                setMapperStatus(savedMapperStatus);

                const modelWithControlFields = modelWithCurrentFlow;

                setSelectedProcessModel(modelWithControlFields);
                setCollectionsTainacan(collections || []);
                let availableFieldIds = extractFieldIdsFromFlowData(
                    normalizeFlowDataShape(modelWithControlFields?.meta?.flowData)
                );
                let stepOptions = [];

                if (modelWithControlFields?.id) {
                    stepOptions = await handleProcessModelSteps(modelWithControlFields.id, modelWithControlFields);
                    if (!availableFieldIds.length) {
                        availableFieldIds = stepOptions.map((field) => String(field?.value || '')).filter(Boolean);
                    }
                }

                if (parsedData) {
                    const normalizedProfiles = getProfilesFromSavedData(parsedData)
                        .filter((profile) => String(profile?.collection_id || '0') !== '0');
                    setProfiles(normalizedProfiles);
                    setActiveProfileKey(normalizedProfiles[0]?.key || '');
                    const normalizedSavedRules = getDecisionRulesFromSavedData(parsedData);
                    const normalizedSavedSelector = getProfileSelectorFieldIdFromSavedData(parsedData);

                    if (savedMapperStatus === MAPPER_STATUS_ENABLED) {
                        const autoDefaults = applyAutomaticControlDefaults(
                            enforceFixedDecisionFields(normalizedSavedRules),
                            normalizedSavedSelector || FIXED_PROFILE_SELECTOR_FIELD_ID,
                            availableFieldIds
                        );
                        setDecisionConfig(enforceFixedDecisionFields(autoDefaults.decisionConfig));
                        setProfileSelectorFieldId(autoDefaults.selectorFieldId || FIXED_PROFILE_SELECTOR_FIELD_ID);
                    } else {
                        setDecisionConfig(enforceFixedDecisionFields(normalizedSavedRules));
                        setProfileSelectorFieldId(FIXED_PROFILE_SELECTOR_FIELD_ID);
                    }
                } else {
                    const defaultProfiles = [];
                    setProfiles(defaultProfiles);
                    setActiveProfileKey('');
                    const defaultControlDecisionConfig = getDefaultControlDecisionConfig();
                    const autoDefaults = applyAutomaticControlDefaults(
                        defaultControlDecisionConfig,
                        FIXED_PROFILE_SELECTOR_FIELD_ID,
                        availableFieldIds
                    );

                    setDecisionConfig(enforceFixedDecisionFields(
                        autoDefaults.changed ? autoDefaults.decisionConfig : defaultControlDecisionConfig
                    ));
                    setProfileSelectorFieldId(autoDefaults.selectorFieldId || FIXED_PROFILE_SELECTOR_FIELD_ID);
                }
            } catch (error) {
                console.error('Erro ao carregar dados iniciais dos mapeadores:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [processTypeId]);

    useEffect(() => {
        if (!embedded || !flowData) {
            return;
        }

        setSelectedProcessModel((previousModel) => {
            if (!previousModel) {
                return previousModel;
            }

            return {
                ...previousModel,
                meta: {
                    ...(previousModel.meta || {}),
                    flowData,
                },
            };
        });

        handleProcessModelSteps(
            Number(processTypeId || selectedProcessModel?.id),
            {
                ...(selectedProcessModel || processModel || {}),
                meta: {
                    ...((selectedProcessModel || processModel)?.meta || {}),
                    flowData,
                },
            }
        );
    }, [embedded, flowData, processTypeId]);

    const currentProfile = useMemo(() => {
        if (!selectedProfiles.length) return null;
        return selectedProfiles.find((profile) => profile.key === activeProfileKey) || selectedProfiles[0];
    }, [selectedProfiles, activeProfileKey]);

    const collectionLabelById = useMemo(() => {
        return (collectionsTainacan || []).reduce((acc, collection) => {
            const id = String(collection?.["WP_Post"]?.ID || '');
            const title = String(collection?.["WP_Post"]?.post_title || '').trim();

            if (id) {
                acc[id] = title || sprintf(__('Collection %s', 'obatala'), id);
            }

            return acc;
        }, {});
    }, [collectionsTainacan]);

    const getCollectionLabel = (collectionId, fallback = '') => {
        const normalizedId = String(collectionId || '');
        if (!normalizedId || normalizedId === '0') {
            return String(fallback || '').trim();
        }
        return collectionLabelById[normalizedId] || String(fallback || sprintf(__('Collection %s', 'obatala'), normalizedId)).trim();
    };

    const configuredCollectionSelectorOptions = useMemo(() => {
        return buildCollectionSelectorOptionsFromProfiles(
            profiles,
            (collectionId, fallback) => getCollectionLabel(collectionId, fallback)
        );
    }, [profiles, collectionLabelById]);

    useEffect(() => {
        if (!isMapperEnabled || !selectedProcessModel?.id || !selectedProcessModel?.meta?.flowData) {
            return;
        }

        const selectorFieldIds = [
            CONTROL_FIELD_IDS.profile_selector_field_id,
            profileSelectorFieldId,
        ];

        const syncResult = syncCollectionSelectorOptionsInFlowData(
            selectedProcessModel.meta.flowData,
            selectorFieldIds,
            configuredCollectionSelectorOptions
        );

        if (!syncResult.changed) {
            return;
        }

        setSelectedProcessModel((prevModel) => {
            if (!prevModel?.id || prevModel.id !== selectedProcessModel.id) {
                return prevModel;
            }

            return {
                ...prevModel,
                meta: {
                    ...(prevModel.meta || {}),
                    flowData: syncResult.flowData,
                },
            };
        });
    }, [
        isMapperEnabled,
        selectedProcessModel,
        configuredCollectionSelectorOptions,
        profileSelectorFieldId,
    ]);

    useEffect(() => {
        if (currentProfile?.collection_id && currentProfile.collection_id !== '0') {
            fetchMetadataCollectionsTainacan(currentProfile.collection_id)
                .then((data) => {
                    setMetadaTainacan(data);
                })
                .catch((error) => {
                    console.error("Erro ao buscar metadados:", error);
                    setMetadaTainacan([]);
                });
        } else {
            setMetadaTainacan([]);
        }
    }, [currentProfile?.collection_id]);

    const handleProcessModelSteps = async (selectedId, processModel = null) => {
        return fetchFieldsProcessModels(selectedId)
            .then((data) => {
                const apiFields = Array.isArray(data) ? data : [];
                const flowFields = processModel?.meta?.flowData
                    ? extractFieldsFromFlowData(processModel.meta.flowData)
                    : [];
                const sourceFields = mergeProcessModelFields(apiFields, flowFields);

                const stepOptions = normalizeProcessModelFields(sourceFields);

                setStepsProcessModel(stepOptions);
                return stepOptions;
            })
            .catch((error) => {
                console.error("Erro ao buscar campos:", error);

                const fallbackFields = processModel?.meta?.flowData
                    ? extractFieldsFromFlowData(processModel.meta.flowData)
                    : [];
                const fallbackStepOptions = normalizeProcessModelFields(fallbackFields);

                setStepsProcessModel(fallbackStepOptions);
                return fallbackStepOptions;
            });
    };

    const updateProfileByKey = (profileKey, updater) => {
        setProfiles((prevProfiles) => prevProfiles.map((profile) => {
            if (profile.key !== profileKey) {
                return profile;
            }
            return typeof updater === 'function' ? updater(profile) : updater;
        }));
    };

    const handleCollectionCheckboxChange = (collectionId, isChecked) => {
        const normalizedCollectionId = String(collectionId || '0');
        if (!normalizedCollectionId || normalizedCollectionId === '0') {
            return;
        }

        if (isChecked) {
            setProfiles((prevProfiles) => {
                if (prevProfiles.some((profile) => String(profile?.collection_id || '0') === normalizedCollectionId)) {
                    return prevProfiles;
                }

                const nextProfile = createProfileFromCollection(
                    normalizedCollectionId,
                    getCollectionLabel(normalizedCollectionId, ''),
                    prevProfiles.map((profile) => profile.key)
                );
                setActiveProfileKey(nextProfile.key);
                return [...prevProfiles, nextProfile];
            });
            return;
        }

        setProfiles((prevProfiles) => prevProfiles.filter(
            (profile) => String(profile?.collection_id || '0') !== normalizedCollectionId
        ));
    };

    const handleRemoveCollectionProfile = (collectionId) => {
        handleCollectionCheckboxChange(collectionId, false);
    };

    const handleSelectChange = (index, field, value) => {
        updateProfileByKey(activeProfileKey, (profile) => {
            const nextMappings = Array.isArray(profile.field_mappings) ? [...profile.field_mappings] : [];
            const currentMapping = nextMappings[index] || { obatala_field: {}, tainacan_metadata_id: '' };

            if (field === 'tainacanMetadata') {
                currentMapping.tainacan_metadata_id = String(value || '');
            }

            if (field === 'obatalaFieldMetadata') {
                currentMapping.obatala_field = value || {};
            }

            nextMappings[index] = currentMapping;

            return {
                ...profile,
                field_mappings: nextMappings,
            };
        });
    };

    const isMetadataSelected = (id, currentIndex) => {
        return (currentProfile?.field_mappings || []).some((mapping, i) => (
            i !== currentIndex && String(mapping?.tainacan_metadata_id || '') === String(id)
        ));
    };

    useEffect(() => {
        if (!selectedProfiles.length) {
            return;
        }

        const activeExists = selectedProfiles.some((profile) => profile.key === activeProfileKey);
        if (!activeExists) {
            setActiveProfileKey(selectedProfiles[0].key);
        }
    }, [selectedProfiles, activeProfileKey]);

    const fieldLabelById = useMemo(() => {
        return stepsProcessModel.reduce((acc, field) => {
            acc[String(field.value)] = field.label;
            return acc;
        }, {});
    }, [stepsProcessModel]);

    const getFieldLabel = (fieldId) => {
        if (!fieldId) return 'Nao definido';
        const normalizedId = String(fieldId);
        return fieldLabelById[normalizedId]
            || CONTROL_FIELD_LABEL_BY_ID[normalizedId]
            || `Field ${fieldId}`;
    };

    const isKnownControlFieldId = (fieldId) => {
        return Boolean(CONTROL_FIELD_LABEL_BY_ID[String(fieldId || '')]);
    };

    const currentProfileMappings = useMemo(() => {
        return Array.isArray(currentProfile?.field_mappings) ? currentProfile.field_mappings : [];
    }, [currentProfile]);

    const selectedSteps = useMemo(() => {
        return currentProfileMappings
            .map((mapping) => {
                const targetValue = String(mapping?.obatala_field?.value || '');
                const matchedStep = stepsProcessModel.find((step) => String(step.value) === targetValue);
                return {
                    value: matchedStep?.value || targetValue,
                    label: matchedStep?.label || mapping?.obatala_field?.label || targetValue,
                    type: matchedStep?.type || mapping?.obatala_field?.type || '',
                    stage: matchedStep?.stage || mapping?.obatala_field?.stage || '',
                };
            })
            .filter((step) => step.value && step.label);
    }, [currentProfileMappings, stepsProcessModel]);

    const selectRows = useMemo(() => {
        return currentProfileMappings.map((mapping) => ({
            obatalaFieldMetadata: {
                value: mapping?.obatala_field?.value,
                label: stepsProcessModel.find((step) => String(step.value) === String(mapping?.obatala_field?.value))?.label || mapping?.obatala_field?.label,
            },
            tainacanMetadata: String(mapping?.tainacan_metadata_id || ''),
        }));
    }, [currentProfileMappings, stepsProcessModel]);

    const firstStageFieldIds = useMemo(() => {
        const flowData = selectedProcessModel?.meta?.flowData;
        const edges = Array.isArray(flowData?.edges) ? flowData.edges : [];
        const nodes = Array.isArray(flowData?.nodes) ? flowData.nodes : [];
        const firstEdge = edges.find((edge) => edge?.source === 'Start');
        const firstNodeId = String(firstEdge?.target || '');
        if (!firstNodeId) {
            return [];
        }

        const firstNode = nodes.find((node) => String(node?.id || '') === firstNodeId);
        const stageKeys = [
            String(firstNode?.id || ''),
            String(firstNode?.data?.stageName || ''),
        ].filter(Boolean);

        return stepsProcessModel
            .filter((field) => stageKeys.includes(String(field.stage || '')))
            .map((field) => String(field.value));
    }, [selectedProcessModel, stepsProcessModel]);

    const buildTypedFieldOptions = (
        allowedTypes,
        placeholder,
        currentValue = '',
        fieldFilter = null,
        incompatibleSuffix = 'tipo nao compativel'
    ) => {
        const filtered = stepsProcessModel.filter((field) => {
            if (!allowedTypes.includes(field.type)) {
                return false;
            }

            return typeof fieldFilter === 'function' ? fieldFilter(field) : true;
        });
        const baseOptions = [
            { label: placeholder, value: '' },
            ...filtered.map((field) => ({
                label: `${field.label}${field.type ? ` [${field.type}]` : ''}`,
                value: String(field.value),
            })),
        ];

        const normalizedCurrent = String(currentValue || '');
        if (normalizedCurrent && !baseOptions.some((option) => option.value === normalizedCurrent)) {
            const suffixLabel = isKnownControlFieldId(normalizedCurrent)
                ? ''
                : ` [${incompatibleSuffix}]`;
            baseOptions.push({
                label: `${getFieldLabel(normalizedCurrent)}${suffixLabel}`,
                value: normalizedCurrent,
            });
        }

        return baseOptions;
    };

    const profileSelectorFieldOptions = useMemo(() => {
        return buildTypedFieldOptions(
            DECISION_FIELD_TYPES,
            __('Select a field', 'obatala'),
            profileSelectorFieldId,
            (field) => firstStageFieldIds.includes(String(field.value)),
            __('field outside the initial step or with an incompatible type', 'obatala')
        );
    }, [stepsProcessModel, profileSelectorFieldId, firstStageFieldIds, fieldLabelById]);

    const decisionFieldIds = useMemo(() => {
        return [
            profileSelectorFieldId,
            decisionConfig.multi_or_single_field_id,
            decisionConfig.quantity_field_id,
            decisionConfig.data_entry_mode_field_id,
            decisionConfig.spreadsheet_upload_field_id,
            decisionConfig.same_values_mode_field_id,
            decisionConfig.same_values_prefix_mode_field_id,
            decisionConfig.same_values_prefix_text_field_id,
        ].map((fieldId) => String(fieldId || '')).filter(Boolean);
    }, [
        profileSelectorFieldId,
        decisionConfig.multi_or_single_field_id,
        decisionConfig.quantity_field_id,
        decisionConfig.data_entry_mode_field_id,
        decisionConfig.spreadsheet_upload_field_id,
        decisionConfig.same_values_mode_field_id,
        decisionConfig.same_values_prefix_mode_field_id,
        decisionConfig.same_values_prefix_text_field_id,
    ]);

    const metadataSelectableSteps = useMemo(() => {
        return stepsProcessModel.filter(
            (field) => !decisionFieldIds.includes(String(field.value))
        );
    }, [stepsProcessModel, decisionFieldIds]);

    useEffect(() => {
        if (!decisionFieldIds.length) {
            return;
        }

        setProfiles((prevProfiles) => prevProfiles.map((profile) => {
            const previousMappings = Array.isArray(profile?.field_mappings) ? profile.field_mappings : [];
            const filteredMappings = previousMappings.filter((mapping) => {
                const fieldId = String(mapping?.obatala_field?.value || '');
                return fieldId && !decisionFieldIds.includes(fieldId);
            });

            if (filteredMappings.length === previousMappings.length) {
                return profile;
            }

            return {
                ...profile,
                field_mappings: filteredMappings,
            };
        }));
    }, [decisionFieldIds]);

    const handleSelectedStepsChange = (selectedOptions) => {
        const normalizedOptions = selectedOptions || [];

        updateProfileByKey(activeProfileKey, (profile) => {
            const previousMappingsByFieldId = new Map(
                (profile.field_mappings || []).map((mapping) => [
                    String(mapping?.obatala_field?.value || ''),
                    mapping,
                ])
            );

            const nextMappings = normalizedOptions.map((step) => {
                const fieldId = String(step.value);
                const existingMapping = previousMappingsByFieldId.get(fieldId);

                if (existingMapping) {
                    return {
                        ...existingMapping,
                        obatala_field: {
                            ...existingMapping.obatala_field,
                            ...step,
                        },
                    };
                }

                return {
                    obatala_field: step,
                    tainacan_metadata_id: '',
                };
            });

            return {
                ...profile,
                field_mappings: nextMappings,
            };
        });
    };

    const getMappingData = async () => {
        if (!selectedProcessModel?.id) {
            alert(__('Process model not found.', 'obatala'));
            return;
        }

        const normalizedMapperStatus = normalizeMapperStatus(mapperStatus);
        let modelForSave = selectedProcessModel;
        let availableFieldIds = extractFieldIdsFromFlowData(
            normalizeFlowDataShape(modelForSave?.meta?.flowData)
        );

        if (normalizedMapperStatus === MAPPER_STATUS_ENABLED) {
            try {
                const ensuredModelResult = await ensureControlFieldsOnProcessModel(modelForSave);
                modelForSave = ensuredModelResult.model || modelForSave;
                availableFieldIds = ensuredModelResult.availableFieldIds || availableFieldIds;
                setSelectedProcessModel(modelForSave);
            } catch (error) {
                console.error('Erro ao garantir a etapa de controle no modelo de processo:', error);
                alert(__('Could not ensure the control step in the process model.', 'obatala'));
                return;
            }
        }

        let effectiveProfileSelectorFieldId = String(profileSelectorFieldId || FIXED_PROFILE_SELECTOR_FIELD_ID);
        let effectiveDecisionConfig = enforceFixedDecisionFields(decisionConfig);

        if (normalizedMapperStatus === MAPPER_STATUS_ENABLED) {
            const autoDefaults = applyAutomaticControlDefaults(
                effectiveDecisionConfig,
                FIXED_PROFILE_SELECTOR_FIELD_ID,
                availableFieldIds
            );
            effectiveDecisionConfig = enforceFixedDecisionFields(autoDefaults.decisionConfig);
            effectiveProfileSelectorFieldId = autoDefaults.selectorFieldId || FIXED_PROFILE_SELECTOR_FIELD_ID;
            setDecisionConfig(effectiveDecisionConfig);
            setProfileSelectorFieldId(effectiveProfileSelectorFieldId);
        }

        const normalizedProfiles = selectedProfiles.map((profile, index) => {
            const collectionId = String(profile.collection_id || '0');
            const collectionName = getCollectionLabel(collectionId, String(profile.collection_name || '').trim());
            const keySource = collectionName || `perfil_${index + 1}`;

            return {
                key: profile.key || buildUniqueProfileKey(keySource, profiles.map((item) => item.key)),
                collection_id: collectionId,
                collection_name: collectionName,
                field_mappings: normalizeSavedFieldMappings(profile.field_mappings),
            };
        });
        const normalizedDecisionRules = {
            ...normalizeDecisionConfig(effectiveDecisionConfig),
            ...FIXED_DECISION_VALUES,
        };

        if (normalizedMapperStatus === MAPPER_STATUS_ENABLED) {
            if (!normalizedProfiles.length) {
                alert(__('Register at least one export collection.', 'obatala'));
                return;
            }

            const hasMissingCollection = normalizedProfiles.some((profile) => !profile.collection_id || profile.collection_id === '0');
            if (hasMissingCollection) {
                alert(__('All configurations must have a Tainacan collection selected.', 'obatala'));
                return;
            }

            const normalizedCollectionIds = normalizedProfiles.map((profile) => String(profile.collection_id));
            if (new Set(normalizedCollectionIds).size !== normalizedCollectionIds.length) {
                alert(__('Each configuration must point to a different collection.', 'obatala'));
                return;
            }

            const normalizedCollectionNames = normalizedProfiles.map((profile) => normalizeOptionLabel(profile.collection_name || ''));
            if (new Set(normalizedCollectionNames).size !== normalizedCollectionNames.length) {
                alert(__('Selected collections must have different names for identification in the workflow.', 'obatala'));
                return;
            }

            const hasIncompleteProfileMappings = normalizedProfiles.some((profile) => (
                profile.field_mappings.some((mapping) => {
                    const hasObatala = mapping.obatala_field && typeof mapping.obatala_field === 'object' && mapping.obatala_field.value;
                    const hasTainacan = mapping.tainacan_metadata_id && mapping.tainacan_metadata_id !== '';

                    return !(hasObatala && hasTainacan);
                })
            ));

            if (hasIncompleteProfileMappings) {
                alert(__('All fields in all configurations must be filled in before saving the mapping.', 'obatala'));
                return;
            }

            const availableFieldIdSet = new Set(availableFieldIds.map((fieldId) => String(fieldId)));
            const invalidMappedFields = normalizedProfiles.flatMap((profile) => (
                profile.field_mappings
                    .filter((mapping) => !availableFieldIdSet.has(String(mapping?.obatala_field?.value || '')))
                    .map((mapping) => ({
                        collection: profile.collection_name,
                        field: mapping?.obatala_field?.label || mapping?.obatala_field?.value,
                    }))
            ));

            if (invalidMappedFields.length) {
                alert(
                    sprintf(
                        __('There are mapped fields that are no longer present in the steps: %s. Review the mapping before saving.', 'obatala'),
                        invalidMappedFields
                            .map(({ collection, field }) => `${collection}: ${field}`)
                            .join("; ")
                    )
                );
                return;
            }

            if (normalizedDecisionRules.data_entry_mode_field_id && !normalizedDecisionRules.spreadsheet_upload_field_id) {
                alert(__('Select the upload field that will receive the spreadsheet in step 3.', 'obatala'));
                return;
            }
        }

        const mappedData = {
            process_model_id: modelForSave.id,
            mappings: {
                status: normalizedMapperStatus,
                profile_selector_field_id: effectiveProfileSelectorFieldId,
                decision_rules: normalizedDecisionRules,
                profiles: normalizedProfiles,
            }
        };

        if (normalizedMapperStatus === MAPPER_STATUS_ENABLED) {
            const selectorCollectionOptions = buildCollectionSelectorOptionsFromProfiles(
                normalizedProfiles,
                (collectionId, fallback) => getCollectionLabel(collectionId, fallback)
            );
            const selectorFieldIdsToSync = [
                CONTROL_FIELD_IDS.profile_selector_field_id,
                effectiveProfileSelectorFieldId,
            ];
            const syncResult = syncCollectionSelectorOptionsInFlowData(
                modelForSave?.meta?.flowData,
                selectorFieldIdsToSync,
                selectorCollectionOptions
            );

            if (syncResult.changed) {
                try {
                    await updateProcessTypeMeta(modelForSave.id, { flowData: syncResult.flowData });
                    modelForSave = {
                        ...modelForSave,
                        meta: {
                            ...(modelForSave?.meta || {}),
                            flowData: syncResult.flowData,
                        },
                    };
                    setSelectedProcessModel(modelForSave);
                } catch (error) {
                console.error(__('Error synchronizing collection options in the process model:', 'obatala'), error);
                    alert(__('Could not update the Export Collection field options in the process model.', 'obatala'));
                    return;
                }
            }
        }

        try {
            const response = await apiFetch({
                path: '/obatala/v1/exporter/save_mapping_data',
                method: 'POST',
                data: mappedData,
            });

            if (response.success) {
                if (embedded) {
                    if (typeof onMappingSaved === 'function') {
                        onMappingSaved({
                            message: __('Mapping saved successfully!', 'obatala'),
                            flowData: modelForSave?.meta?.flowData,
                            mapperStatus: normalizedMapperStatus,
                        });
                    }
                } else {
                    alert(__('Mapping saved successfully!', 'obatala'));
                    window.location.href = '?page=process-type-manager';
                    const defaultProfiles = [];
                    setProfiles(defaultProfiles);
                    setActiveProfileKey('');
                    setMapperStatus(MAPPER_STATUS_DISABLED);
                    setProfileSelectorFieldId(FIXED_PROFILE_SELECTOR_FIELD_ID);
                    setDecisionConfig(getDefaultControlDecisionConfig());
                }
            } else {
                alert(sprintf(__('Failed to save: %s', 'obatala'), response.message || __('Unknown error.', 'obatala')));
            }
        } catch (error) {
            console.error(__('Error saving mapping:', 'obatala'), error);
            alert(__('Error saving the mapping.', 'obatala'));
        }
    };

    const cancelMappingData = () => {
        if (embedded && typeof onCancel === 'function') {
            onCancel();
            return;
        }
        window.location.href = '?page=process-type-manager';
        const defaultProfiles = [];
        setProfiles(defaultProfiles);
        setActiveProfileKey('');
        setMapperStatus(MAPPER_STATUS_DISABLED);
        setProfileSelectorFieldId(FIXED_PROFILE_SELECTOR_FIELD_ID);
        setDecisionConfig(getDefaultControlDecisionConfig());
    }

    const showProfileSelectorSection = false;
    const ContentWrapper = embedded ? 'div' : 'main';

    if (isLoading) {
        if (embedded) {
            return <Spinner />;
        }
        return (
            <>
                <BrandHeader />
                <main>
                    <Spinner />
                </main>
                <BrandFooter />
            </>
        );
    }

    return (
        <>
            {!embedded && <BrandHeader />}
            {!embedded && (
                <div className="title-container">
                    <h2>
                        <small>{__('Edit export data', 'obatala')}</small>{selectedProcessModel?.title?.rendered}
                    </h2>
                </div>
            )}
            <ContentWrapper className={embedded ? "obatala-embedded-mapper" : undefined}>
                <Panel>
                    <PanelRow>
                        <form className="inline-edition flex-basis-100">
                            <input type="hidden" name="page" value="inbcm-mapping" />

                            <ToggleControl
                                label={__('Mapper status', 'obatala')}
                                help={__('Disable to prevent automatic creation of the control step and automatic export to Tainacan.', 'obatala')}
                                checked={ mapperStatus === MAPPER_STATUS_ENABLED }
                                onChange={ (isChecked) => {
                                    const newValue = isChecked ? MAPPER_STATUS_ENABLED : MAPPER_STATUS_DISABLED;
                                    setMapperStatus(normalizeMapperStatus(newValue));
                                } }
                            />

                            {!isMapperEnabled ? (
                                <Notice status="warning" isDismissible={false}>
                                    {__('With the mapper disabled, the flow does not automatically generate the control step and does not send items to Tainacan when the process is completed.', 'obatala')}
                                </Notice>
                            ) : (
                                <div className="counter-container flex-basis-100">
                                    <hr className="mb-2" />
                                    {showProfileSelectorSection && (
                                        <BaseControl
                                            label={__('Collection selection at process start', 'obatala')}
                                            help={__('Choose the field in the initial step that will automatically receive the collection options.', 'obatala')}
                                        >
                                            <SelectControl
                                                label={__('Collection selector field', 'obatala')}
                                                value={profileSelectorFieldId}
                                                options={profileSelectorFieldOptions}
                                                onChange={(value) => setProfileSelectorFieldId(String(value || ''))}
                                            />
                                            <p>
                                                {__('This field will be displayed in the initial workflow step with the collections available for selection.', 'obatala')}{' '}
                                                {__('Currently it accepts initial step fields of type', 'obatala')} <strong>radio</strong>.
                                            </p>
                                        </BaseControl>
                                    )}

                                    <BaseControl className="counter-item"
                                        label={__('Export collections', 'obatala')}
                                        help={__('Each configuration represents a target collection with its own metadata mapping.', 'obatala')}
                                    >
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'flex-start' }}>
                                            {collectionsTainacan.map((collection) => {
                                                const collectionId = String(collection?.["WP_Post"]?.ID || '');
                                                const collectionName = String(collection?.["WP_Post"]?.post_title || '').trim();
                                                const isChecked = selectedProfiles.some(
                                                    (profile) => String(profile?.collection_id || '') === collectionId
                                                );

                                                return (
                                                    <div key={`checkbox_collection_${collectionId}`} style={{ minWidth: '220px' }}>
                                                        <CheckboxControl
                                                            label={collectionName || sprintf(__('Collection %s', 'obatala'), collectionId)}
                                                            checked={isChecked}
                                                            onChange={(checked) => handleCollectionCheckboxChange(collectionId, checked)}
                                                            style={{ marginBottom: 0 }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                            {selectedProfiles.map((profile, index) => {
                                                const displayName = getCollectionLabel(
                                                    profile.collection_id,
                                                    profile.collection_name || sprintf(__('Collection %s', 'obatala'), index + 1)
                                                ) || sprintf(__('Collection %s', 'obatala'), index + 1);
                                                const isActive = currentProfile?.key === profile.key;

                                                return (
                                                    <div
                                                        key={`profile_chip_${profile.key}`}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            borderRadius: '999px',
                                                            border: `1px solid ${isActive ? '#135e96' : '#c3c4c7'}`,
                                                            backgroundColor: isActive ? '#2271b1' : '#ffffff',
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveProfileKey(profile.key)}
                                                            style={{
                                                                border: 'none',
                                                                background: 'transparent',
                                                                color: isActive ? '#ffffff' : '#1d2327',
                                                                padding: '5px 9px',
                                                                cursor: 'pointer',
                                                                fontSize: '13px',
                                                            }}
                                                        >
                                                            {displayName}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCollectionProfile(profile.collection_id)}
                                                            aria-label={sprintf(__('Remove collection %s', 'obatala'), displayName)}
                                                            style={{
                                                                border: 'none',
                                                                borderLeft: `1px solid ${isActive ? '#135e96' : '#dcdcde'}`,
                                                                background: isActive ? '#135e96' : '#f0f0f1',
                                                                color: isActive ? '#ffffff' : '#b32d2e',
                                                                width: '28px',
                                                                height: '28px',
                                                                cursor: 'pointer',
                                                                fontSize: '16px',
                                                                lineHeight: 1,
                                                            }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </BaseControl>

                                    <BaseControl className="counter-item"
                                        label={__('Choose the form fields that contain the item metadata:', 'obatala')}
                                        help={__('The list below automatically excludes fields used in the general decision configuration. You can save without selecting fields and complete the mapping later.', 'obatala')}
                                    >
                                        <Select
                                            key={currentProfile?.key || 'profile-empty'}
                                            isMulti
                                            options={metadataSelectableSteps}
                                            value={selectedSteps}
                                            onChange={handleSelectedStepsChange}
                                            isDisabled={!currentProfile}
                                            placeholder={__('Select the fields...', 'obatala')}
                                        />
                                    </BaseControl>

                                    <BaseControl className="counter-item"
                                        label={__('Metadata mapping', 'obatala')}
                                        help={__('Relate Obatala fields to Tainacan metadata.', 'obatala')}
                                    >
                                        <table className="wp-list-table widefat fixed striped">
                                            <thead>
                                                <tr>
                                                    <th>{__('Obatala field', 'obatala')}</th>
                                                    <th>{__('Tainacan metadata', 'obatala')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedSteps.map((step, index) => {
                                                    const currentValue = selectRows[index]?.tainacanMetadata || '';
                                                    const options = [
                                                        { label: __('Select the metadata', 'obatala'), value: '' },
                                                        ...metadataTainacan.map((item) => {
                                                            const post = item["WP_Post"];
                                                            const id = String(post.ID);
                                                            const isUsed = isMetadataSelected(id, index);
                                                            return {
                                                                label: `${post.post_title}${isUsed ? ` ${__('(already used)', 'obatala')}` : ''}`,
                                                                value: id,
                                                                disabled: isUsed
                                                            };
                                                        })
                                                    ];

                                                    return (
                                                        <tr key={index}>
                                                            <td>
                                                                {step.label}
                                                            </td>
                                                            <td>
                                                                <SelectControl
                                                                    value={currentValue}
                                                                    options={options}
                                                                    onChange={(value) => handleSelectChange(index, 'tainacanMetadata', value)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                {selectedSteps.length === 0 && (
                                                    <tr>
                                                        <td colSpan="2">
                                                            {__('No field selected for mapping.', 'obatala')}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </BaseControl>
                                </div>
                            )}

                            <div className="group-button">
                                <Button variant="tertiary" onClick={cancelMappingData}>
                                    {__('Cancel', 'obatala')}
                                </Button>
                                <Button variant="primary" onClick={getMappingData}>
                                    {__('Save', 'obatala')}
                                </Button>
                            </div>
                        </form>
                    </PanelRow>
                </Panel>
            </ContentWrapper>
            {!embedded && <BrandFooter />}
        </>
    );
};

export default MappersManager;
