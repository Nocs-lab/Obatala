import React, { useState, useEffect } from 'react';
import { Spinner, Button, SelectControl, TextControl, Notice, Panel, PanelBody, PanelRow, DatePicker, RadioControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';

const ProcessStepManager = () => {
    // Estado para armazenar os passos de processo
    const [processSteps, setProcessSteps] = useState([]);
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
        fetchProcessTypes();
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

    // Função para buscar os tipos de processo da API WordPress
    const fetchProcessTypes = () => {
        apiFetch({ path: `/wp/v2/process_type?per_page=100&_embed` })
            .then(data => {
                setProcessTypes(data);
            })
            .catch(error => {
                console.error('Error fetching process types:', error);
            });
    };

    // Função para criar um novo passo de processo
    const handleCreateStep = () => {
        if (!newStepTitle || !newStepType) {
            alert('Please provide a title and select a process type.');
            return;
        }
    
        const newStep = {
            title: newStepTitle,
            status: 'publish',
            type: 'process_step',
            process_type: newStepType,
        };
    
        // Cria o novo passo de processo
        apiFetch({ path: `/wp/v2/process_step`, method: 'POST', data: newStep })
            .then(savedStep => {
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {processSteps.map(step => (
                                                <tr key={step.id}>
                                                    <td>{step.title.rendered}</td>
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
                                <TextControl
                                    label="Step Title"
                                    value={newStepTitle}
                                    onChange={(value) => setNewStepTitle(value)}
                                />
                                <SelectControl
                                    label="Process Type"
                                    value={newStepType}
                                    options={[
                                        { label: 'Select a process type...', value: '' },
                                        ...processTypes.map(type => ({ label: type.title.rendered, value: type.id }))
                                    ]}
                                    onChange={(value) => setNewStepType(value)}
                                />
                            </PanelRow>
                            {/* Renderiza os campos dinâmicos para os metadados */}
                            {dynamicFields.map((field, index) => (
                                <PanelRow key={index}>
                                    {editableFieldIndex === index ? (
                                        <input
                                            type="text"
                                            value={field.name}
                                            onChange={(e) => handleDynamicFieldChange(index, 'name', e.target.value)}
                                            onBlur={() => finishEditFieldName(index, dynamicFields[index].name)}
                                            autoFocus
                                        />
                                    ) : (
                                        <span
                                            className="editable-field-name"
                                            onClick={() => startEditFieldName(index)}
                                        >
                                            {field.name || `Metadata Name ${index + 1}`}
                                        </span>
                                    )}
                                    <SelectControl
                                        label={`Metadata Type ${index + 1}`}
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
                                    <Button isDestructive onClick={() => handleRemoveField(index)}>Remove</Button>
                                </PanelRow>
                            ))}
                            <PanelRow>
                                <Button isSecondary onClick={handleAddField}>Add Metadata</Button>
                            </PanelRow>
                            <PanelRow>
                                <Button isPrimary onClick={handleCreateStep}>Create Step</Button>
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessStepManager;
