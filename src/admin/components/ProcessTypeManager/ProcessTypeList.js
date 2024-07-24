import { useEffect, useState } from 'react';
import { Button, Icon, Tooltip, Card, CardBody, CardHeader, CardFooter, Notice, Panel, PanelHeader, PanelRow, Draggable } from "@wordpress/components";
import { edit, trash } from "@wordpress/icons";
import apiFetch from '@wordpress/api-fetch';

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
      const steps = processSteps
        .filter(step => {
          const stepTypes = Array.isArray(step.process_type) ? step.process_type : [step.process_type];
          return stepTypes.includes(type.id);
        })
        .sort((a, b) => a.step_order - b.step_order);

      acc[type.id] = steps;

      return acc;
    }, {});

    console.log('initialStepsState:', initialStepsState);
    setStepsState(initialStepsState);
  }, [processTypes, processSteps]);

  
  const handleDragStart = (event, typeId, stepId) => {
    event.dataTransfer.setData('typeId', typeId.toString());
    event.dataTransfer.setData('stepId', stepId.toString());
  };

  const handleDrop = async (event, dropIndex, typeId) => {
    event.preventDefault();
    const draggedStepId = event.dataTransfer.getData('stepId');
  
    const updatedSteps = [...stepsState[typeId]];
    const draggedStepIndex = updatedSteps.findIndex(step => step.id === parseInt(draggedStepId, 10));
    const [draggedStep] = updatedSteps.splice(draggedStepIndex, 1);
    updatedSteps.splice(dropIndex, 0, draggedStep);
  
    
    setStepsState(prevState => ({
      ...prevState,
      [typeId]: updatedSteps,
    }));
  
    try {
      await Promise.all(updatedSteps.map((step, index) => 
        apiFetch({
          path: `/wp/v2/process_step/${step.id}`,
          method: 'PUT',
          data: { step_order: index },
        })
        ));
        console.log('Ordem das etapas atualizada no banco de dados');
    }   catch (error) {
        console.error('Erro ao salvar a ordem das etapas:', error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };


  return (
    <Panel>
        <PanelHeader>Existing Process Types</PanelHeader>
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
                            <dd>
                                {type.description ? type.description.split('\n').map((item, key) => ( <span key={key}>{item}<br /></span> )) : "-"}
                            </dd>
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
                            <ol className="list-group">
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
                            </ol>
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
    </Panel>
);
};

export default ProcessTypeList;
