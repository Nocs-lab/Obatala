import React from 'react';
import { Panel, PanelHeader, PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ProcessUserLog from './ProcessUserLog';

const HistoryViewer = ({
    process,
    filteredProcessType,
    authorsById,
    progress,
    isComplete,
    options,
    currentStageData,
    sectors
}) => {
    return (
        <Panel>
            <PanelHeader>{__('History', 'obatala')}</PanelHeader>
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
    );
};

export default HistoryViewer;