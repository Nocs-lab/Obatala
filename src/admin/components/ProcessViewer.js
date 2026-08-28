import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { __, sprintf } from '@wordpress/i18n';
import {
    Icon,
    Spinner,
    Notice,
    Panel,
    PanelBody,
    PanelHeader,
    PanelRow,
    Button,
    Modal,
    TextControl,
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
    saveProcessManualItems,
} from "../api/apiRequests";
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import MetaFieldDisplay from "./ProcessManager/MetaFieldDisplay";
import ProcessHeader from './ProcessManager/ProcessHeader';
import TainacanExportPreparation from './ProcessManager/TainacanExportPreparation';
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

const spreadsheetCellHasValue = (value) => {
    if (Array.isArray(value)) {
        return value.some((entry) => spreadsheetCellHasValue(entry));
    }

    if (value && typeof value === 'object') {
        return Object.values(value).some((entry) => spreadsheetCellHasValue(entry));
    }

    if (value === undefined || value === null) {
        return false;
    }

    return String(value).trim() !== '';
};

const stringifySpreadsheetCellValue = (value) => {
    if (Array.isArray(value)) {
        return value.map((entry) => stringifySpreadsheetCellValue(entry)).filter(Boolean).join(' | ');
    }

    if (value && typeof value === 'object') {
        return Object.values(value)
            .map((entry) => stringifySpreadsheetCellValue(entry))
            .filter(Boolean)
            .join(' | ');
    }

    if (value === undefined || value === null) {
        return '';
    }

    return String(value);
};

const normalizeSpreadsheetRowsForEditor = (rows) => {
    if (!Array.isArray(rows)) {
        return [];
    }

    return rows.map((row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) {
            return {};
        }

        return { ...row };
    });
};

const getSpreadsheetFieldLabel = (field) => {
    return field?.config?.label || field?.title || field?.id || __('Field', 'obatala');
};

const normalizeSpreadsheetHeaderKey = (value) => {
    let normalized = String(value ?? '').replace(/^\uFEFF/, '').trim().toLowerCase();

    if (!normalized) {
        return '';
    }

    if (typeof normalized.normalize === 'function') {
        normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    return normalized
        .replace(/\s+/g, ' ')
        .replace(/[_-]/g, ' ')
        .trim();
};

const countCsvDelimiterOutsideQuotes = (line, delimiter) => {
    let count = 0;
    let inQuotes = false;

    for (let index = 0; index < line.length; index++) {
        const character = line[index];

        if (character === '"') {
            if (inQuotes && line[index + 1] === '"') {
                index++;
                continue;
            }

            inQuotes = !inQuotes;
            continue;
        }

        if (character === delimiter && !inQuotes) {
            count++;
        }
    }

    return count;
};

const detectCsvDelimiter = (line) => {
    const semicolonCount = countCsvDelimiterOutsideQuotes(line, ';');
    const commaCount = countCsvDelimiterOutsideQuotes(line, ',');

    return semicolonCount > commaCount ? ';' : ',';
};

const parseCsvHeaderLine = (line, delimiter) => {
    const cells = [];
    let value = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index++) {
        const character = line[index];

        if (character === '"') {
            if (inQuotes && line[index + 1] === '"') {
                value += '"';
                index++;
                continue;
            }

            inQuotes = !inQuotes;
            continue;
        }

        if (character === delimiter && !inQuotes) {
            cells.push(value.trim());
            value = '';
            continue;
        }

        value += character;
    }

    cells.push(value.trim());
    return cells;
};

const getMappedFieldDisplayName = (mappedField, index = 0) => {
    return String(
        mappedField?.obatala_field_label
        || mappedField?.tainacan_metadata_name
        || mappedField?.obatala_field_id
        || sprintf(__('Campo %d', 'obatala'), index + 1)
    ).trim();
};

const getUniqueSpreadsheetHeaderLabels = (mappedFields) => {
    const usedHeaders = new Set();

    return mappedFields.map((mappedField, index) => {
        const baseLabel = getMappedFieldDisplayName(mappedField, index) || sprintf(__('Campo %d', 'obatala'), index + 1);
        let candidate = baseLabel;
        let counter = 2;
        let normalizedCandidate = normalizeSpreadsheetHeaderKey(candidate);

        while (normalizedCandidate && usedHeaders.has(normalizedCandidate)) {
            candidate = sprintf('%1$s (%2$d)', baseLabel, counter);
            normalizedCandidate = normalizeSpreadsheetHeaderKey(candidate);
            counter++;
        }

        if (normalizedCandidate) {
            usedHeaders.add(normalizedCandidate);
        }

        return candidate;
    });
};

const getMappedFieldHeaderAliases = (mappedField, index = 0, expectedHeader = '') => {
    const candidates = [
        expectedHeader,
        mappedField?.obatala_field_label,
        mappedField?.obatala_field_id,
        mappedField?.tainacan_metadata_name,
        mappedField?.tainacan_metadata_id,
        getMappedFieldDisplayName(mappedField, index),
    ];

    return candidates
        .map((candidate) => normalizeSpreadsheetHeaderKey(candidate))
        .filter((candidate, candidateIndex, aliases) => (
            candidate && aliases.indexOf(candidate) === candidateIndex
        ));
};

const formatSpreadsheetHeaderList = (values, fallback) => {
    const safeValues = values
        .map((value) => String(value ?? '').trim())
        .filter(Boolean);

    return safeValues.length > 0 ? safeValues.join(', ') : fallback;
};

const buildSpreadsheetStructureMessage = (missingHeaders, headers, expectedHeaders, noMatch = false) => {
    const foundHeaders = headers.map((header) => String(header ?? '').trim()).filter(Boolean);

    const baseMessage = noMatch
        ? __('O cabeçalho da planilha não corresponde a nenhum field mapeado.', 'obatala')
        : __('A planilha não possui todas as colunas mapeadas.', 'obatala');

    return sprintf(
        __('%1$s Colunas faltando: %2$s. Colunas encontradas: %3$s. Cabeçalhos esperados no modelo: %4$s.', 'obatala'),
        baseMessage,
        formatSpreadsheetHeaderList(missingHeaders, __('nenhuma', 'obatala')),
        formatSpreadsheetHeaderList(foundHeaders, __('nenhuma', 'obatala')),
        formatSpreadsheetHeaderList(expectedHeaders, __('nenhum', 'obatala'))
    );
};

const validateSpreadsheetCsvStructure = (csvContent, mappedFields) => {
    const safeMappedFields = Array.isArray(mappedFields)
        ? mappedFields.filter((mappedField) => mappedField && typeof mappedField === 'object')
        : [];

    if (safeMappedFields.length === 0) {
        return { status: 'skipped' };
    }

    const headerLine = String(csvContent || '')
        .split(/\r\n|\n|\r/)
        .find((line) => String(line || '').trim() !== '');

    if (!headerLine) {
        return {
            status: 'invalid',
            message: __('A planilha está vazia.', 'obatala'),
        };
    }

    const delimiter = detectCsvDelimiter(headerLine);
    const headers = parseCsvHeaderLine(headerLine, delimiter);
    const normalizedHeaders = new Set(
        headers
            .map((header) => normalizeSpreadsheetHeaderKey(header))
            .filter(Boolean)
    );
    const expectedHeaders = getUniqueSpreadsheetHeaderLabels(safeMappedFields);
    const missingHeaders = [];

    safeMappedFields.forEach((mappedField, index) => {
        const hasColumn = getMappedFieldHeaderAliases(
            mappedField,
            index,
            expectedHeaders[index] || ''
        ).some((alias) => normalizedHeaders.has(alias));

        if (!hasColumn) {
            missingHeaders.push(expectedHeaders[index] || getMappedFieldDisplayName(mappedField, index));
        }
    });

    const noMatch = missingHeaders.length === safeMappedFields.length;

    if (missingHeaders.length > 0) {
        return {
            status: 'invalid',
            message: buildSpreadsheetStructureMessage(missingHeaders, headers, expectedHeaders, noMatch),
        };
    }

    return { status: 'valid' };
};

