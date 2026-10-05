import React, {
	createContext,
	forwardRef,
	useContext,
	useEffect,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import {
	fetchCollectionsTainacan,
	fetchMapperProcessModel,
	fetchMetadataCollectionsTainacan,
} from '../../../api/apiRequests';

const TainacanExportContext = createContext(null);
const PROFILE_SELECTOR_FIELD_ID = 'obatala_ctrl_collection_selector';
const LEGACY_CONTROL_FIELD_IDS = new Set([
	PROFILE_SELECTOR_FIELD_ID,
	'obatala_ctrl_quantity',
	'obatala_ctrl_multi_or_single',
	'obatala_ctrl_entry_mode',
	'obatala_ctrl_spreadsheet_upload',
	'obatala_ctrl_same_values_mode',
	'obatala_ctrl_unique_id',
	'obatala_ctrl_use_prefix',
	'obatala_ctrl_prefix_text',
]);
const CONTROL_DECISION_RULES = {
	quantity_field_id: 'obatala_ctrl_quantity',
	quantity_fallback: '1',
	multi_or_single_field_id: 'obatala_ctrl_multi_or_single',
	data_entry_mode_field_id: 'obatala_ctrl_entry_mode',
	spreadsheet_upload_field_id: 'obatala_ctrl_spreadsheet_upload',
	same_values_mode_field_id: 'obatala_ctrl_same_values_mode',
	same_values_unique_id_field_id: 'obatala_ctrl_unique_id',
	same_values_prefix_mode_field_id: 'obatala_ctrl_use_prefix',
	same_values_prefix_text_field_id: 'obatala_ctrl_prefix_text',
	same_values_id_prefix: '',
	multi_items_value: 'Sim',
	single_item_value: 'Não',
	upload_mode_value: 'Planilha',
	fill_mode_value: 'Manual',
	same_values_enabled_value: 'Sim',
};

const parseMappingData = (mappingData) => {
	if (!mappingData) {
		return {};
	}
	if (typeof mappingData === 'object') {
		return mappingData;
	}
	try {
		return JSON.parse(mappingData);
	} catch (error) {
		console.error('Erro ao interpretar o mapeamento do Tainacan:', error);
		return {};
	}
};

const normalizeStatus = (status) => {
	const normalized = String(status || '').toLowerCase();
	if (normalized === 'draft' || normalized === 'rascunho') {
		return 'draft';
	}
	return normalized === 'enabled' || normalized === 'habilitado'
		? 'enabled'
		: 'disabled';
};

const getCollectionData = (collection) => ({
	id: String(collection?.WP_Post?.ID || ''),
	name: String(collection?.WP_Post?.post_title || ''),
});

const getMetadataData = (metadata) => ({
	id: String(metadata?.WP_Post?.ID || ''),
	name: String(metadata?.WP_Post?.post_title || ''),
});

export const TainacanExportProvider = forwardRef(
	({ processTypeId, children, onStatusChange, onNotice, available = true }, ref) => {
		const [isLoading, setIsLoading] = useState(true);
		const [isPanelOpen, setIsPanelOpen] = useState(
			new URLSearchParams(window.location.search).get('section') === 'export'
		);
		const [status, setStatus] = useState('disabled');
		const [collections, setCollections] = useState([]);
		const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
		const [profiles, setProfiles] = useState([]);
		const [savedMappings, setSavedMappings] = useState({});
		const [metadataByCollection, setMetadataByCollection] = useState({});
		const enabled = status !== 'disabled';

		useEffect(() => {
			if ( ! available ) {
				setIsLoading( false );
				return undefined;
			}
			let active = true;
			setIsLoading(true);
			Promise.all([
				fetchCollectionsTainacan(),
				fetchMapperProcessModel(processTypeId),
			])
				.then(([collectionResponse, mapperResponse]) => {
					if (!active) {
						return;
					}
					const parsed = parseMappingData(mapperResponse?.mapping_data);
					const mappings = parsed?.mappings || parsed || {};
					const loadedProfiles = Array.isArray(mappings?.profiles)
						? mappings.profiles
						: [];
					const loadedStatus = normalizeStatus(mappings?.status);
					setCollections(
						(collectionResponse || [])
							.map(getCollectionData)
							.filter((collection) => collection.id)
					);
					setProfiles(loadedProfiles);
					setSelectedCollectionIds(
						loadedProfiles
							.map((profile) => String(profile?.collection_id || ''))
							.filter(Boolean)
					);
					setStatus(loadedStatus);
					setSavedMappings(mappings);
					onStatusChange?.(loadedStatus);
				})
				.catch((error) => {
					console.error('Erro ao carregar configuração do Tainacan:', error);
					onNotice?.({
						status: 'error',
						message: __( 'Could not load the Tainacan configuration.', 'obatala' ),
					});
				})
				.finally(() => {
					if (active) {
						setIsLoading(false);
					}
				});
			return () => {
				active = false;
			};
		}, [processTypeId, available]);

		useEffect(() => {
			if (!enabled) {
				return;
			}
			selectedCollectionIds.forEach((collectionId) => {
				if (metadataByCollection[collectionId]) {
					return;
				}
				fetchMetadataCollectionsTainacan(collectionId)
					.then((response) => {
						setMetadataByCollection((previous) => ({
							...previous,
							[collectionId]: (response || [])
								.map(getMetadataData)
								.filter((metadata) => metadata.id),
						}));
					})
					.catch((error) => {
						console.error('Erro ao carregar metadados do Tainacan:', error);
					});
			});
		}, [enabled, selectedCollectionIds, metadataByCollection]);

		const collectionById = useMemo(
			() =>
				collections.reduce((result, collection) => {
					result[collection.id] = collection;
					return result;
				}, {}),
			[collections]
		);

		const setEnabled = (isEnabled) => {
			const nextStatus = isEnabled ? 'enabled' : 'disabled';
			setStatus(nextStatus);
			onStatusChange?.(nextStatus);
		};

		const setSelectedCollections = (options) => {
			const nextIds = (options || []).map((option) => String(option.value));
			setSelectedCollectionIds(nextIds);
			setProfiles((previousProfiles) =>
				nextIds.map((collectionId) => {
					const existing = previousProfiles.find(
						(profile) =>
							String(profile?.collection_id || '') === collectionId
					);
					return (
						existing || {
							key: `collection_${collectionId}`,
							collection_id: collectionId,
							collection_name:
								collectionById[collectionId]?.name ||
								sprintf(__('Collection %s', 'obatala'), collectionId),
							field_mappings: [],
						}
					);
				})
			);
		};

		const getFieldMapping = (fieldId) => {
			for (const profile of profiles) {
				const mapping = (profile?.field_mappings || []).find(
					(item) =>
						String(item?.obatala_field?.value || '') === String(fieldId)
				);
				if (mapping) {
					return {
						collectionId: String(profile.collection_id),
						metadataId: String(mapping.tainacan_metadata_id || ''),
					};
				}
			}
			return { collectionId: '', metadataId: '' };
		};

		const updateFieldMapping = ({
			fieldId,
			fieldLabel,
			fieldType,
			stageName,
			collectionId,
			metadataId,
		}) => {
			setProfiles((previousProfiles) => {
				const hasMetadataConflict = metadataId && previousProfiles.some(
					(profile) =>
						String(profile.collection_id) === String(collectionId) &&
						(profile.field_mappings || []).some(
							(mapping) =>
								String(mapping.tainacan_metadata_id) === String(metadataId) &&
								String(mapping?.obatala_field?.value || '') !== String(fieldId)
						)
				);
				if (hasMetadataConflict) {
					return previousProfiles;
				}

				return previousProfiles.map((profile) => {
					const withoutField = (profile.field_mappings || []).filter(
						(mapping) =>
							String(mapping?.obatala_field?.value || '') !==
							String(fieldId)
					);
					if (
						String(profile.collection_id) !== String(collectionId) ||
						!metadataId
					) {
						return { ...profile, field_mappings: withoutField };
					}
					return {
						...profile,
						field_mappings: [
							...withoutField,
							{
								obatala_field: {
									value: String(fieldId),
									label: fieldLabel || String(fieldId),
									type: fieldType || '',
									stage: stageName || '',
								},
								tainacan_metadata_id: String(metadataId),
							},
						],
					};
				});
			});
		};

		const removeFieldMapping = (fieldId) => {
			updateFieldMapping({
				fieldId,
				collectionId: '',
				metadataId: '',
			});
		};

		const getNormalizedProfiles = () =>
			profiles
				.filter((profile) =>
					selectedCollectionIds.includes(String(profile.collection_id))
				)
				.map((profile) => ({
					...profile,
					collection_name:
						collectionById[String(profile.collection_id)]?.name ||
						profile.collection_name,
				}));

		const prepareFlowData = (flowData) => {
			const normalized = JSON.parse( JSON.stringify( flowData || { nodes: [], edges: [] } ) );
			normalized.nodes = Array.isArray( normalized.nodes ) ? normalized.nodes : [];
			normalized.nodes = normalized.nodes.map( ( node ) => ( {
				...node,
				data: {
					...( node.data || {} ),
					fields: Array.isArray( node?.data?.fields )
						? node.data.fields.filter( ( field ) => ! LEGACY_CONTROL_FIELD_IDS.has( String( field?.id || '' ) ) )
						: [],
				},
			} ) );
			return normalized;
		};

		const save = async () => {
			const normalizedProfiles = getNormalizedProfiles();
			if (enabled && !normalizedProfiles.length) {
				throw new Error(
					__( 'Select at least one target collection to configure the mapper.', 'obatala' )
				);
			}
			const response = await apiFetch({
				path: '/obatala/v1/exporter/save_mapping_data',
				method: 'POST',
				data: {
					process_model_id: Number(processTypeId),
					mappings: {
						...savedMappings,
						status,
						profile_selector_field_id: PROFILE_SELECTOR_FIELD_ID,
						decision_rules: {
							...(savedMappings?.decision_rules || {}),
							...CONTROL_DECISION_RULES,
						},
						profiles: normalizedProfiles,
					},
				},
			});
			if (!response?.success) {
				throw new Error(
					response?.message || __( 'Could not save the mapping.', 'obatala' )
				);
			}
			const savedStatus = response?.mapper_status || status;
			setStatus(savedStatus);
			onStatusChange?.(savedStatus);
			setSavedMappings((previous) => ({
				...previous,
				status: savedStatus,
				profiles: normalizedProfiles,
			}));
			return response;
		};

		useImperativeHandle(ref, () => ({ save, prepareFlowData }));

		const value = {
			available,
			isLoading,
			isPanelOpen,
			togglePanel: () => setIsPanelOpen((previous) => !previous),
			enabled,
			setEnabled,
			collections,
			selectedCollectionIds,
			setSelectedCollections,
			profiles,
			metadataByCollection,
			getFieldMapping,
			updateFieldMapping,
			removeFieldMapping,
		};

		return (
			<TainacanExportContext.Provider value={value}>
				{children}
			</TainacanExportContext.Provider>
		);
	}
);

export const useTainacanExport = () => {
	const context = useContext(TainacanExportContext);
	if (!context) {
		throw new Error(
			'useTainacanExport deve ser usado dentro de TainacanExportProvider'
		);
	}
	return context;
};
