import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { close, settings } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const ProcessFilter = ({ accessLevel, setAccessLevel, modelFilter, setModelFilter, processTypes, progressFilter, setProgressFilter }) => {
    const optionsLevel = [
        { title: __("Restricted", "obatala"), value: "Restricted" },
        { title: __("Not Restricted", "obatala"), value: "Not restricted" },
    ];

    const optionsProgress = [
        { title: __("Not started", "obatala"), value: "not_started" },
        { title: __("In progress", "obatala"), value: "in_progress" },
        { title: __("Finished", "obatala"), value: "finished" },
    ];

    const handleClearFilters = () => {
        setAccessLevel('');
        setModelFilter('');
        setProgressFilter('');
    }

    return (
        <div className="search-filter-controls">
            <DropdownMenu
                icon={settings}
                label={__("Filter", "obatala")}
                text={__("Filters", "obatala")}
            >
                {({ onClose }) => (
                    <div style={{ display: "flex", gap: "16px" }}>
                        <MenuGroup label={__("Access Level", "obatala")}>
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

                        <MenuGroup label={__("Process Type", "obatala")}>
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

                        <MenuGroup label={__("Progress", "obatala")}>
                            {optionsProgress.map(option => (
                                <MenuItem
                                    key={option.value}
                                    onClick={() => {
                                        setProgressFilter(option.value);
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

            {(accessLevel || modelFilter || progressFilter) && (
                <Button
                    icon={close}
                    onClick={() => handleClearFilters()}
                    label={__("Clear", "obatala")}
                />
            )}
        </div>
    );
};

export default ProcessFilter;