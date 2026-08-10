/* global obatalaApp */
import React, { useMemo } from 'react';
import { Button, Icon, Notice, Panel, PanelHeader, PanelRow, Spinner } from '@wordpress/components';
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
		publish: { label: __( 'Publicado', 'obatala' ), className: 'success' },
		pending: { label: __( 'Em revisão', 'obatala' ), className: 'warning' },
		draft: { label: __( 'Rascunho', 'obatala' ), className: 'default' },
		private: { label: __( 'Privado', 'obatala' ), className: 'info' },
	};

	return statuses[ status ] || { label: status || '-', className: 'default' };
};

const getProcessStatusDetails = ( process ) => {
	if ( process?.is_deleted ) {
		return { label: __( 'Excluído', 'obatala' ), className: 'danger' };
	}

	const group = process?.status_group || 'pending';
	const byGroup = {
		finished: { label: __( 'Concluído', 'obatala' ), className: 'success' },
		in_progress: { label: __( 'Em progresso', 'obatala' ), className: 'info' },
		pending: { label: __( 'Pendente', 'obatala' ), className: 'default' },
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
		__( 'Processo #%d', 'obatala' ),
		Number( process?.id ) || 0
	);

const getProcessTimestamp = ( process ) => {
	const value = process?.date || process?.modified_at || process?.created_at;
	const timestamp = value ? new Date( value ).getTime() : 0;

	return Number.isNaN( timestamp ) ? 0 : timestamp;
};

const getCurrentStageLabel = ( value ) => {
	const normalizedValue = String( value || '' ).trim().toLowerCase();

	if ( normalizedValue === 'end' ) {
		return __( 'Finalizado', 'obatala' );
	}

	if ( normalizedValue === 'start' ) {
		return __( 'Não iniciado', 'obatala' );
	}

	return value;
};

const InfoRow = ( { label, value } ) => {
	if ( value === undefined || value === null || String( value ).trim() === '' ) {
		return null;
	}

	return (
		<div className="list-item">
			<dt>{ label }</dt>
			<dd>{ value }</dd>
		</div>
	);
};

const TainacanItemTimeline = ( { item, isLoading, notice } ) => {
	const statusDetails = getItemStatusDetails( item?.status );
	const processes = Array.isArray( item?.processes ) ? item.processes : [];
	const metadata = Array.isArray( item?.metadata ) ? item.metadata : [];
	const processSummary = item?.process_summary || {};
	const title = getItemTitle( item );
	const tainacanUrl = getTainacanAdminUrl( item );
	const tainacanEditUrl = getTainacanEditUrl( item );
	const sortedProcesses = useMemo(
		() =>
			[ ...processes ].sort(
				( firstProcess, secondProcess ) =>
					getProcessTimestamp( secondProcess ) -
					getProcessTimestamp( firstProcess )
			),
		[ processes ]
	);

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
			<div className="title-container">
				<h2><small>{__('Item do acervo', 'obatala')}</small> { title }</h2>
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
								__( 'Registro: %s', 'obatala' ),
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
								__( 'Registrado em %s', 'obatala' ),
								formatDate( item.created )
							) }
						</span>
					) }
				</div>
				<div className="group-button">
					{ tainacanUrl && (
						<Button variant="primary" icon="external" href={ tainacanUrl }>
							{ __( 'Abrir no Tainacan', 'obatala' ) }
						</Button>
					) }
					{ tainacanEditUrl && item?.can_edit && (
						<Button variant="secondary" icon="edit" href={ tainacanEditUrl }>
							{ __( 'Editar item', 'obatala' ) }
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
					<div className="panel-container">
						<Panel>
							<PanelHeader>
								{ __( 'Linha do tempo do processo', 'obatala' ) }
								<span className="badge">
									{ sprintf(
										/* translators: %s: total linked processes. */
										__( '%s processos vinculados', 'obatala' ),
										formatCount( processes.length )
									) }
								</span>
							</PanelHeader>
							<PanelRow>
								{ sortedProcesses.length > 0 ? (
									<ol className="tainacan-item-process-timeline">
										{ sortedProcesses.map( ( process, index ) => {
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
															{ process.summary || __( 'Processo vinculado a este item.', 'obatala' ) }
														</p>

														<dl className="tainacan-item-process-meta">
															<InfoRow
																label={ __( 'Responsável', 'obatala' ) }
																value={ process.responsible }
															/>
															<InfoRow
																label={ __( 'Etapa atual', 'obatala' ) }
																value={ getCurrentStageLabel( process.current_stage_label ) }
															/>
															<InfoRow
																label={ __( 'Progresso', 'obatala' ) }
																value={
																	process.progress !== null && process.progress !== undefined
																		? `${ process.progress }%`
																		: ''
																}
															/>
														</dl>

														{ process.url && (
															<Button
																className="tainacan-item-view-process"
																variant="primary"
																icon="arrow-right-alt2"
																href={ process.url }
															>
																{ __( 'Ver processo', 'obatala' ) }
															</Button>
														) }
													</article>
												</li>
											);
										} ) }
									</ol>
								) : (
									<Notice status="warning" isDismissible={ false }>
										{ __( 'Nenhum processo vinculado foi encontrado para este item.', 'obatala' ) }
									</Notice>
								) }
							</PanelRow>
						</Panel>
						<aside>
							<Panel>
								<PanelHeader>{ __( 'Informações do item', 'obatala' ) }</PanelHeader>
								<PanelRow>
									<div className="tainacan-item-detail-thumbnail">
										{ item?.thumbnail ? (
											<img src={ item.thumbnail } alt={ item.thumbnail_alt || '' } />
										) : (
											<Icon icon="archive" />
										) }
									</div>
									<dl className="description-list">
										<InfoRow label={ __( 'Coleção', 'obatala' ) } value={ item?.collection_name } />
										<InfoRow label={ __( 'Número de registro', 'obatala' ) } value={ item?.registration_number } />
										<InfoRow label={ __( 'Situação', 'obatala' ) } value={ statusDetails.label } />
										<InfoRow label={ __( 'Criado em', 'obatala' ) } value={ formatDate( item?.created ) } />
										<InfoRow label={ __( 'Última atualização', 'obatala' ) } value={ formatDate( item?.modified ) } />
										<InfoRow label={ __( 'Autor', 'obatala' ) } value={ item?.author_name } />
									</dl>
									{ item?.description && (
										<div className="tainacan-item-description">
											<strong>{ __( 'Descrição', 'obatala' ) }</strong>
											<p>{ item.description }</p>
										</div>
									) }
								</PanelRow>
							</Panel>

							<section className="tainacan-item-info-panel">
								<h3>{ __( 'Processos vinculados', 'obatala' ) }</h3>
								<ul className="tainacan-process-summary-list">
									<li>
										<span>{ __( 'Concluído', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.finished ) }</strong>
									</li>
									<li>
										<span>{ __( 'Em progresso', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.in_progress ) }</strong>
									</li>
									<li>
										<span>{ __( 'Pendente', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.pending ) }</strong>
									</li>
									<li>
										<span>{ __( 'Total de processos', 'obatala' ) }</span>
										<strong>{ formatCount( processSummary.total ) }</strong>
									</li>
								</ul>
							</section>

							{ visibleMetadata.length > 0 && (
								<section className="tainacan-item-info-panel">
									<h3>{ __( 'Metadados', 'obatala' ) }</h3>
									<dl className="description-list">
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
