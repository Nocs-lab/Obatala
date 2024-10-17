import React, { useMemo } from 'react';
import { Button, ButtonGroup, Icon, Tooltip, Panel, PanelHeader, PanelRow, Notice } from '@wordpress/components';
import { edit, trash} from '@wordpress/icons';


const SectorList = ({sectors, onEdit, onDelete}) => {
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
                                    <tr key={sector.id}>
                                        <td>{sector.name}</td>
                                        <td>{sector.description}</td>
                                        <td><span className={`badge ${sector.status == 'Active' ? 'success' : 'error'}`}>{sector.status}</span></td>
                                        <td>
                                            <ButtonGroup>
                                                <Tooltip text="Edit">
                                                    <Button
                                                        icon={<Icon icon={edit} />}
                                                        onClick={() => onEdit(sector)}
                                                    />
                                                </Tooltip>
                                                <Tooltip text="Delete">
                                                    <Button
                                                        icon={<Icon icon={trash} />}
                                                        onClick={() => onDelete(sector.id)}
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