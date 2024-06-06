import { Button, Icon, Tooltip, Card, CardBody, CardHeader, CardFooter } from '@wordpress/components';
import { edit, trash } from '@wordpress/icons';

const ProcessTypeList = ({ processTypes, processSteps, onEdit, onDeleteProcess, onDeleteStep }) => (
    console.log(processTypes, processSteps),
    <div class="panel">
        <h3 class="panel-title">Existing Process Types</h3>
        <div class="card-container">
            {processTypes.map(type => {
                const steps = processSteps.filter(step => +step.process_type === type.id);
                return (
                    <Card key={type.id}>
                        <CardHeader>
                            <h4 class="card-title">{type.title.rendered}</h4>
                        </CardHeader>
                        <CardBody>
                            <dl class="description-list">
                                <div class="list-item">
                                    <dt>Description:</dt>
                                    <dd>{type.description ? type.description : '-'}</dd>
                                </div>
                                <div class="list-item">
                                    <dt>Accept Attachments:</dt>
                                    <dd>{type.accept_attachments ? 'Yes' : 'No'}</dd>
                                </div>
                                <div class="list-item">
                                    <dt>Accept Tainacan Items:</dt>
                                    <dd>{type.accept_tainacan_items ? 'Yes' : 'No'}</dd>
                                </div>
                                <div class="list-item">
                                    <dt>Generate Tainacan Items:</dt>
                                    <dd>{type.generate_tainacan_items ? 'Yes' : 'No'}</dd>
                                </div>
                            </dl>
                            {steps.length > 0 && (
                                <>
                                    <hr></hr>
                                    <h5>Steps</h5>
                                    <ul class="list-group">
                                        {steps.map(step => (
                                            <li class="list-group-item" key={step.id}>
                                                {step.title.rendered}
                                                <Tooltip text="Delete Step">
                                                    <Button icon={<Icon icon={trash} />} onClick={() => onDeleteStep(step.id)} />
                                                </Tooltip>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </CardBody>
                        <CardFooter>
                            <Tooltip text="Edit">
                                <Button icon={<Icon icon={edit} />} onClick={() => onEdit(type)} />
                            </Tooltip>
                            <Tooltip text="Delete">
                                <Button icon={<Icon icon={trash} />} onClick={() => onDeleteProcess(type.id)} />
                            </Tooltip>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    </div>
);

export default ProcessTypeList;
