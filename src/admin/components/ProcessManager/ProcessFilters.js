import { Button } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import FilterSelect from '../FilterSelect';

const ProcessFilter = ({ accessLevel, setAccessLevel, modelFilter, setModelFilter, processTypes, progressFilter, setProgressFilter }) => {
    const optionsLevel = [
        { label: __("All access levels", "obatala"), value: '' },
        { label: __("Restricted", "obatala"), value: "Restricted" },
        { label: __("Not restricted", "obatala"), value: "Not restricted" },
    ];

    const optionsProgress = [
        { label: __("All progress", "obatala"), value: '' },
        { label: __("Not started", "obatala"), value: "not_started" },
        { label: __("In progress", "obatala"), value: "in_progress" },
        { label: __("Finished", "obatala"), value: "finished" },
    ];

    const handleClearFilters = () => {
        setAccessLevel('');
        setModelFilter('');
        setProgressFilter('');
    }

    return (
        <>
            <FilterSelect
                label={__("Access level", "obatala")}
                value={accessLevel || ''}
                options={optionsLevel}
                onChange={setAccessLevel}
            />
            <FilterSelect
                label={__("Process type", "obatala")}
                value={modelFilter ? String(modelFilter) : ''}
                options={[
                    { label: __("All process types", "obatala"), value: '' },
                    ...processTypes.map(option => ({
                        label: option.title.rendered,
                        value: String(option.id),
                    })),
                ]}
                onChange={setModelFilter}
            />
            <FilterSelect
                label={__("Progress", "obatala")}
                value={progressFilter || ''}
                options={optionsProgress}
                onChange={setProgressFilter}
            />

            {(accessLevel || modelFilter || progressFilter) && (
                <Button
                    icon={close}
                    onClick={handleClearFilters}
                    label={__("Clear", "obatala")}
                />
            )}
        </>
    );
};

export default ProcessFilter;