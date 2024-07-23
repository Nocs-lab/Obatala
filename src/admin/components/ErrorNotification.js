import React from 'react';
import { useError } from '../contexts/ErrorContext';
import { Notice, Animate } from '@wordpress/components';

const ErrorNotification = () => {
    const { errors, removeError } = useError();

    return (
        <div className="error-notifications" style={{ position: 'absolute', top: 15, width: '80%', zIndex: 1000 }}>
            {errors.map((error, index) => (
                <Animate type="slide-in" key={index}>
                    {({ className }) => (
                        <Notice
                            className={className}
                            status="error"
                            onRemove={() => removeError(index)}
                            isDismissible
                        >
                            {error.message}
                        </Notice>
                    )}
                </Animate>
            ))}
        </div>
    );
};

export default ErrorNotification;
