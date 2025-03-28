import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

const Timeline = ({ stages, process, currentStageData, authorsById, sectors }) => {
    const formatDate = (date) => {
        return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
            locale: ptBR
        });
    };

    const getSectorName = (sectorId) => {
        if (!sectorId) return null;
        const sector = sectors.find(s => s.id === sectorId);
        return sector ? sector.name : "Setor desconhecido";
    };

    return (
        <div className="timeline-container">
            <ul className="timeline">
                <li className="timeline-item">
                    <div className="timeline-badge success"></div>
                    <div className="timeline-content">
                        <h3 className="timeline-title">Processo criado</h3>
                        <p>Por: {authorsById[process?.author]?.name}</p>
                        <time>{formatDate(process?.date)}</time>
                    </div>
                </li>
                
                {stages.map((step, index) => {
                    const stageData = currentStageData[step.value];
                    if (!stageData) return null;
                    
                    const sectorName = getSectorName(step.sector_stage);
                    
                    return (
                        <li key={index} className="timeline-item">
                            <div className="timeline-badge primary"></div>
                            <div className="timeline-content">
                                <h3 className="timeline-title">{step.label}</h3>
                                <p>Atualizado por: {stageData[1]}</p>
                                {sectorName && (
                                    <p>Grupo responsável: {sectorName}</p>
                                )}
                                <time>{formatDate(stageData[0])}</time>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Timeline;