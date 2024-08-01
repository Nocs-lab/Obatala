// CommentForm.js
import React, { useState } from "react";
import { TextControl, Button, Notice } from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";

const CommentForm = ({ stepId }) => {
    const [comment, setComment] = useState('');
    const [notice, setNotice] = useState(null);

    const handleCommentSubmit = () => {
        if (!comment) {
            setNotice({ status: 'error', message: 'Please enter a comment.' });
            return;
        }

        const newComment = {
            content: comment,
            step_id: stepId,
            status: 'publish',
        };

        apiFetch({
            path: `/obatala/v1/process_step/${stepId}/comment`,
            method: 'POST',
            data: newComment,
        })
            .then(() => {
                setComment('');
                setNotice({ status: 'success', message: 'Comment added successfully.' });
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
            <TextControl
                label="Add a comment"
                value={comment}
                onChange={(value) => setComment(value)}
            />
            <Button isPrimary onClick={handleCommentSubmit}>Submit Comment</Button>
            <style>{`
                .comment-form {
                    margin-top: 20px;
                }
                .comment-form button {
                    margin-top: 10px;
                }
            `}</style>
        </div>
    );
};

export default CommentForm;
