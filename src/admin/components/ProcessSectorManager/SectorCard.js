import React from 'react';
import { Button, Card, CardBody, CardHeader, CardFooter, Icon, Tooltip } from '@wordpress/components';
import { trash } from '@wordpress/icons';

const SectorCard = ({ sector, users, onDelete, onRemoveUser }) => (
    
    <Card key={sector.id}>
        <CardHeader>
            <h3>{sector.name}</h3>
        </CardHeader>
        <CardBody>
            <p>{sector.description}</p>
            {users.length === 0 ? (
                <p>Nenhum usuário vinculado a este setor.</p>
            ) : (
                <ul className="list-group">
                    {users.map(user => (
                        console.log(user),
                        <li className="list-group-item" key={user.id}>
                            <img src={user.avatar_urls[24]} /> {user.name} 
                            <Tooltip text="Remover Usuário">
                                <Button
                                    isDestructive
                                    icon={<Icon icon={trash} />}
                                    onClick={() => onRemoveUser(user.id, sector.id)}
                                />
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            )}
        </CardBody>
        <CardFooter>
            <Tooltip text="Excluir Setor">
                <Button isDestructive icon={<Icon icon={trash} />} onClick={() => onDelete(sector.id)} />
            </Tooltip>
        </CardFooter>
    </Card>
);

export default SectorCard;
