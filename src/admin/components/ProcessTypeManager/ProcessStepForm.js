import { useState } from 'react';
import { Button, TextControl, SelectControl, Panel, PanelBody, PanelRow } from '@wordpress/components';

const ProcessStepForm = ({ processTypes, onAddStep }) => {
    const [selectedProcessType, setSelectedProcessType] = useState('');
    const [stepName, setStepName] = useState('');
    const [selectedProcess, setSelectedProcess] = useState('');

    const handleAddStep = () => {
        if (!selectedProcessType || !selectedProcess || !stepName) {
            alert('Please select both a process type and a parent process and a step name.');
            return;
        }

        const newStep = {
            title: stepName,
            status: 'publish',
            process_type: selectedProcessType,
            parent_process: selectedProcess
            
        };
        onAddStep(newStep);
        setStepName('');
        setSelectedProcessType('');
        setSelectedProcess('');
    };

    return (
        <Panel>
            <PanelBody title="Add Process Step" initialOpen={ true }>
                <PanelRow>
                    <TextControl
                        label="Step Name"
                        value={stepName}
                        onChange={(value) => setStepName(value)}
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
                    <SelectControl
                        label="Select Parent Process"
                        value={selectedProcess}
                        options={[
                            { label: 'Select a parent process...', value: '' },
                            ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                        ]}
                        onChange={(value) => setSelectedProcess(value)}
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