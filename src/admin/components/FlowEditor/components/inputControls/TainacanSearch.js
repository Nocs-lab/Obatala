import { Button, Notice, TextControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDrawer } from '../../context/DrawerContext';
import { useFlowContext } from '../../context/FlowContext';

const TainacanSearchDetails = ( {
	nodeId,
	fieldId,
	label,
	setLabel,
	config,
	tainacanMappingControls,
} ) => {
	const { updateFieldConfig } = useFlowContext();
	const { toggleDrawer } = useDrawer();
	const [ message, setMessage ] = useState( null );
	const [ fieldLabel, setFieldLabel ] = useState(
		config?.label || label || ''
	);

	const save = () => {
		const normalizedLabel = fieldLabel.trim();

		if ( ! normalizedLabel || normalizedLabel === 'Campo sem título' ) {
			setMessage( {
				type: 'error',
				text: __( 'The label is required.', 'obatala' ),
			} );
			return;
		}

		updateFieldConfig( nodeId, fieldId, {
			...config,
			label: normalizedLabel,
		} );
		setLabel( normalizedLabel );
		toggleDrawer();
	};

	return (
		<form className="flex-form">
			<h3>{ __( 'Editar campo de busca Tainacan', 'obatala' ) }</h3>

			{ message && (
				<Notice
					status={ message.type }
					isDismissible
					onRemove={ () => setMessage( null ) }
				>
					{ message.text }
				</Notice>
			) }

			<TextControl
				label={ __( 'Nome do campo', 'obatala' ) }
				value={ fieldLabel }
				onChange={ setFieldLabel }
				placeholder={ __( 'Buscar no Tainacan', 'obatala' ) }
				required
			/>

			{ tainacanMappingControls }
			
			<Notice status="info" isDismissible={ false }>
				<h4>
					{ __( 'Como funciona a busca de itens e coleções?', 'obatala' ) }
				</h4>
				<p>
					{ __( 'A busca de itens e coleções ajuda você a encontrar o que precisa com facilidade. Digite ao menos três caracteres na barra de busca para ver sugestões de itens e coleções compatíveis com o termo informado.', 'obatala' ) }
				</p>
				<p>
					{ __( 'Conforme você digita, a busca retorna coleções e itens correspondentes ao termo pesquisado, permitindo visualizar informações básicas sobre cada resultado. Para ver mais detalhes de um item ou coleção, clique em um dos resultados.', 'obatala' ) }
				</p>
				<p>
					{ __( 'Você também pode selecionar múltiplos itens e coleções clicando neles, e eles serão adicionados a uma lista abaixo da barra de busca. Para remover um item da seleção, clique no X ao lado do nome do item.', 'obatala' ) }
				</p>
				<p>
					{ __( 'Essa busca é uma forma prática e rápida de navegar por itens e coleções, ajudando você a encontrar o conteúdo necessário de maneira simples e eficiente.', 'obatala' ) }
				</p>
			</Notice>

			<Button variant="primary" type="button" onClick={ save }>
				{ __( 'Save', 'obatala' ) }
			</Button>
		</form>
	);
};

export default TainacanSearchDetails;
