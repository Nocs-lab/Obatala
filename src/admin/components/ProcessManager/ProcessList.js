import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, Tooltip, Panel, PanelRow, Notice, TextControl } from '@wordpress/components';
import { backup, edit, info, download, trash } from '@wordpress/icons';
import { __, sprintf } from '@wordpress/i18n';
import ProcessFilter from './ProcessFilters';
import apiFetch from '@wordpress/api-fetch';
import { decodeEntities } from '@wordpress/html-entities';
import { fetchProcessReportPdf } from '../../api/apiRequests';

const getMetaValue = (meta, key) => {
    if (!meta || meta[key] === undefined || meta[key] === null) {
        return '';
    }
    const value = meta[key];
    return Array.isArray(value) ? (value[0] ?? '') : value;
};

const processMatchesSearch = (process, filterValue) => {
    const query = String(filterValue || '').trim();
    if (!query) {
        return true;
    }

    const queryLower = query.toLowerCase();
    const queryDigits = query.replace(/\D/g, '');
    const title = decodeEntities(process.title?.rendered ?? '').toLowerCase();

    if (title.includes(queryLower)) {
        return true;
    }

    const numero = String(getMetaValue(process.meta, 'numero_processo') || '');
    if (!numero) {
        return false;
    }

    const ano = String(getMetaValue(process.meta, 'ano_processo') || '');
    const sequencial = parseInt(getMetaValue(process.meta, 'sequencial_processo') || '0', 10);
    const dv = String(getMetaValue(process.meta, 'digito_verificador_processo') || '');
    const seqPadded = String(sequencial).padStart(5, '0');

    if (numero.toLowerCase().includes(queryLower)) {
        return true;
    }

    if (ano && queryLower === ano) {
        return true;
    }

    if (queryDigits && seqPadded.includes(queryDigits)) {
        return true;
    }

    if (queryDigits) {
        const baseDigits = `${ano}${seqPadded}`;
        const fullDigits = `${baseDigits}${dv}`;
        const numeroDigits = numero.replace(/\D/g, '');

        if (numeroDigits.includes(queryDigits)) {
            return true;
        }
        if (baseDigits.includes(queryDigits)) {
            return true;
        }
        if (fullDigits.includes(queryDigits)) {
            return true;
        }
    }

    return false;
};

const processListGlobalFilter = (rows, _columnIds, filterValue) => {
    if (!filterValue) {
        return rows;
    }
    return rows.filter(({ original }) => processMatchesSearch(original, filterValue));
};

const isPdfReportAvailable =
    typeof window !== 'undefined' &&
    window.obatalaApp &&
    Boolean(window.obatalaApp.pdf_report_available);

