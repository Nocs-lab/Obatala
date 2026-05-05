import React, { useEffect, useState } from "react";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";
import apiFetch from "@wordpress/api-fetch";
import Select from 'react-select';
import { __ } from "@wordpress/i18n";
import { BaseControl, Button, Icon, Panel, PanelRow, SelectControl } from '@wordpress/components';
import { fetchMapperProcessModel, fetchMetadataCollectionsTainacan, fetchProcessModels, fetchFieldsProcessModels, fetchCollectionsTainacan } from '../api/apiRequests';

const MappersManager = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProcessModel, setSelectedProcessModel] = useState(null);
    const [stepsProcessModel, setStepsProcessModel] = useState([]);
    const [collectionsTainacan, setCollectionsTainacan] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(0);
    const [metadataTainacan, setMetadaTainacan] = useState([]);
    const [selectedSteps, setSelectedSteps] = useState([]);
    const [mapper, setMapper] = useState(null);
    const [showMapper, setShowMapper] = useState(false);
    const [selectRows, setSelectRows] = useState([
        { tainacanMetadata: '', obatalaFieldMetadata: '' },
    ]);

    useEffect(() => {
        const idModel = new URLSearchParams(window.location.search).get('process_type_id');

        fetchMapperProcessModel(idModel)
            .then((mapper) => {
                // Garante que mapping_data exista
                if (mapper?.mapping_data) {
                    const parsedData = JSON.parse(mapper.mapping_data);
                    setMapper(parsedData);

                    // Set collection
                    setSelectedCollection(parsedData.collection_id);

                    // Mapeia as etapas selecionadas (obatala_field)
                    const mappedSteps = parsedData.mappings.map((m) => ({
                        value: m.obatala_field.value,
                        label: m.obatala_field.label
                    }));
                    setSelectedSteps(mappedSteps);

                    // Preenche os rows do select (estrutura do formulário)
                    const rows = parsedData.mappings.map((m) => ({
                        obatalaFieldMetadata: m.obatala_field,
                        tainacanMetadata: m.tainacan_metadata_id,
                    }));
                    setSelectRows(rows);
                } else {
                    console.warn('Nenhum dado encontrado em mapping_data.');
                }
            })
            .catch((error) => {
                console.error('Erro ao buscar o mapper:', error);
            });
    }, []);

    useEffect(() => {
        if (mapper && stepsProcessModel.length > 0) {
            const enrichedSteps = mapper.mappings.map((mapping) => {
                const matchedStep = stepsProcessModel.find(step => step.value === mapping.obatala_field.value);
                return {
                    value: matchedStep?.value,
                    label: matchedStep?.label
                };
            });
            setSelectedSteps(enrichedSteps);

            const updatedRows = mapper.mappings.map((mapping) => ({
                obatalaFieldMetadata: {
                    value: mapping.obatala_field.value,
                    label: stepsProcessModel.find(step => step.value === mapping.obatala_field.value)?.label || mapping.obatala_field.label
                },
                tainacanMetadata: mapping.tainacan_metadata_id
            }));
            setSelectRows(updatedRows);
        }
    }, [mapper, stepsProcessModel]);

    useEffect(() => {
        if (mapper && mapper.collection_id) {
            fetchMetadataCollectionsTainacan(mapper.collection_id)
                .then((data) => {
                    setMetadaTainacan(data);

                    // Após os metadados estarem prontos, preencher os selects
                    if (mapper.mappings) {
                        const rows = mapper.mappings.map((m) => ({
                            obatalaFieldMetadata: m.obatala_field,
                            tainacanMetadata: m.tainacan_metadata_id, // Usa o ID
                        }));
                        setSelectRows(rows);
                    }
                })
                .catch((error) => {
                    console.error("Erro ao buscar metadados da coleção mapeada:", error);
                });
        }
    }, [mapper]);

    useEffect(() => {
        const idModel = new URLSearchParams(window.location.search).get('process_type_id');

        fetchProcessModelObatala()
            .then((models) => {
                const filtered = models.find((model) => model.id === parseInt(idModel));
                setSelectedProcessModel(filtered);
                handleProcessModelSteps(filtered.id);
            });

        fetchGetCollectionsTainacan();
    }, []);

    useEffect(() => {
        setSelectRows((prev) =>
            selectedSteps.map((step, i) => ({
                ...prev[i],
                obatalaFieldMetadata: step,
                tainacanMetadata: prev[i]?.tainacanMetadata || ''
            }))
        );
    }, [selectedSteps]);

    const fetchProcessModelObatala = async () => {
        try {
            const data = await fetchProcessModels();
            return data;
        } catch (error) {
            return [];
        }
    };

    const fetchGetCollectionsTainacan = async () => {
        setIsLoading(true);
        fetchCollectionsTainacan()
            .then(data => {
                setCollectionsTainacan(data);
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    };

    const handleProcessModelSteps = (selectedId) => {
        fetchFieldsProcessModels(selectedId)
            .then((data) => {
                const stepOptions = data.map(field => ({
                    value: field.id,
                    label: field?.config?.label + " - " + field.stage
                }));

                setStepsProcessModel(stepOptions);
            })
            .catch((error) => {
                //console.error("Erro ao buscar campos:", error);
            });
    };

    const handleTainacanColletionChange = (e) => {
        const selectedId = e.target.value;

        // Limpa os mapeamentos anteriores ao trocar de coleção
        if (selectedCollection !== selectedId) {
            setSelectedSteps([]); // Limpa os campos multiseleção
            setSelectRows([]);    // Limpa os mapeamentos de metadados
        }

        setSelectedCollection(selectedId);

        fetchMetadataCollectionsTainacan(selectedId)
            .then((data) => {
                setMetadaTainacan(data);
            })
            .catch((error) => {
                console.error("Erro ao buscar metadados:", error);
            });
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

    const getMappingData = () => {
        if (!selectedCollection || selectedCollection === "0") {
            alert("Selecione uma coleção do Tainacan.");
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

        const mappedData = {
            process_model_id: selectedProcessModel.id,
            collection_id: selectedCollection,
            mappings: selectRows.map((row, index) => ({
                obatala_field: row.obatalaFieldMetadata,
                tainacan_metadata_id: row.tainacanMetadata,
            }))
        };

        apiFetch({
            path: '/obatala/v1/exporter/save_mapping_data',
            method: 'POST',
            data: mappedData,
        }).then((response) => {
            if (response.success) {
                alert('Mapeamento salvo com sucesso!');
                window.location.href = '?page=process-type-manager';
                setShowMapper(false);
                setSelectedProcessModel(0);
                setSelectedCollection(0);
                setSelectedSteps([]);
                setSelectRows([{ tainacanMetadata: '', obatalaFieldMetadata: '' }]);
            } else {
                alert('Falha ao salvar: ' + (response.message || 'Erro desconhecido.'));
            }
        }).catch((error) => {
            alert('Erro ao salvar o mapeamento.');
        });
    };

    const cancelMappingData = () => {
        window.location.href = '?page=process-type-manager';
        setShowMapper(false);
        setSelectedProcessModel(0);
        setSelectedCollection(0);
        setSelectedSteps([]);
        setSelectRows([{ tainacanMetadata: '', obatalaFieldMetadata: '' }]);
    }

    return (
        <>
            <BrandHeader />
            <div className="title-container">
                <h2>
                    Mappers Tainacan
                </h2>
            </div>
            <main>
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
