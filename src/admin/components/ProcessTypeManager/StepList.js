import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Notice, Icon } from '@wordpress/components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import apiFetch from '@wordpress/api-fetch';
import { trash, edit } from '@wordpress/icons';

const StepList = ({ processTypeId, stepOrder = [], onNotice }) => {
    const [stepsState, setStepsState] = useState([]);

    useEffect(() => {
        if (stepOrder.length > 0) {
            apiFetch({ path: `/obatala/v1/process_step?include=${stepOrder.join(',')}` })
                .then((stepsData) => {
                    // Cria um mapa de stepsData para facilitar a busca
                    const stepsMap = new Map(stepsData.map((step) => [step.id, step]));
    
                    // Ordena os steps com base no stepOrder, preenchendo os ausentes com placeholders
                    const orderedSteps = stepOrder.map((stepId, index) => {
                        const step = stepsMap.get(stepId);
                        if (step) {
                            return { ...step, orderIndex: index };
                        }
                        // Placeholder para steps ausentes
                        return { id: stepId, orderIndex: index, title: { rendered: `Step ${index + 1}` }, type: "process_step", status: "missing" };
                    });
    
                    setStepsState(orderedSteps);
                    console.log('steps', orderedSteps);
                })
                .catch((error) => {
                    console.error('Error fetching ordered steps:', error);
                    onNotice({ status: 'error', message: 'Error fetching ordered steps.' });
                });
        }
    }, [stepOrder, onNotice]);
    

    const handleDragEnd = async (result) => {
        if (!result.destination) {
            return;
        }

        const reorderedSteps = Array.from(stepsState);
        const [movedStep] = reorderedSteps.splice(result.source.index, 1);
        reorderedSteps.splice(result.destination.index, 0, movedStep);

        setStepsState(reorderedSteps);

        try {
            const newStepOrder = reorderedSteps.map((step) => step.id);
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

    const handleDeleteStep = async (index) => {
        const updatedSteps = stepsState.filter((_, stepIndex) => stepIndex !== index);
        const updatedStepOrder = updatedSteps.map((step) => step.id);

        try {
            await apiFetch({
                path: `/obatala/v1/process_type/${processTypeId}/meta`,
                method: 'PUT',
                data: { step_order: updatedStepOrder }
            });

            setStepsState(updatedSteps);
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
                            {stepsState.length > 0 ? (
                                stepsState.map((step, index) => (
                                    <Draggable key={`${step.id}-${index}`} draggableId={`${step.id}-${index}`} index={index}>
                                        {(provided) => (
                                            <li
                                                className="step-card"
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                            >
                                                <div className="step-header">
                                                    <span className="step-number">{index + 1}</span>
                                                </div>
                                                <div className="step-title">{step.title ? step.title.rendered : '' }</div>
                                                <div className="step-actions">
                                                    <Tooltip text="Edit Step">
                                                        <Button
                                                            icon={<Icon icon={edit} />}
                                                            onClick={() => window.location.href = `?page=process-step-editor&step_id=${step.id}`}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip text="Delete Step">
                                                        <Button
                                                            isDestructive
                                                            icon={<Icon icon={trash} />}
                                                            onClick={() => handleDeleteStep(index)}
                                                        />
                                                    </Tooltip>
                                                </div>
                                            </li>
                                        )}
                                    </Draggable>
                                ))
                            ) : (
                                <Notice status="info">No steps found.</Notice>
                            )}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
};

export default StepList;
