import React, { useState, useEffect, useCallback, useMemo } from "react";
import { __, sprintf } from '@wordpress/i18n';
import {
    Icon,
    Spinner,
    Notice,
    Panel,
    PanelHeader,
    PanelRow,
    Button,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import MetroNavigation from "./ProcessManager/MetroNavigation";
import MetaFieldInputs from "./ProcessManager/MetaFieldInputs";
import CommentForm from "./ProcessManager/CommentForm";
import ProcessUserLog from "./ProcessManager/ProcessUserLog";
import {
    decideProcessExport,
    fetchNodePermission,
    fetchProcessById,
    fetchProcessExportReview,
    fetchProcessExportRuntime,
    fetchProcessSpreadsheetTemplate,
    fetchProcessTypeById,
    fetchSectors,
} from "../api/apiRequests";
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import MetaFieldDisplay from "./ProcessManager/MetaFieldDisplay";
import ProcessHeader from './ProcessManager/ProcessHeader';
import HistoryViewer from './ProcessManager/HistoryViewer';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const CONTROL_FIELD_IDS = {
    multiOrSingle: 'obatala_ctrl_multi_or_single',
    quantity: 'obatala_ctrl_quantity',
    dataEntryMode: 'obatala_ctrl_entry_mode',
    spreadsheetUpload: 'obatala_ctrl_spreadsheet_upload',
    sameValuesMode: 'obatala_ctrl_same_values_mode',
    sameValuesPrefixMode: 'obatala_ctrl_use_prefix',
    sameValuesPrefixText: 'obatala_ctrl_prefix_text',
};
const CONTROL_FIELD_ID_SET = new Set(Object.values(CONTROL_FIELD_IDS));
const EXPORT_REVIEW_STEP_ID = '__obatala_export_review__';

const ProcessViewer = () => {
    const [process, setProcess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [filteredProcessType, setFilteredProcessType] = useState(null);
    const [submittedSteps, setSubmittedSteps] = useState({});
    const [formValues, setFormValues] = useState({});
    const [flowNodes, setFlowNodes] = useState([]);
    const [orderedSteps, setOrderedSteps] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [sectorUser, setSectorUser] = useState([]);
    const [hasPermission, setHasPermission] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [currentStageData, setCurrentStageData] = useState({});
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [fileInfo, setFileInfo] = useState({});
    const [notice, setNotice] = useState(null);
    const [progress, setProgress] = useState(0);
    const [hasComments, setHasComments] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);
    const [isItemsMatrixOpen, setIsItemsMatrixOpen] = useState(false);
    const [exportRuntimeConfig, setExportRuntimeConfig] = useState(null);
    const [exportReview, setExportReview] = useState(null);
    const [isExportDecisionLoading, setIsExportDecisionLoading] = useState(false);
    const [isTemplateDownloadLoading, setIsTemplateDownloadLoading] = useState(false);

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);
    const allAuthors = useSelect(select => select(coreStore).getUsers({ who: 'authors' }), []);

    const urlParams = new URLSearchParams(window.location.search);
    const viewMode = urlParams.get('view');

    const [isProcessLoading, setIsProcessLoading] = useState(true);

    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("process_id");
    };
    const processId = getProcessIdFromUrl();

    const buildExportNoticeFromResult = (exportResult) => {
        const status = exportResult?.status || 'error';
        const exportedItems = Array.isArray(exportResult?.exported_items) ? exportResult.exported_items : [];
        const failedItems = Array.isArray(exportResult?.failed_items) ? exportResult.failed_items : [];
        const warnings = Array.isArray(exportResult?.warnings) ? exportResult.warnings : [];

        const exportedLabel = exportedItems.length
            ? `Itens exportados: ${exportedItems.map((item) => `#${item.item_id}`).join(', ')}.`
            : '';
        const failedLabel = failedItems.length
            ? `Falhas: ${failedItems.map((item) => `linha ${item.row}`).join(', ')}.`
            : '';
        const warningLabel = warnings.length
            ? `Avisos: ${warnings.join(' | ')}.`
            : '';

        return {
            status: status === 'success' ? 'success' : (status === 'partial' || status === 'skipped' || status === 'pending') ? 'warning' : 'error',
            message: `${exportResult?.message || 'Exportação concluída.'} ${exportedLabel} ${failedLabel} ${warningLabel}`.trim(),
        };
    };

    const formatDateTime = (value) => {
        if (!value) return '';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return String(value);
        return format(parsed, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    };

    const stringifyPreviewValue = (value) => {
        if (Array.isArray(value)) {
            return value.map((entry) => stringifyPreviewValue(entry)).filter(Boolean).join(' | ');
        }

        if (value && typeof value === 'object') {
            return Object.values(value)
                .map((entry) => stringifyPreviewValue(entry))
                .filter(Boolean)
                .join(' | ');
        }

        if (value === undefined || value === null) {
            return '';
        }

        return String(value);
    };

    const loadExportRuntime = useCallback(async () => {
        if (!processId) return;

        try {
            const runtime = await fetchProcessExportRuntime(processId);
            setExportRuntimeConfig(runtime);
        } catch {
            setExportRuntimeConfig(null);
        }
    }, [processId]);

    const loadExportReview = useCallback(async () => {
        if (!processId) return;

        try {
            const review = await fetchProcessExportReview(processId);
            setExportReview(review);
        } catch {
            setExportReview(null);
        }
    }, [processId]);


    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
        setCurrentStep(index);
    };

    useEffect(() => {
        if (!processId) return;

        const initializeNodeData = async () => {
            try {
                setIsLoading(true);

                await apiFetch({
                    path: `/obatala/v1/process_obatala/${processId}/node`,
                    method: 'PUT',
                });

                await fetchUpdatedProcessNodes();
                //await fetchMetaData(processId, orderedSteps);

            } catch (err) {
                setError(err.message || __('Error fetching node data.', 'obatala'));
            } finally {
                setIsLoading(false);
            }
        };

        initializeNodeData();

    }, [processId]);

    useEffect(() => {
        if (processId && orderedSteps.length > 0) {

            fetchMetaData(processId, orderedSteps);
        }
    }, [orderedSteps]);

    useEffect(() => {
        if (processId) {
            loadExportRuntime();
            loadExportReview();
        }
    }, [processId, loadExportRuntime, loadExportReview]);

    useEffect(() => {
        if (!currentUser) {
            return;
        }
        const processId = getProcessIdFromUrl();
        if (processId) {
            setIsLoading(true);
            loadSectors();
            fetchProcessById(processId)
                .then((data) => {
                    setProcess(data);
                    setIsPublic(data.meta?.access_level?.[0] === 'Not restricted' || data.meta?.access_level?.[0] === 'not restricted')

                    const processTypeId = data.meta.process_type;
                    if (processTypeId) {
                        fetchProcessTypeById(processTypeId)
                            .then((processType) => {
                                setFilteredProcessType(processType);
                            })
                            .catch((error) => {
                                console.error("Error fetching process type:", error);
                                setError(__("Error fetching process type.", "obatala"));
                            });
                    } else {
                    }
                })
                .catch((error) => {
                    console.error("Error fetching process:", error);
                    setError(__("Error fetching process details.", "obatala"));
                })
                .finally(() => setIsProcessLoading(false));
            fetchNodePermission(processId, currentUser.id)
                .then((result) => {
                    setHasPermission(result.status);
                    setSectorUser(result.data_sector)
                })
                .catch((error) => {
                    console.error("Error fetching process:", error);
                    setError(__("Error fetching process meta.", "obatala"));
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setError(__("No process ID found in the URL.", "obatala"));
        }
    }, [currentUser]);

    const fetchUpdatedProcessNodes = async () => {
        try {
            const response = await apiFetch({
                path: `/obatala/v1/process_obatala/${processId}/node`,
                method: 'GET',
            });

            setOrderedSteps(response.ordered_nodes); // <- pega apenas os nós ordenados
            setProgress(response.progress)

        } catch (error) {
            console.error('Erro ao buscar etapas atualizadas:', error);
        }
    };

    const loadSectors = () => {
        fetchSectors()
            .then(data => {
                const sectors = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    name: value.nome,
                    description: value.descricao,
                    status: value.status,
                }));

                setSectors(sectors);
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
            })

    };

    const getSectorName = (sectorId) => {
        const sector = sectors.find(sector => sector.id === sectorId);
        return sector ? sector.name : __("Unknown", "obatala");
    };

    const normalizeArrayLike = (value) => {
        if (Array.isArray(value)) return value;
        if (value && typeof value === 'object') return Object.values(value);
        return [];
    };

    const extractConditionalValue = (value) => {
        if (Array.isArray(value)) {
            return extractConditionalValue(value[0]);
        }

        if (value && typeof value === 'object') {
            const objectValues = Object.values(value);
            return extractConditionalValue(objectValues[0]);
        }

        if (value === undefined || value === null) {
            return '';
        }

        return value;
    };

    const normalizeConditionalToken = (value) => {
        return String(value ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();
    };

    const hasValue = (value) => {
        if (value instanceof FileList) {
            return value.length > 0;
        }

        if (Array.isArray(value)) {
            return value.some((entry) => hasValue(entry));
        }

        if (value && typeof value === 'object') {
            return Object.values(value).some((entry) => hasValue(entry));
        }

        if (value === undefined || value === null) {
            return false;
        }

        return String(value).trim() !== '';
    };

    const stripHtml = (value) =>
        String(value || '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim();

    const normalizeDocumentValue = (value, field = {}) => {
        const firstValue = Array.isArray(value) ? value[0] : value;
        if (firstValue && typeof firstValue === 'object') {
            return firstValue;
        }
        const templateText = field.config?.templateText || '';
        return {
            content:
                typeof firstValue === 'string' && firstValue
                    ? firstValue
                    : templateText,
            status: firstValue || templateText ? 'draft' : 'empty',
        };
    };

    const fieldHasValue = (field, value) => {
        if (field?.type === 'stage_document') {
            const documentValue = normalizeDocumentValue(value, field);
            return stripHtml(documentValue.content) !== '';
        }

        return hasValue(value);
    };

    const unwrapSingleValue = (value) => {
        if (Array.isArray(value) && value.length === 1) {
            const first = value[0];
            if (typeof first === 'string' || typeof first === 'number' || typeof first === 'boolean') {
                return first;
            }
        }

        return value;
    };

    const currentStepNodeId = orderedSteps[currentStep]?.id;
    const manualMultipleConfig = useMemo(() => {
        const mappedFieldIds = new Set();
        const mappedFields = Array.isArray(exportRuntimeConfig?.mapped_fields)
            ? exportRuntimeConfig.mapped_fields
            : [];

        const quantity = Math.max(1, Number(exportRuntimeConfig?.decision?.quantity) || 1);
        const sameValuesMode = Boolean(exportRuntimeConfig?.decision?.same_values_mode);
        const sameValuesUniqueFieldId = String(exportRuntimeConfig?.decision?.same_values_unique_id_field_id || '');
        const isEnabled = !!exportRuntimeConfig?.enabled &&
            !!exportRuntimeConfig?.decision?.is_multiple &&
            exportRuntimeConfig?.decision?.entry_mode === 'manual' &&
            quantity > 1;

        if (!isEnabled || !currentStepNodeId) {
            return {
                enabled: false,
                quantity: 1,
                mappedFieldIds,
                sameValuesMode,
                sameValuesUniqueFieldId,
            };
        }

        mappedFields.forEach((mappedField) => {
            const fieldId = String(mappedField?.obatala_field_id || '');
            const fieldStage = String(mappedField?.obatala_field_stage || '');

            if (fieldId && (!fieldStage || fieldStage === String(currentStepNodeId))) {
                mappedFieldIds.add(fieldId);
            }
        });

        return {
            enabled: mappedFieldIds.size > 0,
            quantity,
            mappedFieldIds,
            sameValuesMode,
            sameValuesUniqueFieldId,
        };
    }, [exportRuntimeConfig, currentStepNodeId]);

    const currentRuntimeSpreadsheetUploadFieldId = String(
        exportRuntimeConfig?.decision?.upload_field_id || CONTROL_FIELD_IDS.spreadsheetUpload
    );
    const isSpreadsheetEntryModeActive = exportRuntimeConfig?.decision?.entry_mode === 'upload';

    const mappedFieldIdsForCurrentStep = useMemo(() => {
        const mappedFieldIds = new Set();
        const mappedFields = Array.isArray(exportRuntimeConfig?.mapped_fields)
            ? exportRuntimeConfig.mapped_fields
            : [];

        if (!currentStepNodeId) {
            return mappedFieldIds;
        }

        mappedFields.forEach((mappedField) => {
            const fieldId = String(mappedField?.obatala_field_id || '');
            const fieldStage = String(mappedField?.obatala_field_stage || '');
            if (fieldId && (!fieldStage || fieldStage === String(currentStepNodeId))) {
                mappedFieldIds.add(fieldId);
            }
        });

        return mappedFieldIds;
    }, [exportRuntimeConfig, currentStepNodeId]);

    const isSpreadsheetMappedField = useCallback((field) => {
        const fieldId = String(field?.id || '');
        if (!fieldId || !isSpreadsheetEntryModeActive || !exportRuntimeConfig?.enabled) {
            return false;
        }

        if (fieldId === currentRuntimeSpreadsheetUploadFieldId) {
            return false;
        }

        if (CONTROL_FIELD_ID_SET.has(fieldId)) {
            return false;
        }

        return mappedFieldIdsForCurrentStep.has(fieldId);
    }, [
        isSpreadsheetEntryModeActive,
        exportRuntimeConfig,
        currentRuntimeSpreadsheetUploadFieldId,
        mappedFieldIdsForCurrentStep,
    ]);

    const isRepeatedMappedField = (field) => {
        if (!field || field.type === 'upload') return false;
        const fieldId = String(field.id || '');
        if (!manualMultipleConfig.enabled || !manualMultipleConfig.mappedFieldIds.has(fieldId)) {
            return false;
        }

        if (manualMultipleConfig.sameValuesMode) {
            return !!manualMultipleConfig.sameValuesUniqueFieldId
                && fieldId === manualMultipleConfig.sameValuesUniqueFieldId;
        }

        return true;
    };

    const getFieldRepeatCount = (field) => {
        return isRepeatedMappedField(field) ? manualMultipleConfig.quantity : 1;
    };

    const getFieldInitialValue = (stepId, field, itemIndex = 0) => {
        const rawValue = formValues?.[stepId]?.[field.id];
        const uniqueFieldId = String(exportRuntimeConfig?.decision?.same_values_unique_id_field_id || '');
        const uniqueIdPrefix = String(exportRuntimeConfig?.decision?.same_values_id_prefix || '');
        const shouldPrefillUniquePrefix = uniqueIdPrefix !== '' && String(field?.id || '') === uniqueFieldId;

        if (isRepeatedMappedField(field)) {
            const repeatedValues = normalizeArrayLike(rawValue);
            const repeatedValue = repeatedValues[itemIndex] ?? '';
            if (hasValue(repeatedValue)) {
                return unwrapSingleValue(repeatedValue);
            }

            if (shouldPrefillUniquePrefix) {
                return `${uniqueIdPrefix}${itemIndex + 1}`;
            }

            return '';
        }

        const singleValue = rawValue ?? uploadedFiles?.[stepId]?.[field.id]?.[0]?.name;
        if (hasValue(singleValue)) {
            return unwrapSingleValue(singleValue);
        }

        if (shouldPrefillUniquePrefix) {
            return uniqueIdPrefix;
        }

        return unwrapSingleValue(singleValue);
    };

    const getFieldValueForSubmit = (stepId, field) => {
        const currentValue = formValues?.[stepId]?.[field.id] ?? uploadedFiles?.[stepId]?.[field.id]?.[0]?.name;
        const repeatCount = getFieldRepeatCount(field);

        if (repeatCount > 1) {
            const sourceValues = normalizeArrayLike(currentValue);

            // Sempre envia a matriz de itens completa (sem índices faltando)
            // para evitar preenchimento implícito de linhas vazias no backend.
            const normalizedRepeatedValues = Array.from({ length: repeatCount }).map((_, index) => {
                const sourceValue = sourceValues[index];
                if (hasValue(sourceValue)) {
                    return sourceValue;
                }

                const fallbackValue = getFieldInitialValue(stepId, field, index);
                if (hasValue(fallbackValue)) {
                    return fallbackValue;
                }

                return '';
            });

            return normalizedRepeatedValues.map((entry) => (
                Array.isArray(entry) ? entry : [entry]
            ));
        }

        if (field.type === 'stage_document') {
            const documentValue = normalizeDocumentValue(currentValue, field);
            return [documentValue];
        }

        if (hasValue(currentValue)) {
            return currentValue;
        }

        const fallbackValue = getFieldInitialValue(stepId, field, 0);
        if (hasValue(fallbackValue)) {
            return Array.isArray(fallbackValue) ? fallbackValue : [fallbackValue];
        }

        return currentValue;
    };

    const isFieldVisibleByCondition = useCallback((stepId, field) => {
        let conditional = field?.config?.conditional;
        const fieldId = String(field?.id || '');

        if (fieldId === CONTROL_FIELD_IDS.quantity) {
            const multiRawValue = extractConditionalValue(formValues?.[stepId]?.[CONTROL_FIELD_IDS.multiOrSingle]);
            const entryModeRawValue = extractConditionalValue(formValues?.[stepId]?.[CONTROL_FIELD_IDS.dataEntryMode]);
            const normalizedMulti = normalizeConditionalToken(multiRawValue);
            const normalizedEntryMode = normalizeConditionalToken(entryModeRawValue);

            return normalizedMulti === normalizeConditionalToken('Sim')
                && normalizedEntryMode === normalizeConditionalToken('Manual');
        }

        if (fieldId === CONTROL_FIELD_IDS.spreadsheetUpload) {
            const multiRawValue = extractConditionalValue(formValues?.[stepId]?.[CONTROL_FIELD_IDS.multiOrSingle]);
            const entryModeRawValue = extractConditionalValue(formValues?.[stepId]?.[CONTROL_FIELD_IDS.dataEntryMode]);
            const normalizedMulti = normalizeConditionalToken(multiRawValue);
            const normalizedEntryMode = normalizeConditionalToken(entryModeRawValue);

            return normalizedMulti === normalizeConditionalToken('Sim')
                && normalizedEntryMode === normalizeConditionalToken('Planilha');
        }

        if (fieldId === CONTROL_FIELD_IDS.sameValuesMode) {
            const multiRawValue = extractConditionalValue(formValues?.[stepId]?.[CONTROL_FIELD_IDS.multiOrSingle]);
            const entryModeRawValue = extractConditionalValue(formValues?.[stepId]?.[CONTROL_FIELD_IDS.dataEntryMode]);
            const normalizedMulti = normalizeConditionalToken(multiRawValue);
            const normalizedEntryMode = normalizeConditionalToken(entryModeRawValue);

            return normalizedMulti === normalizeConditionalToken('Sim')
                && normalizedEntryMode === normalizeConditionalToken('Manual');
        }

        const legacyConditionalFields = new Set([
            CONTROL_FIELD_IDS.quantity,
            CONTROL_FIELD_IDS.dataEntryMode,
            CONTROL_FIELD_IDS.spreadsheetUpload,
            CONTROL_FIELD_IDS.sameValuesMode,
        ]);

        if (
            (!conditional || typeof conditional !== 'object')
            && legacyConditionalFields.has(fieldId)
        ) {
            conditional = {
                dependsOnFieldId: CONTROL_FIELD_IDS.multiOrSingle,
                operator: 'equals',
                value: 'Sim',
            };
        }

        if (!conditional || typeof conditional !== 'object') {
            return true;
        }

        const dependsOnFieldId = String(
            conditional.dependsOnFieldId
            || conditional.depends_on_field_id
            || ''
        );

        if (!dependsOnFieldId) {
            return true;
        }

        const sourceRawValue = extractConditionalValue(formValues?.[stepId]?.[dependsOnFieldId]);
        const sourceValue = normalizeConditionalToken(sourceRawValue);
        const operator = String(conditional.operator || 'equals').toLowerCase();

        const targetValuesRaw = Array.isArray(conditional.values)
            ? conditional.values
            : [conditional.value ?? conditional.equals ?? ''];
        const targetValues = targetValuesRaw
            .map((value) => normalizeConditionalToken(extractConditionalValue(value)))
            .filter(Boolean);

        if (!targetValues.length) {
            return true;
        }

        if (operator === 'not_equals') {
            return !targetValues.includes(sourceValue);
        }

        if (operator === 'in') {
            return targetValues.includes(sourceValue);
        }

        if (operator === 'not_in') {
            return !targetValues.includes(sourceValue);
        }

        return targetValues.includes(sourceValue);
    }, [formValues]);

    const getVisibleFieldsForStep = useCallback((step) => {
        if (!step?.id || !Array.isArray(step?.data?.fields)) {
            return [];
        }

        return step.data.fields.filter((field) => isFieldVisibleByCondition(step.id, field));
    }, [isFieldVisibleByCondition]);

    const currentStepVisibleFields = useMemo(() => {
        const step = orderedSteps[currentStep];
        return getVisibleFieldsForStep(step);
    }, [orderedSteps, currentStep, getVisibleFieldsForStep]);

    const getSubmittableFieldsForStep = useCallback((step) => {
        return getVisibleFieldsForStep(step).filter((field) => !isSpreadsheetMappedField(field));
    }, [getVisibleFieldsForStep, isSpreadsheetMappedField]);

    const currentStepRepeatedFields = useMemo(() => {
        if (!Array.isArray(currentStepVisibleFields)) {
            return [];
        }

        return currentStepVisibleFields.filter((field) =>
            getFieldRepeatCount(field) > 1 && !isSpreadsheetMappedField(field)
        );
    }, [currentStepVisibleFields, manualMultipleConfig, isSpreadsheetMappedField]);

    const currentStepSingleFields = useMemo(() => {
        if (!Array.isArray(currentStepVisibleFields)) {
            return [];
        }

        return currentStepVisibleFields.filter((field) =>
            getFieldRepeatCount(field) <= 1 && !isSpreadsheetMappedField(field)
        );
    }, [currentStepVisibleFields, manualMultipleConfig, isSpreadsheetMappedField]);

    const currentStepSpreadsheetMappedFields = useMemo(() => {
        if (!Array.isArray(currentStepVisibleFields)) {
            return [];
        }

        return currentStepVisibleFields.filter((field) => isSpreadsheetMappedField(field));
    }, [currentStepVisibleFields, isSpreadsheetMappedField]);

    const currentStepDisplayFields = useMemo(() => {
        if (!Array.isArray(currentStepVisibleFields)) {
            return [];
        }

        return currentStepVisibleFields.filter((field) => !isSpreadsheetMappedField(field));
    }, [currentStepVisibleFields, isSpreadsheetMappedField]);

    const currentStepMatrixRowCount = useMemo(() => {
        if (!currentStepRepeatedFields.length) {
            return 0;
        }

        return currentStepRepeatedFields.reduce((max, field) => {
            return Math.max(max, getFieldRepeatCount(field));
        }, 1);
    }, [currentStepRepeatedFields, manualMultipleConfig]);

    useEffect(() => {
        setIsItemsMatrixOpen(false);
    }, [currentStep, activeIndex]);

    const canSubmitCurrentStep = useMemo(() => {
        const step = orderedSteps[currentStep];
        if (!step || !Array.isArray(step?.data?.fields)) {
            return false;
        }

        const stepId = step.id;
        const visibleFields = getSubmittableFieldsForStep(step);

        return visibleFields.every((field) => {
            const value = formValues?.[stepId]?.[field.id] ?? uploadedFiles?.[stepId]?.[field.id]?.[0]?.name;

            if (field.type === 'stage_document') {
                const documentValue = normalizeDocumentValue(value, field);
                if (field.config?.requireSignedUpload && !documentValue.signedFile?.name) {
                    const hasContent = stripHtml(documentValue.content) !== '';
                    if (hasContent || field.config?.required) {
                        return false;
                    }
                }
            }

            if (!field?.config?.required) {
                return true;
            }

            const repeatCount = getFieldRepeatCount(field);

            if (repeatCount > 1) {
                const repeatedValues = normalizeArrayLike(formValues?.[stepId]?.[field.id]);

                for (let index = 0; index < repeatCount; index += 1) {
                    if (!fieldHasValue(field, repeatedValues[index])) {
                        return false;
                    }
                }
                return true;
            }

            return fieldHasValue(field, value);
        });
    }, [formValues, uploadedFiles, orderedSteps, currentStep, manualMultipleConfig, getSubmittableFieldsForStep]);

    const fetchMetaData = async (processId, steps) => {
        try {
            const metaData = await apiFetch({ path: `/obatala/v1/process_obatala/${processId}/meta` });

            const submittedState = metaData.submittedStages || {};

            const updatedSubmittedSteps = steps.reduce((acc, step, index) => {
                if (submittedState[step.id]) {
                    acc[index] = true;
                }
                return acc;
            }, {});

            setSubmittedSteps(prev => ({ ...prev, ...updatedSubmittedSteps }));

            const stageData = metaData.stageData || {};

            const updatedFormValues = steps.reduce((acc, step) => {
                if (stageData[step.id]) {
                    acc[step.id] = stageData[step.id].fields.reduce((acc, field) => {
                        acc[field.fieldId] = field.value || '';
                        return acc;
                    }, {});
                }
                return acc;
            }, {});

            setFormValues(prev => ({ ...prev, ...updatedFormValues }));

            const updateCurrentStageData = steps.reduce((acc, step) => {
                if (stageData[step.id]) {
                    acc[step.id] = [stageData[step.id].updateAt, stageData[step.id].user];
                }
                return acc;
            }, {});

            setCurrentStageData(updateCurrentStageData);


        } catch (error) {
            console.error('Error fetching meta data:', error);
            setError('Error fetching meta data.');
        }
    };

    const handleFieldChange = (fieldId, newValue, itemIndex = null) => {
        const step = orderedSteps[currentStep];
        if (!step?.id) return;
        const stepId = step.id;

        if (newValue instanceof FileList) {
            const file = newValue[0];
            setUploadedFiles(prev => ({
                ...prev,
                [stepId]: {
                    ...prev[stepId],
                    [fieldId]: [file],
                },
            }))
            setFileInfo(prev => ({
                ...prev,
                [stepId]: {
                    ...prev[stepId],
                    [fieldId]: { name: file.name, size: file.size },
                },
            }));
            return;
        }

        const valueToSave = Array.isArray(newValue) ? newValue : [newValue];
        const fieldDefinition = step.data?.fields?.find((field) => String(field.id) === String(fieldId));

        setFormValues((prevValues) => {
            const currentStepValues = prevValues[stepId] || {};

            if (fieldDefinition && isRepeatedMappedField(fieldDefinition) && itemIndex !== null && itemIndex !== undefined) {
                const repeatedValues = [...normalizeArrayLike(currentStepValues[fieldId])];
                while (repeatedValues.length <= itemIndex) {
                    repeatedValues.push(['']);
                }
                repeatedValues[itemIndex] = valueToSave;

                return {
                    ...prevValues,
                    [stepId]: {
                        ...currentStepValues,
                        [fieldId]: repeatedValues,
                    },
                };
            }

            return {
                ...prevValues,
                [stepId]: {
                    ...currentStepValues,
                    [fieldId]: valueToSave,
                },
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const step = orderedSteps[currentStep];
        const stepId = step.id;
        const visibleFields = getSubmittableFieldsForStep(step);
        const visibleFieldIds = new Set(visibleFields.map((field) => String(field?.id || '')));
        const fields = visibleFields.map(field => ({
            fieldId: field.id,
            value: getFieldValueForSubmit(stepId, field),
        }));

        // Upload de arquivos 
        let uploadFailed = false;

        if (uploadedFiles[stepId]) {
            for (const [fieldId, files] of Object.entries(uploadedFiles[stepId])) {
                if (!visibleFieldIds.has(String(fieldId))) {
                    continue;
                }

                if (!files || !Array.isArray(files) || files.length === 0) {
                    continue;
                }

                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('id', process.id);
                formData.append('node_id', stepId);

                try {
                    const response = await apiFetch({
                        path: `/obatala/v1/process_type/upload`,
                        method: "POST",
                        headers: {
                            'X-WP-Nonce': ObatalaApi.nonce,
                        },
                        body: formData,
                    });
                    setFormValues(prev => ({
                        ...prev,
                        [stepId]: {
                            ...prev[stepId],
                            [fieldId]: file.name,
                        }
                    }));

                    setNotice({ status: 'success', message: 'Uploaded successfully.' });
                    setFileInfo({ name: file.name, size: file.size });
                } catch (error) {
                    setNotice({ status: 'error', message: `Erro ao enviar arquivo para o campo ${fieldId}: ${error}` });
                    uploadFailed = true;
                    break;
                }
            }

            if (uploadFailed) {
                setIsLoading(false);
                return;
            }
        }

        // Salvar metadados
        try {
            const existingMetaData = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'GET',
            });

            const updatedStageData = {
                ...existingMetaData.stageData,
                [stepId]: {
                    fields, updateAt: new Date(),
                    user: currentUser.name
                },
            };

            await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'POST',
                data: {
                    stageData: updatedStageData,
                    submittedStages: {
                        ...existingMetaData.submittedStages,
                        [stepId]: true,
                    },
                }
            });

            setSubmittedSteps(prev => ({
                ...prev,
                [currentStep]: true,
            }));

            setCurrentStageData(prev => ({
                ...prev,
                [stepId]: [new Date(), currentUser.name],
            }));

            const nodeUpdateResponse = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/node`,
                method: `PUT`,
                data: {
                    node_id: stepId
                }
            });

            const nextNodeId = nodeUpdateResponse?.next_node_id;
            if (nextNodeId) {
                const nextNode = process?.meta?.flowData?.nodes?.find(node => node.id === nextNodeId);
                const nextGroup = nextNode?.sector_obatala
                    ? getSectorName(nextNode.sector_obatala)
                    : '';

                await apiFetch({
                    path: `/obatala/v1/process_obatala/${process.id}/meta`,
                    method: 'POST',
                    data: {
                        current_stage: nextNodeId,
                        groupResponsible: nextGroup
                    }
                });
            }

            if (nodeUpdateResponse?.export_result) {
                setNotice(buildExportNoticeFromResult(nodeUpdateResponse.export_result));
            }

            await fetchUpdatedProcessNodes();
            await loadExportRuntime();
            await loadExportReview();

        } catch (error) {
            console.error('Erro ao salvar metadados:', error);

        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (fieldId) => {
        try {
            const stepId = orderedSteps[currentStep].id;
            const file =
                formValues[stepId]?.[fieldId] ||
                uploadedFiles[stepId]?.[fieldId]?.[0]?.name;

            if (!file) {
                setNotice({ status: 'error', message: 'Arquivo não encontrado para download.' });
                return;
            }
            const params = new URLSearchParams({
                id: process.id,
                user: currentUser.id,
                file: file,
                node_id: stepId
            });
            const response = await apiFetch({
                path: `/obatala/v1/process_type/download?${params}`,
                method: 'GET',
                parse: false
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            //Pega nome do arquivo
            const contentDisposition = response.headers.get('content-disposition');
            const fileName = contentDisposition
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'download.pdf'
                : 'download.pdf';

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            if (error.status === 403 || error?.error && error?.error === 'Permissao negada') {
                setNotice({ status: 'error', message: 'Você não tem permissão para baixar este arquivo.' });
            } else {
                setNotice({ status: 'error', message: 'Ocorreu um erro ao tentar baixar o arquivo.' });
            }
            console.error('Erro ao tentar baixar o arquivo:', error);
        }
    };

    const downloadBase64Pdf = (pdf, filename) => {
        const byteCharacters = atob(pdf);
        const byteNumbers = Array.from(byteCharacters, (char) => char.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'stage-document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const setStageDocumentValue = (stepId, fieldId, documentValue) => {
        setFormValues((prev) => ({
            ...prev,
            [stepId]: {
                ...prev[stepId],
                [fieldId]: [documentValue],
            },
        }));
    };

    const handleGenerateStageDocumentPdf = async (stepId, fieldId) => {
        try {
            const params = new URLSearchParams({
                node_id: stepId,
                field_id: fieldId,
            });
            const response = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/stage-document-pdf?${params}`,
                method: 'GET',
            });

            downloadBase64Pdf(response.pdf, response.filename);
            if (response.document) {
                setStageDocumentValue(stepId, fieldId, response.document);
            }
            setNotice({
                status: 'success',
                message: __('Document PDF generated successfully.', 'obatala'),
            });
        } catch (error) {
            setNotice({
                status: 'error',
                message: error.message || __('Could not generate the document PDF.', 'obatala'),
            });
        }
    };

    const handleSignedDocumentUpload = async (stepId, fieldId, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('node_id', stepId);
            formData.append('field_id', fieldId);

            const response = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/stage-document-signed`,
                method: 'POST',
                headers: {
                    'X-WP-Nonce': ObatalaApi.nonce,
                },
                body: formData,
            });

            if (response.document) {
                setStageDocumentValue(stepId, fieldId, response.document);
            }
            await fetchUpdatedProcessNodes();
            setNotice({
                status: 'success',
                message: __('Signed PDF attached successfully.', 'obatala'),
            });
        } catch (error) {
            setNotice({
                status: 'error',
                message: error.message || __('Could not attach the signed PDF.', 'obatala'),
            });
        }
    };

    const handleDownloadSignedDocument = async (stepId, fieldId) => {
        try {
            const params = new URLSearchParams({
                node_id: stepId,
                field_id: fieldId,
            });
            const response = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/stage-document-signed?${params}`,
                method: 'GET',
                parse: false,
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers.get('content-disposition');
            const fileName = contentDisposition
                ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') || 'signed-document.pdf'
                : 'signed-document.pdf';
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setNotice({
                status: 'error',
                message: error.message || __('Could not download the signed PDF.', 'obatala'),
            });
        }
    };

    const handleDownloadSpreadsheetTemplate = async () => {
        if (!processId) return;

        setIsTemplateDownloadLoading(true);
        try {
            const response = await fetchProcessSpreadsheetTemplate(processId);
            const base64 = response?.file;
            const fileName = response?.filename || `modelo-exportacao-processo-${processId}.csv`;
            const mimeType = response?.mime_type || 'text/csv;charset=utf-8';

            if (!base64) {
                throw new Error(__('Could not generate spreadsheet template.', 'obatala'));
            }

            const binary = window.atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i += 1) {
                bytes[i] = binary.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            const errorMessage = error?.message || error?.error || __('Error downloading spreadsheet template.', 'obatala');
            setNotice({
                status: 'error',
                message: String(errorMessage),
            });
        } finally {
            setIsTemplateDownloadLoading(false);
        }
    };

    const handleExportDecision = async (decision) => {
        if (!processId) return;

        setIsExportDecisionLoading(true);
        try {
            const response = await decideProcessExport(processId, decision);
            const exportResult = response?.export_result;

            if (exportResult) {
                setNotice(buildExportNoticeFromResult(exportResult));
            } else {
                setNotice({
                    status: response?.success ? 'success' : 'error',
                    message: response?.message || __('Could not complete export decision.', 'obatala'),
                });
            }

            const refreshedProcess = await fetchProcessById(processId);
            setProcess(refreshedProcess);
            await fetchUpdatedProcessNodes();
            await loadExportRuntime();
            await loadExportReview();
        } catch (error) {
            const errorMessage = error?.message || error?.error || __('Error while applying export decision.', 'obatala');
            setNotice({
                status: 'error',
                message: String(errorMessage),
            });
            await loadExportReview();
        } finally {
            setIsExportDecisionLoading(false);
        }
    };

    const isUserInSector = (stepSector) => {
        if (!Array.isArray(sectorUser)) {
            console.error("sectorUser não é um array válido:", sectorUser);
            return false;
        }
        return sectorUser.includes(stepSector);
    };

    if (isProcessLoading) return <Spinner />;

    if (!process) {
        return (
            <Notice status="warning" isDismissible={false}>
                {__("No process found.", "obatala")}
            </Notice>
        );
    }

    const baseOptions = orderedSteps.map(step => ({
        label: step.data.stageName,
        value: step.id,
        fields: step.data.fields,
        sector_stage: step.sector_obatala,
        isVirtualExportReview: false,
    }));

    const isTramitationFinished = progress === 100;
    const shouldShowExportReviewStep = Boolean(
        isTramitationFinished
        && exportReview?.runtime?.enabled
        && exportReview?.runtime?.requires_export_confirmation
    );

    const exportDecisionStatus = String(exportReview?.decision?.status || '').toLowerCase();
    const isExportReviewCompleted = ['confirmed', 'refused'].includes(exportDecisionStatus);

    const options = shouldShowExportReviewStep
        ? [
            ...baseOptions,
            {
                label: __('Export confirmation', 'obatala'),
                value: EXPORT_REVIEW_STEP_ID,
                fields: [],
                sector_stage: '',
                isVirtualExportReview: true,
            },
        ]
        : baseOptions;
    const processIsComplete = progress === 100 && (!shouldShowExportReviewStep || isExportReviewCompleted);

    const lastUpdateStage = (stepIndex) => {
        const stepValue = options[stepIndex]?.value;
        if (stepValue === EXPORT_REVIEW_STEP_ID) {
            const decisionDate = formatDateTime(exportReview?.decision?.decided_at);
            return {
                user: exportReview?.decision?.decided_by_name || __('Unknown', 'obatala'),
                dateFormat: decisionDate || __('Date not available', 'obatala'),
            };
        }
        const currentStepData = currentStageData[stepValue];
        const user = currentStepData ? currentStepData[1] : 'Desconhecido';
        const dateFormat = currentStepData && currentStepData[0]
            ? format(currentStepData[0], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            : 'Data não disponível';

        return { user, dateFormat };
    };

    const authorsById = allAuthors ? allAuthors.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {}) : {};

    const createAtProcess = () => {
        const formatDate = format(process?.date, "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
        })
        return formatDate;
    }

    return (
        <>
            <BrandHeader />
            <main>
                {isLoading ? (
                    <Spinner />
                ) : viewMode === "history" ? (
                        <HistoryViewer
                            process={process}
                            filteredProcessType={filteredProcessType}
                            authorsById={authorsById}
                            progress={progress}
                            isComplete={processIsComplete}
                            options={baseOptions}
                            currentStageData={currentStageData}
                            sectors={sectors}
                        />
                ) : (
                    <>
                        <ProcessHeader
                            process={process}
                            filteredProcessType={filteredProcessType}
                            authorsById={authorsById}
                            isComplete={processIsComplete}
                            progress={progress}
                        />
                        {notice && (
                            <Notice
                                status={notice.status}
                                isDismissible
                                onRemove={() => setNotice(null)}
                            >
                                {notice.message}
                            </Notice>
                        )}
                        {!isPublic && hasPermission === false && (
                            <Notice status="error" isDismissible={false}>
                                {__("You do not have permission to access this process.", "obatala")}
                            </Notice>
                        )}
                        <div className="panel-container">
                            <div className="accordion">
                                {options.map((step, index) => {
                                    const isVirtualExportReview = step.isVirtualExportReview === true;
                                    const isCompleted = isVirtualExportReview
                                        ? isExportReviewCompleted
                                        : Object.keys(currentStageData).includes(options[index]?.value);
                                    const isUserAllowed = isVirtualExportReview
                                        ? (hasPermission || isPublic)
                                        : isUserInSector(options[index].sector_stage);
                                    const isAccessRestricted = !(process.meta?.access_level?.[0] === 'Not restricted' ||
                                        process.meta?.access_level?.[0] === 'not restricted');
                                    const isDisabled = isVirtualExportReview
                                        ? ((progress < 100) || (isAccessRestricted && !isUserAllowed))
                                        : (isAccessRestricted ? !isUserAllowed : (!isCompleted && !isUserAllowed));
                                    return (
                                        <div key={index} className={`accordion-item ${isDisabled ? 'disabled' : ''}`}>
                                            <button
                                                className="accordion-header"
                                                onClick={() => !isDisabled && toggleAccordion(index)}
                                                aria-expanded={activeIndex === index}
                                                aria-controls={`accordion-content-${index}`}
                                                disabled={isDisabled}
                                            >
                                                <span className={`status ${isCompleted ? 'success' : isDisabled ? 'danger' : 'warning'}`}>
                                                    {isCompleted ? __('Completed', 'obatala') : __('Pending', 'obatala')}
                                                </span>
                                                <h2 className="accordion-title me-auto">{step.label}</h2>
                                                <div className="badge-container">
                                                    <span
                                                        className={`badge ${isCompleted ? 'success' : isDisabled ? 'danger' : 'warning'}`}
                                                        title={isCompleted ? `Concluído por ${lastUpdateStage(index).user}` : ''}
                                                    >
                                                        {isVirtualExportReview
                                                            ? (isCompleted
                                                                ? sprintf(__('Completed on %s', 'obatala'), lastUpdateStage(index).dateFormat)
                                                                : progress < 100
                                                                    ? __('Waiting process completion', 'obatala')
                                                                    : __('Pending decision', 'obatala'))
                                                            : (isCompleted
                                                                ? sprintf(__('Completed on %s', 'obatala'), lastUpdateStage(index).dateFormat)
                                                                : isDisabled
                                                                    ? __('Pending', 'obatala')
                                                                    : __('Pending input', 'obatala'))}
                                                    </span>
                                                    {options[index].sector_stage && !isVirtualExportReview && (
                                                        <span className="badge info" title={`Grupo responsável: ${getSectorName(options[index].sector_stage)}`}>
                                                            <Icon icon="groups" /> {getSectorName(options[index].sector_stage)}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                            {activeIndex === index && !isDisabled && (
                                                <div className="accordion-content">
                                                    {isVirtualExportReview ? (
                                                        <>
                                                            {progress < 100 && (
                                                                <Notice status="warning" isDismissible={false}>
                                                                    {__('Finalize all process steps before deciding the export.', 'obatala')}
                                                                </Notice>
                                                            )}

                                                            {!!exportReview?.message && (
                                                                <Notice status={exportReview?.success ? 'info' : 'warning'} isDismissible={false}>
                                                                    {exportReview.message}
                                                                </Notice>
                                                            )}

                                                            {Array.isArray(exportReview?.warnings) && exportReview.warnings.length > 0 && (
                                                                <Notice status="warning" isDismissible={false}>
                                                                    {exportReview.warnings.join(' | ')}
                                                                </Notice>
                                                            )}

                                                            <div style={{ marginBottom: '12px' }}>
                                                                <p style={{ margin: '0 0 6px' }}>
                                                                    <strong>{__('Collection', 'obatala')}:</strong> {exportReview?.runtime?.selected_profile?.label || __('Not defined', 'obatala')}
                                                                </p>
                                                                <p style={{ margin: '0 0 6px' }}>
                                                                    <strong>{__('Expected items', 'obatala')}:</strong> {Number(exportReview?.total_rows || 0)}
                                                                </p>
                                                                <p style={{ margin: '0' }}>
                                                                    <strong>{__('Decision status', 'obatala')}:</strong> {exportReview?.decision?.status || 'pending'}
                                                                </p>
                                                            </div>

                                                            {Array.isArray(exportReview?.rows_preview) && exportReview.rows_preview.length > 0 ? (
                                                                <div style={{ overflowX: 'auto', border: '1px solid #dcdcde', borderRadius: '6px' }}>
                                                                    <table className="wp-list-table widefat fixed striped" style={{ minWidth: '960px' }}>
                                                                        <thead>
                                                                            <tr>
                                                                                <th style={{ width: '80px' }}>{__('Item', 'obatala')}</th>
                                                                                {(exportReview?.runtime?.mapped_fields || []).map((field) => (
                                                                                    <th key={field.obatala_field_id}>
                                                                                        {field.obatala_field_label}
                                                                                    </th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {exportReview.rows_preview.map((row, rowIndex) => (
                                                                                <tr key={`export-preview-row-${rowIndex}`}>
                                                                                    <td><strong>{rowIndex + 1}</strong></td>
                                                                                    {(exportReview?.runtime?.mapped_fields || []).map((field) => (
                                                                                        <td key={`${rowIndex}-${field.obatala_field_id}`}>
                                                                                            {stringifyPreviewValue(row?.[field.obatala_field_id]) || '-'}
                                                                                        </td>
                                                                                    ))}
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <Notice status="warning" isDismissible={false}>
                                                                    {__('No export items could be summarized for this process.', 'obatala')}
                                                                </Notice>
                                                            )}

                                                            {exportReview?.truncated && (
                                                                <p style={{ marginTop: '8px' }}>
                                                                    {sprintf(__('Showing first %d items of %d.', 'obatala'), Number(exportReview.preview_limit || 0), Number(exportReview.total_rows || 0))}
                                                                </p>
                                                            )}

                                                            {!isExportReviewCompleted && progress === 100 && (
                                                                <div className="action-bar">
                                                                    <Button
                                                                        variant="primary"
                                                                        onClick={() => handleExportDecision('confirm')}
                                                                        disabled={isExportDecisionLoading || !isUserAllowed}
                                                                    >
                                                                        {isExportDecisionLoading ? __('Processing...', 'obatala') : __('Confirm export', 'obatala')}
                                                                    </Button>
                                                                    <Button
                                                                        variant="secondary"
                                                                        onClick={() => handleExportDecision('refuse')}
                                                                        disabled={isExportDecisionLoading || !isUserAllowed}
                                                                    >
                                                                        {__('Refuse export', 'obatala')}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : orderedSteps.length > 0 && orderedSteps[currentStep] ? (
                                                        <>
                                                            {!isUserAllowed && !isPublic && !isCompleted && (
                                                                <Notice status="warning" isDismissible={false}>
                                                                    {__("You can only view this step.", "obatala")}
                                                                </Notice>
                                                            )}
                                                            {currentStepVisibleFields.length > 0 ? (
                                                                !submittedSteps[currentStep] ? (
                                                                    <form onSubmit={handleSubmit}>
                                                                        <div className="meta-field-wrapper">
                                                                            {Array.isArray(currentStepSingleFields) ? currentStepSingleFields.map((field, idx) => {
                                                                                const stepId = orderedSteps[currentStep].id;
                                                                                const isSpreadsheetUploadField = String(field?.id || '') === currentRuntimeSpreadsheetUploadFieldId
                                                                                    && String(field?.type || '') === 'upload';
                                                                                const uploadTemplateAction = isSpreadsheetUploadField
                                                                                    ? {
                                                                                        show: true,
                                                                                        onClick: handleDownloadSpreadsheetTemplate,
                                                                                        isLoading: isTemplateDownloadLoading,
                                                                                        label: __('Download spreadsheet example', 'obatala'),
                                                                                    }
                                                                                    : null;

                                                                                return (
                                                                                    <MetaFieldInputs
                                                                                        key={`${stepId}-meta-${idx}-single`}
                                                                                        field={field}
                                                                                        fieldId={field.id}
                                                                                        itemIndex={null}
                                                                                        initalValue={getFieldInitialValue(stepId, field, 0)}
                                                                                        isEditable={!submittedSteps[currentStep]}
                                                                                        noHasPermission={!isUserAllowed}
                                                                                        onFieldChange={handleFieldChange}
                                                                                        fileInfo={fileInfo}
                                                                                        handleDownload={handleDownload}
                                                                                        uploadTemplateAction={uploadTemplateAction}
                                                                                        stepId={stepId}
                                                                                    />
                                                                                );
                                                                            }) : null}

                                                                            {currentStepSpreadsheetMappedFields.length > 0 && (
                                                                                <div className="flex-basis-100">
                                                                                    <Notice status="info" isDismissible={false}>
                                                                                        {__('The metadata fields below will be loaded from the spreadsheet rows after upload.', 'obatala')}
                                                                                    </Notice>
                                                                                    <p style={{ marginTop: '8px' }}>
                                                                                        <strong>{__('Mapped metadata fields', 'obatala')}:</strong>{' '}
                                                                                        {currentStepSpreadsheetMappedFields
                                                                                            .map((field) => field?.config?.label || field?.id)
                                                                                            .filter(Boolean)
                                                                                            .join(', ')}
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            {currentStepRepeatedFields.length > 0 && (
                                                                                <div className="flex-basis-100 obatala-items-matrix">
                                                                                    <div className="group-button" style={{ marginBottom: '8px' }}>
                                                                                        <Button
                                                                                            variant="secondary"
                                                                                            onClick={() => setIsItemsMatrixOpen((previous) => !previous)}
                                                                                            disabled={!isUserAllowed}
                                                                                        >
                                                                                            {isItemsMatrixOpen
                                                                                                ? __('Hide items table', 'obatala')
                                                                                                : sprintf(__('Fill %d items in table', 'obatala'), currentStepMatrixRowCount)}
                                                                                        </Button>
                                                                                    </div>

                                                                                    {isItemsMatrixOpen && (
                                                                                        <div style={{ overflowX: 'auto', border: '1px solid #dcdcde', borderRadius: '6px' }}>
                                                                                            <table className="wp-list-table widefat fixed striped" style={{ minWidth: '960px' }}>
                                                                                                <thead>
                                                                                                    <tr>
                                                                                                        <th style={{ width: '80px' }}>{__('Item', 'obatala')}</th>
                                                                                                        {currentStepRepeatedFields.map((field) => (
                                                                                                            <th key={`matrix-head-${field.id}`}>
                                                                                                                {field.config?.label || field.id}
                                                                                                            </th>
                                                                                                        ))}
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    {Array.from({ length: currentStepMatrixRowCount }).map((_, rowIndex) => {
                                                                                                        const stepId = orderedSteps[currentStep].id;
                                                                                                        return (
                                                                                                            <tr key={`matrix-row-${stepId}-${rowIndex}`}>
                                                                                                                <td><strong>{rowIndex + 1}</strong></td>
                                                                                                                {currentStepRepeatedFields.map((field) => (
                                                                                                                    <td key={`matrix-cell-${stepId}-${field.id}-${rowIndex}`}>
                                                                                                                        <MetaFieldInputs
                                                                                                                            key={`${stepId}-meta-matrix-${field.id}-${rowIndex}`}
                                                                                                                            field={field}
                                                                                                                            fieldId={field.id}
                                                                                                                            itemIndex={rowIndex}
                                                                                                                            labelOverride={' '}
                                                                                                                            initalValue={getFieldInitialValue(stepId, field, rowIndex)}
                                                                                                                            isEditable={!submittedSteps[currentStep]}
                                                                                                                            noHasPermission={!isUserAllowed}
                                                                                                                            onFieldChange={handleFieldChange}
                                                                                                                            fileInfo={fileInfo}
                                                                                                                            handleDownload={handleDownload}
                                                                                                                            stepId={stepId}
                                                                                                                        />
                                                                                                                    </td>
                                                                                                                ))}
                                                                                                            </tr>
                                                                                                        );
                                                                                                    })}
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {!submittedSteps[currentStep] && (
                                                                            <div className="action-bar">
                                                                                <Button
                                                                                    variant="primary"
                                                                                    type="submit"
                                                                                    disabled={!canSubmitCurrentStep || submittedSteps[currentStep] || !isUserAllowed}
                                                                                >
                                                                                    {__("Submit", "obatala")}
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </form>
                                                                ) : (
                                                                    <dl className="description-list my-0">
                                                                        {Array.isArray(currentStepDisplayFields) ? currentStepDisplayFields.map((field, idx) => (
                                                                            <MetaFieldDisplay
                                                                                key={`${orderedSteps[currentStep].id}-meta-${idx}`}
                                                                                field={field}
                                                                                value={
                                                                                    formValues[orderedSteps[currentStep].id]?.[field.id] || uploadedFiles[orderedSteps[currentStep].id]?.[field.id]?.[0]?.name
                                                                                }
                                                                                handleDownload={handleDownload}
                                                                                fieldId={field.id}
                                                                                stepId={orderedSteps[currentStep].id}
                                                                                handleGenerateStageDocumentPdf={handleGenerateStageDocumentPdf}
                                                                                handleSignedDocumentUpload={handleSignedDocumentUpload}
                                                                                handleDownloadSignedDocument={handleDownloadSignedDocument}
                                                                            />
                                                                        )) : null}
                                                                    </dl>
                                                                )
                                                            ) : (
                                                                <Notice status="warning" isDismissible={false}>
                                                                    {__("No fields found for this step.", "obatala")}
                                                                </Notice>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Notice status="warning" isDismissible={false}>
                                                            {__("No steps found for this process.", "obatala")}
                                                        </Notice>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <aside>
                                {processIsComplete && !hasComments ? (null) : (
                                    <Panel>
                                        <PanelHeader>{__("Comments", "obatala")}</PanelHeader>
                                        <CommentForm processId={processId || null} setHasComments={setHasComments} />
                                    </Panel>
                                )}
                                <Panel>
                                    <PanelHeader>{__("History", "obatala")}</PanelHeader>
                                    <PanelRow>
                                        <ProcessUserLog
                                            stages={baseOptions}
                                            process={process}
                                            currentStageData={currentStageData}
                                            authorsById={authorsById}
                                            sectors={sectors}
                                        />
                                    </PanelRow>
                                </Panel>
                            </aside>
                        </div>
                    </>
                )}
            </main>
            <BrandFooter />
        </>
    );
}

export default ProcessViewer;
