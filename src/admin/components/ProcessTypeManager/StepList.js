import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Notice, Icon } from '@wordpress/components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import apiFetch from '@wordpress/api-fetch';
import { trash } from '@wordpress/icons';

const StepList = ({ processTypeId, processSteps = [], stepOrder = [], onNotice }) => {
    const [stepsState, setStepsState] = useState([]);

    useEffect(() => {
        if (stepOrder.length > 0 && processSteps.length > 0) {
            const orderedSteps = stepOrder.map(stepId => processSteps.find(step => step.id === stepId)).filter(Boolean);
            setStepsState(orderedSteps);
        }
    }, [stepOrder, processSteps]);

    const handleDragEnd = async (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedSteps = Array.from(stepsState);
        const [movedStep] = reorderedSteps.splice(result.source.index, 1);
        reorderedSteps.splice(result.destination.index, 0, movedStep);

        setStepsState(reorderedSteps);

        try {
            const newStepOrder = reorderedSteps.map(step => step.id);
            await apiFetch({
                path: `/obatala/v1/process_type/${processTypeId}/meta`,
                method: 'PUT',
                data: { step_order: newStepOrder }
            });
            onNotice({ status: 'success', message: 'Step order updated successfully.' });
        } catch (error) {
            console.error('Error updating step order:', error);
            onNotice({ status: 'error', message: 'Error updating step order.' });
        }
    };

    const handleDeleteStep = async (stepId) => {
        const updatedStepOrder = stepsState.filter(step => step.id !== stepId).map(step => step.id);

        try {
            await apiFetch({
                path: `/obatala/v1/process_type/${processTypeId}/meta`,
                method: 'PUT',
                data: { step_order: updatedStepOrder }
            });

            setStepsState(prevSteps => prevSteps.filter(step => step.id !== stepId));
            onNotice({ status: 'success', message: 'Step removed successfully.' });
        } catch (error) {
            console.error('Error removing step:', error);
            onNotice({ status: 'error', message: 'Error removing step.' });
        }
    };

    return (
        <>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps-list" direction="horizontal">
                    {(provided) => (
                        <ul
                            className="steps-list"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {stepsState.map((step, index) => (
                                <Draggable key={step.id} draggableId={String(step.id)} index={index}>
                                    {(provided) => (
                                        <li
                                            className="step-card"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <div className="step-number">{index + 1}</div>
                                            <div className="step-title">{step.title.rendered}</div>
                                            <Tooltip text="Delete Step">
                                                <Button
                                                    isDestructive
                                                    icon={<Icon icon={trash} />}
                                                    onClick={() => handleDeleteStep(step.id)}
                                                />
                                            </Tooltip>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
            <style>{`
                .steps-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    padding: 0;
                    list-style: none;
                }
                .step-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #fff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s, background-color 0.2s;
                }
                .step-number {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .step-title {
                    margin-bottom: 10px;
                    text-align: center;
                }
                .step-card button {
                    align-self: flex-end;
                }
            `}</style>
        </>
    );
};

export default StepList;
