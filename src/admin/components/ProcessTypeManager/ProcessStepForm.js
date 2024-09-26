import { useState, useEffect } from 'react';
import { Button, ComboboxControl, PanelRow, Notice, Icon } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';

const ProcessStepForm = ({ onAddStep }) => {
    const [processSteps, setProcessSteps] = useState([]);
    const [selectedSteps, setSelectedSteps] = useState([]);
    const [stepInputValue, setStepInputValue] = useState('');
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        apiFetch({ path: `/obatala/v1/process_step?per_page=100&_embed` })
            .then((stepsData) => {
                const sortedSteps = stepsData.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessSteps(sortedSteps);
            })
            .catch((error) => {
                console.error('Error fetching process steps:', error);
                setNotice({ status: 'error', message: 'Error fetching process steps.' });
            });
    }, []);

    const handleAddStep = () => {
        if (selectedSteps.length === 0) {
            setNotice({ status: 'error', message: 'Please select at least one step.' });
            return;
        }

        // Chama a função onAddStep passada como prop
        onAddStep(selectedSteps);
        setSelectedSteps([]);
        setNotice({ status: 'success', message: 'Steps added successfully.' });
    };

    const handleChange = (value) => {
        if (value && !selectedSteps.includes(value)) {
            setSelectedSteps([...selectedSteps, value]);
            setStepInputValue('');
        }
    };

    const handleRemoveStep = (stepId) => {
        setSelectedSteps(selectedSteps.filter((step) => step !== stepId));
    };

    return (
        <PanelRow>
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}
            <ComboboxControl
                label="Select one or more Steps"
                value={stepInputValue}
                options={processSteps
                    .filter((step) => !selectedSteps.includes(step.id))
                    .map((step) => ({ label: step.title.rendered, value: step.id }))}
                onChange={handleChange}
                onInputChange={setStepInputValue}
            />
            <div className="selected-steps">
                {selectedSteps.map((stepId) => {
                    const step = processSteps.find((step) => step.id === stepId);
                    return (
                        <div key={stepId} className="selected-step">
                            {step.title.rendered}
                            <Button
                                icon={closeSmall}
                                onClick={() => handleRemoveStep(stepId)}
                                className="remove-step-button"
                            />
                        </div>
                    );
                })}
            </div>
            <Button variant="secondary" onClick={handleAddStep}>
                Add Steps
            </Button>
        </PanelRow>
    );
};

export default ProcessStepForm;
