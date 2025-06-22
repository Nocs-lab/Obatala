    
import React, { useState } from "react";
import BrandHeader from "./BrandHeader";
import BrandFooter from "./BrandFooter";
import { color } from "@wordpress/icons";

//import TainacanExporter from "./ExporterManager/TainacanExporter";

const MappersManager = () => {
    const containerStyle = {
        maxWidth: '1200px', // Aumentado para caber os 3 cards
        margin: '0 auto',
        padding: '0 16px',
    };

    const titleContainerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px',
        marginBottom: '16px',
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: '1',
        color: 'white'
    };

    const cardContainerStyle = {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        flexWrap: 'nowrap', // Não quebrar linha
    };

    const cardStyle = {
        flex: '1 1 30%',
        minWidth: '300px',
        maxWidth: '360px',
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'white',
        transition: 'transform 0.2s ease',
        boxSizing: 'border-box',
        cursor: 'pointer',
    };

    const importCardStyle = {
        borderLeft: '8px solid green',
    };

    const exportCardStyle = {
        borderLeft: '8px solid blue',
    };

    const cardTitleStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: 'black'
    };

    const [selectedExporter, setSelectedExporter] = useState(null);

    const handleExporterClick = (exporter) => {
        setSelectedExporter(exporter);
    };

    return (
        <>
            <BrandHeader />
            <main>
                <div style={containerStyle}>
                    <div style={titleContainerStyle}>
                        <h1 style={titleStyle}>Exporter/Importer Obatala</h1>
                    </div>

                    <div style={cardContainerStyle}>
                        {/* Exportadores - Azul */}
                        <div
                            style={{ ...cardStyle, ...exportCardStyle }}
                            onClick={() => handleExporterClick('tainacan')}
                        >
                            <h2 style={cardTitleStyle}>Obatala para Tainacan</h2>
                            <p>
                                Permite exportar um item gerado por um processo do Obatala para o Tainacan.
                            </p>
                        </div>
                    </div>
                    {selectedExporter === 'tainacan' && <TainacanExporter />}
                </div>
            </main>
            <BrandFooter />
        </>
    );
};

export default MappersManager;
 