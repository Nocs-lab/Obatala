import React, { useEffect, useReducer, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TextFieldControls } from '../inputControls/TextFieldControls';
import { NumberFieldControls } from '../inputControls/NumberFieldControls';
import { DatePickerControls } from '../inputControls/DatePickerControls';
import { FileUploadControls } from '../inputControls/FileUploadControls';
import { StageDocumentControls } from '../inputControls/StageDocumentControls';
import { SelectRadioControls } from '../inputControls/SelectRadioControls';
import {
	Button,
	Tooltip,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { dragHandle, pencil, trash } from '@wordpress/icons';
import { useDrawer } from '../../context/DrawerContext';
import LabelWithIcon from '../inputControls/LabelWithIcon';
import { useFlowContext } from '../../context/FlowContext';
import TainacanSearchDetails from '../inputControls/TainacanSearch';
import Reducer, { initialState } from '../../../../redux/reducer';
import TainacanFieldMappingControls from '../inputControls/TainacanFieldMappingControls';
import { useTainacanExport } from '../../context/TainacanExportContext';
import { __, sprintf } from '@wordpress/i18n';

const SortableField = ( {
	id,
	nodeId,
	title,
	type,
	config,
	autoOpen = false,
	onAutoOpened,
} ) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable( { id } );

	const { removeFieldFromNode } = useFlowContext(); // Pega a função do FlowContext
	const { nodes } = useFlowContext();
	const { removeFieldMapping } = useTainacanExport();
	const [ label, setLabel ] = useState( title ); // Label do campo
	const [ state, dispatch ] = useReducer( Reducer, initialState );

	const handleConfirmDelete = ( nodeId, field ) => {
		dispatch( {
			type: 'OPEN_MODAL_NODE_FIELD',
			payload: { field: field, nodeId: nodeId },
		} );
	};

	const handleCancel = () => {
		dispatch( { type: 'CLOSE_MODAL' } );
	};
	const { toggleDrawer } = useDrawer();
	const stageName =
		nodes.find( ( node ) => String( node.id ) === String( nodeId ) )?.data
			?.stageName || nodeId;

	const handleFieldChange = ( field, value ) => {
		if ( field === 'label' ) {
			setLabel( value );
		}
	};

	const renderFieldEditor = () => {
		const mappingControls = (
			<TainacanFieldMappingControls
				fieldId={ id }
				fieldLabel={ config?.label || label }
				fieldType={ type }
				stageName={ stageName }
			/>
		);
		return renderFieldControls( mappingControls ) || mappingControls;
	};

	const renderFieldControls = ( tainacanMappingControls = null ) => {
		switch ( type ) {
			case 'text':
			case 'email':
			case 'phone':
			case 'address':
				return (
					<TextFieldControls
						nodeId={ nodeId }
						fieldId={ id }
						fieldType={ type }
						label={ label }
						setLabel={ setLabel }
						config={ config }
						tainacanMappingControls={ tainacanMappingControls }
					/>
				);
			case 'number':
				return (
					<NumberFieldControls
						nodeId={ nodeId }
						fieldId={ id }
						fieldType={ type }
						label={ label }
						setLabel={ setLabel }
						config={ config }
						tainacanMappingControls={ tainacanMappingControls }
					/>
				);
			case 'datepicker':
				return (
					<DatePickerControls
						nodeId={ nodeId }
						fieldId={ id }
						fieldType={ type }
						label={ label }
						setLabel={ setLabel }
						config={ config }
						tainacanMappingControls={ tainacanMappingControls }
					/>
				);
			case 'upload':
				return (
					<FileUploadControls
						nodeId={ nodeId }
						fieldId={ id }
						fieldType={ type }
						label={ label }
						setLabel={ setLabel }
						config={ config }
						tainacanMappingControls={ tainacanMappingControls }
					/>
				);
			case 'stage_document':
				return (
					<StageDocumentControls
						nodeId={ nodeId }
						fieldId={ id }
						label={ label }
						setLabel={ setLabel }
						config={ config }
						tainacanMappingControls={ tainacanMappingControls }
					/>
				);
			case 'select':
			case 'radio':
				return (
					<SelectRadioControls
						nodeId={ nodeId }
						fieldId={ id }
						fieldType={ type }
						label={ label }
						setLabel={ setLabel }
						config={ config }
						isSelect={ type === 'select' }
						tainacanMappingControls={ tainacanMappingControls }
					/>
				);
			case 'search':
				return (
					<TainacanSearchDetails
						nodeId={ nodeId }
						fieldId={ id }
						label={ label }
						setLabel={ setLabel }
						config={ config }
						tainacanMappingControls={ tainacanMappingControls }
					/>
				);
			default:
				return null;
		}
	};

	useEffect( () => {
		if ( ! autoOpen ) {
			return;
		}
		toggleDrawer( renderFieldEditor() );
		onAutoOpened?.();
	}, [ autoOpen ] );

	const style = {
		transform: CSS.Transform.toString( transform ),
		transition: transition || 'transform 250ms ease',
		opacity: isDragging ? 0.8 : 1,
		cursor: isDragging ? 'grabbing' : 'pointer',
		boxShadow: isDragging ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
	};

	return (
		<>
			<ConfirmDialog
				isOpen={ state.isOpen }
				onConfirm={ () => {
					removeFieldFromNode(
						state.field.nodeId,
						state.field.field
					);
					removeFieldMapping( state.field.field );
					dispatch( { type: 'CLOSE_MODAL' } );
				} }
				onCancel={ handleCancel }
			>
				{ sprintf(
					__( 'Are you sure you want to delete field %s?', 'obatala' ),
					label
				) }
			</ConfirmDialog>
			<li ref={ setNodeRef } style={ style } { ...attributes }>
				<LabelWithIcon
					label={ config ? config.label : label }
					type={ type }
				/>
				<div className="group-button">
					<Tooltip text={ __( 'Edit', 'obatala' ) }>
						<Button
							icon={pencil}
							onClick={ () =>
								toggleDrawer( renderFieldEditor() )
							}
							variant="tertiary"
							size="small"
						/>
					</Tooltip>
					{ /* Passa o nodeId e o id do campo para remover */ }
					<Tooltip text={ __( 'Remove', 'obatala' ) }>
						<Button
							icon={trash}
							onClick={ () => handleConfirmDelete( nodeId, id ) } // Aqui você passa o nodeId e o id do campo
							variant="tertiary"
							size="small"
						/>
					</Tooltip>
					{ /* Drag handle */ }
					<Tooltip text={ __( 'Reorder', 'obatala' ) }>
						<Button
							{ ...listeners } // Listeners aplicados ao ícone de arraste
							icon={dragHandle}
							onClick={ ( e ) => e.stopPropagation() } // Evita a expansão ao clicar no drag handle
							variant="tertiary"
							size="small"
						/>
					</Tooltip>
				</div>
			</li>
		</>
	);
};

export default SortableField;
