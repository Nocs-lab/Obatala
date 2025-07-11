import React, { useState } from "react";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";
import TainacanExporter from "./MappersManager/TainacanMapper";

const MappersManager = () => {
    const [showForm, setShowForm] = useState(false);

    const handleAddMapper = () => {
        setShowForm(true);
    };

    const handleBackToList = () => {
        setShowForm(false);
    };

    // Função que será passada para o TainacanExporter para avisar do sucesso
    const handleSaveSuccess = () => {
        setShowForm(false); // volta para a lista
        // Se quiser, pode adicionar um alert ou atualizar listagem aqui
    };

    return (
        <>
            <BrandHeader />
            <main>
                {!showForm ? (
                    <>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: '32px',
                            color: 'white'
                        }}>
                            Mapeadores de Exportação
                        </h1>
                        <h3 style={{
                            textAlign: 'center',
                            marginBottom: '32px',
                            color: 'white'
                        }}>
                            Permite exportar um item gerado por um processo do Obatala para o Tainacan.
                        </h3>

                        <div style={{ marginBottom: '24px', textAlign: 'right' }}>
                            <button
                                onClick={handleAddMapper}
                                style={{
                                    padding: '10px 16px',
                                    backgroundColor: '#007cba',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cadastrar novo
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ marginBottom: '24px' }}>
                            <button
                                onClick={handleBackToList}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#ccc',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Voltar para lista
                            </button>
                        </div>
                        {/* Passa onSaveSuccess para o TainacanExporter */}
                        <TainacanExporter onSaveSuccess={handleSaveSuccess} />
                    </>
                )}
            </main>
            <BrandFooter />
        </>
    );
};

export default MappersManager;
