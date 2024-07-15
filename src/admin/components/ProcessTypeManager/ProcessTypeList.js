import { useEffect, useState } from 'react';
import { Draggable, Button, Icon, Tooltip, Card, CardBody, CardHeader, CardFooter, Notice, Panel, PanelBody, PanelRow } from "@wordpress/components";
import { edit, trash } from "@wordpress/icons";

const ProcessTypeList = ({
  processTypes,
  processSteps,
  onEdit,
  onDelete,
  onDeleteStep,
}) => {
  const [stepsState, setStepsState] = useState({});

  useEffect(() => {
    const initialStepsState = processTypes.reduce((acc, type) => {
      acc[type.id] = processSteps.filter((step) => +step.process_type === type.id);
      return acc;
    }, {});
    setStepsState(initialStepsState);
  }, [processTypes, processSteps]);

  const handleDragStart = (event, typeId, stepId) => {
    event.dataTransfer.setData('typeId', typeId.toString());
    event.dataTransfer.setData('stepId', stepId.toString());
    console.log('Drag started in step', stepId);
  };

  const handleDrop = async (event, dropIndex) => {
    event.preventDefault();
    const draggedTypeId = event.dataTransfer.getData('typeId');
    const draggedStepId = event.dataTransfer.getData('stepId');

    if (!stepsState[draggedTypeId]) {
      console.error(`Steps for typeId ${draggedTypeId} not found.`);
      return;
    }

    const draggedStepIndex = stepsState[draggedTypeId].findIndex(step => step.id === parseInt(draggedStepId, 10));
    const updatedSteps = [...stepsState[draggedTypeId]];
    const [draggedStep] = updatedSteps.splice(draggedStepIndex, 1);
    updatedSteps.splice(dropIndex, 0, draggedStep);

    setStepsState({
      ...stepsState,
      [draggedTypeId]: updatedSteps,
    });

    console.log(`Step ${draggedStepId} dropped to index: ${dropIndex}`);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <Panel>
      <PanelBody title="Existing Process Types" initialOpen={true}>
        <PanelRow>
          {processTypes.length > 0 ? (
            <div className="card-container">
              {processTypes.map((type) => {
                const steps = stepsState[type.id] || [];

                return (
                  <Card key={type.id}>
                    <CardHeader>
                      <h4 className="card-title">{type.title.rendered}</h4>
                    </CardHeader>
                    <CardBody>
                      <dl className="description-list">
                        <div className="list-item">
                          <dt>Description:</dt>
                          <dd>{type.description ? type.description : "-"}</dd>
                        </div>
                      </dl>

                      <p className={type.accept_attachments ? "check true" : "check false"}>
                        {!type.accept_attachments && (
                          <span className="visually-hidden">Not</span>
                        )}{" "}
                        Accept attachments
                      </p>
                      <p className={type.accept_tainacan_items ? "check true" : "check false"}>
                        {!type.accept_tainacan_items && (
                          <span className="visually-hidden">Not</span>
                        )}{" "}
                        Accept Tainacan items
                      </p>
                      <p className={type.generate_tainacan_items ? "check true" : "check false"}>
                        {!type.generate_tainacan_items && (
                          <span className="visually-hidden">Not</span>
                        )}{" "}
                        Generate Tainacan items
                      </p>

                      {steps.length > 0 && (
                        <>
                          <hr />
                          <h5>Steps</h5>
                          <ul className="list-group">
                            {steps.map((step, index) => (
                              <Draggable
                                key={step.id}
                                elementId={`step-${step.id}`}
                                appendToOwnerDocument={true}
                                transferData={{ typeId: type.id, stepId: step.id }}
                                onDragStart={(event) => handleDragStart(event, type.id, step.id)}
                              >
                                {({ onDraggableStart, onDraggableEnd }) => (
                                  <li
                                    className="list-group-item"
                                    id={`step-${step.id}`}
                                    draggable="true"
                                    onDragOver={handleDragOver}
                                    onDrop={(event) => handleDrop(event, index, type.id)}
                                    onDragStart={(event) => handleDragStart(event, type.id, step.id)}
                                  >
                                    {step.title.rendered}
                                    <Tooltip text="Delete Step">
                                      <Button
                                        isDestructive
                                        icon={<Icon icon={trash} />}
                                        onClick={() => onDeleteStep(step.id)}
                                      />
                                    </Tooltip>
                                  </li>
                                )}
                              </Draggable>
                            ))}
                          </ul>
                        </>
                      )}
                    </CardBody>
                    <CardFooter>
                      <Tooltip text="Edit">
                        <Button
                          icon={<Icon icon={edit} />}
                          onClick={() => onEdit(type)}
                        />
                      </Tooltip>
                      <Tooltip text="Delete">
                        <Button
                          icon={<Icon icon={trash} />}
                          onClick={() => onDelete(type.id)}
                        />
                      </Tooltip>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Notice isDismissible={false} status="warning">No existing processes types.</Notice>
          )}
        </PanelRow>
      </PanelBody>
    </Panel>
  );
};


export default ProcessTypeList;
