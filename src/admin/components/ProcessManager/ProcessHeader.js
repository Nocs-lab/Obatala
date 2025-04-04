import React from 'react';
import { Icon } from '@wordpress/components';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import BrandHeader from '../BrandHeader';

const ProcessHeader = ({ process, filteredProcessType, authorsById, calculatePercentagem }) => {
    const createAtProcess = () => {
        const formatDate = format(process?.date, "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
        });
        return formatDate;
    };

    return (
        <>
            <BrandHeader />
            <div className="title-container">
                <h2>
                    <small>
                        {filteredProcessType
                            ? filteredProcessType.title.rendered
                            : "Process type title"}
                    </small>
                    {process.title?.rendered}
                </h2>
            </div>
            <div className="badge-container">
                <span
                    className={`badge ${
                        process.meta.access_level == "not restricted" ||
                        process.meta.access_level == "Not restricted"
                            ? "success"
                            : "warning"
                    }`}
                >
                    {process.meta.access_level}
                </span>
                <span className="badge default">
                    <Icon icon="yes" /> {calculatePercentagem()}% concluído
                </span>
                <span className="badge success">
                    <Icon icon="yes" /> 100% concluído
                </span>
                <span className="badge default">
                    <Icon icon="admin-users" /> Aberto por: {authorsById[process?.author]?.name} em {createAtProcess()}
                </span>
            </div>
        </>
    );
};

export default ProcessHeader;