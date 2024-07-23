import React from 'react';
import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';

const ConfirmDeleteModal = ({ isOpen, onConfirm, onCancel, itemType }) => (
    <ConfirmDialog
        isOpen={isOpen}
        onConfirm={onConfirm}
        onCancel={onCancel}
    >
        Tem certeza de que deseja excluir este {itemType}?
    </ConfirmDialog>
);

export default ConfirmDeleteModal;