const validateSpreadsheetFileStructure = (file, mappedFields) => {
    if (!(file instanceof File)) {
        return Promise.resolve({ status: 'skipped' });
    }

    const fileName = String(file.name || '').toLowerCase();
    const fileType = String(file.type || '').toLowerCase();
    const isCsvFile = fileName.endsWith('.csv') || fileType.includes('csv');

    if (!isCsvFile) {
        return Promise.resolve({ status: 'unsupported' });
    }

    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(validateSpreadsheetCsvStructure(String(reader.result || ''), mappedFields));
        };
        reader.onerror = () => {
            resolve({
                status: 'invalid',
                message: __('Não foi possível ler o arquivo selecionado para validar as colunas.', 'obatala'),
            });
        };

        reader.readAsText(file);
    });
};

const toSpreadsheetInputDate = (value) => {
    const stringValue = stringifySpreadsheetCellValue(value);
    if (!stringValue) return '';

    const brDateMatch = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brDateMatch) {
        return `${brDateMatch[3]}-${brDateMatch[2]}-${brDateMatch[1]}`;
    }

    return stringValue;
};

const fromSpreadsheetInputDate = (value) => {
    if (!value) return '';

    const inputDateMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (inputDateMatch) {
        return `${inputDateMatch[3]}/${inputDateMatch[2]}/${inputDateMatch[1]}`;
    }

    return String(value);
};

