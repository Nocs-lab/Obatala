import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import {
	Icon,
	Spinner,
	Notice,
	Panel,
	PanelHeader,
	PanelRow,
	Button,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import MetroNavigation from './ProcessManager/MetroNavigation';
import MetaFieldInputs from './ProcessManager/MetaFieldInputs';
import CommentForm from './ProcessManager/CommentForm';
import ProcessUserLog from './ProcessManager/ProcessUserLog';
import {
	fetchNodePermission,
	fetchProcessById,
	fetchProcessTypeById,
	fetchSectors,
} from '../api/apiRequests';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import MetaFieldDisplay from './ProcessManager/MetaFieldDisplay';
import ProcessHeader from './ProcessManager/ProcessHeader';
import HistoryViewer from './ProcessManager/HistoryViewer';
import BrandHeader from './BrandHeader';
import BrandFooter from './BrandFooter';

const ProcessViewer = () => {
	const [ process, setProcess ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ filteredProcessType, setFilteredProcessType ] = useState( null );
	const [ submittedSteps, setSubmittedSteps ] = useState( {} );
	const [ formValues, setFormValues ] = useState( {} );
	const [ isSubmitEnabled, setIsSubmitEnabled ] = useState( false );
	const [ flowNodes, setFlowNodes ] = useState( [] );
	const [ orderedSteps, setOrderedSteps ] = useState( [] );
	const [ sectors, setSectors ] = useState( [] );
	const [ sectorUser, setSectorUser ] = useState( [] );
	const [ hasPermission, setHasPermission ] = useState( false );
	const [ isPublic, setIsPublic ] = useState( false );
	const [ currentStageData, setCurrentStageData ] = useState( {} );
	const [ stageMetaData, setStageMetaData ] = useState( {} );
	const [ uploadedFiles, setUploadedFiles ] = useState( {} );
	const [ fileInfo, setFileInfo ] = useState( {} );
	const [ notice, setNotice ] = useState( null );
	const [ progress, setProgress ] = useState( 0 );
	const [ hasComments, setHasComments ] = useState( false );
	const [ activeIndex, setActiveIndex ] = useState( null );

	const currentUser = useSelect(
		( select ) => select( coreStore ).getCurrentUser(),
		[]
	);
	const allAuthors = useSelect(
		( select ) => select( coreStore ).getUsers( { who: 'authors' } ),
		[]
	);
	const [ isStepSubmitEnabled, setIsStepSubmitEnabled ] = useState( {} );

	const urlParams = new URLSearchParams( window.location.search );
	const viewMode = urlParams.get( 'view' );

	const [ isProcessLoading, setIsProcessLoading ] = useState( true );

	const toggleAccordion = ( index ) => {
		setActiveIndex( activeIndex === index ? null : index );
		setCurrentStep( index );
	};

	const getProcessIdFromUrl = () => {
		const urlParams = new URLSearchParams( window.location.search );
		return urlParams.get( 'process_id' );
	};
	const processId = getProcessIdFromUrl();

	useEffect( () => {
		if ( ! processId ) return;

		const initializeNodeData = async () => {
			try {
				setIsLoading( true );

				await apiFetch( {
					path: `/obatala/v1/process_obatala/${ processId }/node`,
					method: 'PUT',
				} );

				await fetchUpdatedProcessNodes();
				//await fetchMetaData(processId, orderedSteps);
			} catch ( err ) {
				setError(
					err.message || __( 'Error fetching node data.', 'obatala' )
				);
			} finally {
				setIsLoading( false );
			}
		};

		initializeNodeData();
	}, [ processId ] );

	useEffect( () => {
		if ( processId && orderedSteps.length > 0 ) {
			fetchMetaData( processId, orderedSteps );
		}
	}, [ orderedSteps ] );

	useEffect( () => {
		if ( ! currentUser ) {
			return;
		}
		const processId = getProcessIdFromUrl();
		if ( processId ) {
			setIsLoading( true );
			loadSectors();
			fetchProcessById( processId )
				.then( ( data ) => {
					setProcess( data );
					setIsPublic(
						data.meta?.access_level?.[ 0 ] === 'Not restricted' ||
							data.meta?.access_level?.[ 0 ] === 'not restricted'
					);

					const processTypeId = data.meta.process_type;
					if ( processTypeId ) {
						fetchProcessTypeById( processTypeId )
							.then( ( processType ) => {
								setFilteredProcessType( processType );
							} )
							.catch( ( error ) => {
								console.error(
									'Error fetching process type:',
									error
								);
								setError(
									__(
										'Error fetching process type.',
										'obatala'
									)
								);
							} );
					} else {
					}
				} )
				.catch( ( error ) => {
					console.error( 'Error fetching process:', error );
					setError(
						__( 'Error fetching process details.', 'obatala' )
					);
				} )
				.finally( () => setIsProcessLoading( false ) );
			fetchNodePermission( processId, currentUser.id )
				.then( ( result ) => {
					setHasPermission( result.status );
					setSectorUser( result.data_sector );
				} )
				.catch( ( error ) => {
					console.error( 'Error fetching process:', error );
					setError( __( 'Error fetching process meta.', 'obatala' ) );
				} )
				.finally( () => {
					setIsLoading( false );
				} );
		} else {
			setError( __( 'No process ID found in the URL.', 'obatala' ) );
		}
	}, [ currentUser ] );

	const fetchUpdatedProcessNodes = async () => {
		try {
			const response = await apiFetch( {
				path: `/obatala/v1/process_obatala/${ processId }/node`,
				method: 'GET',
			} );

			setOrderedSteps( response.ordered_nodes ); // <- pega apenas os nós ordenados
			setProgress( response.progress );
		} catch ( error ) {
			console.error( 'Erro ao buscar etapas atualizadas:', error );
		}
	};

	const loadSectors = () => {
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
			} )
			.catch( ( error ) => {
				console.error( 'Error fetching sectors:', error );
			} );
	};

	const getSectorName = ( sectorId ) => {
		const sector = sectors.find( ( sector ) => sector.id === sectorId );
		return sector ? sector.name : __( 'Unknown', 'obatala' );
	};

	const stripHtml = ( value ) =>
		String( value || '' )
			.replace( /<[^>]*>/g, '' )
			.replace( /&nbsp;/g, ' ' )
			.trim();

	const normalizeDocumentValue = ( value, field = {} ) => {
		const firstValue = Array.isArray( value ) ? value[ 0 ] : value;
		if ( firstValue && typeof firstValue === 'object' ) {
			return firstValue;
		}
		const templateText = field.config?.templateText || '';
		return {
			content:
				typeof firstValue === 'string' && firstValue
					? firstValue
					: templateText,
			status: firstValue || templateText ? 'draft' : 'empty',
		};
	};

	const fieldHasValue = ( field, value ) => {
		if ( field.type === 'stage_document' ) {
			const documentValue = normalizeDocumentValue( value, field );
			return stripHtml( documentValue.content ) !== '';
		}
		if ( value instanceof FileList ) {
			return value.length > 0;
		}
		if ( Array.isArray( value ) ) {
			return value.some( ( item ) => fieldHasValue( field, item ) );
		}
		return value !== undefined && value !== null && value !== '';
	};

	const getStepValues = ( stepId, values = formValues ) =>
		values[ stepId ] || {};

	const isStepReadyToSubmit = (
		stepIndex = currentStep,
		values = formValues
	) => {
		const step = orderedSteps[ stepIndex ];
		if ( ! step?.data?.fields ) {
			return false;
		}

		const stepValues = getStepValues( step.id, values );
		return step.data.fields.every( ( field ) => {
			const value =
				stepValues[ field.id ] ||
				uploadedFiles[ step.id ]?.[ field.id ]?.[ 0 ]?.name;

			if ( field.type === 'stage_document' ) {
				const documentValue = normalizeDocumentValue( value, field );
				if (
					field.config?.requireSignedUpload &&
					! documentValue.signedFile?.name
				) {
					return false;
				}
			}

			if ( ! field.config?.required ) {
				return true;
			}

			return fieldHasValue( field, value );
		} );
	};

	const fetchMetaData = async ( processId, steps ) => {
		try {
			const metaData = await apiFetch( {
				path: `/obatala/v1/process_obatala/${ processId }/meta`,
			} );

			const submittedState = metaData.submittedStages || {};

			const updatedSubmittedSteps = steps.reduce(
				( acc, step, index ) => {
					if ( submittedState[ step.id ] ) {
						acc[ index ] = true;
					}
					return acc;
				},
				{}
			);

			setSubmittedSteps( ( prev ) => ( {
				...prev,
				...updatedSubmittedSteps,
			} ) );

			const stageData = metaData.stageData || {};
			setStageMetaData( stageData );

			const updatedFormValues = steps.reduce( ( acc, step ) => {
				if (
					stageData[ step.id ] &&
					Array.isArray( stageData[ step.id ].fields )
				) {
					acc[ step.id ] = stageData[ step.id ].fields.reduce(
						( acc, field ) => {
							acc[ field.fieldId ] = field.value || '';
							return acc;
						},
						{}
					);
				}
				return acc;
			}, {} );

			setFormValues( ( prev ) => ( { ...prev, ...updatedFormValues } ) );

			const updateCurrentStageData = steps.reduce( ( acc, step ) => {
				if ( stageData[ step.id ]?.updateAt ) {
					acc[ step.id ] = [
						stageData[ step.id ].updateAt,
						stageData[ step.id ].user,
					];
				}
				return acc;
			}, {} );

			setCurrentStageData( updateCurrentStageData );
		} catch ( error ) {
			console.error( 'Error fetching meta data:', error );
			setError( 'Error fetching meta data.' );
		}
	};

	const handleFieldChange = ( fieldId, newValue ) => {
		const stepId = orderedSteps[ currentStep ].id;

		if ( newValue instanceof FileList ) {
			const file = newValue[ 0 ];
			setUploadedFiles( ( prev ) => ( {
				...prev,
				[ stepId ]: {
					...prev[ stepId ],
					[ fieldId ]: [ file ],
				},
			} ) );
			setFileInfo( ( prev ) => ( {
				...prev,
				[ stepId ]: {
					...prev[ stepId ],
					[ fieldId ]: { name: file.name, size: file.size },
				},
			} ) );
		} else {
			const valueToSave = Array.isArray( newValue )
				? newValue
				: [ newValue ];

			setFormValues( ( prevValues ) => ( {
				...prevValues,
				[ stepId ]: {
					...prevValues[ stepId ],
					[ fieldId ]: valueToSave,
				},
			} ) );
		}

		const updatedValues =
			newValue instanceof FileList
				? formValues
				: {
						...formValues,
						[ stepId ]: {
							...formValues[ stepId ],
							[ fieldId ]: Array.isArray( newValue )
								? newValue
								: [ newValue ],
						},
				  };
		const allFieldsFilled = isStepReadyToSubmit(
			currentStep,
			updatedValues
		);
		setIsStepSubmitEnabled( ( prevState ) => ( {
			...prevState,
			[ currentStep ]: allFieldsFilled,
		} ) );

		setIsSubmitEnabled( allFieldsFilled );
	};

	const getCurrentStepFields = () => {
		const stepId = orderedSteps[ currentStep ].id;
		return orderedSteps[ currentStep ].data.fields.map( ( field ) => {
			const value =
				formValues[ stepId ]?.[ field.id ] ||
				uploadedFiles[ stepId ]?.[ field.id ]?.[ 0 ]?.name;

			return {
				fieldId: field.id,
				value:
					field.type === 'stage_document'
						? [ normalizeDocumentValue( value, field ) ]
						: value,
			};
		} );
	};

	const handleSaveDraft = async () => {
		setIsLoading( true );
		const stepId = orderedSteps[ currentStep ].id;

		try {
			const existingMetaData = await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/meta`,
				method: 'GET',
			} );

			const updatedStageData = {
				...existingMetaData.stageData,
				[ stepId ]: {
					...existingMetaData.stageData?.[ stepId ],
					fields: getCurrentStepFields(),
					draftUpdateAt: new Date(),
					draftUser: currentUser.name,
				},
			};
			const submittedStages = existingMetaData.submittedStages || {};

			await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/meta`,
				method: 'POST',
				data: {
					stageData: updatedStageData,
					submittedStages,
					process_type: process.meta?.process_type,
				},
			} );

			setStageMetaData( updatedStageData );
			setFormValues( ( prev ) => ( {
				...prev,
				[ stepId ]: getCurrentStepFields().reduce( ( acc, field ) => {
					acc[ field.fieldId ] = field.value || '';
					return acc;
				}, {} ),
			} ) );
			setNotice( {
				status: 'success',
				message: __( 'Draft saved successfully.', 'obatala' ),
			} );
		} catch ( error ) {
			setNotice( {
				status: 'error',
				message:
					error.message ||
					__( 'Could not save the draft.', 'obatala' ),
			} );
		} finally {
			setIsLoading( false );
		}
	};

	const handleSubmit = async ( e ) => {
		e.preventDefault();
		setIsLoading( true );

		const stepId = orderedSteps[ currentStep ].id;
		const currentStage = orderedSteps[ currentStep ]?.data?.stageName;
		const group = getSectorName(
			orderedSteps[ currentStep ].sector_obatala
		);
		const fields = getCurrentStepFields();

		// Upload de arquivos
		let uploadFailed = false;

		if ( uploadedFiles[ stepId ] ) {
			for ( const [ fieldId, files ] of Object.entries(
				uploadedFiles[ stepId ]
			) ) {
				if (
					! files ||
					! Array.isArray( files ) ||
					files.length === 0
				) {
					continue;
				}

				const file = files[ 0 ];
				const formData = new FormData();
				formData.append( 'file', file );
				formData.append( 'id', process.id );
				formData.append( 'node_id', stepId );

				try {
					const response = await apiFetch( {
						path: `/obatala/v1/process_type/upload`,
						method: 'POST',
						headers: {
							'X-WP-Nonce': ObatalaApi.nonce,
						},
						body: formData,
					} );
					setFormValues( ( prev ) => ( {
						...prev,
						[ stepId ]: {
							...prev[ stepId ],
							[ fieldId ]: file.name,
						},
					} ) );

					setNotice( {
						status: 'success',
						message: 'Uploaded successfully.',
					} );
					setFileInfo( { name: file.name, size: file.size } );
				} catch ( error ) {
					setNotice( {
						status: 'error',
						message: `Erro ao enviar arquivo para o campo ${ fieldId }: ${ error }`,
					} );
					uploadFailed = true;
					break;
				}
			}

			if ( uploadFailed ) {
				setIsLoading( false );
				return;
			}
		}

		// Salvar metadados
		try {
			const existingMetaData = await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/meta`,
				method: 'GET',
			} );

			const updatedStageData = {
				...existingMetaData.stageData,
				[ stepId ]: {
					fields,
					updateAt: new Date(),
					user: currentUser.name,
				},
			};

			await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/meta`,
				method: 'POST',
				data: {
					stageData: updatedStageData,
					submittedStages: {
						...existingMetaData.submittedStages,
						[ stepId ]: true,
					},
					current_stage: currentStage,
					groupResponsible: group,
				},
			} );

			setSubmittedSteps( ( prev ) => ( {
				...prev,
				[ currentStep ]: true,
			} ) );

			setCurrentStageData( ( prev ) => ( {
				...prev,
				[ stepId ]: [ new Date(), currentUser.name ],
			} ) );

			//
			await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/node`,
				method: `PUT`,
				data: {
					node_id: stepId,
				},
			} );
			await fetchUpdatedProcessNodes();
		} catch ( error ) {
			console.error( 'Erro ao salvar metadados:', error );
		} finally {
			setIsLoading( false );
		}
	};

	const handleDownload = async ( fieldId ) => {
		try {
			const stepId = orderedSteps[ currentStep ].id;
			const file =
				formValues[ stepId ]?.[ fieldId ] ||
				uploadedFiles[ stepId ]?.[ fieldId ]?.[ 0 ]?.name;

			if ( ! file ) {
				setNotice( {
					status: 'error',
					message: 'Arquivo não encontrado para download.',
				} );
				return;
			}
			const params = new URLSearchParams( {
				id: process.id,
				user: currentUser.id,
				file,
				node_id: stepId,
			} );
			const response = await apiFetch( {
				path: `/obatala/v1/process_type/download?${ params }`,
				method: 'GET',
				parse: false,
			} );

			const blob = await response.blob();
			const url = window.URL.createObjectURL( blob );
			const link = document.createElement( 'a' );
			link.href = url;

			//Pega nome do arquivo
			const contentDisposition = response.headers.get(
				'content-disposition'
			);
			const fileName = contentDisposition
				? contentDisposition
						.split( 'filename=' )[ 1 ]
						?.replace( /"/g, '' ) || 'download.pdf'
				: 'download.pdf';

			link.setAttribute( 'download', fileName );
			document.body.appendChild( link );
			link.click();
			document.body.removeChild( link );
			window.URL.revokeObjectURL( url );
		} catch ( error ) {
			if (
				error.status === 403 ||
				( error?.error && error?.error === 'Permissao negada' )
			) {
				setNotice( {
					status: 'error',
					message: 'Você não tem permissão para baixar este arquivo.',
				} );
			} else {
				setNotice( {
					status: 'error',
					message: 'Ocorreu um erro ao tentar baixar o arquivo.',
				} );
			}
			console.error( 'Erro ao tentar baixar o arquivo:', error );
		}
	};

	const downloadBase64Pdf = ( pdf, filename ) => {
		const byteCharacters = atob( pdf );
		const byteNumbers = Array.from( byteCharacters, ( char ) =>
			char.charCodeAt( 0 )
		);
		const byteArray = new Uint8Array( byteNumbers );
		const blob = new Blob( [ byteArray ], { type: 'application/pdf' } );
		const url = window.URL.createObjectURL( blob );
		const link = document.createElement( 'a' );
		link.href = url;
		link.download = filename || 'stage-document.pdf';
		document.body.appendChild( link );
		link.click();
		document.body.removeChild( link );
		window.URL.revokeObjectURL( url );
	};

	const setStageDocumentValue = ( stepId, fieldId, documentValue ) => {
		setFormValues( ( prev ) => ( {
			...prev,
			[ stepId ]: {
				...prev[ stepId ],
				[ fieldId ]: [ documentValue ],
			},
		} ) );
	};

	const handleGenerateStageDocumentPdf = async ( stepId, fieldId ) => {
		try {
			const params = new URLSearchParams( {
				node_id: stepId,
				field_id: fieldId,
			} );
			const response = await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/stage-document-pdf?${ params }`,
				method: 'GET',
			} );

			downloadBase64Pdf( response.pdf, response.filename );
			if ( response.document ) {
				setStageDocumentValue( stepId, fieldId, response.document );
			}
			setNotice( {
				status: 'success',
				message: __(
					'Document PDF generated successfully.',
					'obatala'
				),
			} );
		} catch ( error ) {
			setNotice( {
				status: 'error',
				message:
					error.message ||
					__( 'Could not generate the document PDF.', 'obatala' ),
			} );
		}
	};

	const handleSignedDocumentUpload = async ( stepId, fieldId, file ) => {
		try {
			const formData = new FormData();
			formData.append( 'file', file );
			formData.append( 'node_id', stepId );
			formData.append( 'field_id', fieldId );

			const response = await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/stage-document-signed`,
				method: 'POST',
				headers: {
					'X-WP-Nonce': ObatalaApi.nonce,
				},
				body: formData,
			} );

			if ( response.document ) {
				setStageDocumentValue( stepId, fieldId, response.document );
			}
			await fetchUpdatedProcessNodes();
			setNotice( {
				status: 'success',
				message: __( 'Signed PDF attached successfully.', 'obatala' ),
			} );
		} catch ( error ) {
			setNotice( {
				status: 'error',
				message:
					error.message ||
					__( 'Could not attach the signed PDF.', 'obatala' ),
			} );
		}
	};

	const handleDownloadSignedDocument = async ( stepId, fieldId ) => {
		try {
			const params = new URLSearchParams( {
				node_id: stepId,
				field_id: fieldId,
			} );
			const response = await apiFetch( {
				path: `/obatala/v1/process_obatala/${ process.id }/stage-document-signed?${ params }`,
				method: 'GET',
				parse: false,
			} );

			const blob = await response.blob();
			const url = window.URL.createObjectURL( blob );
			const link = document.createElement( 'a' );
			link.href = url;
			const contentDisposition = response.headers.get(
				'content-disposition'
			);
			const fileName = contentDisposition
				? contentDisposition
						.split( 'filename=' )[ 1 ]
						?.replace( /"/g, '' ) || 'signed-document.pdf'
				: 'signed-document.pdf';
			link.setAttribute( 'download', fileName );
			document.body.appendChild( link );
			link.click();
			document.body.removeChild( link );
			window.URL.revokeObjectURL( url );
		} catch ( error ) {
			setNotice( {
				status: 'error',
				message:
					error.message ||
					__( 'Could not download the signed PDF.', 'obatala' ),
			} );
		}
	};

	const isUserInSector = ( stepSector ) => {
		if ( ! Array.isArray( sectorUser ) ) {
			console.error( 'sectorUser não é um array válido:', sectorUser );
			return false;
		}
		return sectorUser.includes( stepSector );
	};

	if ( isProcessLoading ) return <Spinner />;

	if ( ! process ) {
		return (
			<Notice status="warning" isDismissible={ false }>
				{ __( 'No process found.', 'obatala' ) }
			</Notice>
		);
	}

	const options = orderedSteps.map( ( step ) => ( {
		label: step.data.stageName,
		value: step.id,
		fields: step.data.fields,
		sector_stage: step.sector_obatala,
	} ) );

	const lastUpdateStage = ( stepIndex ) => {
		const stepValue = options[ stepIndex ]?.value;
		const currentStepData = currentStageData[ stepValue ];
		const user = currentStepData ? currentStepData[ 1 ] : 'Desconhecido';
		const dateFormat =
			currentStepData && currentStepData[ 0 ]
				? format( currentStepData[ 0 ], "dd 'de' MMMM 'de' yyyy", {
						locale: ptBR,
				  } )
				: 'Data não disponível';

		return { user, dateFormat };
	};

	const authorsById = allAuthors
		? allAuthors.reduce( ( acc, user ) => {
				acc[ user.id ] = user;
				return acc;
		  }, {} )
		: {};

	const createAtProcess = () => {
		const formatDate = format( process?.date, "dd 'de' MMMM 'de' yyyy", {
			locale: ptBR,
		} );
		return formatDate;
	};

	const getStageDocumentSummary = ( stepValue, fields = [] ) => {
		return fields
			.filter( ( field ) => field.type === 'stage_document' )
			.reduce(
				( summary, field ) => {
					const rawValue = formValues[ stepValue ]?.[ field.id ];
					const documentValue = Array.isArray( rawValue )
						? rawValue[ 0 ]
						: rawValue;
					if (
						! documentValue ||
						typeof documentValue !== 'object'
					) {
						return summary;
					}
					const hasContent =
						documentValue.content &&
						String( documentValue.content ).trim() !== '';
					const hasGeneratedPdf = Boolean(
						documentValue.generatedPdf?.generatedAt
					);
					const hasSignedPdf = Boolean(
						documentValue.signedFile?.name
					);
					return {
						hasDocument: summary.hasDocument || hasContent,
						hasGeneratedPdf:
							summary.hasGeneratedPdf || hasGeneratedPdf,
						hasSignedPdf: summary.hasSignedPdf || hasSignedPdf,
					};
				},
				{
					hasDocument: false,
					hasGeneratedPdf: false,
					hasSignedPdf: false,
				}
			);
	};

	const stepHasDraft = ( stepValue ) => {
		const data = stageMetaData?.[ stepValue ];
		return (
			Boolean( data?.draftUpdateAt ) && ! currentStageData[ stepValue ]
		);
	};

	const getDocumentBadgeLabel = ( documentSummary ) => {
		if ( documentSummary.hasSignedPdf ) {
			return __( 'Signed document', 'obatala' );
		}
		if ( documentSummary.hasGeneratedPdf ) {
			return __( 'Document PDF generated', 'obatala' );
		}
		return __( 'Document draft', 'obatala' );
	};

	return (
		<>
			<BrandHeader />
			<main>
				{ isLoading ? (
					<Spinner />
				) : viewMode === 'history' ? (
					<HistoryViewer
						process={ process }
						filteredProcessType={ filteredProcessType }
						authorsById={ authorsById }
						progress={ progress }
						isComplete={ progress && progress === 100 }
						options={ options }
						currentStageData={ currentStageData }
						sectors={ sectors }
					/>
				) : (
					<>
						<ProcessHeader
							process={ process }
							filteredProcessType={ filteredProcessType }
							authorsById={ authorsById }
							isComplete={ progress && progress === 100 } // Adicionado para controle do badge
							progress={ progress }
						/>
						{ notice && (
							<Notice
								status={ notice.status }
								isDismissible
								onRemove={ () => setNotice( null ) }
							>
								{ notice.message }
							</Notice>
						) }
						{ ! isPublic && hasPermission === false && (
							<Notice status="error" isDismissible={ false }>
								{ __(
									'You do not have permission to access this process.',
									'obatala'
								) }
							</Notice>
						) }
						<div className="panel-container">
							<div className="accordion">
								{ options.map( ( step, index ) => {
									const isCompleted = Object.keys(
										currentStageData
									).includes( options[ index ]?.value );
									const isUserAllowed = isUserInSector(
										options[ index ].sector_stage
									);
									const isAccessRestricted = ! (
										process.meta?.access_level?.[ 0 ] ===
											'Not restricted' ||
										process.meta?.access_level?.[ 0 ] ===
											'not restricted'
									);
									const isDisabled = isAccessRestricted
										? ! isUserAllowed
										: ! isCompleted && ! isUserAllowed;
									const documentSummary =
										getStageDocumentSummary(
											step.value,
											step.fields
										);
									const hasDraft = stepHasDraft( step.value );
									const isCurrentStepReady =
										isStepReadyToSubmit();
									return (
										<div
											key={ index }
											className={ `accordion-item ${
												isDisabled ? 'disabled' : ''
											}` }
										>
											<button
												className="accordion-header"
												onClick={ () =>
													! isDisabled &&
													toggleAccordion( index )
												}
												aria-expanded={
													activeIndex === index
												}
												aria-controls={ `accordion-content-${ index }` }
												disabled={ isDisabled }
											>
												<span
													className={ `status ${
														isCompleted
															? 'success'
															: isDisabled
															? 'danger'
															: 'warning'
													}` }
												>
													{ isCompleted
														? __(
																'Completed',
																'obatala'
														  )
														: __(
																'Pending',
																'obatala'
														  ) }
												</span>
												<h2 className="accordion-title me-auto">
													{ step.label }
												</h2>
												<div className="badge-container">
													<span
														className={ `badge ${
															isCompleted
																? 'success'
																: isDisabled
																? 'danger'
																: 'warning'
														}` }
														title={
															isCompleted
																? `Concluído por ${
																		lastUpdateStage(
																			index
																		).user
																  }`
																: ''
														}
													>
														{ isCompleted
															? sprintf(
																	__(
																		'Completed on %s',
																		'obatala'
																	),
																	lastUpdateStage(
																		index
																	).dateFormat
															  )
															: isDisabled
															? __(
																	'Pending',
																	'obatala'
															  )
															: __(
																	'Pending input',
																	'obatala'
															  ) }
													</span>
													{ options[ index ]
														.sector_stage && (
														<span
															className="badge info"
															title={ `Grupo responsável: ${ getSectorName(
																options[ index ]
																	.sector_stage
															) }` }
														>
															<Icon icon="groups" />{ ' ' }
															{ getSectorName(
																options[ index ]
																	.sector_stage
															) }
														</span>
													) }
													{ documentSummary.hasDocument && (
														<span
															className={ `badge ${
																documentSummary.hasSignedPdf
																	? 'success'
																	: 'info'
															}` }
														>
															{ getDocumentBadgeLabel(
																documentSummary
															) }
														</span>
													) }
													{ hasDraft && (
														<span className="badge info">
															{ __(
																'Saved draft',
																'obatala'
															) }
														</span>
													) }
												</div>
											</button>
											{ activeIndex === index &&
												! isDisabled && (
													<div className="accordion-content">
														{ orderedSteps.length >
															0 &&
														orderedSteps[
															currentStep
														] ? (
															<>
																{ ! isUserAllowed &&
																	! isPublic &&
																	! isCompleted && (
																		<Notice
																			status="warning"
																			isDismissible={
																				false
																			}
																		>
																			{ __(
																				'You can only view this step.',
																				'obatala'
																			) }
																		</Notice>
																	) }
																{ options[
																	currentStep
																].fields
																	.length >
																0 ? (
																	! submittedSteps[
																		currentStep
																	] ? (
																		<form
																			onSubmit={
																				handleSubmit
																			}
																		>
																			<div className="meta-field-wrapper">
																				{ Array.isArray(
																					options[
																						currentStep
																					]
																						.fields
																				)
																					? options[
																							currentStep
																					  ].fields.map(
																							(
																								field,
																								idx
																							) => (
																								<MetaFieldInputs
																									key={ `${ orderedSteps[ currentStep ].id }-meta-${ idx }` }
																									field={
																										field
																									}
																									fieldId={
																										field.id
																									}
																									initalValue={
																										formValues[
																											orderedSteps[
																												currentStep
																											]
																												.id
																										]?.[
																											field
																												.id
																										] ||
																										uploadedFiles[
																											orderedSteps[
																												currentStep
																											]
																												.id
																										]?.[
																											field
																												.id
																										]?.[ 0 ]
																											?.name
																									}
																									isEditable={
																										! submittedSteps[
																											currentStep
																										]
																									}
																									noHasPermission={
																										! isUserAllowed
																									}
																									onFieldChange={
																										handleFieldChange
																									}
																									fileInfo={
																										fileInfo
																									}
																									handleDownload={
																										handleDownload
																									}
																									stepId={
																										orderedSteps[
																											currentStep
																										]
																											.id
																									}
																								/>
																							)
																					  )
																					: null }
																			</div>
																			{ ! submittedSteps[
																				currentStep
																			] && (
																				<div className="action-bar">
																					<Button
																						variant="secondary"
																						type="button"
																						onClick={
																							handleSaveDraft
																						}
																						disabled={
																							submittedSteps[
																								currentStep
																							] ||
																							! isUserAllowed
																						}
																					>
																						{ __(
																							'Save draft',
																							'obatala'
																						) }
																					</Button>
																					<Button
																						variant="primary"
																						type="submit"
																						disabled={
																							! isCurrentStepReady ||
																							submittedSteps[
																								currentStep
																							] ||
																							! isUserAllowed
																						}
																					>
																						{ __(
																							'Submit',
																							'obatala'
																						) }
																					</Button>
																				</div>
																			) }
																		</form>
																	) : (
																		<dl className="description-list my-0">
																			{ Array.isArray(
																				options[
																					currentStep
																				]
																					.fields
																			)
																				? options[
																						currentStep
																				  ].fields.map(
																						(
																							field,
																							idx
																						) => (
																							<MetaFieldDisplay
																								key={ `${ orderedSteps[ currentStep ].id }-meta-${ idx }` }
																								field={
																									field
																								}
																								value={
																									formValues[
																										orderedSteps[
																											currentStep
																										]
																											.id
																									]?.[
																										field
																											.id
																									] ||
																									uploadedFiles[
																										orderedSteps[
																											currentStep
																										]
																											.id
																									]?.[
																										field
																											.id
																									]?.[ 0 ]
																										?.name
																								}
																								handleDownload={
																									handleDownload
																								}
																								fieldId={
																									field.id
																								}
																								stepId={
																									orderedSteps[
																										currentStep
																									]
																										.id
																								}
																								handleGenerateStageDocumentPdf={
																									handleGenerateStageDocumentPdf
																								}
																								handleSignedDocumentUpload={
																									handleSignedDocumentUpload
																								}
																								handleDownloadSignedDocument={
																									handleDownloadSignedDocument
																								}
																							/>
																						)
																				  )
																				: null }
																		</dl>
																	)
																) : (
																	<Notice
																		status="warning"
																		isDismissible={
																			false
																		}
																	>
																		{ __(
																			'No fields found for this step.',
																			'obatala'
																		) }
																	</Notice>
																) }
															</>
														) : (
															<Notice
																status="warning"
																isDismissible={
																	false
																}
															>
																{ __(
																	'No steps found for this process.',
																	'obatala'
																) }
															</Notice>
														) }
													</div>
												) }
										</div>
									);
								} ) }
							</div>
							<aside>
								{ progress === 100 && ! hasComments ? null : (
									<Panel>
										<PanelHeader>
											{ __( 'Comments', 'obatala' ) }
										</PanelHeader>
										<CommentForm
											processId={ processId || null }
											setHasComments={ setHasComments }
										/>
									</Panel>
								) }
								<Panel>
									<PanelHeader>
										{ __( 'History', 'obatala' ) }
									</PanelHeader>
									<PanelRow>
										<ProcessUserLog
											stages={ options }
											process={ process }
											currentStageData={
												currentStageData
											}
											authorsById={ authorsById }
											sectors={ sectors }
										/>
									</PanelRow>
								</Panel>
							</aside>
						</div>
					</>
				) }
			</main>
			<BrandFooter />
		</>
	);
};

export default ProcessViewer;
