import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const SectorFilter = ({ status, setStatus, group, setGroup }) => {
    const options = [
        { title: __('Active', 'obatala'), value: 'Active' },
        { title: __('Inactive', 'obatala'), value: 'Inactive' },
    ];

    const options2 = [
        { title: __('All', 'obatala'), value: '' },
        { title: __('My Groups', 'obatala'), value: 'my groups' },
    ]

  const handleClearFilters = () => {
      setStatus('');
      setGroup('');
  }

  return (
      <div className="search-filter-controls">
          <DropdownMenu
              icon={settings}
              label={__('Filter', 'obatala')}
              text={__('Filters', 'obatala')}
          >
              {({ onClose }) => (
                  <div style={{ display: "flex", gap: "16px" }}>
                      <MenuGroup label={__('Access Level', 'obatala')}>
                          {options.map(option => (
                            <MenuItem
                                key={option.value}
                                onClick={() => {
                                setStatus(option.value);
                                onClose();
                              }}
                            >
                                {option.title}
                            </MenuItem>
                        ))}
                      </MenuGroup>
                    <MenuGroup label={__('Groups', 'obatala')}>
                        {options2.map(option => (
                            <MenuItem
                                key={option.value}
                                onClick={() => {
                                setGroup(option.value);
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

          {(status || group) && (
              <Button
                  icon={close}
                  onClick={() => handleClearFilters()}
                  label={__('Clear', 'obatala')}
              />
          )}
      </div>
  );
};

export default SectorFilter;