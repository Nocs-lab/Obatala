import React, { useState, useEffect } from 'react';

const MetroNavigation = ({ options, currentStep, onStepChange }) => {
    const [current, setCurrent] = useState(currentStep || 0);

    useEffect(() => {
        setCurrent(currentStep);
    }, [currentStep]);

    const handleNext = () => {
        const next = (current + 1) % options.length;
        setCurrent(next);
        onStepChange(next);
    };

    const handlePrev = () => {
        const prev = (current - 1 + options.length) % options.length;
        setCurrent(prev);
        onStepChange(prev);
    };

    return (
        <div className="metro-navigation">
            <button className="nav-button" onClick={handlePrev}>Previous</button>
            <div className="navigation-line">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className={`navigation-point ${index === current ? 'active' : ''}`}
                        onClick={() => {
                            setCurrent(index);
                            onStepChange(index);
                        }}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
            <button className="nav-button" onClick={handleNext}>Next</button>

            <style>{`
                .metro-navigation {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin: 20px 0;
                }
                .nav-button {
                    padding: 10px;
                    background-color: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                .nav-button:hover {
                    background-color: #084e6b;
                }
                .navigation-line {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    position: relative;
                }
                .navigation-point {
                    background-color: var(--gray-300);
                    border-radius: 25px;
                    padding: .5rem 1rem;
                    position: relative;
                    cursor: pointer;
                }
                .navigation-point.active {
                    background-color: var(--success);
                    color: var(--white);
                }
            `}</style>
        </div>
    );
};

export default MetroNavigation;
