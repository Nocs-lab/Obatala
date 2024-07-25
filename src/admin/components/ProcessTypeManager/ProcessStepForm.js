import { useState } from 'react';
import { Button, ComboboxControl, SelectControl, PanelBody, PanelRow, Notice, Icon } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';

const ProcessStepForm = ({ processTypes, processSteps, onAddStep }) => {
    const [selectedProcessType, setSelectedProcessType] = useState('');
    const [selectedSteps, setSelectedSteps] = useState([]);
    const [stepInputValue, setStepInputValue] = useState('');
    const [notice, setNotice] = useState(null);

    const handleAddStep = () => {
        if (!selectedProcessType || selectedSteps.length === 0) {
            setNotice({ status: 'error', message: 'Please select both a process type and at least one step.' });
            return;
        }

        const stepsToAdd = selectedSteps.map(stepTitle => {
            const step = processSteps.find(step => step.title.rendered === stepTitle);
            return {
                id: step.id,
                title: step.title.rendered,
                status: 'publish',
                process_type: selectedProcessType,
            };
        });

        onAddStep(stepsToAdd);
        setSelectedSteps([]);
        setNotice({ status: 'success', message: 'Steps added successfully.' });
    };

    const handleChange = (value) => {
        if (value && !selectedSteps.includes(value)) {
            setSelectedSteps([...selectedSteps, value]);
            setStepInputValue('');
        }
    };

    const handleRemoveStep = (stepTitle) => {
        setSelectedSteps(selectedSteps.filter(step => step !== stepTitle));
    };

    return (
        <PanelBody title="Add Process Step" initialOpen={true}>
            <PanelRow>
                {notice && (
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                )}
                <ComboboxControl
                    label="Select Step"
                    value={stepInputValue}
                    options={processSteps
                        .filter(step => !selectedSteps.includes(step.title.rendered))
                        .map(step => ({ label: step.title.rendered, value: step.title.rendered }))}
                    onChange={handleChange}
                    onInputChange={setStepInputValue}
                />
                <div className="selected-steps">
                    {selectedSteps.map(step => (
                        <div key={step} className="selected-step">
                            {step}
                            <Button
                                icon={closeSmall}
                                onClick={() => handleRemoveStep(step)}
                                className="remove-step-button"
                            />
                        </div>
                    ))}
                </div>
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
    );
};

export default ProcessStepForm;
