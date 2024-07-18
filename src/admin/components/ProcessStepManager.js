import React, { useState, useEffect } from 'react';
import { Spinner, Button, SelectControl, TextControl, Notice, Panel, PanelHeader, PanelBody, PanelRow, Icon, Modal, DatePicker, RadioControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { edit, trash } from "@wordpress/icons";
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';

const ProcessStepManager = () => {
    // Estado para armazenar os passos de processo
    const [processSteps, setProcessSteps] = useState([]);

    const [editingStep, setEditingStep] = useState(null);
    const [notice, setNotice] = useState(null);

    // Estado para armazenar os tipos de processo
    const [processTypes, setProcessTypes] = useState([]);
    // Estado para armazenar o título do novo passo de processo
    const [newStepTitle, setNewStepTitle] = useState('');
    // Estado para armazenar o tipo do novo passo de processo
    const [newStepType, setNewStepType] = useState('');
    // Estado para armazenar os campos dinâmicos para os metadados
    const [dynamicFields, setDynamicFields] = useState([{ name: '', type: 'text', value: '' }]);
    // Estado para controlar o carregamento
    const [isLoading, setIsLoading] = useState(true);
    // Estado para o índice do campo dinâmico atualmente em modo de edição
    const [editableFieldIndex, setEditableFieldIndex] = useState(-1);

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

                    const stepId = savedStep.id;
                    const metaData = dynamicFields.map(field => ({
                        key: field.name,
                        value: getDefaultFieldValue(field.type) // Define o valor padrão conforme o tipo
                    }));
        
                    // Salva os metadados do novo passo
                    saveMetadata(stepId, metaData)
                        .then(() => {
                            // Atualiza a lista de passos de processo após salvar com sucesso
                            fetchProcessSteps();
                            // Limpa os campos de entrada após salvar
                            setNewStepTitle('');
                            setNewStepType('');
                            setDynamicFields([{ name: '', type: 'text', value: '' }]);
                        })
                        .catch(error => {
                            console.error('Error saving metadata:', error);
                        });
                })
                .catch(error => {
                    console.error('Error updating process step:', error);
                });
        } else {
            apiFetch({ path: `/wp/v2/process_step`, method: 'POST', data: requestData })
                .then(savedStep => {
                    setProcessSteps([...processSteps, savedStep]);
                    setNewStepTitle('');

                    const stepId = savedStep.id;
                    const metaData = dynamicFields.map(field => ({
                        key: field.name,
                        value: getDefaultFieldValue(field.type) // Define o valor padrão conforme o tipo
                    }));

                    // Salva os metadados do novo passo
                    saveMetadata(stepId, metaData)
                    .then(() => {
                        // Atualiza a lista de passos de processo após salvar com sucesso
                        fetchProcessSteps();
                        // Limpa os campos de entrada após salvar
                        setNewStepTitle('');
                        setNewStepType('');
                        setDynamicFields([{ name: '', type: 'text', value: '' }]);
                    })
                    .catch(error => {
                        console.error('Error saving metadata:', error);
                    });
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

    // Função para salvar metadados do passo de processo
    const saveMetadata = (stepId, metaData) => {
        return new Promise((resolve, reject) => {
            apiFetch({
                path: `/wp-admin/admin-ajax.php`,
                method: 'POST',
                data: {
                    action: 'save_metadata',
                    step_id: stepId,
                    meta_data: metaData
                }
            })
            .then(response => {
                if (response.success) {
                    resolve();
                } else {
                    reject('Error saving metadata:', response.data);
                }
            })
            .catch(error => {
                reject('Error saving metadata:', error);
            });
        });
    };

    // Função para lidar com a mudança de campo dinâmico
    const handleDynamicFieldChange = (index, field, value) => {
        const updatedFields = [...dynamicFields];
        updatedFields[index][field] = value;
        setDynamicFields(updatedFields);
    };

    // Função para adicionar um novo campo dinâmico
    const handleAddField = () => {
        setDynamicFields([...dynamicFields, { name: '', type: 'text', value: '' }]);
    };

    // Função para remover um campo dinâmico
    const handleRemoveField = (index) => {
        const updatedFields = dynamicFields.filter((_, idx) => idx !== index);
        setDynamicFields(updatedFields);
    };

    // Função para obter o valor padrão conforme o tipo do campo
    const getDefaultFieldValue = (type) => {
        switch (type) {
            case 'text':
            case 'textfield':
            case 'number':
                return '';
            case 'datepicker':
                return null; // Exemplo de valor padrão para datepicker
            case 'upload':
                return ''; // Exemplo de valor padrão para upload
            case 'select':
                return ''; // Exemplo de valor padrão para select
            case 'radio':
                return ''; // Exemplo de valor padrão para radio
            default:
                return '';
        }
    };

    // Função para iniciar a edição do nome do campo dinâmico
    const startEditFieldName = (index) => {
        setEditableFieldIndex(index);
    };

    // Função para finalizar a edição do nome do campo dinâmico
    const finishEditFieldName = (index, newName) => {
        const updatedFields = [...dynamicFields];
        updatedFields[index].name = newName;
        setDynamicFields(updatedFields);
        setEditableFieldIndex(-1);
    };

    // Renderiza um spinner enquanto os dados estão sendo carregados
    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            {/* Título e cabeçalho da página */}
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Step Manager</h2>
            <div className="panel-container">
                <main>
                     {/* Painel com os passos de processo existentes */}
                    <Panel>
                        <PanelHeader>Existing Steps</PanelHeader>
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
                    </Panel>
                </main>
                <aside>
                     {/* Painel para criar um novo passo de processo */}
                    <Panel>
                        <PanelHeader>Add Step</PanelHeader>
                        <PanelBody title="Main data">
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
                                    Add Step
                                </Button>
                            </PanelRow>
                        </PanelBody>
                        <PanelBody title="Metadata" className="counter-container">
                            {/* Renderiza os campos dinâmicos para os metadados */}
                            {dynamicFields.map((field, index) => (
                                <PanelRow key={index} className="counter-item">
                                    <Button icon={<Icon icon={trash} />} isDestructive onClick={() => handleRemoveField(index)} />
                                    <TextControl
                                        label="Title"
                                        value={field.name || `Metadata Name ${index + 1}`}
                                        onChange={(e) => handleDynamicFieldChange(index, 'name', e.target.value)}
                                        onBlur={() => finishEditFieldName(index, dynamicFields[index].name)}
                                        autoFocus
                                    />
                                    <SelectControl
                                        label="Type"
                                        value={field.type}
                                        options={[
                                            { label: 'Text', value: 'text' },
                                            { label: 'Date Picker', value: 'datepicker' },
                                            { label: 'Upload', value: 'upload' },
                                            { label: 'Number', value: 'number' },
                                            { label: 'Text Field', value: 'textfield' },
                                            { label: 'Select', value: 'select' },
                                            { label: 'Radio', value: 'radio' },
                                        ]}
                                        onChange={(value) => handleDynamicFieldChange(index, 'type', value)}
                                    />
                                </PanelRow>
                                
                            ))}
                            <PanelRow>
                                <Button isSecondary onClick={handleAddField}>Add Metadata</Button>
                            </PanelRow>
                        </PanelBody>

                        <PanelRow>
                            <Button isPrimary onClick={handleSaveStep}>Add Step</Button>
                        </PanelRow>
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
