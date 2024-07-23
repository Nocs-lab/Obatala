import React from 'react';
import { Button, Icon, Tooltip, Card, CardBody, CardHeader, CardFooter, Notice, Panel, PanelBody, PanelRow } from '@wordpress/components';
import { edit, trash } from '@wordpress/icons';

const ProcessTypeList = ({ processTypes, processSteps, sectors, onEdit, onDelete, onDeleteStep }) => (
  console.log(processTypes, processSteps, sectors),
  (
    <Panel>
      <PanelBody title="Existing Process Types" initialOpen={true}>
        <PanelRow>
          {processTypes.length > 0 ? (
            <div className="card-container">
              {processTypes.map((type) => {
                const steps = processSteps.filter((step) => +step.process_type === type.id);
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
                        {!type.accept_attachments && <span className="visually-hidden">Not</span>} Accept attachments
                      </p>
                      <p className={type.accept_tainacan_items ? "check true" : "check false"}>
                        {!type.accept_tainacan_items && <span className="visually-hidden">Not</span>} Accept Tainacan items
                      </p>
                      <p className={type.generate_tainacan_items ? "check true" : "check false"}>
                        {!type.generate_tainacan_items && <span className="visually-hidden">Not</span>} Generate Tainacan items
                      </p>

                      {steps.length > 0 && (
                        <>
                          <hr></hr>
                          <h5>Steps</h5>
                          <ul className="list-group">
                            {steps.map((step) => {
                              const sectorNames = step.sector.map(sectorId => {
                                const sector = sectors.find(sector => sector.id === sectorId);
                                return sector ? sector.name : 'N/A';
                              }).join(', ');

                              return (
                                <li className="list-group-item" key={step.id}>
                                  {step.title.rendered} (Sector: {sectorNames})
                                  <Tooltip text="Delete Step">
                                    <Button
                                      isDestructive
                                      icon={<Icon icon={trash} />}
                                      onClick={() => onDeleteStep(step.id)}
                                    />
                                  </Tooltip>
                                </li>
                              );
                            })}
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
            <Notice isDismissible={false} status="warning">No existing process types.</Notice>
          )}
        </PanelRow>
      </PanelBody>
    </Panel>
  )
);

export default ProcessTypeList;
