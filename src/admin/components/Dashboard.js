import React, { useState, useEffect, useMemo } from 'react';
import {
	Icon,
	Notice,
	Panel,
	PanelRow,
	PanelHeader,
	Spinner,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import {
	fetchProcessModels,
	fetchSectors,
	fetchSectorsUsers,
	fetchTainacanItemsCount,
} from '../api/apiRequests';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const DashboardPage = () => {
	const [ processTypes, setProcessTypes ] = useState( [] );
	const [ processes, setProcesses ] = useState( [] );
	const [ sectors, setSectors ] = useState( [] );
	const [ sectorsUsers, setSectorsUsers ] = useState( [] );
	const [ topModels, setTopModels ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ pendingProcesses, setPendingProcesses ] = useState( [] );
	const [ tainacanItemsCount, setTainacanItemsCount ] = useState( 0 );

	const currentUser = useSelect(
		( select ) => select( coreStore ).getCurrentUser(),
		[]
	);

	const unserializePHP = ( serializedData ) => {
		if ( ! serializedData ) {
			return {};
		}
		try {
			if ( typeof serializedData === 'object' ) {
				return serializedData;
			}
			if ( typeof serializedData === 'string' ) {
				const matches = serializedData.matchAll(
					/s:\d+:"([^"]+)";(b|i|s):([^;]+);/g
				);
				const result = {};

				for ( const match of matches ) {
					const key = match[ 1 ];
					const type = match[ 2 ];
					let value = match[ 3 ];

					if ( type === 'b' ) {
						value = value === '1';
					} else if ( type === 'i' ) {
						value = parseInt( value );
					}
					result[ key ] = value;
				}
				return result;
			}
		} catch {
			console.error( 'Error parsing PHP data:' );
		}
		return {};
	};

	const getProcessDetails = ( process ) => {
		try {
			if ( ! process.meta ) {
				return {
					percentage: 0,
					lastUpdate: null,
					currentStage: null,
				};
			}
			const { nodes, edges } = process.meta.flowData || {};
			const submittedStages = process.meta.submittedStages?.[ 0 ]
				? unserializePHP( process.meta.submittedStages[ 0 ] )
				: {};
			const stageData = process.meta.stageData?.[ 0 ]
				? unserializePHP( process.meta.stageData[ 0 ] )
				: {};
			// Determinar o caminho ativo (considerando condicionais)
			const activePathNodes = [];
			let currentNodeId = 'Start';

			while ( currentNodeId && currentNodeId !== 'End' ) {
				const currentNode = nodes?.find(
					( n ) => n.id === currentNodeId
				);
				if ( ! currentNode ) {
					break;
				}

				if ( currentNode.type === 'customNodeConditional' ) {
					const inputNodeId = currentNode.data?.condition?.inputNode;
					if ( inputNodeId ) {
						const inputStageName =
							nodes.find( ( n ) => n.id === inputNodeId )?.data
								?.stageName || inputNodeId;
						const submittedValue =
							submittedStages[ inputStageName ];
						const matchingOutput =
							currentNode.data?.condition?.outputNodes?.find(
								( output ) =>
									output.conditionValue === submittedValue
							);

						if ( matchingOutput ) {
							currentNodeId = matchingOutput.nodeId;
							continue;
						}
					}
				}

				// nós normais
				const nextEdge = edges?.find(
					( edge ) => edge.source === currentNodeId
				);
				if ( ! nextEdge ) {
					break;
				}

				currentNodeId = nextEdge.target;
				if (
					nodes?.some(
						( n ) =>
							n.id === currentNodeId &&
							n.type === 'customNode' &&
							! [ 'Start', 'End' ].includes( n.id ) &&
							! n.id.startsWith( 'Condicional' )
					)
				) {
					activePathNodes.push( currentNodeId );
				}
			}

			// Calcular porcentagem
			const validNodes =
				nodes?.filter(
					( node ) =>
						node.type === 'customNode' &&
						! [ 'Start', 'End' ].includes( node.id ) &&
						! node.id.startsWith( 'Condicional' )
				) || [];

			const completedCount = validNodes.reduce( ( count, node ) => {
				const stageName = node.data?.stageName || node.id;
				const isSubmitted =
					submittedStages[ stageName ] === true ||
					submittedStages[ stageName ] === '1' ||
					submittedStages[ stageName ] === 1;
				const isFinished = node.node_status === 'Finished';
				const isInActivePath = activePathNodes.includes( node.id );

				return (
					count +
					( isInActivePath && ( isSubmitted || isFinished ) ? 1 : 0 )
				);
			}, 0 );

			const totalActiveNodes = validNodes.filter( ( node ) =>
				activePathNodes.includes( node.id )
			).length;

			const percentage =
				totalActiveNodes > 0
					? Math.round( ( completedCount / totalActiveNodes ) * 100 )
					: 0;

			const currentStageRef = process.meta?.current_stage?.[ 0 ];
			let currentStage = null;
			let lastUpdate = process.modified;
			let currentStageId = null;

			if ( currentStageRef ) {
				const currentNode = getNodeByStageReference(
					nodes,
					currentStageRef
				);
				currentStageId = currentNode?.id || currentStageRef;
				currentStage = currentNode?.data?.stageName || currentStageRef;

				const stageUpdate =
					stageData[ currentStageId ]?.updateAt ||
					stageData[ currentStage ]?.updateAt;
				if ( stageUpdate ) {
					lastUpdate = stageUpdate;
				}
			}

			return {
				percentage,
				lastUpdate: formatDate( lastUpdate ),
				currentStage,
				currentStageId,
			};
		} catch {
			console.error( 'Error getting process details:' );
			return {
				percentage: 0,
				lastUpdate: null,
				currentStage: null,
				currentStageId: null,
			};
		}
	};

	const formatDate = ( dateString ) => {
		if ( ! dateString ) {
			return 'N/A';
		}

		try {
			const date = new Date( dateString );
			return date.toLocaleDateString( 'pt-BR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			} );
		} catch {
			console.error( 'Error formatting date:' );
			return dateString;
		}
	};

	useEffect( () => {
		loadProcessTypes();
		loadProcesses();
		loadSectors();
		loadSectorsUsers();
		loadTainacanItemsCount();
	}, [] );

	useEffect( () => {
		topFiveModels();
	}, [ processes ] );

	const loadProcessTypes = () => {
		setIsLoading( true );
		fetchProcessModels()
			.then( ( data ) => {
				setProcessTypes( data );
				setIsLoading( false );
			} )
			.catch( () => {
				console.error( 'Error fetching process types:' );
				setIsLoading( false );
			} );
	};

	const getNodeByStageReference = ( nodes, stageReference ) => {
		if ( ! Array.isArray( nodes ) || ! stageReference ) {
			return null;
		}

		return (
			nodes.find(
				( node ) =>
					node.id === stageReference ||
					node.data?.stageName === stageReference
			) || null
		);
	};

	const getFirstActionableNode = ( nodes, edges ) => {
		if ( ! Array.isArray( nodes ) || ! Array.isArray( edges ) ) {
			return null;
		}

		let currentNodeId = edges.find(
			( edge ) => edge.source === 'Start'
		)?.target;
		const guardLimit = nodes.length + edges.length + 1;
		let guard = 0;

		while ( currentNodeId && guard < guardLimit ) {
			const node = nodes.find( ( item ) => item.id === currentNodeId );
			if ( ! node ) {
				return null;
			}

			const isActionableNode =
				node.type === 'customNode' &&
				! [ 'Start', 'End' ].includes( node.id ) &&
				! String( node.id ).startsWith( 'Condicional' );

			if ( isActionableNode ) {
				return node;
			}

			if ( node.id === 'End' || node.type === 'endNode' ) {
				return null;
			}

			const nextEdge = edges.find(
				( edge ) => edge.source === currentNodeId
			);
			if ( ! nextEdge ) {
				return null;
			}

			currentNodeId = nextEdge.target;
			guard += 1;
		}

		return null;
	};

	const isUserAllowedInSector = ( sectorId ) => {
		if ( ! sectorId ) {
			return true;
		}

		return sectorsUsers.some(
			( sector ) =>
				String( sector.sector_id ) === String( sectorId ) &&
				sector.sector_status === 'Active' &&
				sector.users?.some( ( user ) => user.ID === currentUser?.id )
		);
	};

	// Função para verificar se um processo está pendente
	const isProcessPending = ( process ) => {
		if ( process.status !== 'publish' ) {
			return false;
		}

		const processStatus = process.meta?.status?.[ 0 ];
		const currentStageRef = process.meta?.current_stage?.[ 0 ];

		if ( processStatus === 'Finished' ) {
			return false;
		}

		if (
			! process.meta?.flowData?.nodes ||
			! process.meta?.flowData?.edges
		) {
			return false;
		}

		const nodes = process.meta.flowData.nodes;
		const edges = process.meta.flowData.edges;

		let currentNode = getNodeByStageReference( nodes, currentStageRef );
		if ( ! currentNode ) {
			currentNode = getFirstActionableNode( nodes, edges );
		}

		if (
			! currentNode ||
			currentNode.type === 'endNode' ||
			currentNode.id === 'End'
		) {
			return false;
		}

		return isUserAllowedInSector( currentNode.sector_obatala );
	};

	useEffect( () => {
		if ( ! currentUser?.id ) {
			return;
		}

		const loadPendingProcesses = async () => {
			setIsLoading( true );
			try {
				const processes = await apiFetch( {
					path: '/obatala/v1/process_obatala?per_page=100&_embed',
				} );

				const pending = processes
					.filter( isProcessPending )
					.slice( 0, 10 )
					.map( ( process ) => {
						const details = getProcessDetails( process );

						return {
							id: process.id,
							title: process.title?.rendered || 'Sem título',
							percentage: details.percentage,
							lastUpdate: details.lastUpdate,
							currentStage: details.currentStage,
							currentStageId: details.currentStageId,
							link:
								obatalaApp.admin_url +
								`admin.php?page=process-viewer&process_id=${ process.id }`,
						};
					} );

				setPendingProcesses( pending );
			} catch {
				console.error( 'Error loading pending processes:' );
			} finally {
				setIsLoading( false );
			}
		};

		loadPendingProcesses();
	}, [ currentUser?.id, sectorsUsers ] );

	const loadProcesses = async () => {
		setIsLoading( true );
		try {
			const data = await apiFetch( {
				path: `/obatala/v1/process_obatala?per_page=100&_embed`,
			} );
			if ( data && Array.isArray( data ) ) {
				setProcesses( data );
			} else {
				console.error( 'No processes data returned.' );
				setProcesses( [] );
			}
		} catch {
			console.error( 'Error fetching processes:' );
		} finally {
			setIsLoading( false );
		}
	};

	const loadSectors = () => {
		setIsLoading( true );
		fetchSectors()
			.then( ( data ) => {
				const sectors = Object.entries( data ).map(
					( [ key, value ] ) => ( {
						id: key,
						name: value.nome,
						description: value.descricao,
						status: value.status,
					} )
				);

				setSectors( sectors );
				setIsLoading( false );
			} )
			.catch( () => {
				console.error( 'Error fetching sectors:' );
				setIsLoading( false );
			} );
	};

	const loadSectorsUsers = () => {
		setIsLoading( true );
		fetchSectorsUsers()
			.then( ( data ) => {
				setSectorsUsers( data );
				setIsLoading( false );
			} )
			.catch( () => {
				console.error( 'Error fetching sectors:' );
				setIsLoading( false );
			} );
	};

	const loadTainacanItemsCount = () => {
		fetchTainacanItemsCount()
			.then( setTainacanItemsCount )
			.catch( () => {
				console.error( 'Error fetching Tainacan items count:' );
				setTainacanItemsCount( 0 );
			} );
	};

	const sectorsUserLogged = useMemo( () => {
		return sectorsUsers.filter( ( sector ) => {
			const matchesUser = currentUser?.id
				? sector?.users?.some(
						( user ) => user.ID === currentUser?.id
				  ) && sector?.sector_status === 'Active'
				: true;
			return matchesUser;
		} );
	}, [ sectorsUsers, currentUser ] );

	const matchesSectors = useMemo( () => {
		return sectors.filter( ( sector ) => {
			const matchesSector = sectorsUserLogged?.some(
				( sectorLogged ) => sectorLogged?.sector_id === sector?.id
			);
			return matchesSector;
		} );
	}, [ sectorsUserLogged, sectors ] );

	const topFiveModels = () => {
		try {
			setIsLoading( true );

			const modelCount = {};

			processes.map( ( process ) => {
				const modelId = process?.meta?.process_type[ 0 ];
				if ( modelId ) {
					if ( modelId ) {
						if ( ! modelCount[ modelId ] ) {
							modelCount[ modelId ] = 0;
						}
						modelCount[ modelId ] += 1;
					}
				}
			} );
			const sortedModels = Object.entries( modelCount )
				.sort( ( a, b ) => b[ 1 ] - a[ 1 ] )
				.slice( 0, 5 )
				.map( ( [ modelId, count ] ) => ( {
					modelId,
					count,
					modelName: getModelNameById( modelId ),
				} ) );

			setTopModels( sortedModels );
		} catch {
			console.error( 'Erro ao buscar dados dos processos:' );
		} finally {
			setIsLoading( false );
		}
	};

	const getModelNameById = ( modelId ) => {
		const model = processTypes.find( ( m ) => m.id.toString() === modelId );
		return model ? model.title.rendered : 'Desconhecido';
	};

	// Função para contar processos concluídos
	const countCompletedProcesses = useMemo( () => {
		const finishedProcesses = processes.filter( ( process ) => {
			const status = process?.meta?.status?.[ 0 ];
			return status === 'Finished';
		} );
		return finishedProcesses.length;
	}, [ processes ] );

	// Porcentagem de processos concluídos
	const completedProcessesPercentage = useMemo( () => {
		return processes.length
			? Math.round( ( countCompletedProcesses / processes.length ) * 100 )
			: 0;
	}, [ countCompletedProcesses, processes.length ] );

	const formattedTainacanItemsCount = useMemo( () => {
		return new Intl.NumberFormat(
			document.documentElement.lang || 'pt-BR'
		).format( tainacanItemsCount );
	}, [ tainacanItemsCount ] );

	if ( isLoading ) {
		return <Spinner />;
	}

	return (
		<>
			<BrandHeader />
			<div className="title-container">
				<h2>{ __( 'Dashboard', 'obatala' ) }</h2>
				<div
					className="stat"
					title={ `${ completedProcessesPercentage }%` }
				>
					<p className="description">
						{ sprintf(
							__( '%1$s/%2$s completed processes', 'obatala' ),
							countCompletedProcesses,
							processes.length
						) }
					</p>
					<progress value={ completedProcessesPercentage } max="100">
						{ completedProcessesPercentage }%
					</progress>
				</div>
			</div>
			<main>
				<div className="dashboard-container">
					<div className="dashboard-item-personal">
						<div className="card-container">
							<div className="card-item card-profile">
								<img
									src={ currentUser.avatar_urls?.[ 96 ] }
									className="user-photo"
									alt={ `Foto de ${ currentUser?.name }` }
								/>
								<span className="description">
									Olá, <strong>{ currentUser.name }</strong>!
								</span>
								{ matchesSectors.length > 0 && (
									<div className="badge-container">
										{ matchesSectors.map( ( sector ) => (
											<span className="badge info">
												<Icon icon="groups" />{ ' ' }
												{ sector.name }
											</span>
										) ) }
									</div>
								) }
							</div>
							{ pendingProcesses.length > 0 && (
								<Panel className="warning">
									<PanelHeader>
										{ __( 'Pending processes', 'obatala' ) }
									</PanelHeader>
									<PanelRow>
										{ pendingProcesses.length > 0 ? (
											<ul className="list-actions mb-0">
												{ pendingProcesses.map(
													( process ) => {
														return (
															<li
																key={
																	process.id
																}
															>
																<a
																	href={
																		process.link
																	}
																>
																	<span className="percent">
																		{
																			process.percentage
																		}
																		%
																	</span>
																	<span className="text">
																		{
																			process.title
																		}
																		<small className="d-block">
																			{ __(
																				'Current stage',
																				'obatala'
																			) }
																			:{ ' ' }
																			{ process.currentStage ||
																				'N/A' }
																		</small>
																	</span>
																	<Icon icon="arrow-right-alt2" />
																</a>
															</li>
														);
													}
												) }
											</ul>
										) : (
											<Notice
												status="info"
												isDismissible={ false }
											>
												{ __(
													'No pending processes found.',
													'obatala'
												) }
											</Notice>
										) }
									</PanelRow>
								</Panel>
							) }
						</div>
					</div>
					<div className="dashboard-item-stats">
						<div className="card-container dashboard-stats-cards">
							<a
								href={
									obatalaApp.admin_url +
									'admin.php?page=collection-items'
								}
								className="card-item"
							>
								<span className="description">
									{ __( 'Collection items', 'obatala' ) }
								</span>
								<span className="indicator">
									{ formattedTainacanItemsCount }{ ' ' }
									<Icon icon="archive" />
								</span>
							</a>
							<a
								href={
									obatalaApp.admin_url +
									'admin.php?page=process-manager'
								}
								className="card-item"
							>
								<span className="description">
									{ __( 'Processes', 'obatala' ) }
								</span>
								<span className="indicator">
									{ processes.length }{ ' ' }
									<Icon icon="admin-page" />
								</span>
							</a>
							<a
								href={
									obatalaApp.admin_url +
									'admin.php?page=process-type-manager'
								}
								className="card-item"
							>
								<span className="description">
									{ __( 'Models', 'obatala' ) }
								</span>
								<span className="indicator">
									{ processTypes.length }{ ' ' }
									<Icon icon="welcome-widgets-menus" />
								</span>
							</a>
							<a
								href={
									obatalaApp.admin_url +
									'admin.php?page=sector_manager'
								}
								className="card-item"
							>
								<span className="description">
									{ __( 'Groups', 'obatala' ) }
								</span>
								<span className="indicator">
									{ sectors.length } <Icon icon="groups" />
								</span>
							</a>
						</div>
						<div className="panel-container mt-2">
							<Panel>
								<PanelHeader>
									{ __(
										'Top 5 most used models',
										'obatala'
									) }
								</PanelHeader>
								<PanelRow>
									{ topModels.length > 0 ? (
										<div className="table-responsive">
											<table className="wp-list-table widefat striped table-view-list">
												<thead>
													<tr>
														<th>
															{ __(
																'Name',
																'obatala'
															) }
														</th>
														<th>
															{ __(
																'Quantity',
																'obatala'
															) }
														</th>
													</tr>
												</thead>
												<tbody>
													{ topModels.map(
														( sector ) => (
															<tr
																key={
																	sector.modelId
																}
															>
																<td>
																	{
																		sector.modelName
																	}
																</td>
																<td>
																	{
																		sector.count
																	}
																</td>
															</tr>
														)
													) }
												</tbody>
											</table>
										</div>
									) : (
										<Notice
											isDismissible={ false }
											status="warning"
										>
											{ __( 'No results.', 'obatala' ) }
										</Notice>
									) }
								</PanelRow>
							</Panel>
						</div>
					</div>
				</div>
			</main>
			<BrandFooter />
		</>
	);
};

export default DashboardPage;
