import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { SearchControl, Spinner } from '@wordpress/components';
import { store as coreDataStore } from '@wordpress/core-data';
import { decodeEntities } from '@wordpress/html-entities';

const ProcessCollection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { processes, hasResolved, error } = useSelect(
    (select) => {
      const query = {};
      if (searchTerm) {
        query.search = searchTerm;
      }
      const selectorArgs = ['postType', 'process_obatala', query];

      try {
        const results = select(coreDataStore).getEntityRecords(...selectorArgs);
        return { processes: results, hasResolved: true };
      } catch (error) {
        console.error('Error fetching processes:', error);
        return { processes: [], hasResolved: true, error };
      }
    },
    [searchTerm]
  );

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div>
        <SearchControl
          onChange={setSearchTerm}
          value={searchTerm}
          placeholder="Search Processes"
        />
      </div>
      {hasResolved ? (
        <ProcessList processes={processes} />
      ) : (
        <Spinner />
      )}
    </div>
  );
};

function ProcessList({ processes }) {
  if (!processes?.length) {
    if (searchTerm) {
      return <div>No results found for "{searchTerm}"</div>;
    } else {
      return <div>Please enter a search term</div>;
    }
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        {processes.map((process) => (
          <tr key={process.id}>
            <td>{decodeEntities(process.title.rendered)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProcessCollection;


