import React, { useMemo } from 'react';
import { Button, ButtonGroup, Icon, Tooltip, Panel, PanelHeader, PanelRow, Notice } from '@wordpress/components';
import { edit} from '@wordpress/icons';


const SectorList = ({sectors, onEdit}) => {
    const filteredSectors = useMemo(() => sectors, [sectors]);
    
    return (
        <Panel>
            <PanelHeader>
                <h3>Existing sectors</h3>
                {/* <span className="badge">{filteredSectors.length}</span> */}
            </PanelHeader>
            <PanelRow>
                {filteredSectors ? (
                    <table className="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSectors.map(sector => {
                                return (
                                    <tr key={sector.key}>
                                        <td>{sector.name}</td>
                                        <td>{sector.description}</td>
                                        <td>{sector.status}</td>
                                        <td>
                                            <ButtonGroup>
                                                <Tooltip text="Edit">
                                                    <Button
                                                        icon={<Icon icon={edit} />}
                                                        onClick={() => onEdit(sector)}
                                                    />
                                                </Tooltip>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <Notice isDismissible={false} status="warning">No existing sectors.</Notice>
                )}
            </PanelRow>
        </Panel>
    );
}

export default SectorList;