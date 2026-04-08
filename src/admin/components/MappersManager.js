import React, { useEffect, useMemo, useState } from "react";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";
import apiFetch from "@wordpress/api-fetch";
import Select from 'react-select';
import { __ } from "@wordpress/i18n";
import { BaseControl, Button, Icon, Panel, PanelRow, SelectControl, Spinner, TextControl } from '@wordpress/components';
import { fetchMapperProcessModel, fetchMetadataCollectionsTainacan, fetchProcessModels, fetchFieldsProcessModels, fetchCollectionsTainacan } from '../api/apiRequests';

const DEFAULT_DECISION_CONFIG = {
    quantity_field_id: '',
    quantity_fallback: '1',
    multi_or_single_field_id: '',
    data_entry_mode_field_id: '',
    same_values_mode_field_id: '',
    same_values_unique_id_field_id: '',
    same_values_id_prefix: '',
};

const DECISION_FIELD_TYPES = ['radio', 'select'];
const QUANTITY_FIELD_TYPES = ['number'];
const UNIQUE_ID_FIELD_TYPES = ['text', 'number', 'email', 'phone', 'address'];
const FIXED_DECISION_VALUES = {
    multi_items_value: 'Sim',
    single_item_value: 'Não',
    upload_mode_value: 'Upload',
    fill_mode_value: 'Manualmente',
    same_values_enabled_value: 'Sim',
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
    return normalizeDecisionConfig();
};

