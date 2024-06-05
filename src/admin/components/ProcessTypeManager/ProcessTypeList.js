import { Button, Icon, Tooltip, Card, CardBody, CardHeader, CardFooter } from '@wordpress/components';
import { edit, trash } from '@wordpress/icons';

const ProcessTypeList = ({ processTypes, processSteps, onEdit, onDelete, onDeleteStep }) => (
    <div>
        <h3>Existing Process Types</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {processTypes.map(type => {
                const steps = processSteps.filter(step => +step.process_type === type.id);
                return (
                    <Card key={type.id} style={{ width: '300px' }}>
                        <CardHeader>
                            <strong>{type.title.rendered}</strong>
                        </CardHeader>
                        <CardBody>
                            <p>{type.description}</p>
                            <p>Accept Attachments: {type.accept_attachments ? 'Yes' : 'No'}</p>
                            <p>Accept Tainacan Items: {type.accept_tainacan_items ? 'Yes' : 'No'}</p>
                            <p>Generate Tainacan Items: {type.generate_tainacan_items ? 'Yes' : 'No'}</p>
                            <h4>Steps</h4>
                            <ul>
                                {steps.map(step => (
                                    <li key={step.id}>
                                        {step.title.rendered}
                                        <Button
                                            isDestructive
                                            onClick={() => onDeleteStep(step.id)}
                                        >
                                            Delete
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardBody>
                        <CardFooter>
                            <Tooltip text="Edit">
                                <Button icon={<Icon icon={edit} />} onClick={() => onEdit(type)} />
                            </Tooltip>
                            <Tooltip text="Delete">
                                <Button icon={<Icon icon={trash} />} onClick={() => onDelete(type.id)} />
                            </Tooltip>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    </div>
);

export default ProcessTypeList;
