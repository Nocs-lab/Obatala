import { DropdownMenu, MenuGroup, MenuItem, Button } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';

const ProcessTypeFilter = ({ status, setStatus }) => {
    const options = [
        { title: __('Active', 'obatala'), value: 'Active' },
        { title: __('Inactive', 'obatala'), value: 'Inactive' },
    ];

  return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <DropdownMenu
              icon={settings}
              label={__('Filter', 'obatala')}
              text={status ? sprintf(__('Status: %s', 'obatala'), status) : __('Filters', 'obatala')}
          >
              {({ onClose }) => (
                  <>
                      <MenuGroup label={__('Status', 'obatala')}>
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
                  </>
              )}
          </DropdownMenu>

          {status && (
              <Button
                  icon={close}
                  onClick={() => setStatus("")}
                  label={__('Clear', 'obatala')}
              />
          )}
      </div>
  );
};

export default ProcessTypeFilter;
