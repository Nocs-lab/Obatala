import {
	Button,
	CheckboxControl,
	Notice,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useDrawer } from '../../context/DrawerContext';
import { useFlowContext } from '../../context/FlowContext';

export const StageDocumentControls = ( {
	nodeId,
	fieldId,
	label,
	setLabel,
	config,
	tainacanMappingControls,
} ) => {
	const { updateFieldConfig } = useFlowContext();
	const { toggleDrawer } = useDrawer();
	const [ message, setMessage ] = useState( null );
	const [ formValues, setFormValues ] = useState( {
		label: config ? config.label : label || '',
		documentType: config ? config.documentType : '',
		required: config ? config.required : false,
		requireSignedUpload: config ? config.requireSignedUpload : false,
		templateText: config ? config.templateText : '',
		helpText: config ? config.helpText : '',
	} );

	const save = () => {
		if ( ! formValues.label ) {
			setMessage( {
				type: 'error',
				text: __( 'The label is required.', 'obatala' ),
			} );
			return;
		}

		updateFieldConfig( nodeId, fieldId, formValues );
		setMessage( {
			type: 'success',
			text: __( 'Settings saved successfully.', 'obatala' ),
		} );
		toggleDrawer();
	};

	return (
		<form>
			<h3>{ __( 'Edit stage document', 'obatala' ) }</h3>

			{ message && (
				<Notice
					status={ message.type }
					isDismissible
					onRemove={ () => setMessage( null ) }
				>
					{ message.text }
				</Notice>
			) }

			<TextControl
				label={ __( 'Field name', 'obatala' ) }
				value={ formValues.label }
				onChange={ ( value ) => {
					setFormValues( ( prev ) => ( { ...prev, label: value } ) );
					setLabel( value );
				} }
				placeholder={ __( 'Document title', 'obatala' ) }
				required
			/>

			<TextControl
				label={ __( 'Document type', 'obatala' ) }
				value={ formValues.documentType }
				onChange={ ( value ) =>
					setFormValues( ( prev ) => ( {
						...prev,
						documentType: value,
					} ) )
				}
				placeholder={ __(
					'Opinion, report, order, or term',
					'obatala'
				) }
			/>

			<TextControl
				label={ __( 'Help text', 'obatala' ) }
				value={ formValues.helpText }
				onChange={ ( value ) =>
					setFormValues( ( prev ) => ( {
						...prev,
						helpText: value,
					} ) )
				}
				placeholder={ __(
					'Instructions for filling this document',
					'obatala'
				) }
			/>

			<CheckboxControl
				label={ __( 'Require document content', 'obatala' ) }
				checked={ formValues.required }
				onChange={ ( isChecked ) =>
					setFormValues( ( prev ) => ( {
						...prev,
						required: isChecked,
					} ) )
				}
			/>

			<CheckboxControl
				label={ __( 'Require signed PDF upload', 'obatala' ) }
				checked={ formValues.requireSignedUpload }
				onChange={ ( isChecked ) =>
					setFormValues( ( prev ) => ( {
						...prev,
						requireSignedUpload: isChecked,
					} ) )
				}
			/>

			<TextareaControl
				label={ __( 'Document template', 'obatala' ) }
				value={ formValues.templateText }
				onChange={ ( value ) =>
					setFormValues( ( prev ) => ( {
						...prev,
						templateText: value,
					} ) )
				}
				help={ __(
					'Optional initial text shown when the document is empty.',
					'obatala'
				) }
				rows={ 8 }
			/>

			{ tainacanMappingControls }
			<Button variant="primary" onClick={ save }>
				{ __( 'Save', 'obatala' ) }
			</Button>
		</form>
	);
};
