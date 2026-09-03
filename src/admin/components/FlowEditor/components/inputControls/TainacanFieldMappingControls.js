import React, { useEffect, useState } from 'react';
import { SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useTainacanExport } from '../../context/TainacanExportContext';

const TainacanFieldMappingControls = ({
	fieldId,
	fieldLabel,
	fieldType,
	stageName,
}) => {
	const {
		enabled,
		available,
		collections,
		selectedCollectionIds,
		metadataByCollection,
		profiles,
		getFieldMapping,
		updateFieldMapping,
	} = useTainacanExport();
	const initialMapping = getFieldMapping(fieldId);
	const [collectionId, setCollectionId] = useState(initialMapping.collectionId);
	const [metadataId, setMetadataId] = useState(initialMapping.metadataId);
	const [isChoosingMapping, setIsChoosingMapping] = useState(false);

	useEffect(() => {
		if (isChoosingMapping) {
			return;
		}
		const current = getFieldMapping(fieldId);
		setCollectionId(current.collectionId);
		setMetadataId(current.metadataId);
	}, [fieldId, profiles, isChoosingMapping]);

	if (!available || !enabled || !selectedCollectionIds.length) {
		return null;
	}

	const collectionOptions = [
		{ label: __( 'Não mapear este campo', 'obatala' ), value: '' },
		...collections
			.filter((collection) => selectedCollectionIds.includes(collection.id))
			.map((collection) => ({
				label: collection.name,
				value: collection.id,
			})),
	];
	const metadataOptions = [
		{ label: __( 'Selecione o metadado', 'obatala' ), value: '' },
		...(metadataByCollection[collectionId] || []).map((metadata) => ({
			label: metadata.name,
			value: metadata.id,
			disabled: profiles.some(
				(profile) =>
					String(profile.collection_id) === String(collectionId) &&
					(profile.field_mappings || []).some(
						(mapping) =>
							String(mapping.tainacan_metadata_id) === String(metadata.id) &&
							String(mapping?.obatala_field?.value || '') !== String(fieldId)
					)
			),
		})),
	];

	const persistMapping = (nextCollectionId, nextMetadataId) => {
		updateFieldMapping({
			fieldId,
			fieldLabel,
			fieldType,
			stageName,
			collectionId: nextCollectionId,
			metadataId: nextMetadataId,
		});
	};

	return (
		<fieldset className="obatala-tainacan-field-mapping">
			<legend>{ __( 'Tainacan Export', 'obatala' ) }</legend>
			<SelectControl
				label={ __( 'Coleção de destino', 'obatala' ) }
				value={collectionId}
				options={collectionOptions}
				onChange={(value) => {
					setCollectionId(value);
					setMetadataId('');
					if (!value) {
						setIsChoosingMapping(false);
						persistMapping('', '');
						return;
					}
					setIsChoosingMapping(true);
				}}
			/>
			<SelectControl
				label={ __( 'Metadado de destino', 'obatala' ) }
				value={metadataId}
				options={metadataOptions}
				disabled={!collectionId}
				onChange={(value) => {
					setMetadataId(value);
					if (value) {
						persistMapping(collectionId, value);
						setIsChoosingMapping(false);
					}
				}}
			/>
		</fieldset>
	);
};

export default TainacanFieldMappingControls;
