import React from 'react';
import { Panel, PanelHeader, PanelRow } from '@wordpress/components';
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
            
            <Panel>
                <PanelHeader>History</PanelHeader>
                <PanelRow>
                    <ProcessUserLog
                        stages={options}
                        process={process}
                        currentStageData={currentStageData}
                        authorsById={authorsById}
                        sectors={sectors}
                    />
                </PanelRow>
            </Panel>
        </main>
    );
};

export default HistoryViewer;