const ProcessList = ({ processes, onEdit, onViewProcess, onDelete, processTypeMappings, processTypes, accessLevel, setAccessLevel, modelFilter, setModelFilter }) => {
    const [pdfLoadingId, setPdfLoadingId] = useState(null);
    const [pdfError, setPdfError] = useState(null);
    const [progressMap, setProgressMap] = useState({});
    const [fetchedProcessIds, setFetchedProcessIds] = useState(new Set());

    useEffect(() => {
        processes.forEach((process) => {
            const processId = process.id;
            if (!fetchedProcessIds.has(processId)) {
                setFetchedProcessIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.add(processId);
                    return newSet;
                });
                apiFetch({
                    path: `/obatala/v1/process_obatala/${processId}/node`,
                    method: 'GET',
                })
                .then((response) => {
                    setProgressMap((prev) => ({
                        ...prev,
                        [processId]: response.progress,
                    }));
                })
                .catch((error) => {
                    console.error('Erro ao buscar progresso do processo:', error);
                    setProgressMap((prev) => ({
                        ...prev,
                        [processId]: 0,
                    }));
                });
            }
        });
    }, [processes, fetchedProcessIds]);

    const handlePdfDownload = useCallback(async (processId) => {
        setPdfError(null);
        setPdfLoadingId(processId);
        try {
            const { pdf: base64, filename } = await fetchProcessReportPdf(processId);
            const binary = atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || `process-${processId}-report.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const rawMessage = err?.message || err?.error || __('Error generating PDF report.', 'obatala');
            setPdfError(typeof rawMessage === 'string' ? __(rawMessage, 'obatala') : rawMessage);
        } finally {
            setPdfLoadingId(null);
        }
    }, []);

    const columns = useMemo(
        () => [
            {
                Header: __("Process number", "obatala"),
                id: "numero_processo",
                accessor: (row) => getMetaValue(row.meta, 'numero_processo'),
                Cell: ({ value }) => (
                    value
                        ? <span>{value}</span>
                        : <span className="description">{__("No numbering", "obatala")}</span>
                ),
            },
            {
                Header: __("Process", "obatala"),
                accessor: "title.rendered",
                Cell: ({ row }) => (
                    <a href={`?page=process-viewer&process_id=${row.original.id}`}>
                        {decodeEntities(row.original.title.rendered ?? '')}
                    </a>
                ),
            },
            {
                Header: __("Model", "obatala"),
                Cell: ({ row }) => {
                    const typeMapping = processTypeMappings.find(
                        (m) => m.processId === row.original.id
                    );
                    const processType = typeMapping
                        ? processTypes.find(
                            (type) => type.id == typeMapping.processTypeId
                        )
                        : null;
                        
                    return row.original.meta.process_title;
                    //return processType ? processType.title.rendered : "Unknown Model";
                },
            },
            {
                Header: __('Current step', 'obatala'),
                accessor: (row) => {
                    if (row.progress === 100) {
                        return __('Finished', 'obatala');
                    }
                    return row.meta?.current_stage
                        ? `${row.meta.current_stage} - ${row.meta.groupResponsible || __("No group", "obatala")
                        }`
                        : __("Not started", "obatala");
                },
            },
            {
                Header: __("Progress", "obatala"),
                accessor: 'progress',
                Cell: ({ value }) => {
                    const isLoadingProgress = value === null || value === undefined;
                    return (
                        <div className="progress" title={isLoadingProgress ? "..." : `${value}%`}>
                            <p className="description">{isLoadingProgress ? "..." : `${value}%`}</p>
                            <progress value={isLoadingProgress ? 0 : value} max="100" />
                        </div>
                    );
                },
            },
            {
                Header: __("Access level", "obatala"),
                accessor: "meta.access_level",
                Cell: ({ value }) => {
                    const isNotRestricted = value == "Not restricted" || value == "not restricted";
                    return (
                        <span
                            className={`badge ${isNotRestricted ? "success" : "warning"}`}
                        >
                            {isNotRestricted ? __('Not restricted', 'obatala') : __('Restricted', 'obatala')}
                        </span>
                    );
                },
            },
            {
                Header: __("Actions", "obatala"),
                accessor: "id",
                Cell: ({ row }) => (
                    <div className="group-button">
                        <Button
                            variant="primary"
                            icon={info}
                            onClick={() => onViewProcess(row.original.id)}
                        >
                            {__("View process", "obatala")}
                        </Button>
                        <Tooltip text={__("Edit", "obatala")}>
                            <Button
                                variant="tertiary"
                                icon={edit}
                                onClick={() => onEdit(row.original)}
                            />
                        </Tooltip>
                        <Tooltip text={__("History", "obatala")}>
                            <Button
                                variant="tertiary"
                                icon={backup}
                                onClick={() => {
                                    const url = `?page=process-viewer&process_id=${row.original.id}&view=history`;
                                    window.location.href = url;
                                }}
                            />
                        </Tooltip>
                        {isPdfReportAvailable && (
                            <Tooltip text={__("Generate PDF report", "obatala")}>
                                <Button
                                    variant="tertiary"
                                    icon={download}
                                    onClick={() => handlePdfDownload(row.original.id)}
                                    disabled={pdfLoadingId === row.original.id}
                                    isBusy={pdfLoadingId === row.original.id}
                                />
                            </Tooltip>
                        )}
                        <Tooltip text={__("Delete process", "obatala")}>
                            <Button
                                variant="tertiary"
                                icon={trash}
                                onClick={() => onDelete(row.original)}
                            />
                        </Tooltip>
                    </div>
                ),
            },
        ],
        [processTypeMappings, processTypes, pdfLoadingId, handlePdfDownload, onDelete, onEdit, onViewProcess, isPdfReportAvailable]
    );

    const data = useMemo(() => {
        return processes.map((p) => ({
            ...p,
            progress: progressMap[p.id] !== undefined ? progressMap[p.id] : null,
        }));
    }, [processes, progressMap]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        state: { pageIndex, globalFilter },
        nextPage,
        previousPage,
        setPageSize,
        setGlobalFilter,
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
            globalFilter: processListGlobalFilter,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <Panel>
            <PanelRow>
                {pdfError && (
                    <Notice status="error" isDismissible onRemove={() => setPdfError(null)} style={{ marginBottom: '12px' }}>
                        {pdfError}
                    </Notice>
                )}
                <div className='container_searchAndSelect'>
                    <TextControl
                        className="mb-1"
                        value={globalFilter || ''}
                        onChange={value => setGlobalFilter(value)}
                        placeholder={__("Search by title or process number", "obatala")}
                        type="search"
                    />
                    <ProcessFilter
                        accessLevel={accessLevel}
                        setAccessLevel={setAccessLevel}
                        modelFilter={modelFilter}
                        setModelFilter={setModelFilter}
                        processTypes={processTypes}
                    />
                </div>
                {processes.length > 0 ? (
                    <>
                        <div className="table-responsive">
                            <table {...getTableProps()} className="wp-list-table widefat striped table-view-list">
                                <thead>
                                    {headerGroups.map(headerGroup => {
                                        const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                                        return (
                                            <tr key={headerGroupKey} {...headerGroupProps}>
                                                {headerGroup.headers.map(column => {
                                                    const { key: columnKey, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                                                    return (
                                                        <th key={columnKey} {...columnProps}>
                                                            {column.render('Header')}
                                                            <span>
                                                                {column.isSorted
                                                                    ? column.isSortedDesc
                                                                        ? ' 🔽'
                                                                        : ' 🔼'
                                                                    : ''}
                                                            </span>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {page.map(row => {
                                        prepareRow(row);
                                        const { key: rowKey, ...rowProps } = row.getRowProps();
                                        return (
                                            <tr key={rowKey} {...rowProps}>
                                                {row.cells.map(cell => {
                                                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                                                    return (
                                                        <td key={cellKey} {...cellProps}>
                                                            {cell.render('Cell')}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="pagination">
                            <Button onClick={() => previousPage()} disabled={!canPreviousPage}>
                                {__("Previous", "obatala")}
                            </Button>
                            <span>
                                {sprintf(
                                    /* translators: 1: current page number, 2: total pages. */
                                    __('Page %1$s of %2$s', 'obatala'),
                                    pageIndex + 1,
                                    pageOptions.length
                                )}
                            </span>
                            <Button onClick={() => nextPage()} disabled={!canNextPage}>
                                {__("Next", "obatala")}
                            </Button>
                        </div>
                    </>
                ) : (
                    <Notice isDismissible={false} status="warning">{__("No existing processes.", "obatala")}</Notice>
                )}
            </PanelRow>
        </Panel>
    );
};

export default ProcessList;
