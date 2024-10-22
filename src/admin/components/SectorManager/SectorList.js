import React, { useEffect, useMemo, useState } from 'react';
import apiFetch from "@wordpress/api-fetch";
import { Button, ButtonGroup, Icon, Tooltip, Panel, PanelHeader, PanelRow, Notice } from '@wordpress/components';
import { edit, trash, people} from '@wordpress/icons';


const SectorList = ({sectors, onEdit, onDelete, onAddUser}) => {
    const filteredSectors = useMemo(() => sectors, [sectors]);
    const [usersSectors, setUsersSectors] = useState({});
    
    useEffect(() => {
        if (filteredSectors.length > 0) {
            loadSectorUsers();
        }
    }, [filteredSectors]);

    const loadSectorUsers = async () => {
        const updatedSectors = await Promise.all(
            filteredSectors.map(async (sector) => {
                console.log(sector.id)
                try {
                    const data = await apiFetch({ path: `/obatala/v1/sector_obatala/${sector.id}/users` })
                    return {...sector, userCount: data.length}
                    
                } catch (error) {
                    console.error(`Erro ao buscar usuários do setor ${sector.id}:`, error);
                    return { ...sector, userCount: 0 };
                }
            })
        )
        setUsersSectors(updatedSectors);
    } 
    console.log(usersSectors)
    return (
        <Panel>
            <PanelHeader>
                <h3>Existing sectors</h3>
                <span className="badge">{filteredSectors.length}</span>
            </PanelHeader>
            <PanelRow>
                {usersSectors.length > 0 ? (
                    <table className="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Number of users</th>
                                <th>Status</th>
                                <th>Actions</th>
                                
                            </tr>
                        </thead>
                        <tbody>
                            {usersSectors.map(sector => {
                                return (
                                    <tr key={sector.id}>
                                        <td>{sector.name}</td>
                                        <td>{sector.description}</td>
                                        <td>{sector?.userCount}</td>
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
                                                        onClick={() => onDelete(sector)}
                                                    />
                                                </Tooltip>
                                                <Tooltip text="Users">
                                                    <Button
                                                        icon={<Icon icon={people} />}
                                                        onClick={() => onAddUser(sector)}
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