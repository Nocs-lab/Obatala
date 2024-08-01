import React from 'react';
import { Button, Icon, Tooltip, Card, CardBody, CardHeader, CardFooter, Notice, Panel, PanelHeader, PanelRow } from "@wordpress/components";
import { edit, trash } from "@wordpress/icons";

const ProcessTypeList = ({ processTypes, onEdit, onDelete }) => {
    return (
        <Panel>
            <PanelHeader>Existing Process Types</PanelHeader>
            <PanelRow>
                {processTypes.length > 0 ? (
                    <div className="card-container">
                        {processTypes.map((type) => (
                            <Card key={type.id}>
                                <CardHeader>
                                    <h4 className="card-title">{type.title.rendered}</h4>
                                </CardHeader>
                                <CardBody>
                                    <dl className="description-list">
                                        <div className="list-item">
                                            <dt>Description:</dt>
                                            <dd>
                                                {type.description ? type.description.split('\n').map((item, key) => (
                                                    <span key={key}>{item}<br /></span>
                                                )) : "-"}
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
                                </CardBody>
                                <CardFooter>
                                    <Tooltip text="Edit">
                                        <Button
                                            icon={<Icon icon={edit} />}
                                            onClick={() => onEdit(type.id)}
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
                        ))}
                    </div>
                ) : (
                    <Notice isDismissible={false} status="warning">No existing process types.</Notice>
                )}
            </PanelRow>
        </Panel>
    );
};

export default ProcessTypeList;
