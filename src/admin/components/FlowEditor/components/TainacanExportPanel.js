import React from 'react';
import Select from 'react-select';
import { Notice, Panel, PanelRow, Spinner } from '@wordpress/components';
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
		<Panel className="obatala-tainacan-export-panel">
			<PanelRow>
				<div className="flex-basis-100">
					<h3>{ __( 'Tainacan Export', 'obatala' ) }</h3>
					{isLoading ? (
						<Spinner />
					) : (
						<>
							<div className="obatala-mapper-status-control">
								<input
									id="obatala-mapper-status"
									type="checkbox"
									checked={enabled}
									onChange={(event) => setEnabled(event.target.checked)}
								aria-label={ __( 'Enable mapper status', 'obatala' ) }
								/>
								<div>
									<strong>{ __( 'Mapper status', 'obatala' ) }</strong>
									<p>
										{ __( 'Enable to configure field export to Tainacan.', 'obatala' ) }
									</p>
								</div>
							</div>
							{enabled && (
								<>
									<label className="components-base-control__label">
									{ __( 'Target collections', 'obatala' ) }
									</label>
									<Select
										className="obatala-tainacan-collections-select"
										isMulti
										options={options}
										value={selectedOptions}
										onChange={setSelectedCollections}
									placeholder={ __( 'Select one or more collections…', 'obatala' ) }
										closeMenuOnSelect={false}
									/>
									{!selectedCollectionIds.length && (
										<Notice status="warning" isDismissible={false}>
										{ __( 'Select at least one collection to map fields.', 'obatala' ) }
										</Notice>
									)}
								</>
							)}
						</>
					)}
				</div>
			</PanelRow>
		</Panel>
	);
};

export default TainacanExportPanel;
