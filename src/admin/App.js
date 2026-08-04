import { createRoot } from 'react-dom/client';
import ProcessManager from './components/ProcessManager';
import ProcessTypeManager from './components/ProcessTypeManager';
import ProcessViewer from './components/ProcessViewer';
import ProcessModelEditor from './components/ProcessModelEditor';
import SectorManager from './components/SectorManager';
import DashboardPage from './components/Dashboard';
import SectorDetailsPage from './components/SectorManager/SectorDetailsPage';
import MappersManager from './components/MappersManager';
import TainacanItemsPage from './components/TainacanItems/TainacanItemsPage';

// Função para navegar para o ProcessViewer ao selecionar um processo
const navigateToProcessViewer = ( processId ) => {
	window.location.href = `?page=process-viewer&process_id=${ processId }`;
};

// Adiciona um evento listener para ser executado quando o conteúdo do DOM for completamente carregado
document.addEventListener( 'DOMContentLoaded', () => {
	// Obtém os elementos do DOM pelos IDs
	const processElement = document.getElementById( 'process-manager' );
	const processTypeElement = document.getElementById(
		'process-type-manager'
	);
	const processViewerElement = document.getElementById( 'process-viewer' );
	const ProcessModelEditorElement = document.getElementById(
		'process-type-editor'
	);
	const sectorManagerElement = document.getElementById( 'sector-manager' );
	const dashboardElement = document.getElementById( 'dashboard' );
	const sectorDetailsElement = document.getElementById( 'sector-details' );
	const mappersManagerElement = document.getElementById( 'mappers' );
	const tainacanItemsElement = document.getElementById( 'collection-items' );

	// Verifica se o elemento com o ID 'sector-details' existe
	// Se existir, renderiza o componente SectorDetailsPage dentro deste elemento
	if ( sectorDetailsElement ) {
		createRoot( sectorDetailsElement ).render( <SectorDetailsPage /> );
	}
	// Verifica se o elemento com o ID 'process-manager' existe
	// Se existir, renderiza o componente ProcessManager dentro deste elemento
	if ( processElement ) {
		createRoot( processElement ).render(
			<ProcessManager onSelectProcess={ navigateToProcessViewer } />
		);
	}

	// Verifica se o elemento com o ID 'process-type-manager' existe
	// Se existir, renderiza o componente ProcessTypeManager dentro deste elemento
	if ( processTypeElement ) {
		createRoot( processTypeElement ).render( <ProcessTypeManager /> );
	}

	// Verifica se o elemento com o ID 'process-viewer' existe
	// Se existir, renderiza o componente ProcessViewer dentro deste elemento
	if ( processViewerElement ) {
		createRoot( processViewerElement ).render( <ProcessViewer /> );
	}

	// Verifica se o elemento com o ID 'process-type-editor' existe
	// Se existir, renderiza o componente ProcessModelEditor dentro deste elemento
	if ( ProcessModelEditorElement ) {
		createRoot( ProcessModelEditorElement ).render(
			<ProcessModelEditor />
		);
	}

	// Verifica se o elemento com o ID 'sector-manager' existe
	// Se existir, renderiza o componente SectorManager dentro deste elemento
	if ( sectorManagerElement ) {
		createRoot( sectorManagerElement ).render( <SectorManager /> );
	}

	if ( dashboardElement ) {
		createRoot( dashboardElement ).render( <DashboardPage /> );
	}

	if ( mappersManagerElement ) {
		const params = new URLSearchParams( window.location.search );
		const processTypeId = params.get( 'process_type_id' );
		if ( processTypeId ) {
			window.location.replace(
				`?page=process-type-editor&process_type_id=${ encodeURIComponent(
					processTypeId
				) }&section=export`
			);
		} else {
			createRoot( mappersManagerElement ).render( <MappersManager /> );
		}
	}

	if ( tainacanItemsElement ) {
		createRoot( tainacanItemsElement ).render( <TainacanItemsPage /> );
	}

	// Accordion
	document.querySelectorAll( '.accordion-button' ).forEach( ( button ) => {
		button.addEventListener( 'click', function () {
			const content = document.getElementById(
				this.getAttribute( 'aria-controls' )
			);
			const isExpanded = this.getAttribute( 'aria-expanded' ) === 'true';
			this.setAttribute( 'aria-expanded', ! isExpanded );
			content.hidden = isExpanded;
		} );

		button.addEventListener( 'keydown', function ( event ) {
			if ( event.key === 'Enter' || event.key === ' ' ) {
				event.preventDefault();
				this.click();
			}
		} );
	} );
} );
