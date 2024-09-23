import React, { useMemo } from 'react';
import { Button, Icon, Tooltip, Panel, PanelHeader, PanelRow, Notice } from '@wordpress/components';
import { edit} from '@wordpress/icons';


const SectorList = ({sectors, onEdit}) => {
    const filteredSectors = useMemo(() => sectors, [sectors]);
    
    return (
        <div>
            <div className="panel-container">
                <main>
                    <Panel>
                        <PanelHeader>
                            <h3>Existing Sectors</h3>
                            <span className="badge">{filteredSectors.length}</span>
                        </PanelHeader>
                        <PanelRow>
                            {filteredSectors.length > 0 ? (
                                <table className="wp-list-table widefat fixed striped">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Actions</th>
                                           
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSectors.map(sector => {
  
                                            return (
                                                <tr key={sector.id}>
                                                    <td>{sector.title.rendered}</td>
                                                    <td>{sector.meta.sector_description}</td>
                                                    <td>
                                                        <Tooltip text="Edit">
                                                            <Button
                                                                icon={<Icon icon={edit} />}
                                                                onClick={() => onEdit(sector)}
                                                            />
                                                        </Tooltip>
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
                </main>
            </div>
        </div>
    );
}

export default SectorList;