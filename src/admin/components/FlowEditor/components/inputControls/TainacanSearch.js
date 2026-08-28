import { Button, Notice, TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDrawer } from '../../context/DrawerContext';
import { useFlowContext } from '../../context/FlowContext';

const TainacanSearchDetails = ( {
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
	const [ fieldLabel, setFieldLabel ] = useState(
		config?.label || label || ''
	);

	const save = () => {
		const normalizedLabel = fieldLabel.trim();

		if ( ! normalizedLabel || normalizedLabel === 'Campo sem título' ) {
			setMessage( {
				type: 'error',
				text: __( 'The label is required.', 'obatala' ),
			} );
			return;
		}

		updateFieldConfig( nodeId, fieldId, {
			...config,
			label: normalizedLabel,
		} );
		setLabel( normalizedLabel );
		toggleDrawer();
	};

	return (
		<form className="flex-form">
			<h3>{ __( 'Edit Search Tainacan field', 'obatala' ) }</h3>

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
				value={ fieldLabel }
				onChange={ setFieldLabel }
				placeholder={ __( 'Search in Tainacan', 'obatala' ) }
				required
			/>

			{ tainacanMappingControls }
			
			<Notice status="info" isDismissible={ false }>
				<h4>
					{ __( 'How does the item and collection search work?', 'obatala' ) }
				</h4>
				<p>
					{ __( 'The item and collection search helps you easily find what you need. Type at least three characters in the search bar to start seeing item and collection suggestions that match what you entered.', 'obatala' ) }
				</p>
				<p>
					{ __( 'As you type, the search returns collections and items that match the searched term, allowing you to view basic information about each result. To see more details for an item or collection, click one of the results.', 'obatala' ) }
				</p>
				<p>
					{ __( 'You can also select multiple items and collections by clicking them, and they will be added to a list below the search bar. To remove an item from the selection, click the X next to the item name.', 'obatala' ) }
				</p>
				<p>
					{ __( 'This search is a practical and quick way to browse items and collections, helping you find the content you need simply and efficiently.', 'obatala' ) }
				</p>
			</Notice>

			<Button variant="primary" type="button" onClick={ save }>
				{ __( 'Save', 'obatala' ) }
			</Button>
		</form>
	);
};

export default TainacanSearchDetails;
