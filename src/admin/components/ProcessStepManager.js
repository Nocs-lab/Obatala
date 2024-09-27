import React, { useState, useEffect, useReducer } from 'react';
import { Spinner, Button, ButtonGroup, TextControl, Notice, Panel, PanelHeader, PanelBody, PanelRow, Tooltip, Icon, __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { edit, trash } from "@wordpress/icons";
import Reducer, { initialState } from '../redux/reducer'; 

const ProcessStepManager = () => {
    const [processSteps, setProcessSteps] = useState([]);
    const [notice, setNotice] = useState(null);
    const [state, dispatch] = useReducer(Reducer, initialState);

    const [newStepTitle, setNewStepTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProcessSteps();
    }, []);

    const fetchProcessSteps = () => {
        setIsLoading(true);
        apiFetch({ path: `/obatala/v1/process_step?per_page=100&_embed` })
            .then(data => {
                const sortedSteps = data.sort((a, b) => a.title.rendered.localeCompare(b.title.rendered));
                setProcessSteps(sortedSteps);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching process steps:', error);
                setIsLoading(false);
            });
    };

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

        apiFetch({ path: `/obatala/v1/process_step`, method: 'POST', data: requestData })
            .then(savedStep => {
                setProcessSteps([...processSteps, savedStep]);
                setNewStepTitle('');
                setNotice({ status: 'success', message: 'Step created successfully.' });
            })
            .catch(error => {
                console.error('Error creating process step:', error);
                setNotice({ status: 'error', message: 'Error creating process step.' });
            });
    };

    const handleEditStep = (stepId) => {
        window.location.href = `?page=process-step-editor&step_id=${stepId}`;
    };

    const handleDeleteProcessStep = async (id) => {
        try {
            const step = await apiFetch({ path: `/obatala/v1/process_step/${id}` });
            const stepProcessTypes = Array.isArray(step.process_type) ? step.process_type : [step.process_type];

            const hasLinkedProcesses = await apiFetch({ path: '/obatala/v1/process_obatala?per_page=100' })
                .then(allProcesses => allProcesses.some(process => stepProcessTypes.includes(Number(process.process_type))));

            if (hasLinkedProcesses) {
                setNotice({ status: 'error', message: 'Cannot delete step as it is linked to a process type in use.' });
                return;
            }

            await apiFetch({ path: `/obatala/v1/process_step/${id}`, method: 'DELETE' });
            setProcessSteps(processSteps.filter(step => step.id !== id));
        } catch (error) {
            console.error('Error deleting process step:', error);
        }
    };

    const handleConfirmDeleteStep = (id) => {
        dispatch({ type: 'OPEN_MODAL_STEP', payload: id });
    };

    const handleCancel = () => {
        setNotice(null);
        dispatch({ type: 'CLOSE_MODAL' });
    };

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div>
            <span className="brand"><strong>Obatala</strong> Curatorial Process Management</span>
            <h2>Step Manager</h2>
            <div className="panel-container">
                <main>
                    <ConfirmDialog
                        isOpen={state.isOpen}
                        onConfirm={() => {
                            handleDeleteProcessStep(state.deleteStep);
                            dispatch({ type: 'CLOSE_MODAL' });
                        }}
                        onCancel={handleCancel}
                    >
                        Are you sure you want to delete this Step?
                    </ConfirmDialog>
                    <Panel>
                        <PanelHeader>
                            <h3>Existing Steps</h3>
                            <span className="badge">{processSteps.length}</span>
                        </PanelHeader>
                        <PanelRow>
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
                                                    <ButtonGroup>
                                                        <Tooltip text="Edit">
                                                            <Button
                                                                icon={<Icon icon={edit} />}
                                                                onClick={() => handleEditStep(step.id)}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip text="Delete">
                                                            <Button
                                                                icon={<Icon icon={trash} />}
                                                                onClick={() => handleConfirmDeleteStep(step.id)}
                                                        />
                                                        </Tooltip>
                                                    </ButtonGroup>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <Notice isDismissible={false} status="warning">No existing process steps.</Notice>
                            )}
                        </PanelRow>
                    </Panel>
                </main>
                <aside>
                    <Panel>
                        <PanelHeader><h3>Add Step</h3></PanelHeader>
                        <PanelBody>
                            <PanelRow>
                                {notice && (
                                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                        {notice.message}
                                    </Notice>
                                )}
                                <TextControl
                                    label="Step Title"
                                    value={newStepTitle}
                                    onChange={(value) => setNewStepTitle(value)}
                                />
                                <Button variant="primary" onClick={handleSaveStep}>
                                    Save
                                </Button>
                            </PanelRow>
                        </PanelBody>
                    </Panel>
                </aside>
            </div>
        </div>
    );
};

export default ProcessStepManager;
