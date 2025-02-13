import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';

const SectorFilter = ({ status, setStatus, group, setGroup }) => {
    const options = [
        { title: "Active", value: "Active" },
        { title: "Inactive", value: "Inactive" },
    ];

    const options2 = [
      { title: "All", value: "" },
      { title: "My Groups", value: "my groups" },
    ]

  const handleClearFilters = () => {
    setStatus('');
    setGroup('');
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <DropdownMenu
        icon={settings}
        label="Filter"
        text= "Filters"
      >
        {({ onClose }) => (
          <div style={{ display: "flex", gap: "16px" }}>
            <MenuGroup label="Access Level">
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
            <MenuGroup label="Groups">
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
          label="Clear"
        />
      )}
    </div>
  );
};

export default SectorFilter;