import React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Icon,
  Tooltip,
} from '@wordpress/components';
import { trash } from '@wordpress/icons';

const SectorCard = ({ sector, users, onDelete }) => (
  <Card key={sector.id}>
    <CardHeader>
      <h3>{sector.name}</h3>
    </CardHeader>
    <CardBody>
      {users.length === 0 ? (
        <p>Nenhum usuário vinculado a este setor.</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.name} ({user.email})</li>
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
