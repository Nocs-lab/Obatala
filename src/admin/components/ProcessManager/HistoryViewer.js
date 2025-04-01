import React from 'react';
import { Panel, PanelHeader } from '@wordpress/components';
import ProcessHeader from './ProcessHeader';
import ProcessUserLog from './ProcessUserLog';

const HistoryViewer = ({ 
    process, 
    filteredProcessType, 
    authorsById, 
    calculatePercentagem,
    options,
    currentStageData,
    sectors
}) => {
    return (
        <main>
            <ProcessHeader 
                process={process}
                filteredProcessType={filteredProcessType}
                authorsById={authorsById}
                calculatePercentagem={calculatePercentagem}
            />
            
            <div className="history-container">
                <Panel>
                    <div className="timeline-full-view">
                    <PanelHeader>History</PanelHeader>
                        <ProcessUserLog
                            stages={options}
                            process={process}
                            currentStageData={currentStageData}
                            authorsById={authorsById}
                            sectors={sectors}
                        />
                    </div>
                </Panel>
            </div>
        </main>
    );
};

export default HistoryViewer;