import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export const fetchProcessModels = () => {
	return apiFetch( {
		path: `/obatala/v1/process_type?per_page=100&_embed`,
	} ).then( ( data ) => {
		return data.map( ( item ) => {
			return {
				...item,
				description: item.meta.description
					? String( item.meta.description )
					: '',
				step_order: item.meta.step_order,
			};
		} );
	} );
};

export const fetchFieldsProcessModels = ( id ) => {
	return apiFetch( {
		path: `/obatala/v1/process_type/${ id }/fields`,
	} ).then( ( data ) => {
		return data;
	} );
};

export const fetchCollectionsTainacan = () => {
	return apiFetch( {
		path: `/obatala/v1/exporter/all_collections_tainacan`,
	} ).then( ( data ) => {
		return data;
	} );
};

export const fetchTainacanItemsCount = () => {
	return apiFetch( {
		path: `/tainacan/v2/items?perpage=1&status=publish,private,pending,draft&context=edit`,
		parse: false,
	} ).then( ( response ) => {
		return Number( response.headers.get( 'X-WP-Total' ) ) || 0;
	} );
};

export const fetchTainacanRepositoryItems = ( {
	page = 1,
	perPage = 10,
	search = '',
	scope = 'all',
	collectionId = '',
	status = '',
} = {} ) => {
	const params = new URLSearchParams( {
		page: String( page ),
		per_page: String( perPage ),
		scope,
	} );

	if ( search ) {
		params.set( 'search', search );
	}
	if ( collectionId ) {
		params.set( 'collection_id', collectionId );
	}
	if ( status ) {
		params.set( 'status', status );
	}

	return apiFetch( {
		path: `/obatala/v1/tainacan/items?${ params.toString() }`,
	} );
};

export const fetchObatalaTainacanItemById = ( itemId ) => {
	return apiFetch( { path: `/obatala/v1/tainacan/items/${ itemId }` } );
};

export const fetchTainacanItemById = ( itemId ) => {
	return apiFetch( { path: `/tainacan/v2/items/${ itemId }?context=edit` } );
};

export const deleteTainacanItem = ( itemId ) => {
	return apiFetch( {
		path: `/tainacan/v2/items/${ itemId }?permanently=0`,
		method: 'DELETE',
	} );
};

export const fetchMetadataCollectionsTainacan = ( id ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/get_metadata_collection/${ id }`,
	} ).then( ( data ) => {
		return data;
	} );
};

export const fetchMapperProcessModel = async ( id ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/get_mapper_process_type/${ id }`,
	} ).then( ( data ) => {
		return data;
	} );
};

export const fetchProcessExportRuntime = ( processId ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/process/${ processId }/runtime-config`,
		method: 'GET',
	} );
};

export const saveProcessExportInput = ( processId, input ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/process/${ processId }/input`,
		method: 'POST',
		data: { input },
	} );
};

export const fetchProcessSpreadsheetTemplate = ( processId ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/process/${ processId }/spreadsheet-template`,
		method: 'GET',
	} );
};

export const saveProcessManualItems = ( processId, rows ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/process/${ processId }/manual-items`,
		method: 'POST',
		data: { rows },
	} );
};

export const executeProcessExport = ( processId, force = false ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/process/${ processId }/execute`,
		method: 'POST',
		data: { force },
	} );
};

export const fetchProcessExportReview = ( processId, previewLimit = 20 ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/process/${ processId }/review?preview_limit=${ previewLimit }`,
		method: 'GET',
	} );
};

export const decideProcessExport = ( processId, decision, force = false ) => {
	return apiFetch( {
		path: `/obatala/v1/exporter/process/${ processId }/decision`,
		method: 'POST',
		data: { decision, force },
	} );
};

// Função para desserializar
const maybeUnserialize = ( data ) => {
	try {
		return JSON.parse( data );
	} catch ( e ) {
		return [];
	}
};

const debugApiRequest = async ( { path, method = 'GET', data } ) => {
	/* eslint-disable no-console, @wordpress/no-unused-vars-before-return --
	 * This temporary diagnostic intentionally logs malformed REST responses,
	 * including timing information collected before the request starts.
	 */
	const startedAt = performance.now();

	try {
		const response = await apiFetch( {
			path,
			method,
			data,
			parse: false,
		} );
		const rawBody = await response.text();

		if ( ! rawBody ) {
			return null;
		}

		try {
			return JSON.parse( rawBody );
		} catch ( parseError ) {
			console.group( 'Obatalá: resposta REST inválida' );
			console.error( 'A resposta não é um JSON válido.', parseError );
			console.log( 'URL:', response.url || path );
			console.log( 'Método:', method );
			console.log( 'Status:', response.status, response.statusText );
			console.log(
				'Content-Type:',
				response.headers.get( 'content-type' )
			);
			console.log(
				'Duração:',
				`${ Math.round( performance.now() - startedAt ) }ms`
			);
			console.log( 'Corpo bruto:', rawBody );
			console.groupEnd();

			throw new Error(
				`Resposta inválida em ${ method } ${ path }. HTTP ${ response.status }. Consulte o console.`
			);
		}
	} catch ( error ) {
		if ( error instanceof Response ) {
			const rawBody = await error.text();

			console.group( 'Obatalá: erro na requisição REST' );
			console.error( 'URL:', error.url || path );
			console.log( 'Método:', method );
			console.log( 'Status:', error.status, error.statusText );
			console.log( 'Content-Type:', error.headers.get( 'content-type' ) );
			console.log(
				'Duração:',
				`${ Math.round( performance.now() - startedAt ) }ms`
			);
			console.log( 'Corpo bruto:', rawBody );
			console.groupEnd();

			throw new Error(
				`Erro HTTP ${ error.status } em ${ method } ${ path }. Consulte o console.`
			);
		}

		throw error;
	}
	/* eslint-enable no-console, @wordpress/no-unused-vars-before-return */
};

