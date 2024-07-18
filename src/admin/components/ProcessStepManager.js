import { useState, useEffect } from 'react';
import { Spinner, Button, TextControl, Notice, Panel, PanelBody, PanelRow, Icon, Modal } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { edit } from "@wordpress/icons";

const ProcessStepManager = () => {
    const [processSteps, setProcessSteps] = useState([]);
    const [newStepTitle, setNewStepTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editingStep, setEditingStep] = useState(null);
    const [notice, setNotice] = useState(null);

    // Carrega os passos de processo e tipos de processo ao inicializar
    useEffect(() => {
        fetchProcessSteps();
    }, []);

    // Função para buscar os passos de processo da API WordPress
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

    // Função para criar um novo passo de processo
    const handleSaveStep = () => {
        if (!newStepTitle) {
            setNotice({ status: 'error', message: 'Step Title field cannot be empty.' });
            return;
        }

        const requestData = {
            title: newStepTitle,
            status: 'publish',
            type: 'process_step',
        };

        if (editingStep) {
            apiFetch({ path: `/wp/v2/process_step/${editingStep}`, method: 'PUT', data: requestData })
                .then(updatedStep => {
                    const updatedProcessSteps = processSteps.map(step =>
                        step.id === editingStep ? updatedStep : step
                    );
                    setProcessSteps(updatedProcessSteps);
                    setEditingStep(null);
                    setNewStepTitle('');
                    setNotice(null);
                })
                .catch(error => {
                    console.error('Error updating process step:', error);
                });
        } else {
            apiFetch({ path: `/wp/v2/process_step`, method: 'POST', data: requestData })
                .then(savedStep => {
                    setProcessSteps([...processSteps, savedStep]);
                    setNewStepTitle('');
                })
                .catch(error => {
                    console.error('Error creating process step:', error);
                });
        }
    };

    const handleEditStep = (stepId, currentTitle) => {
        setEditingStep(stepId);
        setNewStepTitle(currentTitle);
        
    };

    const handleCancel = () => {
        setEditingStep(null);
        setNewStepTitle('');
        setNotice(null);
    };

    // Renderiza um spinner enquanto os dados estão sendo carregados
    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            {/* Título e cabeçalho da página */}
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Process Step Manager</h2>
            <div className="panel-container">
                <main>
                     {/* Painel com os passos de processo existentes */}
                    <Panel>
                        <PanelBody title="Existing Process Steps" initialOpen={true}>
                            <PanelRow>
                                 {/* Lista os passos de processo existentes */}

                                {processSteps.length > 0 ? (
                                    <table className="wp-list-table widefat fixed striped">
                                        <thead>
                                            <tr>
                                                <th>Step Title</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {processSteps.map(step => (
                                                <tr key={step.id}>
                                                    <td>{step.title.rendered}</td>
                                                    <td>
                                                        <Button
                                                            icon={<Icon icon={edit} />}
                                                            onClick={() => handleEditStep(step.id, step.title.rendered)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    // Aviso se não houver passos de processo existentes

                                    <Notice isDismissible={false} status="warning">No existing process steps.</Notice>
                                )}
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </main>
                <aside>
                     {/* Painel para criar um novo passo de processo */}
                    <Panel>
                        <PanelBody title="Create Process Step" initialOpen={true}>
                            <PanelRow>
                                {/* Formulário para inserir título e tipo de processo do novo passo */}
                                {notice && !editingStep && (
                                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                        {notice.message}
                                    </Notice>
                                )}
                                <TextControl
                                    label="Step Title"
                                    value={newStepTitle}
                                    onChange={(value) => setNewStepTitle(value)}
                                />
                                <Button isPrimary onClick={handleSaveStep}>
                                    Create Step
                                </Button>
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </aside>
            </div>
            {editingStep && (
                <Modal
                    title="Edit Process Step"
                    onRequestClose={handleCancel}
                    isDismissible={true}
                >
                    {notice && editingStep && (
                        <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                            {notice.message}
                        </Notice>
                    )}
                    <TextControl
                        label="Step Title"
                        value={newStepTitle}
                        onChange={(value) => setNewStepTitle(value)}
                    />
                    <Button isPrimary onClick={handleSaveStep}>
                        Save
                    </Button>
                    <Button onClick={handleCancel}>
                        Cancel
                    </Button>
                </Modal>
            )}
        </div>
    );
};

export default ProcessStepManager;
