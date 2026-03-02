import React from 'react';

const TainacanSearchDetails = () => {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '20px auto',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            fontSize: '1rem',
            lineHeight: '1.6',
            color: '#333'
        }}>
            <h2 style={{ marginBottom: '12px', fontSize: '1.4rem', color: '#007bff' }}>Como funciona a busca de itens e coleções?</h2>
            <p>
                A busca de itens e coleções permite que você encontre facilmente o que procura. 
                Basta digitar pelo menos três caracteres na barra de pesquisa para começar a ver 
                sugestões de itens e coleções que correspondem ao que você digitou.
            </p>
            <p>
                À medida que você digita, a busca retorna coleções e itens que correspondem ao termo 
                pesquisado, permitindo que você visualize informações básicas sobre cada resultado.
                Para ver mais detalhes de um item ou coleção, basta clicar em um dos resultados.
            </p>
            <p>
                Além disso, você pode selecionar múltiplos itens e coleções clicando sobre eles, 
                e eles serão adicionados a uma lista abaixo da barra de pesquisa. Caso queira 
                remover algum item da seleção, clique no "X" ao lado do nome do item.
            </p>
            <p>
                Esta busca é uma maneira prática e rápida de navegar pelos itens e coleções, ajudando 
                você a encontrar o conteúdo que precisa de forma simples e eficiente.
            </p>
        </div>
    );
};

export default TainacanSearchDetails;
