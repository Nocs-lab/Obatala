import React, { useState, useEffect } from 'react';
import { Panel, PanelHeader, Spinner, Notice, TextControl, Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const ProcessStepEditor = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('step_id');
    const [step, setStep] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        apiFetch({ path: `/obatala/v1/process_step/${id}/` })
            .then((stepData) => {
                setStep(stepData);
                setTitle(stepData.title.rendered || '');
                setDescription(stepData.description || '');
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching step data:', error);
                setNotice({ status: 'error', message: 'Error fetching process step.' });
                setIsLoading(false);
            });
    }, [id]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatedStep = {
                title,
                description
            };

            await apiFetch({
                path: `/obatala/v1/process_step/${id}`,
                method: 'PUT',
                data: updatedStep
            });

            setNotice({ status: 'success', message: 'Process step updated successfully.' });
        } catch (error) {
            setNotice({ status: 'error', message: 'Error updating process step.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (!step) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Panel>
                <PanelHeader><h3>Edit Process Step</h3></PanelHeader>
                {notice && (
                    <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                        {notice.message}
                    </Notice>
                )}
                <TextControl
                    label="Title"
                    value={title}
                    onChange={(value) => setTitle(value)}
                />
                <TextControl
                    label="Description"
                    value={description}
                    onChange={(value) => setDescription(value)}
                />
                <Button isPrimary onClick={handleSave}>Save</Button>
            </Panel>
        </div>
    );
};

export default ProcessStepEditor;
