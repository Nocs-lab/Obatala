import { DropdownMenu, MenuGroup, MenuItem,Button } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';

const ProcessTypeFilter = ({ status, setStatus }) => {
  const options = [
    { title: "Active", value: "Active" },
    { title: "Inactive", value: "Inactive" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <DropdownMenu
        icon={settings}
        label="Filter"
        text={`${status ? `Status: ${status}` : "Filters"}`}
      >
        {({ onClose }) => (
          <>
            <MenuGroup label="Status">
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
          label="Clear"
        />
      )}
    </div>
  );
};

export default ProcessTypeFilter;
