import React, { useEffect, useState } from "react";
import apiFetch from "@wordpress/api-fetch";
import Select from 'react-select';
import { fetchMetadataCollectionsTainacan, fetchProcessModels, fetchFieldsProcessModels, fetchCollectionsTainacan } from '../../api/apiRequests';


const TainacanMapper = () => {
    const [processModelObatala, setProcessModelObatala] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProcessModel, setSelectedProcessModel] = useState(0);
    const [stepsProcessModel, setStepsProcessModel] = useState([]);
    const [collectionsTainacan, setCollectionsTainacan] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(0);
    const [metadataTainacan, setMetadaTainacan] = useState([]);
    const [selectedSteps, setSelectedSteps] = useState([]);
    const [showMapper, setShowMapper] = useState(false);
    const [selectRows, setSelectRows] = useState([
        { tainacanMetadata: '', obatalaFieldMetadata: '' },
    ]);

    useEffect(() => {
        fetchProcessModelObatala();
        fetchGetCollectionsTainacan();
    }, []);

    useEffect(() => {
        setSelectRows((prev) =>
            selectedSteps.map((step, i) => ({
                ...prev[i],
                obatalaFieldMetadata: step.value,
                tainacanMetadata: prev[i]?.tainacanMetadata || ''
            }))
        );
    }, [selectedSteps]);

    const fetchProcessModelObatala = async () => {
        setIsLoading(true);
        fetchProcessModels()
            .then(data => {
                const sortedProcessTypes = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessModelObatala(sortedProcessTypes);
                console.log(sortedProcessTypes);
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    };

    const fetchGetCollectionsTainacan = async () => {
        setIsLoading(true);
        fetchCollectionsTainacan()
            .then(data => {
                setCollectionsTainacan(data);
                console.log(data);
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
            });
    };


    const handleProcessModelChange = (e) => {
        const selectedId = e.target.value;
        setSelectedProcessModel(selectedId);

        fetchFieldsProcessModels(selectedId)
            .then((data) => {
                console.log("Campos retornados:", data);

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
        setSelectedCollection(selectedId);

        fetchMetadataCollectionsTainacan(selectedId)
            .then((data) => {
                console.log("Metadados retornados:", data);

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

    return (
        <div style={{ backgroundColor: "white", paddingTop: "1px" }}>
            <h1 style={{ textAlign: 'center' }}>Mappers Tainacan</h1>
            <form style={formStyle}>
                <input type="hidden" name="page" value="inbcm-mapping" />

                <label style={labelStyle}>
                    Escolha o Modelo:
                    <select
                        name="model"
                        style={selectStyle}
                        onChange={handleProcessModelChange}
                        value={selectedProcessModel}
                    >

                        <option value="0">-- Selecione --</option>
                        {processModelObatala.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item?.title?.rendered}
                            </option>
                        ))}
                    </select>
                </label>

                <label style={labelStyle}>
                    Escolha a Etapa(s) cujo formulário apresenta os metadados do item:
                    <Select
                        isMulti
                        disabled={!selectedProcessModel || selectedSteps.length === 0}
                        options={stepsProcessModel}
                        onChange={(selectedOptions) => {
                            setSelectedSteps(selectedOptions.map(opt => opt));
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

                <label style={labelStyle}>
                    Escolha a Coleção de Destino no Tainacan:
                    <select
                        onChange={handleTainacanColletionChange}
                        name="mapper_slug"
                        style={{
                            ...selectStyle,
                            backgroundColor: selectedSteps.length === 0 ? '#f0f0f0' : 'white',
                            cursor: selectedSteps.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                        disabled={selectedSteps.length === 0}
                    >
                        <option value="0">-- Selecione --</option>
                        {collectionsTainacan.map((collection) => (
                            <option key={collection["WP_Post"].ID} value={collection["WP_Post"].ID}>
                                {collection["WP_Post"].post_title}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    type="button"
                    style={buttonStyle}
                    onClick={() => setShowMapper(true)}
                    disabled={selectedProcessModel === "0" || selectedSteps.length === 0}
                >
                    Continuar
                </button>
            </form>

            {showMapper && (
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
                            onClick={() => {
                                // Aqui você pode processar os mapeamentos entre os campos
                                console.log('Mapeamentos salvos:', selectRows);
                            }}
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TainacanMapper;
