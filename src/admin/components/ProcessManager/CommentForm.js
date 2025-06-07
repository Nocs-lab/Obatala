import React, { useState, useEffect } from "react";
import { ptBR } from "date-fns/locale/pt-BR";
import { formatDistanceToNow } from "date-fns";
import { addComment, deleteComment, fetchProcess, fetchProcessComments, updateComment } from "../../api/apiRequests";
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { TextControl, Button, Icon, Notice, PanelBody, PanelRow, DropdownMenu } from "@wordpress/components";
import {
    moreHorizontalMobile,
    edit,
    trash,
    commentContent,
} from '@wordpress/icons';

const CommentForm = ({ processId }) => {
    const [comment, setComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [comments, setComments] = useState([]);
    const [notice, setNotice] = useState(null);
    const [processIsFinished, setProcessIsFinished] = useState(null);

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);

    useEffect(() => {
        if ((currentUser && currentUser === undefined) || !processId) return;

        fetchComments();
        loadProcess();

    }, [currentUser, processId]);

    const fetchComments = () => {
        if (!currentUser?.id || !processId) return;

        fetchProcessComments(processId, currentUser.id)
            .then(data => {
                setComments(data);
            })
            .catch((error) => {
                console.error('Error fetching comments:', error);
                if (error?.status === 'Usuário não possui permissão.') {
                    setNotice({ status: 'warning', message: 'You do not have permission to view the comments for this process.' });
                } else {

                    setNotice({ status: 'error', message: 'Error fetching comments.' });
                }

            });
    };
    const loadProcess = () => {
        if (!processId) return;

        fetchProcess(processId)
            .then(data => {
                setProcessIsFinished(data.meta.status?.[0] === 'Finished');
            })
            .catch((error) => {
                console.error('Error fetching process:', error);
                setNotice({ status: 'error', message: 'Error fetching process.' });
            });
    };
    const handleCommentSubmit = () => {
        if (!comment) {
            setNotice({ status: 'error', message: 'Please enter a comment.' });
            return;
        }

        const newComment = {
            text: comment,
            user_id: currentUser.id,
        };

        addComment(processId, newComment)
            .then(() => {
                setComment('');
                setNotice({ status: 'success', message: 'Comment added successfully.' });
                fetchComments(); // Recarregar os comentários após adicionar um novo
            })
            .catch((error) => {
                console.error('Error adding comment:', error);
                if (error?.error === 'Permission denied')
                    setNotice({ status: 'error', message: 'You do not have permission to comment on this process.' });

                setNotice({ status: 'error', message: 'Error adding comment.' });
            });
    };

    const handleDeleteComment = (commentId) => {
        deleteComment(commentId, currentUser.id)
            .then(() => {
                fetchComments();
            })
            .catch((error) => {
                console.error(error?.message);
                if (error?.message === 'You do not have permission to delete this comment.') {
                    setNotice({ status: 'error', message: 'You do not have permission to delete this comment.' });
                } else {
                    setNotice({ status: 'error', message: 'Error deleting comments.' });
                }
            });
    };

    const handleEditComment = (commentId) => {
        if (!editContent) {
            setNotice({ status: 'error', message: 'Please enter a comment.' });
            return;
        }

        const newComment = {
            text: editContent,
            user_id: currentUser.id,
        };

        updateComment(commentId, newComment)
            .then(() => {
                setEditingComment(null);
                setEditContent('');
                setNotice({ status: 'success', message: 'Comment updated successfully.' });
                fetchComments(); // Recarregar os comentários após editar
            })
            .catch((error) => {
                console.error('Error updating comment:', error);
                if (error?.message === 'You do not have permission to edit this comment.') {
                    setNotice({ status: 'error', message: 'You do not have permission to edit this comment.' });
                } else {
                    setNotice({ status: 'error', message: 'Error updating comment.' });
                }
            });
    };
    const orderedComments = comments?.length
        ? [...comments].sort((a, b) => b.comment_ID - a.comment_ID)
        : [];

    return (
        <>
            {comments.length > 0 && (
                <PanelRow>
                    <div class="timeline-container">
                        <ul className="timeline">
                            {orderedComments.map((comment) => (
                                <li key={comment.comment_ID} className="timeline-item">
                                    <div className={`timeline-badge ${comment.comment_author ? '' : 'primary'}`}><Icon icon={commentContent} /></div>
                                    {editingComment === comment.comment_ID ? (
                                        <>
                                            <TextControl value={editContent} onChange={(value) => setEditContent(value)} />
                                            <div className="timeline-content-buttons">
                                                <Button variant="secondary" onClick={() => setEditingComment(null)}>Cancel</Button>
                                                <Button variant="primary" onClick={() => handleEditComment(comment.comment_ID)}>Save</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="timeline-title"><strong>{comment.comment_author || 'Anonymous'}</strong> commented <time>{formatDistanceToNow(new Date(comment.comment_date), { addSuffix: true, locale: ptBR })}</time></p>
                                            <div className="timeline-content">
                                                <p class="timeline-text">{comment.comment_content}</p>
                                                {currentUser.id === comment.user_id && (
                                                    <DropdownMenu
                                                        icon={moreHorizontalMobile}
                                                        className="timeline-actions"
                                                        label="Select an action"
                                                        size="small"
                                                        controls={[
                                                            {
                                                                title: 'Edit',
                                                                icon: edit,
                                                                isDisabled: processIsFinished,
                                                                onClick: () => {
                                                                    setEditingComment(comment.comment_ID);
                                                                    setEditContent(comment.comment_content);
                                                                }
                                                            },
                                                            {
                                                                title: 'Delete',
                                                                icon: trash,
                                                                isDisabled: processIsFinished,
                                                                onClick: () => handleDeleteComment(comment.comment_ID),
                                                            },
                                                        ]}
                                                    />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </PanelRow>
            )}
            <PanelBody title="Submit comment" className="no-print">
                <PanelRow>
                    {notice && (
                        <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                            {notice.message}
                        </Notice>
                    )}
                    <TextControl
                        label="Add a comment"
                        value={comment}
                        onChange={(value) => setComment(value)}
                        disabled={processIsFinished}
                    />
                    <Button variant="primary" onClick={handleCommentSubmit} disabled={processIsFinished}
                    >Submit</Button>
                </PanelRow>
            </PanelBody>
        </>
    );
};

export default CommentForm;
