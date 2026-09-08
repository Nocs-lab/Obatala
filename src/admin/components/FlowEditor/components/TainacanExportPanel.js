import React from 'react';
import Select from 'react-select';
import { BaseControl, Notice, Spinner, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useTainacanExport } from '../context/TainacanExportContext';

const TainacanExportPanel = () => {
	const {
		isLoading,
		enabled,
		setEnabled,
		collections,
		selectedCollectionIds,
		setSelectedCollections,
	} = useTainacanExport();

	const options = collections.map((collection) => ({
		value: collection.id,
		label: collection.name,
	}));
	const selectedOptions = options.filter((option) =>
		selectedCollectionIds.includes(option.value)
	);

	return (
		<>
			{isLoading ? (
				<Spinner />
			) : (
				<>
					<ToggleControl
						label={__('Exporter status', 'obatala')}
						help={ __( 'Enable to configure field export to Tainacan.', 'obatala' ) }
						checked={enabled}
						onChange={(isChecked) => setEnabled(isChecked)}
					/>
					{enabled && (
						<BaseControl
							label={ __( 'Coleções de destino', 'obatala' ) }>
							{!selectedCollectionIds.length && (
								<Notice status="warning" isDismissible={false}>
								{ __( 'Select at least one collection to map fields.', 'obatala' ) }
								</Notice>
							)}
							<Select
								className="obatala-tainacan-collections-select"
								isMulti
								options={options}
								value={selectedOptions}
								onChange={setSelectedCollections}
								placeholder={ __( 'Select one or more collections…', 'obatala' ) }
								closeMenuOnSelect={false}
							/>
						</BaseControl>
					)}
				</>
			)}
		</>
	);
};

export default TainacanExportPanel;
