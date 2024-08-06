// CommentForm.js
import React, { useState, useEffect } from "react";
import { TextControl, Button, Notice, PanelBody, PanelRow } from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";

const CommentForm = ({ stepId }) => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        fetchComments();
    }, [stepId]);

    const fetchComments = () => {
        apiFetch({
            path: `/obatala/v1/process_obatala/${stepId}/comments`, // Atualize o caminho se necessário
            method: 'GET',
        })
        .then(data => {
            setComments(data);
        })
        .catch((error) => {
            console.error('Error fetching comments:', error);
            setNotice({ status: 'error', message: 'Error fetching comments.' });
        });
    };

    const handleCommentSubmit = () => {
        if (!comment) {
            setNotice({ status: 'error', message: 'Please enter a comment.' });
            return;
        }

        const newComment = {
            content: comment,
            step_id: stepId, // Use stepId para vincular o comentário
        };

        apiFetch({
            path: `/obatala/v1/process_obatala/${stepId}/comment`, // Atualize o caminho se necessário
            method: 'POST',
            data: newComment,
        })
        .then(() => {
            setComment('');
            setNotice({ status: 'success', message: 'Comment added successfully.' });
            fetchComments(); // Recarregar os comentários após adicionar um novo
        })
        .catch((error) => {
            console.error('Error adding comment:', error);
            setNotice({ status: 'error', message: 'Error adding comment.' });
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
                    <Button isPrimary onClick={handleCommentSubmit}>Submit</Button>
                </PanelRow>
            </PanelBody>
            {comments.length > 0 && (
                <PanelBody title="Comments">
                    <PanelRow>
                        <div className="chat-container">
                            <div className="chat-messages">
                                {comments.map((comment) => (
                                    <div key={comment.id} className={`chat-message ${comment.author ? 'received' : 'sent'}`}>
                                        <div className="message-content">
                                            <strong>{comment.author || 'Anonymous'}:</strong> {comment.content}
                                            <div className="message-date">{new Date(comment.date).toLocaleString()}</div>
                                        </div>
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
