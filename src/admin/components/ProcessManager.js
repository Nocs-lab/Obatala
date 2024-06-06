import { useState, useEffect } from 'react';
import { Spinner, Button, SelectControl, TextControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import ProcessStage from './ProcessManager/ProcessStage';

const ProcessManager = () => {
    const [processTypes, setProcessTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newProcessTitle, setNewProcessTitle] = useState('');
    const [newProcessType, setNewProcessType] = useState('');

    useEffect(() => {
        fetchProcessTypes();
        fetchProcesses();
    }, []);

    const fetchProcessTypes = () => {
        apiFetch({ path: `/wp/v2/process_type?per_page=100&_embed` })
            .then(data => {
                setProcessTypes(data);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
            });
    };

    const fetchProcesses = () => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_obatala?per_page=100&_embed` })
            .then(data => {
                setProcesses(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching processes:', error);
                setIsLoading(false);
            });
    };

    const handleCreateProcess = () => {
        if (!newProcessTitle || !newProcessType) {
            alert('Please provide a title and select a process type.');
            return;
        }

        const newProcess = {
            title: newProcessTitle,
            status: 'publish',
            type: 'process_obatala',
            process_type: newProcessType,
            current_stage: null,
        };

        apiFetch({ path: `/wp/v2/process_obatala`, method: 'POST', data: newProcess })
            .then(savedProcess => {
                setProcesses([...processes, savedProcess]);
                setNewProcessTitle('');
                setNewProcessType('');
                setSelectedProcess(savedProcess);
            })
            .catch(error => {
                console.error('Error creating process:', error);
            });
    };

    const handleSelectProcess = (processId) => {
        const process = processes.find(p => p.id === processId);
        setSelectedProcess(process);
    };

    const handleCancelEdit = () => {
        setSelectedProcess(null);
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            <h2>Manage Processes</h2>
            {!selectedProcess && (
                <div className="panel">
                    <TextControl
                        label="Process Title"
                        value={newProcessTitle}
                        onChange={(value) => setNewProcessTitle(value)}
                    />
                    <SelectControl
                        label="Process Type"
                        value={newProcessType}
                        options={[
                            { label: 'Select a process type...', value: '' },
                            ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                        ]}
                        onChange={(value) => setNewProcessType(value)}
                    />
                    <Button isPrimary onClick={handleCreateProcess}>Create Process</Button>
                </div>
            )}
            <div className="panel">
                <h3 className="panel-title">Existing Processes</h3>
                <ul className="list-group">
                    {processes.map(process => (
                        <li key={process.id} className="list-group-item">
                            <Button onClick={() => handleSelectProcess(process.id)}>
                                {process.title.rendered}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedProcess && (
                <ProcessStage process={selectedProcess} onCancelEdit={handleCancelEdit} />
            )}
        </div>
    );
};

export default ProcessManager;
