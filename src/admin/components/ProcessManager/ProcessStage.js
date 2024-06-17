import { useState, useEffect } from 'react';
import { Spinner, Button, TextareaControl, FormFileUpload } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __experimentalGetSettings, dateI18n } from '@wordpress/date';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

const ProcessStage = ({ process, onCancelEdit }) => {
    const [stages, setStages] = useState([]);
    const [currentStage, setCurrentStage] = useState(null);
    const [comments, setComments] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState(null);

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);

    useEffect(() => {
        if (process) {
            fetchStages();
        }
    }, [process]);

    useEffect(() => {
        if (currentStage) {
            fetchComments(currentStage.id);
            fetchAttachments();
        }
    }, [currentStage]);

    useEffect(() => {
        if (currentStage && process.current_stage !== currentStage.id) {
            updateCurrentStage(currentStage.id);
        }
    }, [currentStage]);

    const fetchStages = () => {
        setIsLoading(true);
        const processTypeId = process ? process.process_type : null;
        if (!processTypeId) {
            console.error('Process type ID is missing');
            setIsLoading(false);
            return;
        }

        apiFetch({ path: `/wp/v2/process_step?parent_process=${processTypeId}&per_page=100&_embed` })
            .then(data => {
                const stages = data.map((stage, index) => ({
                    id: stage.id,
                    title: stage.title ? stage.title.rendered : 'Untitled',
                    content: stage.content ? stage.content.rendered : '',
                }));
                stages.sort((a, b) => a.id - b.id); // Ordenar as etapas pelo ID
                setStages(stages);
                const currentStageId = process.current_stage || stages[0]?.id;
                const currentStage = stages.find(stage => stage.id === currentStageId) || stages[0];
                setCurrentStage(currentStage);

                if (process.current_stage === null || process.current_stage === "0") {
                    updateCurrentStage(stages[0]?.id);
                }
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching stages:', error);
                setIsLoading(false);
            });
    };

    const fetchComments = (stageId) => {
        apiFetch({ path: `/wp/v2/comments?post=${process.id}&meta_key=stage_id&meta_value=${stageId}&per_page=100&_embed` })
            .then(data => {
                const sortedComments = data.sort((a, b) => new Date(a.date) - new Date(b.date));
                setComments(sortedComments);
            })
            .catch(error => {
                console.error('Error fetching comments:', error);
            });
    };

    const fetchAttachments = () => {
        apiFetch({ path: `/wp/v2/media?parent=${process.id}&per_page=100&_embed` })
            .then(data => {
                setAttachments(data);
            })
            .catch(error => {
                console.error('Error fetching attachments:', error);
            });
    };

    const handleAddComment = () => {
        if (!newComment) {
            alert('Please enter a comment.');
            return;
        }

        const commentData = {
            post: process.id,
            content: newComment,
            status: 'approved',
            meta: {
                stage_id: currentStage.id,
            },
        };

        apiFetch({ path: `/wp/v2/comments`, method: 'POST', data: commentData })
            .then(savedComment => {
                setComments([...comments, savedComment].sort((a, b) => new Date(a.date) - new Date(b.date)));
                setNewComment('');
            })
            .catch(error => {
                console.error('Error adding comment:', error);
            });
    };

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('post', process.id);

        apiFetch({
            path: `/wp/v2/media`,
            method: 'POST',
            body: formData,
        }).then(savedFile => {
            setAttachments([...attachments, savedFile]);
        }).catch(error => {
            console.error('Error uploading file:', error);
        });
    };

    const handleAdvanceStage = () => {
        const currentIndex = stages.findIndex(stage => stage.id === currentStage.id);
        if (currentIndex < stages.length - 1) {
            const nextStage = stages[currentIndex + 1];
            setCurrentStage(nextStage);
        }
    };

    const handleReopenStage = (stageId) => {
        const stageIndex = stages.findIndex(stage => stage.id === stageId);
        setCurrentStage(stages[stageIndex]);
    };

    const handlePreviousStage = () => {
        const currentIndex = stages.findIndex(stage => stage.id === currentStage.id);
        if (currentIndex > 0) {
            const previousStage = stages[currentIndex - 1];
            setCurrentStage(previousStage);
        }
    };

    const updateCurrentStage = (stageId) => {
        apiFetch({
            path: `/wp/v2/process_obatala/${process.id}`,
            method: 'PUT',
            data: { current_stage: stageId },
        }).then(() => {
            process.current_stage = stageId;
        }).catch(error => {
            console.error('Error updating current stage:', error);
        });
    };

    if (isLoading || !currentStage) {
        return <Spinner />;
    }

    return (
        <div className='panel'>
            <h3>Process: {process.title.rendered}</h3>
            <Button isSecondary onClick={onCancelEdit}>Back to Processes</Button>
            <div>
                <h4>Current Stage: {currentStage.title}</h4>
                <p>{currentStage.content}</p>
                <Button
                    isSecondary
                    onClick={handlePreviousStage}
                    disabled={stages.findIndex(stage => stage.id === currentStage.id) === 0}
                >
                    View Previous Stage
                </Button>
                <Button
                    isSecondary
                    onClick={handleAdvanceStage}
                    disabled={stages.findIndex(stage => stage.id === currentStage.id) === stages.length - 1}
                >
                    Advance Stage
                </Button>
                <Button
                    isSecondary
                    onClick={() => handleReopenStage(currentStage.id)}
                    disabled={stages.findIndex(stage => stage.id === currentStage.id) <= stages.findIndex(stage => stage.id === process.current_stage)}
                >
                    Reopen Stage
                </Button>
                <div>
                    <h5>Comments</h5>
                    <ul className="comment-list">
                        {comments.filter(comment => comment.meta.stage_id == currentStage.id).map(comment => (
                            <li key={comment.id} className={`comment ${comment.author === currentUser?.id ? 'current-user' : ''}`}>
                                <img src={comment.author_avatar_urls['48']} alt={`${comment.author_name} avatar`} className="avatar" />
                                <div className="comment-content">
                                    <strong>{comment.author_name}</strong> - {dateI18n(__experimentalGetSettings().formats.datetime, comment.date)}
                                    <p dangerouslySetInnerHTML={{ __html: comment.content?.rendered }}></p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h5>Attachments</h5>
                    <ul className="attachment-list">
                        {attachments.map(attachment => (
                            <li key={attachment.id} className="attachment">
                                <a href={attachment.source_url} target="_blank" rel="noopener noreferrer">
                                    {attachment.title.rendered}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <FormFileUpload onChange={handleFileUpload} style={{border: "1px solid blue"}}>
                        Attach file
                    </FormFileUpload>

                    <TextareaControl
                        label="Add a comment"
                        value={newComment}
                        onChange={(value) => setNewComment(value)}
                        disabled={false}
                    />
                    <Button
                        isPrimary
                        onClick={handleAddComment}
                        disabled={false}
                    >
                        Add Comment
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProcessStage;
