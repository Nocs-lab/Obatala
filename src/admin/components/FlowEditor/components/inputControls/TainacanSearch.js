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
		<form>
			<h3>{ __( 'Edit Search Tainacan field', 'obatala' ) }</h3>

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
				label={ __( 'Label', 'obatala' ) }
				value={ fieldLabel }
				onChange={ setFieldLabel }
				placeholder="Busca em Tainacan"
			/>

			{ tainacanMappingControls }
			<Button variant="primary" type="button" onClick={ save }>
				{ __( 'Save settings', 'obatala' ) }
			</Button>

			<Notice status="info" isDismissible={ false }>
				<h4>
					Como funciona a busca de itens e coleções?
				</h4>
				<p>
					A busca de itens e coleções permite que você encontre
					facilmente o que procura. Basta digitar pelo menos três
					caracteres na barra de pesquisa para começar a ver sugestões
					de itens e coleções que correspondem ao que você digitou.
				</p>
				<p>
					À medida que você digita, a busca retorna coleções e itens
					que correspondem ao termo pesquisado, permitindo que você
					visualize informações básicas sobre cada resultado. Para ver
					mais detalhes de um item ou coleção, basta clicar em um dos
					resultados.
				</p>
				<p>
					Além disso, você pode selecionar múltiplos itens e coleções
					clicando sobre eles, e eles serão adicionados a uma lista
					abaixo da barra de pesquisa. Caso queira remover algum item
					da seleção, clique no &quot;X&quot; ao lado do nome do item.
				</p>
				<p>
					Esta busca é uma maneira prática e rápida de navegar pelos
					itens e coleções, ajudando você a encontrar o conteúdo que
					precisa de forma simples e eficiente.
				</p>
			</Notice>
		</form>
	);
};

export default TainacanSearchDetails;
