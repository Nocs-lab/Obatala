import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const SectorFilter = ({ status, setStatus }) => {
    const options = [
        { title: __('Active', 'obatala'), value: 'Active' },
        { title: __('Inactive', 'obatala'), value: 'Inactive' },
    ];

    const handleClearFilters = () => {
        setStatus('');
    }

    return (
        <div className="search-filter-controls">
            <DropdownMenu
                icon={settings}
                label={__('Filter', 'obatala')}
                text={__('Filters', 'obatala')}
            >
                {({ onClose }) => (
                    <div className="search-filter-controls-popover">
                        <MenuGroup label={__('Access Level', 'obatala')}>
                            {options.map(option => (
                                <MenuItem
                                    key={option.value}
                                    className={option.value === status ? 'active' : undefined}
                                    onClick={() => {
                                        setStatus(option.value);
                                        onClose();
                                    }}
                                >
                                    {option.title}
                                </MenuItem>
                            ))}
                        </MenuGroup>
                    </div>
                )}
            </DropdownMenu>

            {status && (
                <Button
                    icon={close}
                    onClick={handleClearFilters}
                    label={__('Clear', 'obatala')}
                />
            )}
        </div>
    );
};

export default SectorFilter;