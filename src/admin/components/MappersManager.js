import React, { useEffect, useState } from "react";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";
import apiFetch from "@wordpress/api-fetch";
import Select from 'react-select';
import { fetchMapperCollectionTainacan, fetchMapperProcessModel, fetchMetadataCollectionsTainacan, fetchProcessModels, fetchFieldsProcessModels, fetchCollectionsTainacan } from '../api/apiRequests';

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
                    console.log(parsedData);
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
        console.log("R:", selectRows);
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
        console.log("map:", mappedData);

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



    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '500px',
        width: '100%',
        margin: '0 auto',
    };

    const labelStyle = {
        width: '100%',
    };

    const selectStyle = {
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '4px',
        marginBottom: '6px',
        height: '36px',
        fontSize: '1rem',
    };

    const multiSelectStyle = {
        ...selectStyle,
        minHeight: '100px', // Garante que o select de múltiplas opções tenha altura suficiente
    };

    const buttonStyle = {
        width: '200px', // Mantém o tamanho fixo do botão
        height: '36px',
        fontSize: '1rem',
        backgroundColor: '#007cba', // cor padrão do botão WP
        color: '#fff',
        border: 'none',
        borderRadius: '3px',
        cursor: 'pointer',
        boxSizing: 'border-box',
        margin: '10px 0', // Espaço entre os botões
        alignSelf: 'center', // Centraliza cada botão na linha
    };

    const greenButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'green', // Cor verde para os botões
    };

    const redButtonStyle = {
        ...buttonStyle,
        backgroundColor: 'red', // Cor verde para os botões
    };

    return (
        <>
            <BrandHeader />
            <main>
                <div style={{ backgroundColor: "white", paddingTop: "1px" }}>
                    <h1 style={{ textAlign: 'center' }}>Mappers Tainacan</h1>
                    <form style={formStyle}>
                        <input type="hidden" name="page" value="inbcm-mapping" />

                        <label style={labelStyle}>
                            Process Model: {" "}
                            <strong>
                                {selectedProcessModel?.title?.rendered}
                            </strong>
                        </label>

                        <label style={labelStyle}>
                            Escolha a Coleção de Destino no Tainacan:
                            <select
                                onChange={handleTainacanColletionChange}
                                value={selectedCollection}
                                name="mapper_slug"
                                style={{
                                    ...selectStyle,
                                    backgroundColor: selectedSteps.length === 0 ? '#f0f0f0' : 'white',
                                    cursor: selectedSteps.length === 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <option value="0">-- Selecione --</option>
                                {collectionsTainacan.map((collection) => (
                                    <option key={collection["WP_Post"].ID} value={collection["WP_Post"].ID}>
                                        {collection["WP_Post"].post_title}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label style={labelStyle}>
                            Escolha os campos do formulário que apresentam os metadados do item:
                            <Select
                                isMulti
                                options={stepsProcessModel}
                                value={selectedSteps}
                                onChange={(selectedOptions) => {
                                    setSelectedSteps(selectedOptions);
                                }}
                                styles={{
                                    multiSelectStyle,
                                    container: (base) => ({
                                        ...base,
                                        width: '100%',
                                    }),
                                    control: (base) => ({
                                        ...base,
                                        minHeight: '36px',
                                        fontSize: '1rem',
                                        backgroundColor: selectedProcessModel === "0" ? '#f0f0f0' : 'white', // Feedback visual opcional
                                        cursor: selectedProcessModel === "0" ? 'not-allowed' : 'pointer',
                                    }),
                                }}
                            />
                        </label>

                        {/* Exibir as etapas selecionadas */}
                        {selectedSteps.length > 0 && (
                            <div>
                                <h4>Campos Selecionados:</h4>
                                <ul>
                                    {selectedSteps.map((step, index) => (
                                        <li key={index}>{step.label}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <h1>Mapeie os Metadados</h1>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '40px',
                                    marginTop: '2rem',
                                }}
                            >
                                <div>
                                    <h3>Field Obatala</h3>
                                    {selectedSteps.map((step, index) => (
                                        <div key={index} style={{ marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                value={step.label}
                                                readOnly
                                                style={{
                                                    height: '36px',
                                                    fontSize: '1rem',
                                                    width: '250px',
                                                    boxSizing: 'border-box',
                                                    backgroundColor: '#f5f5f5',
                                                    border: '1px solid #ccc',
                                                    padding: '0 8px'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h3>Tainacan Metadado</h3>
                                    {selectedSteps.map((_, index) => (
                                        <div key={index} style={{ marginBottom: '10px' }}>
                                            <select
                                                style={{
                                                    height: '36px',
                                                    fontSize: '1rem',
                                                    width: '250px',
                                                    boxSizing: 'border-box',
                                                }}
                                                value={selectRows[index]?.tainacanMetadata || ''}
                                                onChange={(e) => handleSelectChange(index, 'tainacanMetadata', e.target.value)}
                                            >
                                                <option value="">-- Selecione --</option>
                                                {metadataTainacan.map((item) => {
                                                    const post = item["WP_Post"];
                                                    const id = String(post.ID);
                                                    const isUsed = isMetadataSelected(id, index);

                                                    return (
                                                        post?.post_title && (
                                                            <option
                                                                key={id}
                                                                value={id}
                                                                disabled={isUsed}
                                                            >
                                                                {post.post_title} {isUsed ? ' (já usado)' : ''}
                                                            </option>
                                                        )
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    ))}

                                </div>

                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '20px' }}>
                                <button
                                    type="button"
                                    style={greenButtonStyle}
                                    onClick={getMappingData}
                                >
                                    Salvar
                                </button>
                                <button
                                    type="button"
                                    style={redButtonStyle}
                                    onClick={cancelMappingData}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <BrandFooter />
        </>
    );
};

export default MappersManager;
