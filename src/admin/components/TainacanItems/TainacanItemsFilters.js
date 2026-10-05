import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import FilterSelect from '../FilterSelect';

const TainacanItemsFilters = ( {
	collectionId,
	setCollectionId,
	status,
	setStatus,
	collections,
	statusOptions,
	onFilterChange,
} ) => {
	const handleClearFilters = () => {
		setCollectionId( '' );
		setStatus( '' );
		onFilterChange?.();
	};

	const hasActiveFilters = collectionId !== '' || status !== '';
	const collectionOptions = [
		{ label: __( 'Todas as coleções', 'obatala' ), value: '' },
		...collections.map( ( collection ) => ( {
			label: collection.name,
			value: String( collection.id ),
		} ) ),
	];
	const collectionValue = collectionId || '';
	const availableStatusOptions = statusOptions.filter(
		( option ) => option.value !== ''
	);
	const selectStatusOptions = [
		{ label: __( 'Todas as situações', 'obatala' ), value: '' },
		...availableStatusOptions,
	];
	const handleCollectionChange = ( value ) => {
		setCollectionId( value );
		onFilterChange?.();
	};
	const handleStatusChange = ( value ) => {
		setStatus( value );
		onFilterChange?.();
	};

	return (
		<>
			<FilterSelect
				label={ __( 'Coleção', 'obatala' ) }
				value={ collectionValue }
				options={ collectionOptions }
				onChange={ handleCollectionChange }
			/>
			<FilterSelect
				label={ __( 'Situação', 'obatala' ) }
				value={ status || '' }
				options={ selectStatusOptions }
				onChange={ handleStatusChange }
			/>

			{ hasActiveFilters && (
				<Button
					icon={ close }
					onClick={ handleClearFilters }
					label={ __( 'Limpar', 'obatala' ) }
				/>
			) }
		</>
	);
};

export default TainacanItemsFilters;
