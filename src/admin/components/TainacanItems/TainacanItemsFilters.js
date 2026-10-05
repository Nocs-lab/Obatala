import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

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

	return (
		<div className="search-filter-controls">
			<DropdownMenu
				icon={ settings }
				label={ __( 'Filtrar', 'obatala' ) }
				text={ __( 'Filtros', 'obatala' ) }
			>
				{ ( { onClose } ) => (
					<div className="search-filter-controls-popover">
						<MenuGroup label={ __( 'Coleção', 'obatala' ) }>
								<MenuItem
									className={ collectionId === '' ? 'active' : undefined }
									onClick={ () => {
										setCollectionId( '' );
										onFilterChange?.();
										onClose();
									} }
								>
									{ __( 'Todas as coleções', 'obatala' ) }
								</MenuItem>
							{ collections.map( ( collection ) => (
								<MenuItem
									key={ collection.id }
										className={ String( collection.id ) === collectionId ? 'active' : undefined }
										onClick={ () => {
											setCollectionId(
												String( collection.id )
											);
											onFilterChange?.();
											onClose();
										} }
								>
									{ collection.name }
								</MenuItem>
							) ) }
						</MenuGroup>

						<MenuGroup label={ __( 'Situação', 'obatala' ) }>
							<MenuItem
								className={ status === '' ? 'active' : undefined }
								onClick={ () => {
									setStatus( '' );
									onFilterChange?.();
									onClose();
								} }
							>
								{ __( 'Todas as situações', 'obatala' ) }
							</MenuItem>
							{ statusOptions
								.filter( ( option ) => option.value !== '' )
								.map( ( option ) => (
									<MenuItem
										key={ option.value }
										className={ option.value === status ? 'active' : undefined }
										onClick={ () => {
											setStatus( option.value );
											onFilterChange?.();
											onClose();
										} }
									>
										{ option.label }
									</MenuItem>
								) ) }
						</MenuGroup>
					</div>
				) }
			</DropdownMenu>

			{ hasActiveFilters && (
				<Button
					icon={ close }
					onClick={ handleClearFilters }
					label={ __( 'Limpar', 'obatala' ) }
				/>
			) }
		</div>
	);
};

export default TainacanItemsFilters;
