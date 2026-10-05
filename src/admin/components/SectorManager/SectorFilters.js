import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import FilterSelect from '../FilterSelect';

const SectorFilter = ({ status, setStatus }) => {
    const options = [
        { label: __('All statuses', 'obatala'), value: '' },
        { label: __('Active', 'obatala'), value: 'Active' },
        { label: __('Inactive', 'obatala'), value: 'Inactive' },
    ];

    const handleClearFilters = () => {
        setStatus('');
    }

    return (
        <>
            <FilterSelect
                label={__('Status', 'obatala')}
                value={status || ''}
                options={options}
                onChange={setStatus}
            />

            {status && (
                <Button
                    icon={close}
                    onClick={handleClearFilters}
                    label={__('Clear', 'obatala')}
                />
            )}
        </>
    );
};

export default SectorFilter;