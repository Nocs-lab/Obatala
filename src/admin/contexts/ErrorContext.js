import React, { createContext, useContext, useState } from 'react';

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState([]);

    const addError = (error) => {
        setErrors([...errors, error]);
    };

    const removeError = (index) => {
        setErrors(errors.filter((_, i) => i !== index));
    };

    return (
        <ErrorContext.Provider value={{ errors, addError, removeError }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = () => {
    return useContext(ErrorContext);
};
