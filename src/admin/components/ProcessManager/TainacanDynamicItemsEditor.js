import React, { useEffect, useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { BaseControl, Button, Notice, SelectControl, TextControl } from '@wordpress/components';

const parseOptions = (config = {}) => {
    const raw = typeof config.options === 'string' ? config.options : '';
    if (!raw.trim()) return [];

    return raw
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean)
        .map((option) => ({ label: option, value: option }));
};

const normalizeRows = (quantity, mappedFields, existingRows) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const baseRow = mappedFields.reduce((acc, field) => {
        acc[field.obatala_field_id] = '';
        return acc;
    }, {});

    const rows = Array.isArray(existingRows) ? existingRows : [];
    const normalized = [];

    for (let i = 0; i < safeQuantity; i += 1) {
        normalized.push({
            ...baseRow,
            ...(rows[i] || rows[0] || {}),
        });
    }

    return normalized;
};

const toInputDate = (value) => {
    if (!value) return '';

    const stringValue = String(value);
    const match = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) {
        return `${match[3]}-${match[2]}-${match[1]}`;
    }

    return stringValue;
};

const fromInputDate = (value) => {
    if (!value) return '';

    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    return String(value);
};

const TainacanDynamicItemsEditor = ({ runtimeConfig, onSave }) => {
    const [rows, setRows] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState(null);

    const mappedFields = useMemo(() => {
        return Array.isArray(runtimeConfig?.mapped_fields) ? runtimeConfig.mapped_fields : [];
    }, [runtimeConfig]);

    const quantity = runtimeConfig?.decision?.quantity || 1;

    useEffect(() => {
        setRows(normalizeRows(quantity, mappedFields, runtimeConfig?.manual_items));
    }, [quantity, mappedFields, runtimeConfig?.manual_items]);

    if (!runtimeConfig?.enabled || !runtimeConfig?.show_manual_matrix) {
        return null;
    }

    const updateFieldValue = (rowIndex, fieldId, value) => {
        setRows((prev) => {
            const updated = [...prev];
            updated[rowIndex] = {
                ...(updated[rowIndex] || {}),
                [fieldId]: value,
            };
            return updated;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setNotice(null);

        try {
            const response = await onSave(rows);
            if (response?.success) {
                setNotice({ status: 'success', message: response.message || __('Dados salvos com sucesso.', 'obatala') });
                setRows(normalizeRows(quantity, mappedFields, response.saved_rows || rows));
            } else {
                setNotice({ status: 'error', message: response?.message || __('Não foi possível salvar os dados dinâmicos.', 'obatala') });
            }
        } catch (error) {
            const errorMessage = error?.message || error?.error || __('Erro ao salvar os dados dinâmicos.', 'obatala');
            setNotice({ status: 'error', message: errorMessage });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex-basis-100" style={{ marginTop: '1rem' }}>
            <BaseControl
                label="Preenchimento Dinâmico de Itens para Exportação"
                help="Quando a regra indicar vários itens com preenchimento manual, preencha os dados de cada item nesta grade e salve antes da conclusão da tramitação."
            >
                {notice && (
                    <Notice
                        status={notice.status}
                        isDismissible
                        onRemove={() => setNotice(null)}
                    >
                        {notice.message}
                    </Notice>
                )}

                <p style={{ marginTop: 0, marginBottom: '8px', color: '#50575e' }}>
                    {`Quantidade prevista para exportação: ${quantity} item(ns)`}
                </p>

                <div style={{ overflowX: 'auto', border: '1px solid #dcdcde', borderRadius: '6px' }}>
                    <table className="wp-list-table widefat fixed striped" style={{ minWidth: '960px' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Item</th>
                                {mappedFields.map((field) => (
                                    <th key={field.obatala_field_id}>
                                        {field.obatala_field_label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIndex) => (
                                <tr key={`dynamic-item-row-${rowIndex}`}>
                                    <td><strong>{rowIndex + 1}</strong></td>
                                    {mappedFields.map((field) => {
                                        const value = row[field.obatala_field_id] ?? '';
                                        const fieldType = field.obatala_field_type;
                                        const fieldOptions = parseOptions(field.obatala_field_config);

                                        if (fieldType === 'radio' || fieldType === 'select') {
                                            return (
                                                <td key={`${rowIndex}-${field.obatala_field_id}`}>
                                                    <SelectControl
                                                        value={String(value || '')}
                                                        options={[
                                                            { label: 'Selecione...', value: '' },
                                                            ...fieldOptions,
                                                        ]}
                                                        onChange={(selectedValue) => updateFieldValue(rowIndex, field.obatala_field_id, selectedValue)}
                                                        disabled={isSaving}
                                                    />
                                                </td>
                                            );
                                        }

                                        if (fieldType === 'datepicker') {
                                            return (
                                                <td key={`${rowIndex}-${field.obatala_field_id}`}>
                                                    <input
                                                        type="date"
                                                        value={toInputDate(value)}
                                                        onChange={(event) => updateFieldValue(rowIndex, field.obatala_field_id, fromInputDate(event.target.value))}
                                                        disabled={isSaving}
                                                        style={{ width: '100%' }}
                                                    />
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={`${rowIndex}-${field.obatala_field_id}`}>
                                                <TextControl
                                                    type={fieldType === 'number' ? 'number' : 'text'}
                                                    value={String(value ?? '')}
                                                    onChange={(newValue) => updateFieldValue(rowIndex, field.obatala_field_id, newValue)}
                                                    disabled={isSaving}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="group-button" style={{ marginTop: '12px' }}>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? __('Saving...', 'obatala') : __('Save dynamic items data', 'obatala')}
                    </Button>
                </div>
            </BaseControl>
        </div>
    );
};

export default TainacanDynamicItemsEditor;
