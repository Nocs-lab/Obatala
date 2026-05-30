import React, { useState, useEffect } from "react";
import { __ } from '@wordpress/i18n';
import { ptBR } from "date-fns/locale/pt-BR";
import { formatDistanceToNow } from "date-fns";
import { addComment, deleteComment, fetchProcess, fetchProcessComments, updateComment } from "../../api/apiRequests";
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { TextControl, Button, Icon, Notice, PanelBody, PanelRow, DropdownMenu } from "@wordpress/components";
import {
    moreHorizontal,
    edit,
    trash,
    commentContent,
} from '@wordpress/icons';

const CommentForm = ({ processId, setHasComments }) => {
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
                if (data.length > 0) {
                    setHasComments(true);
                }
            })
            .catch((error) => {
                console.error('Error fetching comments:', error);
                if (error?.status === 'Usuário não possui permissão.') {
                    setNotice({ status: 'warning', message: __('You do not have permission to view the comments for this process.', 'obatala') });
                } else {

                    setNotice({ status: 'error', message: __('Error fetching comments.', 'obatala') });
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
                setNotice({ status: 'error', message: __('Error fetching process.', 'obatala') });
            });
    };
    const handleCommentSubmit = () => {
        if (!comment) {
            setNotice({ status: 'error', message: __('Please enter a comment.', 'obatala') });
            return;
        }

        const newComment = {
            text: comment,
            user_id: currentUser.id,
        };

        addComment(processId, newComment)
            .then(() => {
                setComment('');
                setNotice({ status: 'success', message: __('Comment added successfully.', 'obatala') });
                fetchComments(); // Recarregar os comentários após adicionar um novo
            })
            .catch((error) => {
                console.error('Error adding comment:', error);
                if (error?.error === 'Permission denied')
                    setNotice({ status: 'error', message: __('You do not have permission to comment on this process.', 'obatala') });

                setNotice({ status: 'error', message: __('Error adding comment.', 'obatala') });
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
                    setNotice({ status: 'error', message: __('You do not have permission to delete this comment.', 'obatala') });
                } else {
                    setNotice({ status: 'error', message: __('Error deleting comments.', 'obatala') });
                }
            });
    };

    const handleEditComment = (commentId) => {
        if (!editContent) {
            setNotice({ status: 'error', message: __('Please enter a comment.', 'obatala') });
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
                setNotice({ status: 'success', message: __('Comment updated successfully.', 'obatala') });
                fetchComments(); // Recarregar os comentários após editar
            })
            .catch((error) => {
                console.error('Error updating comment:', error);
                if (error?.message === 'You do not have permission to edit this comment.') {
                    setNotice({ status: 'error', message: __('You do not have permission to edit this comment.', 'obatala') });
                } else {
                    setNotice({ status: 'error', message: __('Error updating comment.', 'obatala') });
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
                    <div className="timeline-container">
                        <ul className="timeline">
                            {orderedComments.map((comment) => (
                                <li key={comment.comment_ID} className="timeline-item">
                                    <div className={`timeline-badge ${comment.comment_author ? '' : 'primary'}`}><Icon icon={commentContent} /></div>
                                    {editingComment === comment.comment_ID ? (
                                        <>
                                            <TextControl value={editContent} onChange={(value) => setEditContent(value)} />
                                            <div className="timeline-content-buttons">
                                                <Button variant="secondary" onClick={() => setEditingComment(null)}>{__('Cancel', 'obatala')}</Button>
                                                <Button variant="primary" onClick={() => handleEditComment(comment.comment_ID)}>{__('Save', 'obatala')}</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="timeline-title"><strong>{comment.comment_author || __('Anonymous', 'obatala')}</strong> {__('commented', 'obatala')} <time>{formatDistanceToNow(new Date(comment.comment_date), { addSuffix: true, locale: ptBR })}</time></p>
                                            <div className="timeline-content">
                                                <p className="timeline-text">{comment.comment_content}</p>
                                                {currentUser.id === comment.user_id && (
                                                    <DropdownMenu
                                                        icon={moreHorizontal}
                                                        className="timeline-actions"
                                                        label={__('Select an action', 'obatala')}
                                                        size="small"
                                                        controls={[
                                                            {
                                                                title: __('Edit', 'obatala'),
                                                                icon: edit,
                                                                isDisabled: processIsFinished,
                                                                onClick: () => {
                                                                    setEditingComment(comment.comment_ID);
                                                                    setEditContent(comment.comment_content);
                                                                }
                                                            },
                                                            {
                                                                title: __('Delete', 'obatala'),
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
            {!processIsFinished && (
                <PanelBody title={__('Submit comment', 'obatala')} className="no-print">
                    <PanelRow>
                        {notice && (
                            <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                                {notice.message}
                            </Notice>
                        )}
                        <TextControl
                            label={__('Add a comment', 'obatala')}
                            value={comment}
                            onChange={(value) => setComment(value)}
                            disabled={processIsFinished}
                        />
                        <Button variant="primary" onClick={handleCommentSubmit} disabled={processIsFinished}
                        >{__('Submit', 'obatala')}</Button>
                    </PanelRow>
                </PanelBody>
            )}
        </>
    );
};

export default CommentForm;
