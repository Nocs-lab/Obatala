import { useState, useEffect } from 'react';
import { Button, TextControl, SelectControl, Panel, PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessStepForm = ({ processTypes, onAddStep }) => {
    const [selectedProcessType, setSelectedProcessType] = useState('');
    const [stepName, setStepName] = useState('');
    const [selectedProcess, setSelectedProcess] = useState('');
    const [sectors, setSectors] = useState([]);
    const [selectedSector, setSelectedSector] = useState('');

    useEffect(() => {
        fetchSectors();
    }, []);

    const fetchSectors = () => {
        apiFetch({ path: '/wp/v2/sector?per_page=100&_embed' })
            .then(data => {
                setSectors(data);
            })
            .catch(error => {
                console.error('Error fetching sectors:', error);
            });
    };

    const handleAddStep = () => {
        if (!selectedProcessType || !selectedProcess || !selectedSector) {
            alert('Please select a process type, a parent process, and a sector.');
            return;
        }

        const newStep = {
            title: stepName,
            status: 'publish',
            process_type: selectedProcessType,
            parent_process: selectedProcess,
            sector: selectedSector
        };
        onAddStep(newStep);
        setStepName('');
        setSelectedProcessType('');
        setSelectedProcess('');
        setSelectedSector('');
    };

    return (
        <Panel>
            <PanelBody title="Add Process Step" initialOpen={true}>
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
                    <SelectControl
                        label="Select Sector"
                        value={selectedSector}
                        options={[
                            { label: 'Select a sector...', value: '' },
                            ...sectors.map(sector => ({ label: sector.name, value: sector.id }))
                        ]}
                        onChange={(value) => setSelectedSector(value)}
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
