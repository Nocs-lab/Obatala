import { useState } from 'react';
import { Button, TextControl, SelectControl } from '@wordpress/components';

const ProcessStepForm = ({ processTypes, onAddStep }) => {
    const [selectedProcessType, setSelectedProcessType] = useState('');
    const [stepName, setStepName] = useState('');
    const [selectedProcess, setSelectedProcess] = useState('');

    const handleAddStep = () => {
        if (!selectedProcessType || !selectedProcess) {
            alert('Please select both a process type and a parent process.');
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
        <div>
            <h3>Add Process Step</h3>
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
        </div>
    );
};

export default ProcessStepForm;
