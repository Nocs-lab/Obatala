/* global obatalaApp */
import React, { useMemo } from 'react';
import { Button, Icon, Notice, Spinner } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

const getLocale = () => document.documentElement.lang || 'pt-BR';

const formatCount = ( value ) =>
	new Intl.NumberFormat( getLocale() ).format( Number( value ) || 0 );

const formatDate = ( value ) => {
	if ( ! value ) {
		return '-';
	}

	const date = new Date( value );
	if ( Number.isNaN( date.getTime() ) ) {
		return String( value );
	}

	return date.toLocaleString( getLocale(), {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	} );
};

const formatDateParts = ( value ) => {
	if ( ! value ) {
		return { date: '-', time: '' };
	}

	const date = new Date( value );
	if ( Number.isNaN( date.getTime() ) ) {
		return { date: String( value ), time: '' };
	}

	return {
		date: date.toLocaleDateString( getLocale(), {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		} ),
		time: date.toLocaleTimeString( getLocale(), {
			hour: '2-digit',
			minute: '2-digit',
		} ),
	};
};

const getItemStatusDetails = ( status ) => {
	const statuses = {
		publish: { label: __( 'Published', 'obatala' ), className: 'success' },
		pending: { label: __( 'Under review', 'obatala' ), className: 'warning' },
		draft: { label: __( 'Draft', 'obatala' ), className: 'default' },
		private: { label: __( 'Private', 'obatala' ), className: 'info' },
	};

	return statuses[ status ] || { label: status || '-', className: 'default' };
};

const getProcessStatusDetails = ( process ) => {
	if ( process?.is_deleted ) {
		return { label: __( 'Deleted', 'obatala' ), className: 'danger' };
	}

	const group = process?.status_group || 'pending';
	const byGroup = {
		finished: { label: __( 'Completed', 'obatala' ), className: 'success' },
		in_progress: { label: __( 'In progress', 'obatala' ), className: 'info' },
		pending: { label: __( 'Pending', 'obatala' ), className: 'default' },
	};

	return byGroup[ group ] || byGroup.pending;
};

const getProcessMarkerIcon = ( process ) => {
	if ( process?.status_group === 'finished' ) {
		return 'yes';
	}
	if ( process?.status_group === 'in_progress' ) {
		return 'update';
	}
	return 'clock';
};

const getTainacanAdminUrl = ( item ) => {
	if ( ! item?.id || ! item?.collection_id ) {
		return '';
	}

	return `${ obatalaApp.admin_url }admin.php?page=tainacan_admin#/collections/${ item.collection_id }/items/${ item.id }`;
};

const getTainacanEditUrl = ( item ) => {
	if ( ! item?.id || ! item?.collection_id ) {
		return '';
	}

	return `${ getTainacanAdminUrl( item ) }/edit`;
};

const getItemTitle = ( item ) =>
	item?.title ||
	sprintf(
		/* translators: %d: Tainacan item ID. */
		__( 'Item #%d', 'obatala' ),
		Number( item?.id ) || 0
	);

const getProcessTitle = ( process ) =>
	[ process?.number, process?.title ].filter( Boolean ).join( ' - ' ) ||
	sprintf(
		/* translators: %d: Obatala process ID. */
		__( 'Process #%d', 'obatala' ),
		Number( process?.id ) || 0
	);

const InfoRow = ( { label, value } ) => {
	if ( value === undefined || value === null || String( value ).trim() === '' ) {
		return null;
	}

	return (
		<div className="tainacan-item-info-row">
			<dt>{ label }</dt>
			<dd>{ value }</dd>
		</div>
	);
};

