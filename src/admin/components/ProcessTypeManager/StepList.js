import React, { useState, useEffect } from "react";
import {
  Button,
  ButtonGroup,
  Tooltip,
  Notice,
  Icon,
} from "@wordpress/components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import apiFetch from "@wordpress/api-fetch";
import { trash, edit } from "@wordpress/icons";

const StepList = ({ processTypeId, stepOrder = [], onNotice }) => {
  const [stepsState, setStepsState] = useState([]);

  useEffect(() => {
    if (stepOrder.length > 0) {
      apiFetch({
        path: `/obatala/v1/process_step?include=${stepOrder.join(",")}`,
      })
        .then((stepsData) => {
          console.log("Steps:", stepsData);
          console.log("Step order:", stepOrder);
          const orderedSteps = stepOrder
            .map((stepId, index) => {
              // Converte o stepId para número antes de comparar
              const step = stepsData.find((step) => step.id === Number(stepId));
              if (step) {
                return { ...step, orderIndex: index };
              }
              return null; // Retorna null se o stepId não for encontrado
            })
            .filter((step) => step !== null); // Filtra os nulos
          setStepsState(orderedSteps);
        })
        .catch((error) => {
          console.error("Error fetching ordered steps:", error);
          onNotice({
            status: "error",
            message: "Error fetching ordered steps.",
          });
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
        method: "PUT",
        data: { step_order: newStepOrder },
      });
      onNotice({
        status: "success",
        message: "Step order updated successfully.",
      });
    } catch (error) {
      console.error("Error updating step order:", error);
      onNotice({ status: "error", message: "Error updating step order." });
    }
  };

  const handleDeleteStep = async (index) => {
    const updatedSteps = stepsState.filter(
      (_, stepIndex) => stepIndex !== index
    );
    const updatedStepOrder = updatedSteps.map((step) => step.id);

    try {
      await apiFetch({
        path: `/obatala/v1/process_type/${processTypeId}/meta`,
        method: "PUT",
        data: { step_order: updatedStepOrder },
      });

      setStepsState(updatedSteps);
      onNotice({ status: "success", message: "Step removed successfully." });
    } catch (error) {
      console.error("Error removing step:", error);
      onNotice({ status: "error", message: "Error removing step." });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="steps-list" direction="vertical">
        {(provided) => (
          <ul
            className="steps-list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {stepsState.length > 0 ? (
              stepsState.map((step, index) => (
                <Draggable
                  key={`${step.id}-${index}`}
                  draggableId={`${step.id}-${index}`}
                  index={index}
                >
                  {(provided) => (
                    <li
                      className="step-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <span className="step-number">{index + 1}</span>
                      <h4>{step.title.rendered}</h4>
                      <ButtonGroup>
                        <Tooltip text="Edit Step">
                          <Button
                            icon={<Icon icon={edit} />}
                            onClick={() =>
                              (window.location.href = `?page=process-step-editor&step_id=${step.id}`)
                            }
                          />
                        </Tooltip>
                        <Tooltip text="Delete Step">
                          <Button
                            icon={<Icon icon={trash} />}
                            onClick={() => handleDeleteStep(index)}
                          />
                        </Tooltip>
                      </ButtonGroup>
                    </li>
                  )}
                </Draggable>
              ))
            ) : (
              <Notice status="warning" isDismissible={false}>
                No steps found.
              </Notice>
            )}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default StepList;
