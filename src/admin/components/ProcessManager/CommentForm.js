// CommentForm.js
import React, { useState, useEffect } from "react";
import { TextControl, Button, Notice } from "@wordpress/components";
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
        <div className="comment-form">
            {notice && (
                <Notice status={notice.status} isDismissible onRemove={() => setNotice(null)}>
                    {notice.message}
                </Notice>
            )}
            <div className="comment-input">
                <TextControl
                    label="Add a comment"
                    value={comment}
                    onChange={(value) => setComment(value)}
                />
                <Button isPrimary onClick={handleCommentSubmit}>Submit Comment</Button>
            </div>

            {comments.length > 0 && (
                <div className="comments-list">
                    <h3>Comments:</h3>
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
            )}

            <style>{`
                .comment-form {
                    margin-top: 20px;
                    max-width: 600px;
                    margin: auto;
                }
                .comment-input {
                    display: flex;
                    flex-direction: column;
                }
                .comment-input button {
                    margin-top: 10px;
                }
                .comments-list {
                    margin-top: 20px;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background-color: #f9f9f9;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .chat-messages {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .chat-message {
                    padding: 10px;
                    border-radius: 15px;
                    max-width: 70%;
                    position: relative;
                    word-wrap: break-word;
                }
                .chat-message.sent {
                    background-color: #e1ffc7;
                    align-self: flex-end;
                }
                .chat-message.received {
                    background-color: #fff;
                    align-self: flex-start;
                }
                .message-content {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                .message-date {
                    font-size: 0.8em;
                    color: #666;
                    text-align: right;
                }
            `}</style>
        </div>
    );
};

export default CommentForm;