const TainacanItemTimeline = ( { item, isLoading, notice, onBack } ) => {
	const statusDetails = getItemStatusDetails( item?.status );
	const processes = Array.isArray( item?.processes ) ? item.processes : [];
	const metadata = Array.isArray( item?.metadata ) ? item.metadata : [];
	const processSummary = item?.process_summary || {};
	const title = getItemTitle( item );
	const tainacanUrl = getTainacanAdminUrl( item );
	const tainacanEditUrl = getTainacanEditUrl( item );

	const visibleMetadata = useMemo( () => {
		const hiddenSlugs = new Set( [
			'numero-de-registro',
			'numero-do-registro',
			'numero-registro',
			'n-de-registro',
			'no-de-registro',
			'registration-number',
			'record-number',
		] );

		return metadata.filter( ( field ) => ! hiddenSlugs.has( field.slug ) );
	}, [ metadata ] );

	return (
		<>
			<div className="title-container tainacan-item-detail-title">
				<div>
					<Button
						className="tainacan-item-detail-back"
						variant="tertiary"
						icon="arrow-left-alt2"
						onClick={ onBack }
					>
						{ __( 'Collection items', 'obatala' ) }
					</Button>
					<h2>{ title }</h2>
					<div className="badge-container">
						{ item?.collection_name && (
							<span className="badge info">
								{ item.collection_name }
							</span>
						) }
						{ item?.registration_number && (
							<span className="badge default">
								{ sprintf(
									/* translators: %s: item registration number. */
									__( 'Record: %s', 'obatala' ),
									item.registration_number
								) }
							</span>
						) }
						<span className={ `badge ${ statusDetails.className }` }>
							{ statusDetails.label }
						</span>
						{ item?.created && (
							<span className="badge default">
								{ sprintf(
									/* translators: %s: item creation date. */
									__( 'Registered on %s', 'obatala' ),
									formatDate( item.created )
								) }
							</span>
						) }
					</div>
				</div>
				<div className="group-button">
					{ tainacanUrl && (
						<Button variant="tertiary" icon="external" href={ tainacanUrl }>
							{ __( 'Open in Tainacan', 'obatala' ) }
						</Button>
					) }
					{ tainacanEditUrl && item?.can_edit && (
						<Button variant="primary" icon="edit" href={ tainacanEditUrl }>
							{ __( 'Edit item', 'obatala' ) }
						</Button>
					) }
				</div>
			</div>

			<main className="tainacan-item-detail-page">
				{ notice && (
					<Notice status={ notice.status } isDismissible={ false }>
						{ notice.message }
					</Notice>
				) }

				{ isLoading && ! item ? (
					<div className="tainacan-items-loading">
						<Spinner />
					</div>
				) : ! item ? null : (
					<div className="tainacan-item-detail-grid">
						<section className="tainacan-item-timeline-section">
							<div className="tainacan-item-section-heading">
								<h3>{ __( 'Process timeline', 'obatala' ) }</h3>
								<span>
									{ sprintf(
										/* translators: %s: total linked processes. */
										__( '%s linked processes', 'obatala' ),
										formatCount( processes.length )
									) }
								</span>
							</div>

							{ processes.length > 0 ? (
								<ol className="tainacan-item-process-timeline">
									{ processes.map( ( process, index ) => {
										const processStatus = getProcessStatusDetails( process );
										const parts = formatDateParts(
											process.date || process.modified_at || process.created_at
										);

										return (
											<li
												className={ `tainacan-item-process-entry ${ process.status_group || 'pending' }` }
												key={ `${ process.id || process.url }-${ index }` }
											>
												<div className="tainacan-item-process-date">
													<strong>{ parts.date }</strong>
													{ parts.time && <span>{ parts.time }</span> }
												</div>
												<div className="tainacan-item-process-marker">
													<Icon icon={ getProcessMarkerIcon( process ) } />
												</div>
												<article className="tainacan-item-process-card">
													<header>
														<div>
															<h4>{ getProcessTitle( process ) }</h4>
															{ process.process_type && (
																<p>{ process.process_type }</p>
															) }
														</div>
														<span className={ `badge ${ processStatus.className }` }>
															{ processStatus.label }
														</span>
													</header>

													<p className="tainacan-item-process-summary">
														{ process.summary || __( 'Process linked to this item.', 'obatala' ) }
													</p>

													<dl className="tainacan-item-process-meta">
														<InfoRow
															label={ __( 'Responsible', 'obatala' ) }
															value={ process.responsible }
														/>
														<InfoRow
															label={ __( 'Current step', 'obatala' ) }
															value={ process.current_stage_label }
														/>
														<InfoRow
															label={ __( 'Progress', 'obatala' ) }
															value={
																process.progress !== null && process.progress !== undefined
																	? `${ process.progress }%`
																	: ''
															}
														/>
													</dl>

													{ process.url && (
														<Button variant="link" icon="arrow-right-alt2" href={ process.url }>
															{ __( 'View process', 'obatala' ) }
														</Button>
													) }
												</article>
											</li>
										);
									} ) }
								</ol>
							) : (
								<Notice status="warning" isDismissible={ false }>
									{ __( 'No linked processes were found for this item.', 'obatala' ) }
								</Notice>
							) }
						</section>

						<aside className="tainacan-item-detail-sidebar">
							<section className="tainacan-item-info-panel">
								<h3>{ __( 'Item information', 'obatala' ) }</h3>
								<div className="tainacan-item-info-main">
									<div className="tainacan-item-detail-thumbnail">
										{ item?.thumbnail ? (
											<img src={ item.thumbnail } alt={ item.thumbnail_alt || '' } />
										) : (
											<Icon icon="archive" />
										) }
									</div>
									<dl>
										<InfoRow label={ __( 'Collection', 'obatala' ) } value={ item?.collection_name } />
										<InfoRow label={ __( 'Record number', 'obatala' ) } value={ item?.registration_number } />
										<InfoRow label={ __( 'Situation', 'obatala' ) } value={ statusDetails.label } />
										<InfoRow label={ __( 'Created at', 'obatala' ) } value={ formatDate( item?.created ) } />
										<InfoRow label={ __( 'Last update', 'obatala' ) } value={ formatDate( item?.modified ) } />
										<InfoRow label={ __( 'Author', 'obatala' ) } value={ item?.author_name } />
									</dl>
								</div>
								{ item?.description && (
									<div className="tainacan-item-description">
										<strong>{ __( 'Description', 'obatala' ) }</strong>
										<p>{ item.description }</p>
									</div>
								) }
							</section>

							<section className="tainacan-item-info-panel">
								<h3>{ __( 'Linked processes', 'obatala' ) }</h3>
								<ul className="tainacan-process-summary-list">
									<li>
										<span>{ __( 'Completed', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.finished ) }</strong>
									</li>
									<li>
										<span>{ __( 'In progress', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.in_progress ) }</strong>
									</li>
									<li>
										<span>{ __( 'Pending', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.pending ) }</strong>
									</li>
									<li>
										<span>{ __( 'Total processes', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.total ) }</strong>
									</li>
								</ul>
							</section>

							{ visibleMetadata.length > 0 && (
								<section className="tainacan-item-info-panel">
									<h3>{ __( 'Metadata', 'obatala' ) }</h3>
									<dl className="tainacan-item-metadata-list">
										{ visibleMetadata.map( ( field ) => (
											<InfoRow key={ `${ field.id }-${ field.slug }` } label={ field.name } value={ field.value } />
										) ) }
									</dl>
								</section>
							) }
						</aside>
					</div>
				) }
			</main>
		</>
	);
};

export default TainacanItemTimeline;
