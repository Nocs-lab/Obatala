import React, { useMemo, useState } from 'react';
import { Panel, PanelRow, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useTainacanExport } from '../context/TainacanExportContext';
import { useFlowContext } from '../context/FlowContext';

const TainacanMappingSummary = () => {
	const {
		enabled,
		collections,
		selectedCollectionIds,
		profiles,
		metadataByCollection,
		updateFieldMapping,
	} = useTainacanExport();
	const { nodes } = useFlowContext();
	const [visibleCollectionId, setVisibleCollectionId] = useState('');
	const activeCollectionId = selectedCollectionIds.includes(visibleCollectionId)
		? visibleCollectionId
		: selectedCollectionIds[0] || '';
	const activeProfile = profiles.find(
		(profile) => String(profile.collection_id) === activeCollectionId
	);
	const mappings = activeProfile?.field_mappings || [];
	const fieldsById = useMemo(
		() =>
			nodes.reduce((result, node) => {
				(node?.data?.fields || []).forEach((field) => {
					result[String(field.id)] = {
						id: String(field.id),
						label: field?.config?.label || field?.title || String(field.id),
						type: field?.type || '',
						stageName: node?.data?.stageName || node?.id || '',
					};
				});
				return result;
			}, {}),
		[nodes]
	);
	const usedMetadataIds = new Set(
		mappings.map((mapping) => String(mapping.tainacan_metadata_id || ''))
	);

	if (!enabled || !selectedCollectionIds.length) {
		return null;
	}

	return (
		<Panel className="obatala-tainacan-mapping-summary">
			<PanelRow>
				<div className="flex-basis-100">
					<div className="obatala-tainacan-summary-header">
						<h3>{ __( 'Tainacan mapping summary', 'obatala' ) }</h3>
						<SelectControl
							label={ __( 'Collection', 'obatala' ) }
							hideLabelFromVision
							value={activeCollectionId}
							options={collections
								.filter((collection) =>
									selectedCollectionIds.includes(collection.id)
								)
								.map((collection) => ({
									label: collection.name,
									value: collection.id,
								}))}
							onChange={setVisibleCollectionId}
						/>
					</div>
					<table className="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<th>{ __( 'Obatala field', 'obatala' ) }</th>
								<th>{ __( 'Tainacan metadata', 'obatala' ) }</th>
							</tr>
						</thead>
						<tbody>
							{mappings.map((mapping) => {
								const fieldId = String(mapping.obatala_field.value);
								const field = fieldsById[fieldId] || {
									id: fieldId,
									label: mapping.obatala_field.label || fieldId,
									type: mapping.obatala_field.type || '',
									stageName: mapping.obatala_field.stage || '',
								};
								const currentMetadataId = String(
									mapping.tainacan_metadata_id || ''
								);
								return <tr key={fieldId}>
									<td>
										{field.label}
									</td>
									<td>
										<SelectControl
											label={ __( 'Tainacan metadata', 'obatala' ) }
											hideLabelFromVision
											value={currentMetadataId}
											options={(metadataByCollection[activeCollectionId] || []).map(
												(metadata) => ({
													label: metadata.name,
													value: metadata.id,
													disabled:
														String(metadata.id) !== currentMetadataId &&
														usedMetadataIds.has(String(metadata.id)),
												})
											)}
											onChange={(metadataId) =>
												updateFieldMapping({
													fieldId: field.id,
													fieldLabel: field.label,
													fieldType: field.type,
													stageName: field.stageName,
													collectionId: activeCollectionId,
													metadataId,
												})
											}
										/>
									</td>
								</tr>
							})}
							{!mappings.length && (
								<tr>
									<td colSpan="2">{ __( 'No fields mapped in this collection.', 'obatala' ) }</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</PanelRow>
		</Panel>
	);
};

export default TainacanMappingSummary;
