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
                        <span className="tooltip">{option.label}</span>
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
                    background-color: #0b6d9e;
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
                    width: 20px;
                    height: 20px;
                    background-color: #ddd;
                    border-radius: 50%;
                    position: relative;
                    cursor: pointer;
                }
                .navigation-point.active {
                    background-color: #0b6d9e;
                }
                .navigation-point:hover .tooltip {
                    visibility: visible;
                    opacity: 1;
                }
                .tooltip {
                    visibility: hidden;
                    opacity: 0;
                    background-color: #333;
                    color: #fff;
                    text-align: center;
                    padding: 5px;
                    border-radius: 4px;
                    position: absolute;
                    z-index: 1;
                    bottom: 125%; 
                    left: 50%;
                    transform: translateX(-50%);
                    transition: opacity 0.3s;
                    white-space: nowrap;
                }
                .tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%; 
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 5px;
                    border-style: solid;
                    border-color: #333 transparent transparent transparent;
                }
            `}</style>
        </div>
    );
};

export default MetroNavigation;
