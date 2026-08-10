import React from 'react';
import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

const getMetaValue = (meta, key) => {
    if (!meta || meta[key] === undefined || meta[key] === null) {
        return '';
    }
    const value = meta[key];
    return Array.isArray(value) ? (value[0] ?? '') : value;
};

const ProcessHeader = ({ process, filteredProcessType, authorsById, isComplete, progress }) => {
    const createAtProcess = () => {
        const formatDate = format(process?.date, "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
        });
        return formatDate;
    };

    const processNumber = getMetaValue(process?.meta, 'numero_processo');

    return (
        <>
            <div className="title-container">
                <h2>
                    <small>
                        {filteredProcessType
                            ? filteredProcessType.title.rendered
                            : __("Process type title", "obatala")}
                    </small>
                    {processNumber ? `${processNumber} - ` : null}
                    {process.title?.rendered}
                </h2>
                <div className="badge-container">
                    <span
                        className={`badge ${process.meta.access_level == "not restricted" ||
                            process.meta.access_level == "Not restricted"
                            ? "success"
                            : "warning"
                            }`}
                    >
                        {process.meta.access_level == "Not restricted" || process.meta.access_level == "not restricted"
                            ? __('Not restricted', 'obatala')
                            : __('Restricted', 'obatala')}
                    </span>
                    <span className={`badge ${isComplete ? 'success' : 'default'}`}>
                        <Icon icon={isComplete ? "yes" : "update"} />
                        {sprintf(__('%s%% completed', 'obatala'), progress)}
                    </span>
                    <span className="badge default">
                        <Icon icon="admin-users" /> {sprintf(__('Opened by: %1$s on %2$s', 'obatala'), authorsById[process?.author]?.name, createAtProcess())}
                    </span>
                </div>
            </div>
        </>
    );
};

export default ProcessHeader;
