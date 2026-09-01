import React, { useEffect, useMemo, useState } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import {
	Button,
	CheckboxControl,
	FormFileUpload,
	Notice,
	PanelBody,
	PanelRow,
	RadioControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { saveProcessExportInput } from '../../api/apiRequests';

const TainacanExportPreparation = ( { processId, runtime, canEdit, onSaved } ) => {
	const profiles = Array.isArray( runtime?.available_profiles )
		? runtime.available_profiles
		: [];
	const savedInput = runtime?.input || {};
	const [ profileKey, setProfileKey ] = useState( '' );
	const [ mode, setMode ] = useState( 'single' );
	const [ quantity, setQuantity ] = useState( '1' );
	const [ entryMode, setEntryMode ] = useState( 'manual' );
	const [ sameValues, setSameValues ] = useState( false );
	const [ uniqueFieldId, setUniqueFieldId ] = useState( '' );
	const [ usePrefix, setUsePrefix ] = useState( false );
	const [ prefix, setPrefix ] = useState( '' );
	const [ spreadsheetFile, setSpreadsheetFile ] = useState( null );
	const [ spreadsheetFileName, setSpreadsheetFileName ] = useState( '' );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );
	const activeProfile = profiles.find( ( profile ) => profile.key === profileKey );
	const mappedFields = Array.isArray( activeProfile?.mapped_fields )
		? activeProfile.mapped_fields
		: Array.isArray( runtime?.mapped_fields ) ? runtime.mapped_fields : [];

	useEffect( () => {
		setProfileKey( savedInput.profile_key || profiles[ 0 ]?.key || '' );
		setMode( savedInput.mode || 'single' );
		setQuantity( String( savedInput.quantity || 1 ) );
		setEntryMode( savedInput.entry_mode || 'manual' );
		setSameValues( Boolean( savedInput.same_values ) );
		setUniqueFieldId( savedInput.unique_field_id || '' );
		setUsePrefix( Boolean( savedInput.use_prefix ) );
		setPrefix( savedInput.prefix || '' );
		setSpreadsheetFileName( savedInput.spreadsheet_file_name || '' );
	}, [ runtime ] );

	const profileOptions = useMemo(
		() => profiles.map( ( profile ) => ( {
			label: profile.label || profile.key,
			value: profile.key,
		} ) ),
		[ profiles ]
	);
	const uniqueFieldOptions = useMemo(
		() => [
			{ label: __( 'Select a field…', 'obatala' ), value: '' },
			...mappedFields.map( ( field ) => ( {
				label: field.obatala_field_label || field.obatala_field_id,
				value: field.obatala_field_id,
			} ) ),
		],
		[ mappedFields ]
	);

	const uploadSpreadsheet = async () => {
		if ( ! spreadsheetFile ) {
			return spreadsheetFileName;
		}
		const body = new FormData();
		body.append( 'file', spreadsheetFile );
		const response = await apiFetch( {
			path: `/obatala/v1/exporter/process/${ processId }/input-file`,
			method: 'POST',
			body,
		} );
		return response?.file_name || '';
	};

	const handleSave = async () => {
		setError( '' );
		setIsSaving( true );
		try {
			const fileName = await uploadSpreadsheet();
			const response = await saveProcessExportInput( processId, {
				profile_key: profileKey,
				mode,
				quantity: Number( quantity ) || 1,
				entry_mode: entryMode,
				spreadsheet_file_name: fileName,
				same_values: sameValues,
				unique_field_id: uniqueFieldId,
				use_prefix: usePrefix,
				prefix,
			} );
			setSpreadsheetFileName( fileName );
			setSpreadsheetFile( null );
			onSaved?.( response );
		} catch ( saveError ) {
			setError(
				saveError?.message ||
					__( 'Could not save the export preparation.', 'obatala' )
			);
		} finally {
			setIsSaving( false );
		}
	};

	return (
		<PanelBody
			title={
				<>
					<span className="accordion-title me-auto">{ __( 'Tainacan export preparation', 'obatala' ) }</span>
					<div className="badge-container">

					</div>
				</>
			}
			className={`accordion-item configuration-item`}
		>
			<PanelRow>
				<Notice status="info" isDismissible={ false }>
					{ __(
						'Define how this process will generate items without adding technical fields to its steps.',
						'obatala'
					) }
				</Notice>
				<form className="flex-form">
					{ error && <Notice status="error" isDismissible={ false }>{ error }</Notice> }
					<SelectControl
						label={ __( 'Target collection', 'obatala' ) }
						value={ profileKey }
						options={ profileOptions }
						onChange={ setProfileKey }
						disabled={ ! canEdit || profiles.length <= 1 }
					/>
					<RadioControl
						className="flex-basis-100"
						label={ __( 'Number of items', 'obatala' ) }
						selected={ mode }
						options={ [
							{ label: __( 'One item', 'obatala' ), value: 'single' },
							{ label: __( 'Multiple items', 'obatala' ), value: 'multiple' },
						] }
						onChange={ setMode }
						disabled={ ! canEdit }
					/>
					{ mode === 'multiple' && (
						<>
							<TextControl
								label={ __( 'Quantity of items', 'obatala' ) }
								type="number"
								min="1"
								value={ quantity }
								onChange={ setQuantity }
								disabled={ ! canEdit }
							/>
							<RadioControl
								label={ __( 'Data source', 'obatala' ) }
								selected={ entryMode }
								options={ [
									{ label: __( 'Manual entry', 'obatala' ), value: 'manual' },
									{ label: __( 'Spreadsheet', 'obatala' ), value: 'upload' },
								] }
								onChange={ setEntryMode }
								disabled={ ! canEdit }
							/>
						</>
					) }
					{ mode === 'multiple' && entryMode === 'upload' && (
						<div className="obatala-export-preparation__file">
							<FormFileUpload
								accept=".csv,.xls,.xlsx"
								onChange={ ( event ) => setSpreadsheetFile( event.currentTarget.files?.[ 0 ] || null ) }
								disabled={ ! canEdit }
								variant="secondary"
							>
								{ __( 'Select spreadsheet', 'obatala' ) }
							</FormFileUpload>
							{ ( spreadsheetFile?.name || spreadsheetFileName ) && (
								<span>{ spreadsheetFile?.name || spreadsheetFileName }</span>
							) }
						</div>
					) }
					{ mode === 'multiple' && (
						<>
							<CheckboxControl
								label={ __( 'Repeat base values between items', 'obatala' ) }
								checked={ sameValues }
								onChange={ setSameValues }
								disabled={ ! canEdit }
							/>
							{ sameValues && (
								<>
									<SelectControl
										label={ __( 'Unique identifier field', 'obatala' ) }
										value={ uniqueFieldId }
										options={ uniqueFieldOptions }
										onChange={ setUniqueFieldId }
										disabled={ ! canEdit }
									/>
									<CheckboxControl
										label={ __( 'Use an identifier prefix', 'obatala' ) }
										checked={ usePrefix }
										onChange={ setUsePrefix }
										disabled={ ! canEdit }
									/>
									{ usePrefix && (
										<TextControl
											label={ __( 'Identifier prefix', 'obatala' ) }
											value={ prefix }
											onChange={ setPrefix }
											disabled={ ! canEdit }
										/>
									) }
								</>
							) }
						</>
					)}
					<div className="action-bar">
						<Button
							variant="primary"
							onClick={ handleSave }
							disabled={ ! canEdit || isSaving || ! profileKey }
							isBusy={ isSaving }
						>
							{ isSaving
								? __( 'Saving…', 'obatala' )
								: __( 'Save export preparation', 'obatala' ) }
						</Button>
					</div>
				</form>
			</PanelRow>
		</PanelBody>
	);
};

export default TainacanExportPreparation;
