import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';

const ProcessFilter = ({ accessLevel, setAccessLevel, modelFilter, setModelFilter, processTypes }) => {
    const optionsLevel = [
        { title: "Restricted", value: "Restricted" },
        { title: "Not Restricted", value: "Not restricted" },
    ];

    const handleClearFilters = () => {
        setAccessLevel('');
        setModelFilter('');
    }

    return (
        <>
            <DropdownMenu
                icon={settings}
                label="Filter"
                text= "Filters"
            >
                {({ onClose }) => (
                    <div style={{ display: "flex", gap: "16px" }}>
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

                        <MenuGroup label="Process Type">
                            {processTypes.map(option => (
                                <MenuItem
                                    key={option.id}
                                    onClick={() => {
                                        setModelFilter(option.id);
                                        onClose();
                                    }}
                                >
                                    {option.title.rendered}
                                </MenuItem>
                              ))}
                        </MenuGroup> 
                    </div>
                )}
            </DropdownMenu>

            {(accessLevel || modelFilter) && (
                <Button
                    icon={close}
                    onClick={() => handleClearFilters()}
                    label="Clear"
                />
            )}
        </>
    );
};

export default ProcessFilter;