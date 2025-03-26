import React, { useState, useEffect } from "react";
import { addComment, deleteComment, fetchProcessComments, updateComment } from "../../api/apiRequests";
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { TextControl, Button, Notice, PanelBody, PanelRow, DropdownMenu } from "@wordpress/components";
import {
    menu,
    edit,
    trash,
} from '@wordpress/icons';

const CommentForm = ({ processId }) => {
    const [comment, setComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [comments, setComments] = useState([]);
    const [notice, setNotice] = useState(null);

    const currentUser = useSelect(select => select(coreStore).getCurrentUser(), []);
    
    useEffect(() => {
        fetchComments();
    }, [processId]); 

    const fetchComments = () => {
        fetchProcessComments(processId,currentUser.id)
        .then(data => {
            console.log(data);
            setComments(data);
        })
        .catch((error) => {
            console.error('Error fetching comments:', error);
            //setNotice({ status: 'error', message: 'Error fetching comments.' });
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

        addComment(processId,newComment)
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
        deleteComment(commentId,currentUser.id)
        .then(() => {
            fetchComments();
        })
        .catch((error) => {
            console.error(error?.message);
            if (error?.message === 'You do not have permission to delete this comment.'){
                setNotice({ status: 'error', message: 'You do not have permission to delete this comment.' });
            }else{
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

        updateComment(commentId,newComment)
        .then(() => {
            setEditingComment(null);
            setEditContent('');
            setNotice({ status: 'success', message: 'Comment updated successfully.' });
            fetchComments(); // Recarregar os comentários após editar
        })
        .catch((error) => {
            console.error('Error updating comment:', error);
            if (error?.message === 'You do not have permission to edit this comment.'){
                setNotice({ status: 'error', message: 'You do not have permission to edit this comment.' });
            }else{
                setNotice({ status: 'error', message: 'Error updating comment.' });
            }
        });
    };

    return (
        <>
            <PanelBody title="Submit comment">
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
                    />
                    <Button variant="primary" onClick={handleCommentSubmit}>Submit</Button>
                </PanelRow>
            </PanelBody>
            {comments.length > 0 && (
                <PanelBody title="Comments">
                    <PanelRow>
                        <div className="chat-container">
                            <div className="chat-messages">
                                {comments.map((comment) => (
                                    <div key={comment.comment_ID} className={`chat-message ${comment.comment_author ? 'received' : 'sent'}`}>
                                        {editingComment === comment.comment_ID ? (
                                            <>
                                                <TextControl value={editContent} onChange={(value) => setEditContent(value)} />
                                                <div className="chat-content-buttons">
                                                    <Button variant="secondary" onClick={() => setEditingComment(null)}>Cancel</Button>
                                                    <Button variant="primary" onClick={() => handleEditComment(comment.comment_ID)}>Save</Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="message-content">
                                                <div className="message">
                                                    <strong>{comment.comment_author || 'Anonymous'}:</strong> {comment.comment_content}
                                                    <div className="message-date">{new Date(comment.comment_date).toLocaleString()}</div>
                                                </div> 
                                                <DropdownMenu
                                                    icon={ menu }
                                                    label="Select a direction"
                                                    controls={[
                                                        {
                                                            title: 'Delete',
                                                            icon: trash,
                                                            onClick: () => handleDeleteComment(comment.comment_ID),
                                                            isDisabled:currentUser.id !== comment.user_id
                                                        },
                                                        {
                                                            title: 'Edit',
                                                            icon: edit,
                                                            onClick: () => {
                                                                setEditingComment(comment.comment_ID);
                                                                setEditContent(comment.comment_content);
                                                            },
                                                            isDisabled:currentUser.id !== comment.user_id
                                                        },
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PanelRow>
                </PanelBody>
            )}
        </>
    );
};

export default CommentForm;