const SpreadsheetMappedFieldsSummary = ({
    fields,
    rows,
    runtimeConfig,
    onOpenField,
    canEdit,
    isSaving,
}) => {
    if (!Array.isArray(fields) || fields.length === 0) {
        return null;
    }

    const safeRows = Array.isArray(rows) ? rows : [];
    const rowCount = safeRows.length;
    const source = String(runtimeConfig?.spreadsheet_rows_source || 'none');
    const message = String(runtimeConfig?.spreadsheet_rows_message || '');
    const warnings = Array.isArray(runtimeConfig?.spreadsheet_rows_warnings)
        ? runtimeConfig.spreadsheet_rows_warnings
        : [];
    const noticeStatus = source === 'error'
        ? 'error'
        : source === 'manual'
            ? 'success'
            : rowCount > 0
                ? 'info'
                : 'warning';

    const buildSummaryValue = (field) => {
        const fieldId = String(field?.id || '');
        const values = safeRows
            .map((row) => row?.[fieldId])
            .filter((value) => spreadsheetCellHasValue(value));

        if (rowCount === 0) {
            return runtimeConfig?.spreadsheet_file_exists
                ? __('No spreadsheet values found.', 'obatala')
                : __('Waiting for spreadsheet upload.', 'obatala');
        }

        if (values.length === 0) {
            return __('No values filled in the spreadsheet.', 'obatala');
        }

        if (rowCount === 1) {
            return stringifySpreadsheetCellValue(values[0]);
        }

        return sprintf(
            __('%d spreadsheet row(s), %d filled value(s).', 'obatala'),
            rowCount,
            values.length
        );
    };

    return (
        <div className="flex-basis-100 obatala-spreadsheet-summary">
            {message && (
                <Notice status={noticeStatus} isDismissible={false}>
                    {message}
                </Notice>
            )}

            {warnings.length > 0 && (
                <Notice status="warning" isDismissible={false}>
                    {warnings.join(' | ')}
                </Notice>
            )}

            <div className="obatala-spreadsheet-summary__fields">
                {fields.map((field) => {
                    const fieldId = String(field?.id || '');
                    const label = getSpreadsheetFieldLabel(field);
                    const buttonLabel = rowCount > 1
                        ? sprintf(__('View/edit %d values', 'obatala'), rowCount)
                        : __('Edit spreadsheet value', 'obatala');

                    return (
                        <div
                            className="meta-field md obatala-spreadsheet-summary__field"
                            key={`spreadsheet-summary-${fieldId}`}
                        >
                            <TextControl
                                label={label}
                                value={buildSummaryValue(field)}
                                disabled
                            />
                            {rowCount > 0 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => onOpenField(field)}
                                    disabled={!canEdit || isSaving}
                                >
                                    {buttonLabel}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SpreadsheetRowsModal = ({
    field,
    rows,
    canEdit,
    isSaving,
    onChange,
    onClose,
    onSave,
}) => {
    if (!field) {
        return null;
    }

    const safeRows = Array.isArray(rows) ? rows : [];
    const fieldId = String(field?.id || '');
    const fieldType = String(field?.type || '');
    const label = getSpreadsheetFieldLabel(field);

    return (
        <Modal
            title={sprintf(__('Spreadsheet values: %s', 'obatala'), label)}
            onRequestClose={onClose}
            className="obatala-spreadsheet-modal"
            shouldCloseOnClickOutside={!isSaving}
        >
            <div className="obatala-spreadsheet-modal__table-wrap">
                <table className="wp-list-table widefat fixed striped obatala-spreadsheet-modal__table">
                    <thead>
                        <tr>
                            <th>{__('Row', 'obatala')}</th>
                            <th>{label}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeRows.map((row, rowIndex) => {
                            const value = row?.[fieldId] ?? '';
                            const inputLabel = sprintf(
                                __('%1$s, row %2$d', 'obatala'),
                                label,
                                rowIndex + 1
                            );

                            return (
                                <tr key={`spreadsheet-modal-${fieldId}-${rowIndex}`}>
                                    <td><strong>{rowIndex + 1}</strong></td>
                                    <td>
                                        {fieldType === 'datepicker' ? (
                                            <input
                                                type="date"
                                                aria-label={inputLabel}
                                                value={toSpreadsheetInputDate(value)}
                                                onChange={(event) => onChange(
                                                    rowIndex,
                                                    fieldId,
                                                    fromSpreadsheetInputDate(event.target.value)
                                                )}
                                                disabled={!canEdit || isSaving}
                                            />
                                        ) : (
                                            <TextControl
                                                label={inputLabel}
                                                hideLabelFromVision
                                                type={fieldType === 'number' ? 'number' : 'text'}
                                                value={stringifySpreadsheetCellValue(value)}
                                                onChange={(newValue) => onChange(rowIndex, fieldId, newValue)}
                                                disabled={!canEdit || isSaving}
                                            />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="action-bar obatala-spreadsheet-modal__actions">
                <Button
                    variant="primary"
                    onClick={onSave}
                    disabled={!canEdit || isSaving}
                    isBusy={isSaving}
                >
                    {isSaving ? __('Saving...', 'obatala') : __('Save spreadsheet values', 'obatala')}
                </Button>
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSaving}
                >
                    {__('Close', 'obatala')}
                </Button>
            </div>
        </Modal>
    );
};

const ProcessViewer = () => {
    const [process, setProcess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep] = useState(0);
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
    const [isItemsMatrixOpen, setIsItemsMatrixOpen] = useState(false);
    const [exportRuntimeConfig, setExportRuntimeConfig] = useState(null);
    const [exportReview, setExportReview] = useState(null);
    const [isExportDecisionLoading, setIsExportDecisionLoading] = useState(false);
    const [isTemplateDownloadLoading, setIsTemplateDownloadLoading] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmittingStep, setIsSubmittingStep] = useState(false);
    const [spreadsheetRows, setSpreadsheetRows] = useState([]);
    const [activeSpreadsheetField, setActiveSpreadsheetField] = useState(null);
    const [isSpreadsheetRowsSaving, setIsSpreadsheetRowsSaving] = useState(false);
    const [isCorrectedSpreadsheetUploading, setIsCorrectedSpreadsheetUploading] = useState(false);
    const [pendingSpreadsheetUpload, setPendingSpreadsheetUpload] = useState(null);
    const spreadsheetValidationRequestRef = useRef(0);

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

    const normalizeProcessTypeId = (value) => {
        if (Array.isArray(value)) {
            return value[0] || null;
        }

        if (value && typeof value === 'object') {
            return value.id || Object.values(value)[0] || null;
        }

        if (typeof value === 'string') {
            const serializedMatch = value.match(/s:\d+:"(\d+)"/);
            if (serializedMatch?.[1]) {
                return serializedMatch[1];
            }

            const serializedIntegerMatches = [...value.matchAll(/i:(\d+);/g)];
            if (serializedIntegerMatches.length > 0) {
                return serializedIntegerMatches[serializedIntegerMatches.length - 1][1];
            }

            const trimmedValue = value.trim();
            if (/^\d+$/.test(trimmedValue)) {
                return trimmedValue;
            }

            const numericMatch = value.match(/(?:^|[^\d])(\d+)(?:[^\d]|$)/);
            return numericMatch?.[1] || null;
        }

        return value || null;
    };

    const buildExportNoticeFromResult = (exportResult) => {
        const status = exportResult?.status || 'error';
        const exportedItems = Array.isArray(exportResult?.exported_items) ? exportResult.exported_items : [];
        const failedItems = Array.isArray(exportResult?.failed_items) ? exportResult.failed_items : [];
        const warnings = Array.isArray(exportResult?.warnings) ? exportResult.warnings : [];

        const exportedLabel = exportedItems.length
            ? sprintf(__('Exported items: %s.', 'obatala'), exportedItems.map((item) => `#${item.item_id}`).join(', '))
            : '';
        const failedLabel = failedItems.length
            ? sprintf(__('Failures: %s.', 'obatala'), failedItems.map((item) => sprintf(__('row %s', 'obatala'), item.row)).join(', '))
            : '';
        const warningLabel = warnings.length
            ? sprintf(__('Warnings: %s.', 'obatala'), warnings.join(' | '))
            : '';

        return {
            status: status === 'success' ? 'success' : (status === 'partial' || status === 'skipped' || status === 'pending') ? 'warning' : 'error',
            message: `${exportResult?.message || __('Export completed.', 'obatala')} ${exportedLabel} ${failedLabel} ${warningLabel}`.trim(),
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

    const handleExportPreparationSaved = async (response) => {
        if (response?.runtime) {
            setExportRuntimeConfig(response.runtime);
        } else {
            await loadExportRuntime();
        }
        setNotice({
            status: 'success',
            message: response?.message || __('Export preparation saved successfully.', 'obatala'),
        });
        await loadExportReview();
        await fetchUpdatedProcessNodes();
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
        setSpreadsheetRows(normalizeSpreadsheetRowsForEditor(exportRuntimeConfig?.spreadsheet_rows));
    }, [exportRuntimeConfig]);

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

                    const processTypeId = normalizeProcessTypeId(data.meta?.process_type);
                    if (processTypeId) {
                        fetchProcessTypeById(processTypeId)
                            .then((processType) => {
                                setFilteredProcessType(processType);
                            })
                            .catch((error) => {
                                console.error("Error fetching process type:", error);
                                setNotice({
                                    status: 'warning',
                                    message: __("Process type details could not be loaded.", "obatala"),
                                });
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
                    setHasPermission(Boolean(result.status));
                    setSectorUser(Array.isArray(result.data_sector) ? result.data_sector : [])
                })
                .catch((error) => {
                    console.error("Error fetching process:", error);
                    setHasPermission(false);
                    setSectorUser([]);
                    setNotice({
                        status: 'warning',
                        message: __("Process permissions could not be fully loaded.", "obatala"),
                    });
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

    const stageDocumentRequiresSignedUpload = (field) => {
        return field?.type === 'stage_document' && Boolean(field?.config?.requireSignedUpload);
    };

    const stageDocumentHasSignedUpload = (value, field) => {
        const documentValue = normalizeDocumentValue(value, field);
        const signedName = documentValue?.signedFile?.name ?? '';
        return String(signedName).trim() !== '';
    };

    const fieldBlocksSubmit = (field) => {
        return isFieldRequired(field) || stageDocumentRequiresSignedUpload(field);
    };

    const fieldMeetsSubmitRequirements = (field, value) => {
        if (field?.type === 'stage_document') {
            const documentValue = normalizeDocumentValue(value, field);

            if (isFieldRequired(field) && stripHtml(documentValue.content) === '') {
                return false;
            }

            if (stageDocumentRequiresSignedUpload(field) && !stageDocumentHasSignedUpload(value, field)) {
                return false;
            }

            return true;
        }

        if (!isFieldRequired(field)) {
            return true;
        }

        return fieldHasValue(field, value);
    };

    const isFieldRequired = (field) => {
        const required = field?.config?.required;

        if (required === true || required === 1) {
            return true;
        }

        if (required === false || required === 0 || required === null || required === undefined) {
            return false;
        }

        if (typeof required === 'string') {
            const normalized = required.trim().toLowerCase();
            if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'nao' || normalized === 'não') {
                return false;
            }

            return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'sim';
        }

        return Boolean(required);
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
    const isCurrentSpreadsheetUploadField = useCallback((field) => {
        const fieldId = String(field?.id || field || '');
        const fieldType = String(field?.type || '');

        if (!fieldId) {
            return false;
        }

        if (fieldType && fieldType !== 'upload') {
            return false;
        }

        return fieldId === currentRuntimeSpreadsheetUploadFieldId
            || fieldId === CONTROL_FIELD_IDS.spreadsheetUpload;
    }, [currentRuntimeSpreadsheetUploadFieldId]);

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

        if (isCurrentSpreadsheetUploadField(field)) {
            return false;
        }

        if (CONTROL_FIELD_ID_SET.has(fieldId)) {
            return false;
        }

        return mappedFieldIdsForCurrentStep.has(fieldId);
    }, [
        isSpreadsheetEntryModeActive,
        exportRuntimeConfig,
        isCurrentSpreadsheetUploadField,
        mappedFieldIdsForCurrentStep,
    ]);

    const clearSpreadsheetUploadValidationState = useCallback(() => {
        setSpreadsheetRows([]);
        setActiveSpreadsheetField(null);
        setExportRuntimeConfig((previousRuntime) => {
            if (!previousRuntime) {
                return previousRuntime;
            }

            return {
                ...previousRuntime,
                spreadsheet_rows: [],
                spreadsheet_rows_source: 'none',
                spreadsheet_rows_message: '',
                spreadsheet_rows_warnings: [],
            };
        });
        setNotice((previousNotice) => (
            previousNotice?.status === 'error' ? null : previousNotice
        ));
    }, []);

    const applySpreadsheetFileStructureValidation = useCallback((file) => {
        const requestId = spreadsheetValidationRequestRef.current + 1;
        spreadsheetValidationRequestRef.current = requestId;

        let mappedFields = Array.isArray(exportRuntimeConfig?.mapped_fields)
            ? exportRuntimeConfig.mapped_fields
            : [];

        const runValidation = async () => {
            if (mappedFields.length === 0 && processId) {
                try {
                    const runtime = await fetchProcessExportRuntime(processId);
                    if (spreadsheetValidationRequestRef.current !== requestId) {
                        return;
                    }

                    setExportRuntimeConfig((previousRuntime) => ({
                        ...(previousRuntime || {}),
                        ...(runtime || {}),
                        spreadsheet_rows: [],
                        spreadsheet_rows_source: 'none',
                        spreadsheet_rows_message: '',
                        spreadsheet_rows_warnings: [],
                    }));
                    mappedFields = Array.isArray(runtime?.mapped_fields) ? runtime.mapped_fields : [];
                } catch (runtimeError) {
                    console.error('Erro ao carregar mapeamento para validar a planilha:', runtimeError);
                }
            }

            const validationResult = await validateSpreadsheetFileStructure(file, mappedFields);

            if (spreadsheetValidationRequestRef.current !== requestId) {
                return;
            }

            if (validationResult?.status === 'invalid') {
                const message = validationResult.message || __('Não foi possível validar as colunas da planilha.', 'obatala');
                setPendingSpreadsheetUpload((previousUpload) => (
                    previousUpload
                        ? {
                            ...previousUpload,
                            validationStatus: 'invalid',
                            validationMessage: message,
                        }
                        : previousUpload
                ));
                return;
            }

            if (validationResult?.status === 'valid') {
                const message = __('Colunas da planilha validadas. Envie a etapa para processar o arquivo.', 'obatala');
                setPendingSpreadsheetUpload((previousUpload) => (
                    previousUpload
                        ? {
                            ...previousUpload,
                            validationStatus: 'valid',
                            validationMessage: message,
                        }
                        : previousUpload
                ));
                return;
            }

            const validationStatus = validationResult?.status || 'skipped';
            const validationMessage = validationStatus === 'unsupported'
                ? __('Arquivo selecionado. A estrutura será validada ao enviar a etapa.', 'obatala')
                : '';

            setPendingSpreadsheetUpload((previousUpload) => (
                previousUpload
                    ? {
                        ...previousUpload,
                        validationStatus,
                        validationMessage,
                    }
                    : previousUpload
            ));
        };

        runValidation();
    }, [exportRuntimeConfig, processId]);

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

        const singleValue = rawValue
            ?? uploadedFiles?.[stepId]?.[field.id]?.[0]?.name
            ?? fileInfo?.[stepId]?.[field.id]?.name;
        if (hasValue(singleValue)) {
            return unwrapSingleValue(singleValue);
        }

        if (shouldPrefillUniquePrefix) {
            return uniqueIdPrefix;
        }

        return unwrapSingleValue(singleValue);
    };

    const resolveFieldValueForValidation = (stepId, field, itemIndex = 0) => {
        const repeatCount = getFieldRepeatCount(field);

        if (repeatCount > 1) {
            const repeatedValues = normalizeArrayLike(formValues?.[stepId]?.[field.id]);
            const sourceValue = repeatedValues[itemIndex];

            if (fieldHasValue(field, sourceValue)) {
                return sourceValue;
            }

            return getFieldInitialValue(stepId, field, itemIndex);
        }

        const currentValue = formValues?.[stepId]?.[field.id]
            ?? uploadedFiles?.[stepId]?.[field.id]?.[0]?.name
            ?? fileInfo?.[stepId]?.[field.id]?.name;

        if (field.type === 'stage_document') {
            return normalizeDocumentValue(currentValue, field);
        }

        if (fieldHasValue(field, currentValue)) {
            return unwrapSingleValue(currentValue);
        }

        const fallbackValue = getFieldInitialValue(stepId, field, itemIndex);
        if (field.type === 'stage_document') {
            return normalizeDocumentValue(fallbackValue, field);
        }

        return unwrapSingleValue(fallbackValue);
    };

    const getFieldValueForSubmit = (stepId, field) => {
        const currentValue = formValues?.[stepId]?.[field.id]
            ?? uploadedFiles?.[stepId]?.[field.id]?.[0]?.name
            ?? fileInfo?.[stepId]?.[field.id]?.name;
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

    const uploadVisibleStepFiles = async (stepId, visibleFieldIds) => {
        if (!uploadedFiles[stepId]) {
            return { ok: true };
        }

        for (const [fieldId, files] of Object.entries(uploadedFiles[stepId])) {
            if (!visibleFieldIds.has(String(fieldId))) {
                continue;
            }

            if (!files || !Array.isArray(files) || files.length === 0) {
                continue;
            }

            const file = files[0];
            if (!(file instanceof File)) {
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('id', process.id);
            formData.append('node_id', stepId);

            try {
                await apiFetch({
                    path: `/obatala/v1/process_type/upload`,
                    method: 'POST',
                    headers: {
                        'X-WP-Nonce': ObatalaApi.nonce,
                    },
                    body: formData,
                });

                if (
                    isSpreadsheetEntryModeActive &&
                    (
                        String(fieldId) === currentRuntimeSpreadsheetUploadFieldId
                        || String(fieldId) === CONTROL_FIELD_IDS.spreadsheetUpload
                    )
                ) {
                    setPendingSpreadsheetUpload((previousUpload) => (
                        previousUpload
                        && String(previousUpload.stepId || '') === String(stepId)
                        && String(previousUpload.fieldId || '') === String(fieldId)
                            ? null
                            : previousUpload
                    ));

                    try {
                        await saveProcessManualItems(process.id, []);
                        setSpreadsheetRows([]);
                        setActiveSpreadsheetField(null);
                    } catch (clearError) {
                        console.error('Erro ao limpar edições anteriores da planilha:', clearError);
                    }
                }

                setFormValues((prev) => ({
                    ...prev,
                    [stepId]: {
                        ...prev[stepId],
                        [fieldId]: file.name,
                    },
                }));

                setFileInfo((prev) => ({
                    ...prev,
                    [stepId]: {
                        ...prev[stepId],
                        [fieldId]: { name: file.name, size: file.size },
                    },
                }));
            } catch (error) {
                const serverMessage = error?.message
                    || error?.error
                    || error?.data?.message
                    || error?.data?.error
                    || '';

                return {
                    ok: false,
                    message: serverMessage
                        ? sprintf(
                            __('Erro ao enviar o campo %1$s: %2$s', 'obatala'),
                            fieldId,
                            String(serverMessage)
                        )
                        : sprintf(
                            __('Erro ao enviar o campo %s.', 'obatala'),
                            fieldId
                        ),
                };
            }
        }

        return { ok: true };
    };

    const buildStepFieldsPayload = (stepId, visibleFields) => {
        return visibleFields.map((field) => ({
            fieldId: field.id,
            value: getFieldValueForSubmit(stepId, field),
        }));
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

    const currentStepSpreadsheetUploadField = useMemo(() => {
        if (!Array.isArray(currentStepVisibleFields)) {
            return null;
        }

        return currentStepVisibleFields.find((field) => (
            String(field?.type || '') === 'upload'
            && isCurrentSpreadsheetUploadField(field)
        )) || null;
    }, [currentStepVisibleFields, isCurrentSpreadsheetUploadField]);

    const hasPendingCurrentSpreadsheetUpload = Boolean(
        pendingSpreadsheetUpload
        && String(pendingSpreadsheetUpload.stepId || '') === String(currentStepNodeId || '')
        && (
            String(pendingSpreadsheetUpload.fieldId || '') === String(currentStepSpreadsheetUploadField?.id || '')
            || String(pendingSpreadsheetUpload.fieldId || '') === currentRuntimeSpreadsheetUploadFieldId
            || String(pendingSpreadsheetUpload.fieldId || '') === CONTROL_FIELD_IDS.spreadsheetUpload
        )
    );
    const currentSpreadsheetUploadValidationStatus = hasPendingCurrentSpreadsheetUpload
        ? String(pendingSpreadsheetUpload?.validationStatus || '')
        : '';
    const currentSpreadsheetUploadValidationMessage = hasPendingCurrentSpreadsheetUpload
        ? String(pendingSpreadsheetUpload?.validationMessage || '')
        : '';
    const hasSpreadsheetValidationError = Boolean(
        exportRuntimeConfig?.enabled
        && isSpreadsheetEntryModeActive
        && String(exportRuntimeConfig?.spreadsheet_rows_source || '') === 'error'
    );
    const isSpreadsheetFileStructureValidationPending = Boolean(
        hasPendingCurrentSpreadsheetUpload
        && currentSpreadsheetUploadValidationStatus === 'pending'
    );
    const hasBlockingSpreadsheetValidationError = Boolean(
        currentStepSpreadsheetUploadField
        && (
            hasPendingCurrentSpreadsheetUpload
                ? currentSpreadsheetUploadValidationStatus === 'invalid'
                : hasSpreadsheetValidationError
        )
    );
    const spreadsheetValidationBlockingMessage = currentSpreadsheetUploadValidationMessage
        || exportRuntimeConfig?.spreadsheet_rows_message
        || __('A planilha contém erros de validação. Envie uma planilha corrigida antes de concluir a etapa.', 'obatala');
    const shouldKeepCurrentStepOpenForSpreadsheet = Boolean(
        (hasSpreadsheetValidationError || hasPendingCurrentSpreadsheetUpload)
        && currentStepSpreadsheetUploadField
    );

    const currentStepDisplayFields = useMemo(() => {
        if (!Array.isArray(currentStepVisibleFields)) {
            return [];
        }

        return currentStepVisibleFields.filter((field) => !isSpreadsheetMappedField(field));
    }, [currentStepVisibleFields, isSpreadsheetMappedField]);

    const currentStepCanSaveDraft = useMemo(() => {
        const step = orderedSteps[currentStep];
        return getSubmittableFieldsForStep(step).length > 0;
    }, [orderedSteps, currentStep, getSubmittableFieldsForStep]);

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
        setActiveSpreadsheetField(null);
    }, [currentStep]);

    const canSubmitCurrentStep = useMemo(() => {
        const step = orderedSteps[currentStep];
        if (!step || !Array.isArray(step?.data?.fields)) {
            return false;
        }

        const stepId = step.id;
        const visibleFields = getSubmittableFieldsForStep(step);

        return visibleFields.every((field) => {
            if (!fieldBlocksSubmit(field)) {
                return true;
            }

            const repeatCount = getFieldRepeatCount(field);

            if (repeatCount > 1) {
                for (let index = 0; index < repeatCount; index += 1) {
                    if (!fieldMeetsSubmitRequirements(field, resolveFieldValueForValidation(stepId, field, index))) {
                        return false;
                    }
                }
                return true;
            }

            return fieldMeetsSubmitRequirements(field, resolveFieldValueForValidation(stepId, field, 0));
        });
    }, [formValues, uploadedFiles, fileInfo, orderedSteps, currentStep, manualMultipleConfig, getSubmittableFieldsForStep]);

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

            const updatedFormValues = {};
            const updatedFileInfo = {};

            steps.forEach((step) => {
                const stageFields = stageData[step.id]?.fields;
                if (!Array.isArray(stageFields)) {
                    return;
                }

                updatedFormValues[step.id] = stageFields.reduce((acc, field) => {
                    const storedValue = field.value ?? '';
                    acc[field.fieldId] = storedValue;

                    const fieldDefinition = step.data?.fields?.find(
                        (stepField) => String(stepField.id) === String(field.fieldId)
                    );

                    if (fieldDefinition?.type === 'upload' && hasValue(storedValue)) {
                        const fileName = String(extractConditionalValue(storedValue) || '').trim();
                        if (fileName) {
                            if (!updatedFileInfo[step.id]) {
                                updatedFileInfo[step.id] = {};
                            }
                            updatedFileInfo[step.id][field.fieldId] = { name: fileName };
                        }
                    }

                    return acc;
                }, {});
            });

            setFormValues(prev => ({ ...prev, ...updatedFormValues }));

            if (Object.keys(updatedFileInfo).length > 0) {
                setFileInfo(prev => ({ ...prev, ...updatedFileInfo }));
            }

            const updateCurrentStageData = steps.reduce((acc, step) => {
                if (stageData[step.id]?.updateAt) {
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

        const isFileSelection = (
            (typeof FileList !== 'undefined' && newValue instanceof FileList)
            || (typeof File !== 'undefined' && newValue instanceof File)
            || (
                newValue
                && typeof newValue === 'object'
                && typeof newValue.length === 'number'
                && typeof File !== 'undefined'
                && newValue[0] instanceof File
            )
        );

        if (isFileSelection) {
            const file = (typeof File !== 'undefined' && newValue instanceof File) ? newValue : newValue[0];
            if (typeof File === 'undefined' || !(file instanceof File)) {
                return;
            }
            const fieldDefinition = step.data?.fields?.find((field) => String(field?.id || '') === String(fieldId));
            const isSpreadsheetUploadChange = isCurrentSpreadsheetUploadField(fieldDefinition || fieldId);

            if (isSpreadsheetUploadChange) {
                setPendingSpreadsheetUpload({
                    stepId: String(stepId),
                    fieldId: String(fieldId),
                    fileName: file.name,
                    validationStatus: 'pending',
                    validationMessage: __('Validando estrutura da planilha...', 'obatala'),
                });
                clearSpreadsheetUploadValidationState();
                applySpreadsheetFileStructureValidation(file);
            }

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
            setFormValues((prev) => ({
                ...prev,
                [stepId]: {
                    ...prev[stepId],
                    [fieldId]: file.name,
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

    const handleOpenSpreadsheetField = (field) => {
        setActiveSpreadsheetField(field);
    };

    const handleCloseSpreadsheetModal = () => {
        if (!isSpreadsheetRowsSaving) {
            setActiveSpreadsheetField(null);
        }
    };

    const handleSpreadsheetCellChange = (rowIndex, fieldId, value) => {
        setSpreadsheetRows((previousRows) => {
            const updatedRows = normalizeSpreadsheetRowsForEditor(previousRows);
            while (updatedRows.length <= rowIndex) {
                updatedRows.push({});
            }

            updatedRows[rowIndex] = {
                ...updatedRows[rowIndex],
                [fieldId]: value,
            };

            return updatedRows;
        });
    };

    const handleSaveSpreadsheetRows = async () => {
        if (!processId) return;

        setIsSpreadsheetRowsSaving(true);
        try {
            const response = await saveProcessManualItems(processId, spreadsheetRows);
            const savedRows = normalizeSpreadsheetRowsForEditor(response?.saved_rows || spreadsheetRows);

            setSpreadsheetRows(savedRows);
            setExportRuntimeConfig((previousRuntime) => ({
                ...(previousRuntime || {}),
                manual_items: savedRows,
                spreadsheet_rows: savedRows,
                spreadsheet_rows_source: savedRows.length > 0 ? 'manual' : 'none',
                spreadsheet_rows_message: savedRows.length > 0
                    ? __('Values edited manually in Obatala.', 'obatala')
                    : __('Spreadsheet values cleared.', 'obatala'),
            }));
            setNotice({
                status: response?.success ? 'success' : 'error',
                message: response?.message || __('Spreadsheet values saved.', 'obatala'),
            });

            if (response?.success) {
                setActiveSpreadsheetField(null);
                await loadExportRuntime();
                await loadExportReview();
            }
        } catch (error) {
            const errorMessage = error?.message || error?.error || __('Could not save spreadsheet values.', 'obatala');
            setNotice({
                status: 'error',
                message: String(errorMessage),
            });
        } finally {
            setIsSpreadsheetRowsSaving(false);
        }
    };

    const handleCorrectedSpreadsheetUpload = async () => {
        const step = orderedSteps[currentStep];
        const uploadField = currentStepSpreadsheetUploadField;

        if (!step?.id || !uploadField?.id) {
            return;
        }

        const stepId = step.id;
        const fieldId = String(uploadField.id);
        const selectedFile = uploadedFiles?.[stepId]?.[fieldId]?.[0];

        if (!(selectedFile instanceof File)) {
            setNotice({
                status: 'error',
                message: __('Select a corrected spreadsheet before saving.', 'obatala'),
            });
            return;
        }

        if (isSpreadsheetFileStructureValidationPending) {
            if (!currentStepSpreadsheetUploadField) {
                setNotice({
                    status: 'info',
                    message: __('Aguarde a validação da estrutura da planilha antes de salvar.', 'obatala'),
                });
            }
            return;
        }

        if (hasBlockingSpreadsheetValidationError) {
            if (!currentStepSpreadsheetUploadField) {
                setNotice({
                    status: 'error',
                    message: spreadsheetValidationBlockingMessage,
                });
            }
            return;
        }

        setIsCorrectedSpreadsheetUploading(true);

        try {
            const uploadResult = await uploadVisibleStepFiles(stepId, new Set([fieldId]));
            if (!uploadResult.ok) {
                setNotice({
                    status: 'error',
                    message: uploadResult.message || __('Could not upload the corrected spreadsheet.', 'obatala'),
                });
                return;
            }

            const existingMetaData = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'GET',
            });

            const existingStageData = existingMetaData.stageData && typeof existingMetaData.stageData === 'object'
                ? existingMetaData.stageData
                : {};
            const currentStagePayload = existingStageData?.[stepId] && typeof existingStageData[stepId] === 'object'
                ? existingStageData[stepId]
                : {};
            const currentFields = Array.isArray(currentStagePayload.fields)
                ? currentStagePayload.fields
                : [];
            const fields = [
                ...currentFields.filter((field) => String(field?.fieldId || '') !== fieldId),
                {
                    fieldId,
                    value: selectedFile.name,
                },
            ];

            const updatedStageData = {
                ...existingStageData,
                [stepId]: {
                    ...currentStagePayload,
                    fields,
                    updateAt: currentStagePayload.updateAt || new Date(),
                    correctedSpreadsheetUpdateAt: new Date().toISOString(),
                    correctedSpreadsheetUser: currentUser?.name || '',
                },
            };

            await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'POST',
                data: {
                    stageData: updatedStageData,
                    submittedStages: existingMetaData.submittedStages || {},
                    process_type: normalizeProcessTypeId(process.meta?.process_type),
                },
            });

            setNotice({
                status: 'success',
                message: __('Corrected spreadsheet uploaded successfully.', 'obatala'),
            });
            await fetchUpdatedProcessNodes();
            await loadExportRuntime();
            await loadExportReview();
        } catch (error) {
            const errorMessage = error?.message || error?.error || __('Could not save the corrected spreadsheet.', 'obatala');
            setNotice({
                status: 'error',
                message: String(errorMessage),
            });
        } finally {
            setIsCorrectedSpreadsheetUploading(false);
        }
    };

    const handleSaveDraft = async () => {
        const step = orderedSteps[currentStep];
        if (!step?.id) return;

        const stepId = step.id;
        const visibleFields = getSubmittableFieldsForStep(step);
        const visibleFieldIds = new Set(visibleFields.map((field) => String(field?.id || '')));

        setIsSavingDraft(true);

        try {
            if (isSpreadsheetFileStructureValidationPending) {
                if (!currentStepSpreadsheetUploadField) {
                    setNotice({
                        status: 'info',
                        message: __('Aguarde a validação da estrutura da planilha antes de salvar.', 'obatala'),
                    });
                }
                return;
            }

            if (hasBlockingSpreadsheetValidationError) {
                if (!currentStepSpreadsheetUploadField) {
                    setNotice({
                        status: 'error',
                        message: spreadsheetValidationBlockingMessage,
                    });
                }
                return;
            }

            const uploadResult = await uploadVisibleStepFiles(stepId, visibleFieldIds);
            if (!uploadResult.ok) {
                setNotice({
                    status: 'error',
                    message: uploadResult.message || __('Could not save the draft.', 'obatala'),
                });
                return;
            }

            const fields = buildStepFieldsPayload(stepId, visibleFields);

            const existingMetaData = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'GET',
            });

            const existingStageData = existingMetaData.stageData && typeof existingMetaData.stageData === 'object'
                ? existingMetaData.stageData
                : {};

            const updatedStageData = {
                ...existingStageData,
                [stepId]: {
                    ...existingStageData?.[stepId],
                    fields,
                    draftUpdateAt: new Date().toISOString(),
                    draftUser: currentUser.name,
                },
            };

            await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'POST',
                data: {
                    stageData: updatedStageData,
                    submittedStages: existingMetaData.submittedStages || {},
                    process_type: normalizeProcessTypeId(process.meta?.process_type),
                },
            });

            setNotice({
                status: 'success',
                message: __('Draft saved successfully.', 'obatala'),
            });
            await loadExportRuntime();
            await loadExportReview();
        } catch (error) {
            console.error('Erro ao salvar rascunho:', error);
            setNotice({
                status: 'error',
                message: __('Could not save the draft.', 'obatala'),
            });
        } finally {
            setIsSavingDraft(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmittingStep(true);

        const step = orderedSteps[currentStep];
        const stepId = step.id;
        const visibleFields = getSubmittableFieldsForStep(step);
        const visibleFieldIds = new Set(visibleFields.map((field) => String(field?.id || '')));

        if (!canSubmitCurrentStep) {
            setNotice({
                status: 'error',
                message: __('Complete all required fields before submitting this step.', 'obatala'),
            });
            setIsSubmittingStep(false);
            return;
        }

        if (isSpreadsheetFileStructureValidationPending) {
            if (!currentStepSpreadsheetUploadField) {
                setNotice({
                    status: 'info',
                    message: __('Aguarde a validação da estrutura da planilha antes de enviar.', 'obatala'),
                });
            }
            setIsSubmittingStep(false);
            return;
        }

        if (hasBlockingSpreadsheetValidationError) {
            if (!currentStepSpreadsheetUploadField) {
                setNotice({
                    status: 'error',
                    message: spreadsheetValidationBlockingMessage,
                });
            }
            setIsSubmittingStep(false);
            return;
        }

        const uploadResult = await uploadVisibleStepFiles(stepId, visibleFieldIds);
        if (!uploadResult.ok) {
            setNotice({
                status: 'error',
                message: uploadResult.message || __('Could not save the draft.', 'obatala'),
            });
            setIsSubmittingStep(false);
            return;
        }

        const fields = buildStepFieldsPayload(stepId, visibleFields);

        // Salvar metadados
        try {
            const existingMetaData = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'GET',
            });

            const existingStageData = existingMetaData.stageData && typeof existingMetaData.stageData === 'object'
                ? existingMetaData.stageData
                : {};
            const updatedStageData = {
                ...existingStageData,
                [stepId]: {
                    ...existingStageData?.[stepId],
                    fields, updateAt: new Date(),
                    user: currentUser.name
                },
            };

            if (
                isSpreadsheetEntryModeActive
                && currentStepSpreadsheetUploadField
                && visibleFieldIds.has(String(currentStepSpreadsheetUploadField.id))
            ) {
                await apiFetch({
                    path: `/obatala/v1/process_obatala/${process.id}/meta`,
                    method: 'POST',
                    data: {
                        stageData: updatedStageData,
                        submittedStages: existingMetaData.submittedStages || {},
                        process_type: normalizeProcessTypeId(process.meta?.process_type),
                    },
                });

                const runtime = await fetchProcessExportRuntime(process.id);
                setExportRuntimeConfig(runtime);
                setSpreadsheetRows(normalizeSpreadsheetRowsForEditor(runtime?.spreadsheet_rows));

                if (String(runtime?.spreadsheet_rows_source || '') === 'error') {
                    if (!currentStepSpreadsheetUploadField) {
                        setNotice({
                            status: 'error',
                            message: runtime?.spreadsheet_rows_message || __('The spreadsheet contains validation errors. Upload a corrected spreadsheet before submitting this step.', 'obatala'),
                        });
                    }
                    await loadExportReview();
                    return;
                }
            }

            await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/meta`,
                method: 'POST',
                data: {
                    stageData: updatedStageData,
                    submittedStages: {
                        ...existingMetaData.submittedStages,
                        [stepId]: true,
                    },
                    process_type: normalizeProcessTypeId(process.meta?.process_type),
                }
            });

            const nodeUpdateResponse = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/node`,
                method: `PUT`,
                data: {
                    node_id: stepId
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
            const errorMessage = error?.message || error?.error || __('Could not submit this step.', 'obatala');
            setNotice({
                status: 'error',
                message: String(errorMessage),
            });
            await loadExportRuntime();
            await loadExportReview();
        } finally {
            setIsSubmittingStep(false);
        }
    };

    const handleDownload = async (fieldId) => {
        try {
            const stepId = orderedSteps[currentStep].id;
            const file =
                formValues[stepId]?.[fieldId] ||
                uploadedFiles[stepId]?.[fieldId]?.[0]?.name;

            if (!file) {
                setNotice({ status: 'error', message: __('File not found for download.', 'obatala') });
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
                setNotice({ status: 'error', message: __('You do not have permission to download this file.', 'obatala') });
            } else {
                setNotice({ status: 'error', message: __('An error occurred while trying to download the file.', 'obatala') });
            }
            console.error(__('Error trying to download the file:', 'obatala'), error);
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

    const getStageDocumentPayload = (stepId, fieldId) => {
        const step = orderedSteps[currentStep];
        const fieldDefinition = step?.data?.fields?.find(
            (field) => String(field.id) === String(fieldId)
        );
        const rawValue = formValues?.[stepId]?.[fieldId];
        const documentValue = normalizeDocumentValue(rawValue, fieldDefinition || {});

        if (stripHtml(documentValue.content) === '') {
            return null;
        }

        return {
            content: documentValue.content,
            status: documentValue.status || 'draft',
            updatedAt: documentValue.updatedAt || new Date().toISOString(),
        };
    };

    const handleGenerateStageDocumentPdf = async (stepId, fieldId) => {
        const documentPayload = getStageDocumentPayload(stepId, fieldId);
        if (!documentPayload) {
            setNotice({
                status: 'error',
                message: __('Fill in the document content before generating the PDF.', 'obatala'),
            });
            return;
        }

        try {
            const response = await apiFetch({
                path: `/obatala/v1/process_obatala/${process.id}/stage-document-pdf`,
                method: 'POST',
                data: {
                    node_id: stepId,
                    field_id: fieldId,
                    document: documentPayload,
                },
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
        const currentValue = formValues[stepId]?.[fieldId];
        const documentValue = Array.isArray(currentValue) ? currentValue[0] : currentValue;
        if (documentValue?.signedFile?.name) {
            setNotice({
                status: 'error',
                message: __('A signed PDF is already attached and cannot be replaced.', 'obatala'),
            });
            return;
        }

        const documentPayload = getStageDocumentPayload(stepId, fieldId);
        if (!documentPayload) {
            setNotice({
                status: 'error',
                message: __('Fill in the document content before attaching the signed PDF.', 'obatala'),
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('node_id', stepId);
            formData.append('field_id', fieldId);
            formData.append('document', JSON.stringify(documentPayload));

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

    if (isProcessLoading) {
        return (
            <>
                <BrandHeader />
                <main>
                    <div className="obatala-inline-loading">
                        <Spinner />
                        <span>{__("Loading process...", "obatala")}</span>
                    </div>
                </main>
                <BrandFooter />
            </>
        );
    }

    if (!process) {
        return (
            <>
                <BrandHeader />
                <main>
                    <Notice status="warning" isDismissible={false}>
                        {__("No process found.", "obatala")}
                    </Notice>
                </main>
                <BrandFooter />
            </>
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
    const requiresExportPreparation = Boolean(
        exportRuntimeConfig?.configured && !exportRuntimeConfig?.prepared
    );
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
    const processIsComplete = progress === 100
        && !requiresExportPreparation
        && (!shouldShowExportReviewStep || isExportReviewCompleted);
    const activeOption = options[currentStep];
    const activeSpreadsheetStepUserAllowed = activeOption?.isVirtualExportReview
        ? (hasPermission || isPublic)
        : isUserInSector(activeOption?.sector_stage);
    const canEditActiveSpreadsheetRows = Boolean(
        activeSpreadsheetField &&
        activeSpreadsheetStepUserAllowed &&
        !isExportReviewCompleted
    );
    const shouldShowCorrectedSpreadsheetUpload = Boolean(
        hasSpreadsheetValidationError
        && currentStepSpreadsheetUploadField
        && !isExportReviewCompleted
    );

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
        const user = currentStepData ? currentStepData[1] : __('Unknown', 'obatala');
        const dateFormat = currentStepData && currentStepData[0]
            ? format(currentStepData[0], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
            : __('Date not available', 'obatala');

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
            <ProcessHeader
                process={process}
                filteredProcessType={filteredProcessType}
                authorsById={authorsById}
                isComplete={processIsComplete}
                progress={progress}
            />
            <main>
                {isLoading && (
                    <div className="obatala-inline-loading">
                        <Spinner />
                        <span>{__("Loading process data...", "obatala")}</span>
                    </div>
                )}
                {viewMode === "history" ? (
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
                        {notice && (
                            <Notice
                                status={notice.status}
                                isDismissible
                                onRemove={() => setNotice(null)}
                            >
                                {notice.message}
                            </Notice>
                        )}
                        {activeSpreadsheetField && (
                            <SpreadsheetRowsModal
                                field={activeSpreadsheetField}
                                rows={spreadsheetRows}
                                canEdit={canEditActiveSpreadsheetRows}
                                isSaving={isSpreadsheetRowsSaving}
                                onChange={handleSpreadsheetCellChange}
                                onClose={handleCloseSpreadsheetModal}
                                onSave={handleSaveSpreadsheetRows}
                            />
                        )}
                        {!isPublic && hasPermission === false && (
                            <Notice status="error" isDismissible={false}>
                                {__("You do not have permission to access this process.", "obatala")}
                            </Notice>
                        )}
                        <div className="panel-container">
                            <Panel>
                                <PanelHeader>Etapas</PanelHeader>
                                {exportRuntimeConfig?.configured && !isExportReviewCompleted && (
                                    <TainacanExportPreparation
                                        processId={processId}
                                        runtime={exportRuntimeConfig}
                                        canEdit={hasPermission || isPublic}
                                        onSaved={handleExportPreparationSaved}
                                    />
                                )}
                                {options.map((step, index) => {
                                    const isVirtualExportReview = step.isVirtualExportReview === true;
                                    const baseIsCompleted = isVirtualExportReview
                                        ? isExportReviewCompleted
                                        : Object.keys(currentStageData).includes(options[index]?.value);
                                    const stepHasInvalidSpreadsheet = Boolean(
                                        hasSpreadsheetValidationError
                                        && Array.isArray(step.fields)
                                        && step.fields.some((field) => String(field?.id || '') === currentRuntimeSpreadsheetUploadFieldId)
                                    );
                                    const isCompleted = baseIsCompleted && !stepHasInvalidSpreadsheet;
                                    const isUserAllowed = isVirtualExportReview
                                        ? (hasPermission || isPublic)
                                        : isUserInSector(options[index].sector_stage);
                                    const isAccessRestricted = !(process.meta?.access_level?.[0] === 'Not restricted' ||
                                        process.meta?.access_level?.[0] === 'not restricted');
                                    const isDisabled = isVirtualExportReview
                                        ? ((progress < 100) || (isAccessRestricted && !isUserAllowed))
                                        : (isAccessRestricted ? !isUserAllowed : (!isCompleted && !isUserAllowed));
                                    return (
                                        <PanelBody
                                            title={
                                                <>
                                                    <span className="accordion-title me-auto">{step.label}</span>
                                                    <div className="badge-container">
                                                        <span
                                                            className={`badge ${isCompleted ? 'success' : isDisabled ? 'danger' : 'warning'}`}
                                                            title={isCompleted ? sprintf(__('Completed by %s', 'obatala'), lastUpdateStage(index).user) : ''}
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
                                                            <span className="badge default" title={sprintf(__('Responsible group: %s', 'obatala'), getSectorName(options[index].sector_stage))}>
                                                                <Icon icon="groups" /> {getSectorName(options[index].sector_stage)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            }
                                            key={index}
                                            className={`accordion-item ${isCompleted ? 'success' : isDisabled ? 'danger' : 'warning'} ${isDisabled ? 'disabled' : ''}`}
                                            initialOpen={ false }
                                            opened={ isDisabled ? false : undefined }
                                            >
                                            {!isDisabled && (
                                                <PanelRow>
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
                                                                (!submittedSteps[currentStep] || shouldKeepCurrentStepOpenForSpreadsheet) ? (
                                                                    <form onSubmit={handleSubmit} className="flex-form">
                                                                        <>
                                                                            {Array.isArray(currentStepSingleFields) ? currentStepSingleFields.map((field, idx) => {
                                                                                const stepId = orderedSteps[currentStep].id;
                                                                                const isSpreadsheetUploadField = String(field?.type || '') === 'upload'
                                                                                    && isCurrentSpreadsheetUploadField(field);
                                                                                const fieldCanBeEdited = !submittedSteps[currentStep]
                                                                                    || (shouldKeepCurrentStepOpenForSpreadsheet && isSpreadsheetUploadField);
                                                                                const uploadTemplateAction = isSpreadsheetUploadField
                                                                                    ? {
                                                                                        show: true,
                                                                                        onClick: handleDownloadSpreadsheetTemplate,
                                                                                        isLoading: isTemplateDownloadLoading,
                                                                                        label: __('Download spreadsheet example', 'obatala'),
                                                                                    }
                                                                                    : null;
                                                                                const spreadsheetUploadNoticeMessage = isSpreadsheetUploadField
                                                                                    ? currentSpreadsheetUploadValidationMessage
                                                                                    : '';
                                                                                const spreadsheetUploadNoticeStatus = hasBlockingSpreadsheetValidationError
                                                                                    ? 'error'
                                                                                    : isSpreadsheetFileStructureValidationPending
                                                                                        ? 'info'
                                                                                        : currentSpreadsheetUploadValidationStatus === 'valid'
                                                                                            ? 'success'
                                                                                            : currentSpreadsheetUploadValidationStatus === 'unsupported'
                                                                                                ? 'info'
                                                                                                : 'warning';

                                                                                return (
                                                                                    <React.Fragment key={`${stepId}-meta-${idx}-single`}>
                                                                                        <MetaFieldInputs
                                                                                            field={field}
                                                                                            fieldId={field.id}
                                                                                            itemIndex={null}
                                                                                            initalValue={getFieldInitialValue(stepId, field, 0)}
                                                                                            isEditable={fieldCanBeEdited}
                                                                                            noHasPermission={!isUserAllowed}
                                                                                            onFieldChange={handleFieldChange}
                                                                                            fileInfo={fileInfo}
                                                                                            handleDownload={handleDownload}
                                                                                            uploadTemplateAction={uploadTemplateAction}
                                                                                            stepId={stepId}
                                                                                            handleGenerateStageDocumentPdf={handleGenerateStageDocumentPdf}
                                                                                            handleSignedDocumentUpload={handleSignedDocumentUpload}
                                                                                            handleDownloadSignedDocument={handleDownloadSignedDocument}
                                                                                        />
                                                                                        {isSpreadsheetUploadField && spreadsheetUploadNoticeMessage && (
                                                                                            <div className="flex-basis-100">
                                                                                                <Notice status={spreadsheetUploadNoticeStatus} isDismissible={false}>
                                                                                                    {spreadsheetUploadNoticeMessage}
                                                                                                </Notice>
                                                                                            </div>
                                                                                        )}
                                                                                    </React.Fragment>
                                                                                );
                                                                            }) : null}

                                                                            {currentStepSpreadsheetMappedFields.length > 0 && (
                                                                                <SpreadsheetMappedFieldsSummary
                                                                                    fields={currentStepSpreadsheetMappedFields}
                                                                                    rows={spreadsheetRows}
                                                                                    runtimeConfig={exportRuntimeConfig}
                                                                                    onOpenField={handleOpenSpreadsheetField}
                                                                                    canEdit={isUserAllowed && !isExportReviewCompleted}
                                                                                    isSaving={isSpreadsheetRowsSaving}
                                                                                />
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
                                                                                                                            handleGenerateStageDocumentPdf={handleGenerateStageDocumentPdf}
                                                                                                                            handleSignedDocumentUpload={handleSignedDocumentUpload}
                                                                                                                            handleDownloadSignedDocument={handleDownloadSignedDocument}
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
                                                                        </>
                                                                        {(!submittedSteps[currentStep] || shouldKeepCurrentStepOpenForSpreadsheet) && (
                                                                            <div className="action-bar">
                                                                                {currentStepCanSaveDraft && (
                                                                                    <Button
                                                                                        variant="tertiary"
                                                                                        type="button"
                                                                                        onClick={handleSaveDraft}
                                                                                        disabled={isSavingDraft || isSpreadsheetFileStructureValidationPending || hasBlockingSpreadsheetValidationError || (submittedSteps[currentStep] && !shouldKeepCurrentStepOpenForSpreadsheet) || !isUserAllowed}
                                                                                        isBusy={isSavingDraft}
                                                                                    >
                                                                                        {isSavingDraft ? __('Saving...', 'obatala') : __('Save draft', 'obatala')}
                                                                                    </Button>
                                                                                )}
                                                                                <Button
                                                                                    variant="primary"
                                                                                    type="submit"
                                                                                    disabled={!canSubmitCurrentStep || isSpreadsheetFileStructureValidationPending || hasBlockingSpreadsheetValidationError || (submittedSteps[currentStep] && !shouldKeepCurrentStepOpenForSpreadsheet) || !isUserAllowed || isSubmittingStep}
                                                                                    isBusy={isSubmittingStep}
                                                                                >
                                                                                    {isSubmittingStep ? __("Submitting...", "obatala") : __("Submit", "obatala")}
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </form>
                                                                ) : (
                                                                    <form className="flex-form">
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

                                                                        {shouldShowCorrectedSpreadsheetUpload && (
                                                                            <>
                                                                                <Notice status="error" isDismissible={false}>
                                                                                    {exportRuntimeConfig?.spreadsheet_rows_message || __('The uploaded spreadsheet could not be validated. Upload a corrected file to continue.', 'obatala')}
                                                                                </Notice>
                                                                                <MetaFieldInputs
                                                                                    key={`${orderedSteps[currentStep].id}-corrected-spreadsheet-upload`}
                                                                                    field={currentStepSpreadsheetUploadField}
                                                                                    fieldId={currentStepSpreadsheetUploadField.id}
                                                                                    itemIndex={null}
                                                                                    initalValue={getFieldInitialValue(orderedSteps[currentStep].id, currentStepSpreadsheetUploadField, 0)}
                                                                                    isEditable
                                                                                    noHasPermission={!isUserAllowed}
                                                                                    onFieldChange={handleFieldChange}
                                                                                    fileInfo={fileInfo}
                                                                                    uploadTemplateAction={{
                                                                                        show: true,
                                                                                        onClick: handleDownloadSpreadsheetTemplate,
                                                                                        isLoading: isTemplateDownloadLoading,
                                                                                        label: __('Download spreadsheet example', 'obatala'),
                                                                                    }}
                                                                                    stepId={orderedSteps[currentStep].id}
                                                                                />
                                                                                <div className="action-bar">
                                                                                    <Button
                                                                                        variant="primary"
                                                                                        onClick={handleCorrectedSpreadsheetUpload}
                                                                                        disabled={!isUserAllowed || isSpreadsheetFileStructureValidationPending || hasBlockingSpreadsheetValidationError || isCorrectedSpreadsheetUploading}
                                                                                        isBusy={isCorrectedSpreadsheetUploading}
                                                                                    >
                                                                                        {isCorrectedSpreadsheetUploading
                                                                                            ? __('Uploading...', 'obatala')
                                                                                            : __('Upload corrected spreadsheet', 'obatala')}
                                                                                    </Button>
                                                                                </div>
                                                                            </>
                                                                        )}

                                                                        {currentStepSpreadsheetMappedFields.length > 0 && (
                                                                            <SpreadsheetMappedFieldsSummary
                                                                                fields={currentStepSpreadsheetMappedFields}
                                                                                rows={spreadsheetRows}
                                                                                runtimeConfig={exportRuntimeConfig}
                                                                                onOpenField={handleOpenSpreadsheetField}
                                                                                canEdit={isUserAllowed && !isExportReviewCompleted}
                                                                                isSaving={isSpreadsheetRowsSaving}
                                                                            />
                                                                        )}
                                                                    </form>
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
                                                </PanelRow>
                                            )}
                                        </PanelBody>
                                    );
                                })}
                            </Panel>
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
