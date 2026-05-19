import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TextControl } from '@wordpress/components';
import CollectionCard from './TainacanSearch/CollectionCard';
import ItemCard from './TainacanSearch/ItemCard';

const TainacanSearchControls = ({
  onFieldChange,
  initialValue = [],
  isEditable,
  noHasPermission
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiRoot = window?.wpApiSettings?.root;

  const normalizeArrayLike = (v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.values(v);
    return [];
  };

  const normalizeSelection = (v) => {
    return normalizeArrayLike(v)
      .filter(Boolean)
      .map((x) => ({
        id: x?.id != null ? String(x.id) : '',
        type: x?.type ? String(x.type) : 'Item',
        title:
          typeof x?.title === 'string'
            ? x.title
            : (x?.title?.rendered ?? x?.name ?? '(sem título)'),
        url: typeof x?.url === 'string' ? x.url : '',
        thumbnailUrl: typeof x?.thumbnailUrl === 'string' ? x.thumbnailUrl : null,
        metadata: x?.metadata && typeof x.metadata === 'object' ? x.metadata : {},
        author: x?.author ?? '',
        creationDate: x?.creationDate ?? '',
        modificationDate: x?.modificationDate ?? '',
        totalPublishedItems: x?.totalPublishedItems ?? 0,
      }))
      .filter((x) => x.id);
  };

  const [selectedItems, setSelectedItems] = useState(() => normalizeSelection(initialValue));

  const idsKey = (arr) => normalizeSelection(arr).map((x) => x.id).sort().join('|');

  const lastSyncedKeyRef = useRef(idsKey(initialValue));

  useEffect(() => {
    const nextKey = idsKey(initialValue);
    if (nextKey && nextKey !== lastSyncedKeyRef.current) {
      setSelectedItems(normalizeSelection(initialValue));
      lastSyncedKeyRef.current = nextKey;
    }
  }, [initialValue]);

  const fetchJson = async (url) => {
    const res = await fetch(url, { credentials: 'same-origin' });
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status} em ${url}\n${text.slice(0, 200)}`);
    }
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Resposta nao-JSON em ${url}\n${text.slice(0, 200)}`);
    }
    return res.json();
  };

  const handleSearch = async (input) => {
    setQuery(input);

    if (!input || input.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const q = encodeURIComponent(input);

      const [collectionsData, itemsData] = await Promise.all([
        fetchJson(`${apiRoot}tainacan/v2/collections?search=${q}`),
        fetchJson(`${apiRoot}tainacan/v2/items?search=${q}`)
      ]);

      const items = Array.isArray(itemsData?.items) ? itemsData.items : [];
      const collections = Array.isArray(collectionsData) ? collectionsData : [];

      const formattedResults = [
        ...collections.map((collection) => ({
          id: collection.id,
          title: collection.name,
          type: 'Collection',
          url: collection.url,
          metadata: collection.metadata || {},
          thumbnailUrl: collection.thumbnail?.medium_large?.[0] || null,
          author: collection.author_name,
          creationDate: collection.creation_date,
          modificationDate: collection.modification_date,
          totalPublishedItems: collection.total_items?.publish ?? 0,
        })),
        ...items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: 'Item',
          metadata: item.metadata || {},
          thumbnailId: item?._thumbnail_id || null,
          thumbnailUrl: null
        }))
      ];

      const resultsWithThumbnails = await Promise.all(
        formattedResults.map(async (result) => {
          if (result.thumbnailId) {
            try {
              const mediaData = await fetchJson(`${apiRoot}wp/v2/media/${result.thumbnailId}`);
              return { ...result, thumbnailUrl: mediaData?.source_url || null };
            } catch {
              return { ...result, thumbnailUrl: null };
            }
          }
          return result;
        })
      );

      setResults(resultsWithThumbnails.filter(Boolean));
    } catch (e) {
      console.error('Erro ao buscar dados:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const commitToParent = (next) => {
    const normalized = normalizeSelection(next);
    setSelectedItems(normalized);
    lastSyncedKeyRef.current = idsKey(normalized);
    onFieldChange(normalized);
  };

  const handleSelectItem = (rawItem) => {
    const item = normalizeSelection([rawItem])[0];
    if (!item?.id) return;

    const exists = selectedItems.some((s) => s.id === item.id);
    const next = exists
      ? selectedItems.filter((s) => s.id !== item.id)
      : [...selectedItems, item];

    commitToParent(next);
  };

  const removeSelectedItem = (itemId) => {
    commitToParent(selectedItems.filter((x) => x.id !== String(itemId)));
  };

  return (
    <div style={{ width: '800px', margin: 'auto' }}>
      {isEditable && (
        <TextControl
          label="Search Tainacan"
          value={query}
          disabled={noHasPermission}
          onChange={handleSearch}
          placeholder="Search for collections and/or items"
        />
      )}

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
              fontSize: '0.9em'
            }}
          >
            {item.title}
            {isEditable && (
              <button
                type="button"
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
        {results.map((result) =>
          result?.type === 'Collection' ? (
            <CollectionCard
              key={result.id}
              collection={result}
              onSelect={() => handleSelectItem(result)}
              isSelected={selectedItems.some((x) => x.id === String(result.id))}
              isEditable={isEditable}
            />
          ) : (
            <ItemCard
              key={result?.id ?? Math.random()}
              item={result}
              onSelect={() => handleSelectItem(result)}
              isSelected={selectedItems.some((x) => x.id === String(result?.id))}
              isEditable={isEditable}
            />
          )
        )}
      </div>
    </div>
  );
};

export default TainacanSearchControls;