const MappersManager = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProcessModel, setSelectedProcessModel] = useState(null);
    const [stepsProcessModel, setStepsProcessModel] = useState([]);
    const [collectionsTainacan, setCollectionsTainacan] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState('0');
    const [metadataTainacan, setMetadaTainacan] = useState([]);
    const [selectedSteps, setSelectedSteps] = useState([]);
    const [mapper, setMapper] = useState(null);
    const [selectRows, setSelectRows] = useState([]);
    const [decisionConfig, setDecisionConfig] = useState(normalizeDecisionConfig());

    useEffect(() => {
        const idModel = Number(new URLSearchParams(window.location.search).get('process_type_id'));

        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [models, collections, mapperResponse] = await Promise.all([
                    fetchProcessModels(),
                    fetchCollectionsTainacan(),
                    fetchMapperProcessModel(idModel),
                ]);

                const filtered = models.find((model) => model.id === idModel);
                setSelectedProcessModel(filtered || null);
                setCollectionsTainacan(collections || []);

                if (filtered?.id) {
                    await handleProcessModelSteps(filtered.id);
                }

                if (mapperResponse?.mapping_data) {
                    let parsedData = mapperResponse.mapping_data;
                    if (typeof mapperResponse.mapping_data === 'string') {
                        parsedData = JSON.parse(mapperResponse.mapping_data);
                    }

                    setMapper(parsedData);
                    setSelectedCollection(String(parsedData?.collection_id || '0'));
                    setDecisionConfig(getDecisionRulesFromSavedData(parsedData));
                }
            } catch (error) {
                console.error('Erro ao carregar dados iniciais dos mapeadores:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        if (mapper && stepsProcessModel.length > 0) {
            const savedMappings = getFieldMappingsFromSavedData(mapper);
            if (!savedMappings.length) return;

            const enrichedSteps = savedMappings.map((mapping) => {
                const targetValue = String(mapping?.obatala_field?.value || '');
                const matchedStep = stepsProcessModel.find(step => String(step.value) === targetValue);
                return {
                    value: matchedStep?.value || targetValue,
                    label: matchedStep?.label || mapping?.obatala_field?.label || targetValue,
                    type: matchedStep?.type || mapping?.obatala_field?.type || '',
                    stage: matchedStep?.stage || mapping?.obatala_field?.stage || '',
                };
            }).filter((step) => step.value && step.label);
            setSelectedSteps(enrichedSteps);

            const updatedRows = savedMappings.map((mapping) => ({
                obatalaFieldMetadata: {
                    value: mapping?.obatala_field?.value,
                    label: stepsProcessModel.find(step => String(step.value) === String(mapping?.obatala_field?.value))?.label || mapping?.obatala_field?.label
                },
                tainacanMetadata: String(mapping?.tainacan_metadata_id || ''),
            }));
            setSelectRows(updatedRows);
        }
    }, [mapper, stepsProcessModel]);

    useEffect(() => {
        if (selectedCollection && selectedCollection !== '0') {
            fetchMetadataCollectionsTainacan(selectedCollection)
                .then((data) => {
                    setMetadaTainacan(data);
                })
                .catch((error) => {
                    console.error("Erro ao buscar metadados:", error);
                });
        }
    }, [selectedCollection]);

    useEffect(() => {
        setSelectRows((prev) =>
            selectedSteps.map((step, i) => ({
                ...prev[i],
                obatalaFieldMetadata: step,
                tainacanMetadata: prev[i]?.tainacanMetadata || '',
            }))
        );
    }, [selectedSteps]);

    const handleProcessModelSteps = async (selectedId) => {
        return fetchFieldsProcessModels(selectedId)
            .then((data) => {
                const stepOptions = data.map(field => ({
                    value: String(field.id),
                    label: `${field?.config?.label || field.id} - ${field.stage}`,
                    type: field?.type || '',
                    stage: field?.stage || '',
                }));

                setStepsProcessModel(stepOptions);
                return stepOptions;
            })
            .catch((error) => {
                console.error("Erro ao buscar campos:", error);
                setStepsProcessModel([]);
                return [];
            });
    };

    const handleTainacanColletionChange = (selectedId) => {
        const normalizedId = String(selectedId);
        // Limpa os mapeamentos anteriores ao trocar de coleção
        if (selectedCollection !== normalizedId) {
            setSelectedSteps([]); // Limpa os campos multiseleção
            setSelectRows([]);    // Limpa os mapeamentos de metadados
        }

        setSelectedCollection(normalizedId);
    };

    const handleSelectChange = (index, field, value) => {
        const newSelectRows = [...selectRows];

        if (!newSelectRows[index]) {
            newSelectRows[index] = { tainacanMetadata: '', obatalaFieldMetadata: '' };
        }

        newSelectRows[index][field] = value;
        setSelectRows(newSelectRows);
    };

    const isMetadataSelected = (id, currentIndex) => {
        return selectRows.some((row, i) => i !== currentIndex && row.tainacanMetadata === id);
    };

    const handleDecisionConfigChange = (key, value) => {
        setDecisionConfig((prev) => ({
            ...prev,
            [key]: String(value ?? ''),
        }));
    };

    const fieldLabelById = useMemo(() => {
        return stepsProcessModel.reduce((acc, field) => {
            acc[String(field.value)] = field.label;
            return acc;
        }, {});
    }, [stepsProcessModel]);

    const getFieldLabel = (fieldId) => {
        if (!fieldId) return 'Nao definido';
        return fieldLabelById[String(fieldId)] || `Field ${fieldId}`;
    };

    const buildTypedFieldOptions = (allowedTypes, placeholder, currentValue = '') => {
        const filtered = stepsProcessModel.filter((field) => allowedTypes.includes(field.type));
        const baseOptions = [
            { label: placeholder, value: '' },
            ...filtered.map((field) => ({
                label: `${field.label}${field.type ? ` [${field.type}]` : ''}`,
                value: String(field.value),
            })),
        ];

        const normalizedCurrent = String(currentValue || '');
        if (normalizedCurrent && !baseOptions.some((option) => option.value === normalizedCurrent)) {
            baseOptions.push({
                label: `${getFieldLabel(normalizedCurrent)} [tipo nao compativel]`,
                value: normalizedCurrent,
            });
        }

        return baseOptions;
    };

    const decisionPreviewItems = useMemo(() => {
        return [
            {
                title: 'Unico x Varios',
                detail: `Campo: ${getFieldLabel(decisionConfig.multi_or_single_field_id)} | fixo: Sim = VARIOS, Não = UNICO`,
                ok: Boolean(decisionConfig.multi_or_single_field_id),
            },
            {
                title: 'Quantidade de itens',
                detail: `Campo: ${getFieldLabel(decisionConfig.quantity_field_id)} | fallback: ${decisionConfig.quantity_fallback || '1'}`,
                ok: Boolean(decisionConfig.quantity_field_id),
            },
            {
                title: 'Upload x Preenchimento',
                detail: `Campo: ${getFieldLabel(decisionConfig.data_entry_mode_field_id)} | fixo: Upload = planilha, Manualmente = formulario`,
                ok: Boolean(decisionConfig.data_entry_mode_field_id),
            },
            {
                title: 'Repeticao com ID unico',
                detail: `Campo ativador: ${getFieldLabel(decisionConfig.same_values_mode_field_id)} | fixo: Sim = repetir com mesmo conjunto de dados | campo que diferencia cada item: ${getFieldLabel(decisionConfig.same_values_unique_id_field_id)} | prefixo: ${decisionConfig.same_values_id_prefix || '(vazio)'}`,
                ok: Boolean(decisionConfig.same_values_mode_field_id && decisionConfig.same_values_unique_id_field_id),
            },
        ];
    }, [decisionConfig, fieldLabelById]);

    const quantityFieldOptions = useMemo(() => {
        return buildTypedFieldOptions(
            QUANTITY_FIELD_TYPES,
            'Selecione o field numerico que define quantidade',
            decisionConfig.quantity_field_id
        );
    }, [stepsProcessModel, decisionConfig.quantity_field_id, fieldLabelById]);

    const decisionModeFieldOptions = useMemo(() => {
        return buildTypedFieldOptions(
            DECISION_FIELD_TYPES,
            'Selecione um field de decisao (radio/select)',
            decisionConfig.multi_or_single_field_id
        );
    }, [stepsProcessModel, decisionConfig.multi_or_single_field_id, fieldLabelById]);

    const dataEntryModeFieldOptions = useMemo(() => {
        return buildTypedFieldOptions(
            DECISION_FIELD_TYPES,
            'Selecione um field de decisao (radio/select)',
            decisionConfig.data_entry_mode_field_id
        );
    }, [stepsProcessModel, decisionConfig.data_entry_mode_field_id, fieldLabelById]);

    const sameValuesModeFieldOptions = useMemo(() => {
        return buildTypedFieldOptions(
            DECISION_FIELD_TYPES,
            'Selecione um field de decisao (radio/select)',
            decisionConfig.same_values_mode_field_id
        );
    }, [stepsProcessModel, decisionConfig.same_values_mode_field_id, fieldLabelById]);

    const uniqueIdFieldOptions = useMemo(() => {
        return buildTypedFieldOptions(
            UNIQUE_ID_FIELD_TYPES,
            'Selecione o campo que diferencia cada item',
            decisionConfig.same_values_unique_id_field_id
        );
    }, [stepsProcessModel, decisionConfig.same_values_unique_id_field_id, fieldLabelById]);

    const getMappingData = () => {
        if (!selectedCollection || selectedCollection === "0") {
            alert("Selecione uma coleção do Tainacan.");
            return;
        }

        if (!selectedProcessModel?.id) {
            alert("Modelo de processo não encontrado.");
            return;
        }

        const hasIncompleteRows = selectRows.some(row => {
            const hasObatala = row.obatalaFieldMetadata && typeof row.obatalaFieldMetadata === 'object' && row.obatalaFieldMetadata.value;
            const hasTainacan = row.tainacanMetadata && row.tainacanMetadata !== '';

            return !(hasObatala && hasTainacan);
        });

        if (hasIncompleteRows) {
            alert("Todos os campos devem estar preenchidos antes de salvar o mapeamento.");
            return;
        }

        const fieldMappings = selectRows.map((row) => ({
            obatala_field: row.obatalaFieldMetadata,
            tainacan_metadata_id: row.tainacanMetadata,
        }));

        const decisionRulesToSave = {
            ...decisionConfig,
            ...FIXED_DECISION_VALUES,
        };

        const mappedData = {
            process_model_id: selectedProcessModel.id,
            collection_id: selectedCollection,
            mappings: {
                field_mappings: fieldMappings,
                decision_rules: decisionRulesToSave,
            }
        };

        apiFetch({
            path: '/obatala/v1/exporter/save_mapping_data',
            method: 'POST',
            data: mappedData,
        }).then((response) => {
            if (response.success) {
                alert('Mapeamento salvo com sucesso!');
                window.location.href = '?page=process-type-manager';
                setSelectedProcessModel(0);
                setSelectedCollection('0');
                setSelectedSteps([]);
                setSelectRows([]);
                setDecisionConfig(normalizeDecisionConfig());
            } else {
                alert('Falha ao salvar: ' + (response.message || 'Erro desconhecido.'));
            }
        }).catch((error) => {
            alert('Erro ao salvar o mapeamento.');
        });
    };

    const cancelMappingData = () => {
        window.location.href = '?page=process-type-manager';
        setSelectedProcessModel(0);
        setSelectedCollection('0');
        setSelectedSteps([]);
        setSelectRows([]);
        setDecisionConfig(normalizeDecisionConfig());
    }

    if (isLoading) {
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
            <BrandHeader />
            <main>
                <div className="title-container">
                    <h2>
                        Mappers Tainacan
                    </h2>
                </div>
                <div className="badge-container">
                    <span className="badge default">
                        <Icon icon="welcome-widgets-menus" /> Process Model: {selectedProcessModel?.title?.rendered}
                    </span>
                </div>
                <Panel>
                    <PanelRow>
                        <form className="inline-edition flex-basis-100">
                            <input type="hidden" name="page" value="inbcm-mapping" />

                            <SelectControl
                                label="Escolha a Coleção de Destino no Tainacan:"
                                value={selectedCollection}
                                options={[
                                    { label: 'Selecione uma coleção', value: '0', disabled: true },
                                    ...collectionsTainacan.map((collection) => ({
                                        label: collection["WP_Post"].post_title,
                                        value: String(collection["WP_Post"].ID),
                                    })),
                                ]}
                                onChange={(newValue) => {
                                    handleTainacanColletionChange(newValue);
                                }}
                            />

                            <BaseControl
                                label="Escolha os campos do formulário que apresentam os metadados do item:"
                            >
                                <Select
                                    isMulti
                                    options={stepsProcessModel}
                                    value={selectedSteps}
                                    onChange={(selectedOptions) => {
                                        setSelectedSteps(selectedOptions);
                                    }}
                                    isDisabled={selectedProcessModel === "0"}
                                    placeholder="Selecione os campos..."
                                />
                            </BaseControl>

                            <div className="flex-basis-100">
                                <BaseControl
                                    label="Mapeamento de Metadados"
                                    help="Relacione os campos do Obatala com os metadados do Tainacan."
                                >
                                    <table className="wp-list-table widefat fixed striped">
                                        <thead>
                                            <tr>
                                                <th>Field Obatala</th>
                                                <th>Tainacan Metadado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSteps.map((step, index) => {
                                                const currentValue = selectRows[index]?.tainacanMetadata || '';
                                                const options = [
                                                    { label: 'Selecione o metadado', value: '' },
                                                    ...metadataTainacan.map((item) => {
                                                        const post = item["WP_Post"];
                                                        const id = String(post.ID);
                                                        const isUsed = isMetadataSelected(id, index);
                                                        return {
                                                            label: `${post.post_title}${isUsed ? ' (já usado)' : ''}`,
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
                                                        Nenhum campo selecionado para mapeamento.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </BaseControl>
                            </div>

                            <div className="flex-basis-100" style={{ marginTop: '1rem' }}>
                                <BaseControl
                                    label="Configuração Geral de Decisão na Tramitação"
                                    help="Nesta seção você define quais fields das etapas serão usados para decidir como a exportação vai acontecer durante a tramitação do processo."
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                                        <div style={{ border: '1px solid #dcdcde', borderRadius: '6px', padding: '12px' }}>
                                            <h4 style={{ marginTop: 0 }}>1) Único item ou vários itens</h4>
                                            <SelectControl
                                                label="Field decisor (radio/select)"
                                                value={decisionConfig.multi_or_single_field_id}
                                                options={decisionModeFieldOptions}
                                                onChange={(value) => handleDecisionConfigChange('multi_or_single_field_id', value)}
                                            />
                                            <p style={{ marginTop: '8px', marginBottom: 0, color: '#50575e' }}>
                                                Valores fixos usados na tramitação: <strong>Sim</strong> = vários itens e <strong>Não</strong> = item único.
                                            </p>
                                        </div>

                                        <div style={{ border: '1px solid #dcdcde', borderRadius: '6px', padding: '12px' }}>
                                            <h4 style={{ marginTop: 0 }}>2) Quantidade de itens (1 ou N)</h4>
                                            <SelectControl
                                                label="Field que define o total de itens"
                                                value={decisionConfig.quantity_field_id}
                                                options={quantityFieldOptions}
                                                onChange={(value) => handleDecisionConfigChange('quantity_field_id', value)}
                                            />
                                            <TextControl
                                                label="Valor padrão quando o field estiver vazio"
                                                value={decisionConfig.quantity_fallback}
                                                onChange={(value) => handleDecisionConfigChange('quantity_fallback', value)}
                                                help="Exemplo: 1"
                                            />
                                        </div>

                                        <div style={{ border: '1px solid #dcdcde', borderRadius: '6px', padding: '12px' }}>
                                            <h4 style={{ marginTop: 0 }}>3) Upload de planilha ou preenchimento nos fields</h4>
                                            <SelectControl
                                                label="Field decisor de origem dos dados"
                                                value={decisionConfig.data_entry_mode_field_id}
                                                options={dataEntryModeFieldOptions}
                                                onChange={(value) => handleDecisionConfigChange('data_entry_mode_field_id', value)}
                                            />
                                            <p style={{ marginTop: '8px', marginBottom: 0, color: '#50575e' }}>
                                                Valores fixos usados na tramitação: <strong>Upload</strong> = planilha e <strong>Manualmente</strong> = formulário.
                                            </p>
                                        </div>

                                        <div style={{ border: '1px solid #dcdcde', borderRadius: '6px', padding: '12px' }}>
                                            <h4 style={{ marginTop: 0 }}>4) Vários itens com mesmos dados mudando apenas ID</h4>
                                            <SelectControl
                                                label="Field que ativa modo de repetição"
                                                value={decisionConfig.same_values_mode_field_id}
                                                options={sameValuesModeFieldOptions}
                                                onChange={(value) => handleDecisionConfigChange('same_values_mode_field_id', value)}
                                            />
                                            <p style={{ marginTop: '8px', marginBottom: 0, color: '#50575e' }}>
                                                Valor fixo usado na tramitação: <strong>Sim</strong> = ativar repetição com dados iguais e IDs diferentes.
                                            </p>
                                            <SelectControl
                                                label="Campo que diferencia cada item (ID/Nº de tombo)"
                                                value={decisionConfig.same_values_unique_id_field_id}
                                                options={uniqueIdFieldOptions}
                                                onChange={(value) => handleDecisionConfigChange('same_values_unique_id_field_id', value)}
                                            />
                                            <TextControl
                                                label="Prefixo opcional do ID"
                                                value={decisionConfig.same_values_id_prefix}
                                                onChange={(value) => handleDecisionConfigChange('same_values_id_prefix', value)}
                                                help="Exemplo: MOEDA-"
                                            />
                                        </div>
                                    </div>
                                </BaseControl>
                            </div>

                            <div className="flex-basis-100" style={{ marginTop: '1rem' }}>
                                <BaseControl
                                    label="Resumo de Decisao (Preview)"
                                    help="Este resumo descreve como as regras serao avaliadas na tramitacao do processo."
                                >
                                    <div style={{ border: '1px solid #dcdcde', borderRadius: '6px', padding: '12px', backgroundColor: '#f8f9fa' }}>
                                        <ul style={{ margin: 0, paddingLeft: '18px', display: 'grid', gap: '10px' }}>
                                            {decisionPreviewItems.map((item) => (
                                                <li key={item.title}>
                                                    <strong>{item.title}:</strong> {item.detail}{' '}
                                                    <span className={`badge ${item.ok ? 'success' : 'warning'}`}>
                                                        {item.ok ? 'Configurado' : 'Nao definido'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </BaseControl>
                            </div>

                            <div className="group-button">
                                <Button variant="secondary" onClick={cancelMappingData}>
                                    {__('Cancel', 'obatala')}
                                </Button>
                                <Button variant="primary" onClick={getMappingData}>
                                    {__('Save', 'obatala')}
                                </Button>
                            </div>
                        </form>
                    </PanelRow>
                </Panel>
            </main>
            <BrandFooter />
        </>
    );
};

export default MappersManager;
