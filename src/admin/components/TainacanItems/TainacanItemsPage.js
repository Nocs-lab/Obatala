/* global obatalaApp */
/* eslint-disable import/no-extraneous-dependencies, @wordpress/no-unsafe-wp-apis, no-nested-ternary */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	Button,
	Icon,
	Notice,
	Panel,
	PanelRow,
	Spinner,
	TextControl,
	Tooltip,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { download, info } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import BrandFooter from '../BrandFooter';
import BrandHeader from '../BrandHeader';
import TainacanItemsFilters from './TainacanItemsFilters';
import TainacanItemTimeline from './TainacanItemTimeline';
import {
	deleteTainacanItem,
	fetchObatalaTainacanItemById,
	fetchTainacanItemById,
	fetchTainacanRepositoryItems,
} from '../../api/apiRequests';

const ITEMS_PER_PAGE = 8;

const getLocale = () => document.documentElement.lang || 'pt-BR';

const formatCount = ( value ) =>
	new Intl.NumberFormat( getLocale() ).format( Number( value ) || 0 );

const formatDate = ( value ) => {
	if ( ! value ) {
		return '-';
	}
	const date = new Date( value );
	if ( Number.isNaN( date.getTime() ) ) {
		return value;
	}

	return date.toLocaleString( getLocale(), {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	} );
};

const getStatusDetails = ( status ) => {
	const statuses = {
		publish: { label: __( 'Publicado', 'obatala' ), className: 'success' },
		pending: {
			label: __( 'Em revisão', 'obatala' ),
			className: 'warning',
		},
		draft: { label: __( 'Rascunho', 'obatala' ), className: '' },
		private: { label: __( 'Privado', 'obatala' ), className: 'info' },
	};

	return statuses[ status ] || { label: status || '-', className: '' };
};

const getTainacanAdminUrl = ( path ) =>
	`${ obatalaApp.admin_url }admin.php?page=tainacan_admin#${ path }`;

const getObatalaItemUrl = ( itemId ) =>
	`${ obatalaApp.admin_url }admin.php?page=collection-items&item_id=${ itemId }`;

const getSelectedItemIdFromUrl = () =>
	new URLSearchParams( window.location.search ).get( 'item_id' ) || '';

