import React from "react";
import { __ } from '@wordpress/i18n';
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Icon } from "@wordpress/components";
import { check, plus } from "@wordpress/icons";

const ProcessUserLog = ({ stages, process, currentStageData, authorsById, sectors }) => {
    const formatDate = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    };

    const getSectorName = (sectorId) => {
        if (!sectorId) return null;
        const sector = sectors.find(s => s.id === sectorId);
        return sector ? sector.name : __("Unknown sector", "obatala");
    };

    return (
        <div className="timeline-container">
            <ul className="timeline">
                <li className="timeline-item">
                    <div className="timeline-badge primary"><Icon icon={plus} /></div>
                    <p className="timeline-title"><strong>{__("Process created", "obatala")}</strong> <time>{formatDate(process?.date)}</time></p>
                    <dl className="timeline-content">
                        <dt>{__("Responsible", "obatala")}:</dt>
                        <dd>{authorsById[process?.author]?.name}</dd>
                    </dl>
                </li>
                
                {stages.map((step, index) => {
                    const stageData = currentStageData[step.value];
                    if (!stageData) return null;
                    
                    const sectorName = getSectorName(step.sector_stage);
                    
                    return (
                        <li key={index} className="timeline-item">
                            <div className="timeline-badge success"><Icon icon={check} /></div>
                            <p className="timeline-title"><strong>{step.label}</strong> <time>{formatDate(stageData[0])}</time></p>
                            <dl className="timeline-content">
                                <dt>{__("Responsible", "obatala")}:</dt>
                                <dd>{stageData[1]}{sectorName && ` (${sectorName})`}</dd>
                            </dl>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ProcessUserLog;
