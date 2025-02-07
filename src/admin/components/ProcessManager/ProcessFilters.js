import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';

const ProcessFilter = ({ accessLevel, setAccessLevel, processModel, setProcessModel }) => {
  const optionsLevel = [
    { title: "Restricted", value: "Restricted" },
    { title: "Not Restricted", value: "Not restricted" },
  ];

  const handleClearFilters = () => {
    setAccessLevel('');
    //setProcessModel('');
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <DropdownMenu
        icon={settings}
        label="Filter"
        text= "Filters"
      >
        {({ onClose }) => (
          <>
            <MenuGroup label="Access Level">
              {optionsLevel.map(option => (
                <MenuItem
                  key={option.value}
                  onClick={() => {
                    setAccessLevel(option.value);
                    onClose();
                  }}
                >
                  {option.title}
                </MenuItem>
              ))}
            </MenuGroup>

           {/*  <MenuGroup label="Process Type">
            {processModel.map(option => (
                <MenuItem
                  key={option.id}
                  onClick={() => {
                    setProcessModel(option.id);
                    onClose();
                  }}
                >
                  {option.title.rendered}
                </MenuItem>
              ))}
            </MenuGroup> */}
          </>
        )}
      </DropdownMenu>

      

      {(accessLevel /* || processModel */) && (
        <Button
          icon={close}
          onClick={() => handleClearFilters()}
          label="Clear"
        />
      )}
    </div>
  );
};

export default ProcessFilter;