const TainacanItemsPage = () => {
	const [ items, setItems ] = useState( [] );
	const [ collections, setCollections ] = useState( [] );
	const [ total, setTotal ] = useState( 0 );
	const [ totalPages, setTotalPages ] = useState( 0 );
	const [ page, setPage ] = useState( 1 );
	const [ scope, setScope ] = useState( 'all' );
	const [ searchInput, setSearchInput ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ collectionId, setCollectionId ] = useState( '' );
	const [ status, setStatus ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ downloadingItemId, setDownloadingItemId ] = useState( null );
	const [ selectedItemId, setSelectedItemId ] = useState(
		getSelectedItemIdFromUrl
	);
	const [ selectedItem, setSelectedItem ] = useState( null );
	const [ isDetailLoading, setIsDetailLoading ] = useState( false );
	const [ detailNotice, setDetailNotice ] = useState( null );
	const [ itemToDelete, setItemToDelete ] = useState( null );
	const [ isDeleting, setIsDeleting ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	const loadItems = useCallback( async () => {
		setIsLoading( true );
		try {
			const response = await fetchTainacanRepositoryItems( {
				page,
				perPage: ITEMS_PER_PAGE,
				search,
				scope,
				collectionId,
				status,
			} );

			setItems( Array.isArray( response?.items ) ? response.items : [] );
			setCollections(
				Array.isArray( response?.collections )
					? response.collections
					: []
			);
			setTotal( Number( response?.total ) || 0 );
			setTotalPages( Number( response?.total_pages ) || 0 );
		} catch {
			setItems( [] );
			setTotal( 0 );
			setTotalPages( 0 );
			setNotice( {
				status: 'error',
				message: __( 'Error loading collection items.', 'obatala' ),
			} );
		} finally {
			setIsLoading( false );
		}
	}, [ collectionId, page, scope, search, status ] );

	useEffect( () => {
		if ( selectedItemId ) {
			return;
		}

		loadItems();
	}, [ loadItems, selectedItemId ] );

	useEffect( () => {
		const timer = window.setTimeout( () => {
			setPage( 1 );
			setSearch( searchInput.trim() );
		}, 350 );

		return () => window.clearTimeout( timer );
	}, [ searchInput ] );

	useEffect( () => {
		const handlePopState = () => {
			setSelectedItemId( getSelectedItemIdFromUrl() );
		};

		window.addEventListener( 'popstate', handlePopState );

		return () => window.removeEventListener( 'popstate', handlePopState );
	}, [] );

	useEffect( () => {
		if ( ! selectedItemId ) {
			setSelectedItem( null );
			setDetailNotice( null );
			setIsDetailLoading( false );
			return;
		}

		let isMounted = true;
		setIsDetailLoading( true );
		setDetailNotice( null );

		fetchObatalaTainacanItemById( selectedItemId )
			.then( ( data ) => {
				if ( isMounted ) {
					setSelectedItem( data );
				}
			} )
			.catch( () => {
				if ( isMounted ) {
					setSelectedItem( null );
					setDetailNotice( {
						status: 'error',
						message: __( 'Error loading item details.', 'obatala' ),
					} );
				}
			} )
			.finally( () => {
				if ( isMounted ) {
					setIsDetailLoading( false );
				}
			} );

		return () => {
			isMounted = false;
		};
	}, [ selectedItemId ] );

	const statusOptions = useMemo(
		() => [
			{ label: __( 'Todas as situações', 'obatala' ), value: '' },
			{ label: __( 'Publicado', 'obatala' ), value: 'publish' },
			{ label: __( 'Em revisão', 'obatala' ), value: 'pending' },
			{ label: __( 'Rascunho', 'obatala' ), value: 'draft' },
			{ label: __( 'Privado', 'obatala' ), value: 'private' },
		],
		[]
	);

	const handleFilterChange = () => {
		setPage( 1 );
	};

	const handleOpenItemDetail = useCallback( ( item ) => {
		const nextItemId = String( item?.id || '' );
		if ( ! nextItemId ) {
			return;
		}

		setSelectedItem( item );
		setSelectedItemId( nextItemId );
		window.history.pushState( {}, '', getObatalaItemUrl( nextItemId ) );
	}, [] );

	const handleDownload = async ( item ) => {
		setDownloadingItemId( item.id );
		setNotice( null );
		try {
			const data = await fetchTainacanItemById( item.id );
			const blob = new Blob( [ JSON.stringify( data, null, 2 ) ], {
				type: 'application/json',
			} );
			const url = window.URL.createObjectURL( blob );
			const link = document.createElement( 'a' );
			link.href = url;
			link.download = `tainacan-item-${ item.id }.json`;
			document.body.appendChild( link );
			link.click();
			document.body.removeChild( link );
			window.URL.revokeObjectURL( url );
		} catch {
			setNotice( {
				status: 'error',
				message: __( 'Erro ao baixar os dados do item.', 'obatala' ),
			} );
		} finally {
			setDownloadingItemId( null );
		}
	};

	const handleDelete = async () => {
		if ( ! itemToDelete ) {
			return;
		}

		setIsDeleting( true );
		setNotice( null );
		try {
			await deleteTainacanItem( itemToDelete.id );
			const shouldReturnToPreviousPage = items.length === 1 && page > 1;
			setNotice( {
				status: 'success',
				message: __( 'Item excluído com sucesso.', 'obatala' ),
			} );
			setItemToDelete( null );
			if ( shouldReturnToPreviousPage ) {
				setPage( ( currentPage ) => currentPage - 1 );
			} else {
				await loadItems();
			}
		} catch {
			setNotice( {
				status: 'error',
				message: __( 'Erro ao excluir o item.', 'obatala' ),
			} );
		} finally {
			setIsDeleting( false );
		}
	};

	const renderProcessesLink = ( item ) => {
		const processCount = Array.isArray( item.processes )
			? item.processes.length
			: 0;
		const label =
			processCount === 1
				? sprintf(
						/* translators: %s: number of linked processes. */
						__( '%s processo', 'obatala' ),
						formatCount( processCount )
				  )
				: sprintf(
						/* translators: %s: number of linked processes. */
						__( '%s processos', 'obatala' ),
						formatCount( processCount )
				  );

		if ( processCount === 0 ) {
			return (
				<span>
					{ label }
				</span>
			);
		}

		return (
			<Button variant="link" onClick={ () => handleOpenItemDetail( item ) }>
				{ label }
			</Button>
		);
	};

	if ( selectedItemId ) {
		return (
			<>
				<BrandHeader />
				<TainacanItemTimeline
					item={ selectedItem }
					isLoading={ isDetailLoading }
					notice={ detailNotice }
				/>
				<BrandFooter />
			</>
		);
	}

	return (
		<>
			<BrandHeader />
			<div className="title-container">
				<h2>{ __( 'Itens da coleção', 'obatala' ) }</h2>
				<span className="badge default">{ formatCount( total ) }</span>
			</div>
			<main className="tainacan-items-page">
				{ notice && (
					<Notice
						status={ notice.status }
						isDismissible
						onRemove={ () => setNotice( null ) }
					>
						{ notice.message }
					</Notice>
				) }

				<Panel>
					<PanelRow>
						<div className="container_searchAndSelect">
							<TextControl
								className="mb-1"
								label={ __(
									'Buscar itens da coleção',
									'obatala'
								) }
								hideLabelFromVision
								value={ searchInput }
								onChange={ setSearchInput }
								placeholder={ __(
									'Buscar por título, número de registro ou palavra-chave',
									'obatala'
								) }
								type="search"
							/>
							<TainacanItemsFilters
								collectionId={ collectionId }
								setCollectionId={ setCollectionId }
								status={ status }
								setStatus={ setStatus }
								collections={ collections }
								statusOptions={ statusOptions }
								onFilterChange={ handleFilterChange }
							/>
						</div>

						{ isLoading ? (
							<div className="tainacan-items-loading">
								<Spinner />
							</div>
						) : items.length > 0 ? (
							<>
								<div className="table-responsive">
									<table className="wp-list-table widefat striped table-view-list tainacan-items-table">
										<thead>
											<tr>
												<th>
													{ __(
														'Item',
														'obatala'
													) }
												</th>
												<th>
													{ __(
														'Coleção',
														'obatala'
													) }
												</th>
												<th>
													{ __(
														'Situação',
														'obatala'
													) }
												</th>
												<th>
													{ __(
														'Processos vinculados',
														'obatala'
													) }
												</th>
												<th>
													{ __(
														'Última atualização',
														'obatala'
													) }
												</th>
												<th>
													{ __(
														'Ações',
														'obatala'
													) }
												</th>
											</tr>
										</thead>
										<tbody>
											{ items.map( ( item ) => {
												const statusDetails =
													getStatusDetails(
														item.status
													);
												const itemDetailsUrl =
													getTainacanAdminUrl(
														`/collections/${ item.collection_id }/items/${ item.id }`
													);

												return (
													<tr key={ item.id }>
														<td>
															<div className="tainacan-item-summary">
																<div className="tainacan-item-thumbnail">
																	{ item.thumbnail ? (
																		<img
																			src={
																				item.thumbnail
																			}
																			alt={
																				item.thumbnail_alt ||
																				''
																			}
																		/>
																	) : (
																		<Icon icon="archive" />
																	) }
																</div>
																<a
															href={ getObatalaItemUrl( item.id ) }
															onClick={ ( event ) => {
																event.preventDefault();
																handleOpenItemDetail( item );
															} } >
																	{ item.title ||
																		sprintf(
																			/* translators: %d: Tainacan item ID. */
																			__(
																				'Item #%d',
																				'obatala'
																			),
																			item.id
																		) }
																</a>
															</div>
														</td>
														<td>
															{ item.collection_name ||
																'-' }
														</td>
														<td>
															<span
																className={ `badge ${ statusDetails.className }` }
															>
																{
																	statusDetails.label
																}
															</span>
														</td>
														<td>
															{ renderProcessesLink(
																item
															) }
														</td>
														<td>
															<span className="tainacan-item-update">
																{ formatDate(
																	item.modified
																) }
																{ item.modified_by && (
																	<small>
																		{ sprintf(
																			/* translators: %s: user display name. */
																			__(
																				'por %s',
																				'obatala'
																			),
																			item.modified_by
																		) }
																	</small>
																) }
															</span>
														</td>
														<td>
															<div className="group-button">
																<Button
																	variant="primary"
																	icon={ info }
																	onClick={ () =>
																		handleOpenItemDetail( item )
																	}
																>
																	{ __( 'Ver item', 'obatala' ) }
																</Button>
																<Tooltip
																	text={ __( 'Abrir no Tainacan', 'obatala' ) }
																>
																	<Button
																		variant="tertiary"
																		icon="external"
																		href={ itemDetailsUrl }
																	/>
																</Tooltip>
																<Tooltip
																	text={ __(
																		'Baixar dados do item',
																		'obatala'
																	) }
																>
																	<Button
																		variant="tertiary"
																		icon={
																			download
																		}
																		onClick={ () =>
																			handleDownload(
																				item
																			)
																		}
																		isBusy={
																			downloadingItemId ===
																			item.id
																		}
																		disabled={
																			downloadingItemId ===
																			item.id
																		}
																	/>
																</Tooltip>
															</div>
														</td>
													</tr>
												);
											} ) }
										</tbody>
									</table>
								</div>

								<div className="pagination">
									<Button
										onClick={ () =>
											setPage(
												( value ) => value - 1
											)
										}
										disabled={ page <= 1 }
									>
										{ __( 'Previous', 'obatala' ) }
									</Button>
									<span>
										{ sprintf(
											/* translators: 1: current page number, 2: total pages. */
											__(
												'Page %1$s of %2$s',
												'obatala'
											),
											page,
											totalPages || 1
										) }
									</span>
									<Button
										onClick={ () =>
											setPage(
												( value ) => value + 1
											)
										}
										disabled={ page >= totalPages }
									>
										{ __( 'Next', 'obatala' ) }
									</Button>
								</div>
							</>
						) : (
							<Notice
								isDismissible={ false }
								status="warning"
							>
								{ __(
									'No collection items found.',
									'obatala'
								) }
							</Notice>
						) }
					</PanelRow>
				</Panel>

				<ConfirmDialog
					isOpen={ !! itemToDelete }
					onConfirm={ handleDelete }
					onCancel={ () => setItemToDelete( null ) }
					confirmButtonText={ __( 'Excluir', 'obatala' ) }
					cancelButtonText={ __( 'Cancelar', 'obatala' ) }
					isBusy={ isDeleting }
				>
					{ sprintf(
						/* translators: %s: item title. */
						__(
							'Tem certeza de que deseja excluir o item %s?',
							'obatala'
						),
						itemToDelete?.title || ''
					) }
				</ConfirmDialog>
			</main>
			<BrandFooter />
		</>
	);
};

export default TainacanItemsPage;
