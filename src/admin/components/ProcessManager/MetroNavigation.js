import React, { useState, useEffect } from 'react';
import { Button, Icon, Tooltip } from '@wordpress/components';
import { arrowLeft, arrowRight } from "@wordpress/icons";

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
            <Tooltip text="Previous">
                <Button isPrimary className="nav-button prev" onClick={handlePrev} icon={<Icon icon={arrowLeft} />} />
            </Tooltip>
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
            <Tooltip text="Next">
                <Button isPrimary className="nav-button next" onClick={handleNext} icon={<Icon icon={arrowRight} />} />
            </Tooltip>

            <style>{`
                .metro-navigation {
                    background-color: var(--gray-200);
                    border-radius: var(--border-radius);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    margin-bottom: 1rem;
                    padding: .75rem;
                }
                .nav-button {
                    border-radius: 10px;
                }
                .nav-button.prev {
                    margin-right: auto;
                }
                .nav-button.next {
                    margin-left: auto;
                }
                .navigation-line {
                    display: flex;
                    align-items: center;
                    gap: .75rem;
                    position: relative;
                }
                .navigation-line::before {
                    background-color: var(--gray-300);
                    content: "";
                    height: 2px;
                    position: absolute;
                    top: 50%;
                    width: 100%;
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
