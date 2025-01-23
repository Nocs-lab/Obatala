import React, { useState, useEffect } from 'react';

const MetroNavigation = ({ options, currentStep, onStepChange, submittedSteps }) => {
    const [current, setCurrent] = useState(currentStep || 0);

    useEffect(() => {
        setCurrent(currentStep);
    }, [currentStep]);

    return (
        <div className="metro-navigation">
            {options.map((option, index) => (
                <button
                    type="button"
                    key={index}
                    className={`navigation-point ${index === currentStep ? 'active' : ''} ${submittedSteps[index] ? 'completed' : ''}`}
                    onClick={() => {
                        setCurrent(index);
                        onStepChange(index);
                    }}
                >
                    {option.label}
                </button>
            ))}

            <style>{`
                .metro-navigation {
                    display: flex;
                    align-items: stretch;
                    flex-basis: 260px;
                    flex-direction: column;
                    gap: .5rem;
                }
                .navigation-point {
                    background-color: var(--gray-300);
                    border: 0 none;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    font-size: .9rem;
                    gap: .5rem;
                    padding: .45rem .75rem;
                    text-align: left;
                }
                .navigation-point.active {
                    background-color: var(--primary-500);
                    color: var(--white);
                }
                .navigation-point .badge {
                    background-color: rgba(0,0,0,.15);
                    color: var(--white);
                }
            `}</style>
        </div>
    );
};

export default MetroNavigation;
