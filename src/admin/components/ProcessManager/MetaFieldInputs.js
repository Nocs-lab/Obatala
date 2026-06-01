import React, { useEffect, useMemo, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import {
	TextControl,
	FormFileUpload,
	RadioControl,
	ComboboxControl,
	Button,
} from '@wordpress/components';
import { closeSmall, upload } from '@wordpress/icons';
import TainacanSearchControls from '../Tainacan/TainacanSearch';

const toEditorHtml = ( content ) => {
	if ( ! content || typeof content !== 'string' ) {
		return '';
	}
	if ( ! content.includes( '<' ) ) {
		return content.replace( /\n/g, '<br>' );
	}
	return content;
};

const RichTextDocumentEditor = ( {
	label,
	value,
	onChange,
	disabled,
	required,
	help,
} ) => {
	const editorRef = useRef( null );
	const isFocusedRef = useRef( false );

	const renderToolbarIcon = ( icon ) => {
		const lineProps = {
			stroke: 'currentColor',
			strokeWidth: 2,
			strokeLinecap: 'round',
		};
		const alignLines = {
			alignLeft: [
				[ 3, 5, 19, 5 ],
				[ 3, 10, 15, 10 ],
				[ 3, 15, 19, 15 ],
				[ 3, 20, 12, 20 ],
			],
			alignCenter: [
				[ 5, 5, 19, 5 ],
				[ 8, 10, 16, 10 ],
				[ 5, 15, 19, 15 ],
				[ 9, 20, 15, 20 ],
			],
			alignRight: [
				[ 5, 5, 21, 5 ],
				[ 9, 10, 21, 10 ],
				[ 5, 15, 21, 15 ],
				[ 12, 20, 21, 20 ],
			],
			justify: [
				[ 3, 5, 21, 5 ],
				[ 3, 10, 21, 10 ],
				[ 3, 15, 21, 15 ],
				[ 3, 20, 21, 20 ],
			],
		};

		if ( alignLines[ icon ] ) {
			return (
				<svg
					aria-hidden="true"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					focusable="false"
				>
					{ alignLines[ icon ].map( ( line ) => (
						<line
							key={ line.join( '-' ) }
							x1={ line[ 0 ] }
							y1={ line[ 1 ] }
							x2={ line[ 2 ] }
							y2={ line[ 3 ] }
							{ ...lineProps }
						/>
					) ) }
				</svg>
			);
		}

		if ( icon === 'ul' || icon === 'ol' ) {
			return (
				<svg
					aria-hidden="true"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					focusable="false"
				>
					{ [ 6, 12, 18 ].map( ( y, index ) =>
						icon === 'ul' ? (
							<circle
								key={ y }
								cx="5"
								cy={ y }
								r="1.5"
								fill="currentColor"
							/>
						) : (
							<text
								key={ y }
								x="3"
								y={ y + 2 }
								fontSize="6"
								fill="currentColor"
							>
								{ index + 1 }
							</text>
						)
					) }
					{ [ 6, 12, 18 ].map( ( y ) => (
						<line
							key={ `line-${ y }` }
							x1="10"
							y1={ y }
							x2="21"
							y2={ y }
							{ ...lineProps }
						/>
					) ) }
				</svg>
			);
		}

		return <span aria-hidden="true">{ icon }</span>;
	};

	const commands = [
		{ command: 'bold', label: __( 'Bold', 'obatala' ), icon: 'B' },
		{ command: 'italic', label: __( 'Italic', 'obatala' ), icon: 'I' },
		{
			command: 'underline',
			label: __( 'Underline', 'obatala' ),
			icon: 'U',
		},
		{
			command: 'justifyLeft',
			label: __( 'Align left', 'obatala' ),
			icon: 'alignLeft',
		},
		{
			command: 'justifyCenter',
			label: __( 'Center', 'obatala' ),
			icon: 'alignCenter',
		},
		{
			command: 'justifyRight',
			label: __( 'Align right', 'obatala' ),
			icon: 'alignRight',
		},
		{
			command: 'justifyFull',
			label: __( 'Justify', 'obatala' ),
			icon: 'justify',
		},
		{
			command: 'insertUnorderedList',
			label: __( 'Bulleted list', 'obatala' ),
			icon: 'ul',
		},
		{
			command: 'insertOrderedList',
			label: __( 'Numbered list', 'obatala' ),
			icon: 'ol',
		},
		{
			command: 'removeFormat',
			label: __( 'Clear formatting', 'obatala' ),
			icon: 'Tx',
		},
	];

	useEffect( () => {
		if ( ! editorRef.current || isFocusedRef.current ) {
			return;
		}
		const nextHtml = toEditorHtml( value );
		if ( editorRef.current.innerHTML !== nextHtml ) {
			editorRef.current.innerHTML = nextHtml;
		}
	}, [ value ] );

	const runCommand = ( command ) => {
		if ( disabled ) {
			return;
		}
		editorRef.current?.focus();
		document.execCommand( command, false, null );
		onChange( editorRef.current?.innerHTML || '' );
	};

	return (
		<div className="components-base-control stage-document-editor">
			<div className="components-base-control__field">
				<label className="components-base-control__label">
					{ label }
					{ required ? ' *' : '' }
				</label>
				<div
					className="stage-document-toolbar"
					role="toolbar"
					aria-label={ label }
				>
					{ commands.map( ( item ) => (
						<Button
							key={ item.command }
							variant="secondary"
							size="small"
							onMouseDown={ ( event ) => event.preventDefault() }
							onClick={ () => runCommand( item.command ) }
							disabled={ disabled }
							label={ item.label }
							aria-label={ item.label }
							className="stage-document-toolbar__button"
						>
							{ renderToolbarIcon( item.icon ) }
						</Button>
					) ) }
				</div>
				<div
					ref={ editorRef }
					className="stage-document-richtext"
					contentEditable={ ! disabled }
					role="textbox"
					aria-multiline="true"
					aria-label={ label }
					aria-required={ required }
					onFocus={ () => {
						isFocusedRef.current = true;
					} }
					onBlur={ () => {
						isFocusedRef.current = false;
					} }
					onInput={ () =>
						onChange( editorRef.current?.innerHTML || '' )
					}
					suppressContentEditableWarning
				/>
				{ help && (
					<p className="components-base-control__help">{ help }</p>
				) }
			</div>
		</div>
	);
};

const MetaFieldInputs = React.memo(
	( {
		field,
		isEditable,
		onFieldChange,
		fieldId,
		initalValue,
		noHasPermission,
		fileInfo,
		stepId,
		itemIndex = null,
		labelOverride = null,
		uploadTemplateAction = null,
	} ) => {
		const [ value, setValue ] = useState( initalValue );

		useEffect( () => {
			setValue( initalValue );
		}, [ stepId, fieldId, itemIndex, initalValue ] );

		const normalizeArrayLike = ( v ) => {
			if ( Array.isArray( v ) ) return v;
			if ( v && typeof v === 'object' ) return Object.values( v );
			return [];
		};

		const normalizedSearchInitial = useMemo( () => {
			return normalizeArrayLike( initalValue );
		}, [ stepId, fieldId, itemIndex, initalValue ] );

		const normalizeDocumentValue = ( v, fieldConfig = {} ) => {
			const firstValue = Array.isArray( v ) ? v[ 0 ] : v;
			if ( firstValue && typeof firstValue === 'object' ) {
				return firstValue;
			}
			const templateText = fieldConfig.templateText || '';
			return {
				content:
					typeof firstValue === 'string' && firstValue
						? firstValue
						: templateText,
				status: firstValue || templateText ? 'draft' : 'empty',
			};
		};

		const handleChange = ( newValue ) => {
			setValue( newValue );
			onFieldChange( fieldId, newValue, itemIndex );

			const isValid =
				! field.config?.pattern ||
				new RegExp( field.config.pattern ).test( newValue );

			if ( ! isValid ) {
				console.log( 'Valor inválido' );
			}
		};

		const fieldLabel =
			labelOverride ||
			field.config?.label ||
			__( 'Unknown Title', 'obatala' );

		switch ( field.type ) {
			case 'text':
			case 'phone':
			case 'address':
				return (
					<div
						className={ `meta-field ${
							field.config?.required ? 'required' : ''
						}` }
					>
						<TextControl
							label={ fieldLabel }
							placeholder={
								field.config?.placeholder ??
								__( 'Enter a value...', 'obatala' )
							}
							value={ value ?? '' }
							onChange={ handleChange }
							disabled={ ! isEditable || noHasPermission }
							required={ field.config?.required ?? false }
							minLength={ field.config?.minLength }
							maxLength={ field.config?.maxLength }
							help={ field.config?.helpText }
							pattern={ field.config?.pattern || undefined }
						/>
					</div>
				);

			case 'datepicker':
				return (
					<div className="meta-field sm">
						<label>{ fieldLabel }</label>
						<input
							type="date"
							value={
								value
									? String( value )
											.split( '/' )
											.reverse()
											.join( '-' )
									: ''
							}
							onChange={ ( e ) => {
								const formattedDate = e.target.value
									.split( '-' )
									.reverse()
									.join( '/' );
								handleChange( formattedDate );
							} }
							disabled={ ! isEditable || noHasPermission }
							required={ field.config?.required ?? false }
						/>
					</div>
				);

			case 'upload':
				return (
					<div className="meta-field">
						<p>{ fieldLabel }</p>
						<div
							style={ {
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								flexWrap: 'wrap',
							} }
						>
							<FormFileUpload
								accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.csv,.xls,.xlsx"
								onChange={ ( event ) =>
									handleChange( event.currentTarget.files )
								}
								disabled={ ! isEditable || noHasPermission }
								required={ field.config?.required ?? false }
								help={ field.config?.helpText }
								icon={ upload }
								style={ { border: '1px dashed #ccc' } }
							>
								{ __( 'Upload', 'obatala' ) }
							</FormFileUpload>

							{ uploadTemplateAction?.show && (
								<Button
									variant="link"
									onClick={ uploadTemplateAction.onClick }
									isBusy={ uploadTemplateAction.isLoading }
									disabled={
										uploadTemplateAction.isLoading ||
										noHasPermission
									}
								>
									{ uploadTemplateAction.label ||
										__(
											'Download spreadsheet template',
											'obatala'
										) }
								</Button>
							) }
						</div>

						{ fileInfo?.[ stepId ]?.[ fieldId ] && (
							<div>
								<p>
									<strong>{ __( 'File', 'obatala' ) }:</strong>{ ' ' }
									{ fileInfo[ stepId ][ fieldId ].name }
								</p>
							</div>
						) }
					</div>
				);

			case 'stage_document': {
				const documentValue = normalizeDocumentValue(
					value,
					field.config
				);

				return (
					<div
						className={ `meta-field stage-document-field ${
							field.config?.required ? 'required' : ''
						}` }
					>
						<RichTextDocumentEditor
							label={
								fieldLabel ||
								__( 'Stage document', 'obatala' )
							}
							value={ documentValue.content ?? '' }
							onChange={ ( content ) =>
								handleChange( {
									...documentValue,
									content,
									status: content ? 'draft' : 'empty',
									updatedAt: new Date().toISOString(),
								} )
							}
							disabled={ ! isEditable || noHasPermission }
							required={ field.config?.required ?? false }
							help={ field.config?.helpText }
						/>
					</div>
				);
			}

			case 'number':
				return (
					<div className="meta-field sm">
						<TextControl
							label={ fieldLabel }
							min={ field.config?.min }
							max={ field.config?.max }
							step={ field.config?.step }
							value={ value ?? '' }
							onChange={ ( v ) => handleChange( v ) }
							type="number"
							disabled={ ! isEditable || noHasPermission }
							required={ field.config?.required ?? false }
							help={ field.config?.helpText }
						/>
					</div>
				);

			case 'select':
				return (
					<div className="meta-field">
						<ComboboxControl
							label={ fieldLabel }
							value={ Array.isArray( value ) ? value : [] }
							options={ field.config?.options
								.split( ',' )
								.map( ( option ) => ( {
									label: option.trim(),
									value: option.trim(),
								} ) ) }
							onChange={ ( selectedValue ) => {
								const arr = Array.isArray( value ) ? value : [];
								if (
									selectedValue &&
									! arr.includes( selectedValue )
								) {
									handleChange( [ ...arr, selectedValue ] );
								}
							} }
							disabled={ ! isEditable || noHasPermission }
						/>

						{ Array.isArray( value ) && value.length > 0 && (
							<div className="combobox-selection">
								{ value.map( ( selected ) => (
									<div
										key={ selected }
										className="combobox-selected"
									>
										{ selected }
										<Button
											icon={ closeSmall }
											onClick={ () =>
												handleChange(
													value.filter(
														( v ) => v !== selected
													)
												)
											}
											className="remove-option-button"
											disabled={
												! isEditable || noHasPermission
											}
										/>
									</div>
								) ) }
							</div>
						) }
					</div>
				);

			case 'radio':
				return (
					<div className="meta-field">
						<RadioControl
							label={ fieldLabel }
							selected={ value ?? '' }
							onChange={ ( v ) => handleChange( v ) }
							options={ field.config?.options
								.split( ',' )
								.map( ( option ) => ( {
									label: option,
									value: option,
								} ) ) }
							disabled={ ! isEditable || noHasPermission }
							required={ field.config?.required ?? false }
							help={ field.config?.helpText }
						/>
					</div>
				);

			case 'search':
				return (
					<TainacanSearchControls
						onFieldChange={ ( selectedItems ) =>
							onFieldChange( fieldId, selectedItems, itemIndex )
						}
						initialValue={ normalizedSearchInitial }
						isEditable={ isEditable }
						noHasPermission={ noHasPermission }
						key={ `${ stepId }-${ fieldId }-${ itemIndex ?? 'single' }` }
					/>
				);

			case 'email':
				return (
					<div
						className={ `meta-field md ${
							field.config?.required ? 'required' : ''
						}` }
					>
						<TextControl
							label={ fieldLabel }
							placeholder={
								field.config?.placeholder ??
								__( 'Enter a value...', 'obatala' )
							}
							value={ value ?? '' }
							type="email"
							onChange={ handleChange }
							disabled={ ! isEditable || noHasPermission }
							required={ field.config?.required ?? false }
							minLength={ field.config?.minLength }
							maxLength={ field.config?.maxLength }
							help={ field.config?.helpText }
						/>
					</div>
				);

			default:
				return null;
		}
	}
);

export default MetaFieldInputs;