export const saveProcessType = async ( processType, editingProcessType ) => {
	const path = editingProcessType
		? `/obatala/v1/process_type/${ editingProcessType.id }`
		: `/obatala/v1/process_type`;
	const method = editingProcessType ? 'PUT' : 'POST';
	const { meta = {}, ...postData } = processType || {};
	const savedProcessType = await debugApiRequest( {
		path,
		method,
		data: postData,
	} );
	const processTypeId = editingProcessType?.id || savedProcessType?.id;

	if ( ! processTypeId ) {
		throw new Error( __( 'Error saving process model.', 'obatala' ) );
	}

	if ( Object.keys( meta ).length > 0 ) {
		await debugApiRequest( {
			path: `/obatala/v1/process_type/${ processTypeId }/meta`,
			method: 'PUT',
			data: meta,
		} );
	}

	const persistedProcessType = await debugApiRequest( {
		path: `/obatala/v1/process_type/${ processTypeId }`,
	} );
	if ( Object.prototype.hasOwnProperty.call( meta, 'description' ) ) {
		const persistedDescription = Array.isArray(
			persistedProcessType?.meta?.description
		)
			? persistedProcessType.meta.description[ 0 ]
			: persistedProcessType?.meta?.description;
		if (
			String( persistedDescription || '' ) !==
			String( meta.description || '' )
		) {
			throw new Error( __( 'Error saving process model.', 'obatala' ) );
		}
	}

	return persistedProcessType;
};

export const updateProcessTypeMeta = ( id, meta ) => {
	return apiFetch( {
		path: `/obatala/v1/process_type/${ id }/meta`,
		method: 'PUT',
		data: meta,
	} );
};
export const fetchProcessTypeById = ( id ) => {
	return apiFetch( { path: `/obatala/v1/process_type/${ id }` } );
};
export const deleteProcessType = ( id ) => {
	return apiFetch( {
		path: `/obatala/v1/process_type/${ id }`,
		method: 'DELETE',
	} );
};

export const fetchProcesses = () => {
	return apiFetch( { path: `/obatala/v1/process_obatala?per_page=100` } );
};

export const fetchProcessById = ( id ) => {
	return apiFetch( { path: `/obatala/v1/process_obatala/${ id }` } );
};

export const deleteProcess = ( id ) => {
	return apiFetch( {
		path: `/obatala/v1/process_obatala/${ id }`,
		method: 'DELETE',
	} );
};

export const fetchUserProcesses = ( currentUserId ) => {
	return apiFetch( {
		path: `/obatala/v1/process_obatala/users?user_id=${ currentUserId }`,
	} );
};

export const fetchSectors = () => {
	return apiFetch( { path: `/obatala/v1/all_sector_obatala` } );
};

export const fetchSectorsUsers = () => {
	return apiFetch( {
		path: `/obatala/v1/sector_obatala/sectors_with_users`,
	} );
};

export const saveSector = async ( sector, editingSector ) => {
	const path = editingSector
		? `/obatala/v1/update_sector_obatala/${ editingSector.id }`
		: `/obatala/v1/create_sector_obatala`;
	const method = 'POST';
	return apiFetch( { path, method, data: sector } );
};

export const deleteSector = ( id ) => {
	return apiFetch( {
		path: `/obatala/v1/delete_sector_obatala/${ id }`,
		method: 'DELETE',
	} );
};

export const fetchUsers = () => {
	return apiFetch( { path: `/obatala/v1/sector_obatala/users_obatala` } );
};

export const fetchUsersBySector = ( id ) => {
	return apiFetch( { path: `/obatala/v1/sector_obatala/${ id }/users` } );
};

export const assignUserToSector = ( data ) => {
	const path = `/obatala/v1/associate_user_to_sector`;
	const method = 'POST';
	return apiFetch( { path, method, data } );
};

export const deleteSectorUser = ( sectorId, data ) => {
	return apiFetch( {
		path: `/obatala/v1/sector_obatala/${ sectorId }/remove_user`,
		method: 'POST',
		data,
	} );
};

export const fetchNodePermission = ( processId, currentUserId ) => {
	return apiFetch( {
		path: `/obatala/v1/process_type/${ processId }/get_node?user=${ currentUserId }`,
	} );
};

export const addComment = ( processId, data ) => {
	const path = `/obatala/v1/process_obatala/${ processId }/comment`;
	const method = 'POST';
	return apiFetch( { path, method, data } );
};

export const fetchProcessComments = ( processId, user_id ) => {
	return apiFetch( {
		path: `/obatala/v1/process_obatala/${ processId }/comments?user_id=${ user_id }`,
	} );
};
export const fetchProcess = ( processId ) => {
	return apiFetch( { path: `/obatala/v1/process_obatala/${ processId }` } );
};

export const deleteComment = ( commentId, user_id ) => {
	return apiFetch( {
		path: `/obatala/v1/process_obatala/comment/${ commentId }?user_id=${ user_id }`,
		method: 'DELETE',
	} );
};

export const updateComment = ( commentId, meta ) => {
	return apiFetch( {
		path: `/obatala/v1/process_obatala/comment/${ commentId }`,
		method: 'PUT',
		data: meta,
	} );
};

/**
 * Gera relatório PDF do processo e retorna { pdf: base64, filename }.
 * O frontend deve decodificar o base64, criar um Blob e disparar o download.
 *
 * @param {number} processId
 * @return {Promise<{ pdf: string, filename: string }>}
 */
export const fetchProcessReportPdf = ( processId ) => {
	return apiFetch( {
		path: `/obatala/v1/process_obatala/${ processId }/report-pdf`,
		method: 'GET',
	} );
};
