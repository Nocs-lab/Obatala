import { useState, useEffect } from 'react';
import { Spinner, Notice, Panel, PanelHeader, PanelBody, PanelRow } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessViewer = () => {
    const [process, setProcess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processTypes, setProcessTypes] = useState([]);
    const [processSteps, setProcessSteps] = useState([]);

    const getProcessIdFromUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('process_id');
    };

    useEffect(() => {
        const processId = getProcessIdFromUrl();
        if (processId) {
            fetchProcess(processId);
            fetchProcessTypes();
            fetchProcessSteps();
        } else {
            setError('No process ID found in the URL.');
            setIsLoading(false);
        }
    }, []);

    const fetchProcess = (processId) => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_obatala/${processId}?_embed` })
            .then(data => {
                setProcess(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process:', error);
                setError('Error fetching process details.');
                setIsLoading(false);
            });
    };

    const fetchProcessTypes = () => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_type?per_page=100&_embed` })
            .then(data => {
                setProcessTypes(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
                setIsLoading(false);
            });
    };

    const fetchProcessSteps = () => {
        setIsLoading(true);
        apiFetch({ path: `/wp/v2/process_step?per_page=100&_embed` })
            .then(data => {
                setProcessSteps(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process steps:', error);
                setIsLoading(false);
            });
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return <Notice status="error" isDismissible={false}>{error}</Notice>;
    }

    if (!process) {
        return <Notice status="warning" isDismissible={false}>No process found.</Notice>;
    }

    // Filtrar as etapas pelo tipo de processo atual
    const filteredSteps = processSteps.filter(step => step.process_type === process.process_type);

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Viewer</span>
            <h2>{process.process_type ? 'Process type title' : ''}: {process.title.rendered}</h2>
            <div className="badge-container">
                <span className="badge success">{process.status}</span>
                <span className="badge">Current step</span>
            </div>

            <div className="panel-container">
                <main className="counter-container">
                    {filteredSteps.length > 0 ? (
                        filteredSteps.map((step, index) => (
                            <Panel key={step.id} className="counter-item">
                                <PanelHeader>{step.title.rendered}<span className="badge success">Completed</span><small>Completed at 21/04/2024 by João Silva</small></PanelHeader>
                                <PanelBody title="History" initialOpen={false}>
                                    <PanelRow>
                                        {/* Renderizar histórico aqui, se houver */}
                                    </PanelRow>
                                </PanelBody>
                                <PanelBody title="Comments" initialOpen={false}>
                                    <PanelRow>
                                        {/* Renderizar comentários aqui, se houver */}
                                    </PanelRow>
                                </PanelBody>
                            </Panel>
                        ))
                    ) : (
                        <Notice status="warning" isDismissible={false}>No steps found for this process type.</Notice>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProcessViewer;
