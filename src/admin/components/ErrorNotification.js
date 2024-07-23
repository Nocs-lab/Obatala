import React from 'react';
import { useError } from '../contexts/ErrorContext';
import { Notice } from '@wordpress/components';

const ErrorNotification = () => {
    const { errors, removeError } = useError();

    return (
        <div className="error-notifications" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000 }}>
            {errors.map((error, index) => (
                <Notice
                    key={index}
                    status="error"
                    onRemove={() => removeError(index)}
                    isDismissible
                >
                    {error.message}
                </Notice>
            ))}
        </div>
    );
};

export default ErrorNotification;
