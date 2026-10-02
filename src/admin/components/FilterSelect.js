import { SelectControl } from '@wordpress/components';

const FilterSelect = ({ label, value, options, onChange }) => {
    const selectedOption = options.find(option => String(option.value) === String(value ?? ''));
    const displayValue = value
        ? `${label}: ${selectedOption?.label ?? ''}`
        : selectedOption?.label ?? '';

    return (
        <div className="search-filter-controls__select-wrap">
            <SelectControl
                className="search-filter-controls__select"
                label={label}
                hideLabelFromVision
                value={value || ''}
                options={options}
                onChange={onChange}
            />
            <span className="search-filter-controls__selected-value" aria-hidden="true">
                {displayValue}
            </span>
        </div>
    );
};

export default FilterSelect;