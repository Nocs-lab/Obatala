import React, { useEffect, useState } from 'react';
import { TextControl } from '@wordpress/components';
import CollectionCard from './TainacanSearch/CollectionCard';
import ItemCard from './TainacanSearch/ItemCard';

const TainacanSearchControls = ({onFieldChange, initialValue = [], isEditable}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        
        onFieldChange(selectedItems);
 
    }, [selectedItems])

    const handleSearch = async (input) => {
        setQuery(input);
        if (input.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);

        try {
            const [collectionsResponse, itemsResponse] = await Promise.all([
                fetch(`/wordpress/wp-json/tainacan/v2/collections?search=${input}`),
                fetch(`/wordpress/wp-json/tainacan/v2/items?search=${input}`)
            ]);

            const collectionsData = await collectionsResponse.json();
            const itemsData = await itemsResponse.json();

            const items = Array.isArray(itemsData.items) ? itemsData.items : [];
            const collections = Array.isArray(collectionsData) ? collectionsData : [];

            const formattedResults = [
                ...collections.map((collection) => ({
                    id: collection.id,
                    title: collection.name,
                    type: 'Collection',
                    url: collection.url,
                    metadata: collection.metadata || {},
                    thumbnailUrl: collection.thumbnail?.medium_large[0] || null,
                    author: collection.author_name,
                    creationDate: collection.creation_date,
                    modificationDate: collection.modification_date,
                    totalPublishedItems: collection.total_items.publish,
                    viewModes: collection.enabled_view_modes,
                    documentTypes: collection.item_enabled_document_types
                })),
                ...items.map((item) => ({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    type: 'Item',
                    metadata: item.metadata || {},
                    thumbnailId: item._thumbnail_id || null,
                    thumbnailUrl: null
                }))
            ];

            const resultsWithThumbnails = await Promise.all(
                formattedResults.map(async (result) => {
                    if (result.thumbnailId) {
                        try {
                            const mediaResponse = await fetch(`/wp-json/wp/v2/media/${result.thumbnailId}`);
                            const mediaData = await mediaResponse.json();
                            result.thumbnailUrl = mediaData.source_url || null;
                        } catch {
                            result.thumbnailUrl = null;
                        }
                    }
                    return result;
                })
            );

            setResults(resultsWithThumbnails);
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (item) => {
        setSelectedItems((prevSelected) =>
            prevSelected.some((selected) => selected.id === item.id)
                ? prevSelected.filter((selected) => selected.id !== item.id)
                : [...prevSelected, item]
        );
    };

    const removeSelectedItem = (itemId) => {
        setSelectedItems((prevSelected) => prevSelected.filter((item) => item.id !== itemId));
    };

    return (
        <div style={{ width: '800px', margin: 'auto' }}>
            {isEditable && (
            <TextControl
                label="Search Tainacan"
                value={query}
                onChange={handleSearch}
                placeholder="Search for collections and/or items"
                style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                }}
            />
            )}
            {/* Lista de Itens Selecionados como Badges */}
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                
                {selectedItems.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            fontSize: '0.9em',
                        }}
                    >
                        {item.title}
                        {isEditable && (
                        <button
                            onClick={() => removeSelectedItem(item.id)}
                            style={{
                                marginLeft: '8px',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            &times;
                        </button>
                        )}
                    </div>
                ))}
            
            </div>

            {loading && <div>Carregando...</div>}
            
            <div style={{ marginTop: '20px' }}>
                 {initialValue.length > 0  ? (
                     initialValue.map((result) => (
                        result.type === 'Collection'
                            ? <CollectionCard key={result.id} collection={result}  />
                            : <ItemCard key={result.id} item={result} />
                    ))
                ) : (
                    results.map((result) => (
                        result.type === 'Collection'
                            ? <CollectionCard key={result.id} collection={result} onSelect={() => handleSelectItem(result)} isSelected={selectedItems.some((item) => item.id === result.id)} />
                            : <ItemCard key={result.id} item={result} onSelect={() => handleSelectItem(result)} isSelected={selectedItems.some((item) => item.id === result.id)} />
                )))}
               
            </div>
        </div>
    );
};

export default TainacanSearchControls;