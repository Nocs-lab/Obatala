import { useState } from 'react';
import { Button, SelectControl, Panel, PanelBody, PanelRow, Notice } from '@wordpress/components';

const ProcessStepForm = ({ processTypes, processSteps, onAddStep }) => {
    const [selectedProcessType, setSelectedProcessType] = useState('');
    const [selectedStep, setSelectedStep] = useState('');
    const [notice, setNotice] = useState(null);

    const handleAddStep = () => {
        if (!selectedProcessType || !selectedStep) {
            setNotice({ status: 'error', message: 'Please select both a process type and a step.' });
            return;
        }

        
        const step = processSteps.find(step => step.title.rendered === selectedStep);

        const newStep = {
            id: step.id, // Use the ID of the existing step
            title: step.title.rendered,
            status: 'publish',
            process_type: selectedProcessType,
        };

        onAddStep(newStep);
        setSelectedProcessType('');
        setSelectedStep('');
    };

    return (
        <Panel>
            <PanelBody title="Add Process Step" initialOpen={true}>
                <PanelRow>
                {notice && (
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                    )}

                    <SelectControl
                        label="Select Step"
                        value={selectedStep}
                        options={[
                            { label: 'Select a step...', value: '' },
                            ...processSteps.map(step => ({ label: step.title.rendered, value: step.title.rendered }))
                        ]}
                        onChange={(value) => setSelectedStep(value)}
                    />
                    <SelectControl
                        label="Select Process Type"
                        value={selectedProcessType}
                        options={[
                            { label: 'Select a process type...', value: '' },
                            ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                        ]}
                        onChange={(value) => setSelectedProcessType(value)}
                    />
                    <Button isSecondary onClick={handleAddStep}>
                        Add Process Step
                    </Button>
                </PanelRow>
            </PanelBody>
        </Panel>
    );
};

export default ProcessStepForm;

