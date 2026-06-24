import React, { useState, useMemo } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, Tooltip, Panel, PanelRow, Notice, TextControl } from '@wordpress/components';
import { edit, trash, layout, external } from '@wordpress/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProcessTypeFilter from './ProcessTypeFilters';

const ProcessTypeList = ({ processTypes, onExport, onEdit, onDelete, onManager, status, setStatus, authorsById }) => {
    const columns = useMemo(() => [
        {
            Header: __('Title', 'obatala'),
            accessor: 'title.rendered',
        },
        {
            Header: __('Description', 'obatala'),
            accessor: 'description',
        },
        {
            Header: __('Status', 'obatala'),
            accessor: 'meta.status[0]',
            Cell: ({ value }) => (
                <span className={`badge ${value === 'Active' ? 'success' : 'error'}`}>
                    {value === 'Active' ? __('Active', 'obatala') : __('Inactive', 'obatala')}
                </span>
            ),
        },
        {
            Header: __('Created at', 'obatala'),
            //accessor: 'date',
            Cell: ({ row }) => (
                <p>
                    {format(new Date(row.original.date), "MM/dd/yyyy 'por' ")}
                    {authorsById[row.original.author]?.name}
                </p>
            )
        },
       /*  {
            Header: 'Created By',
            accessor: 'author',
            Cell: ({ value }) => authorsById[value]?.name,
        }, */
        {
            Header: __('Last update', 'obatala'),
            accessor: 'meta',
            Cell: ({ value }) => (
                <p>
                   { value.updateAt 
                        ? format(value.updateAt[0], "MM/dd/yyyy 'às' pp 'por' ",
                            {
                                locale: ptBR
                            })  
                        : ''
                    }
                    {value.user ? value.user[0] : ''}
                </p>
            ),
        },
        {
            Header: __('Actions', 'obatala'),
            accessor: 'id',
            Cell: ({ row }) => (
                <div className="group-button">
                    <Button
                        variant="primary"
                        icon={layout}
                        onClick={() => onManager(row.original.id)}
                    >
                        {__('Manage steps', 'obatala')}
                    </Button>
                    <Tooltip text={__('Edit export data', 'obatala')}>
                        <Button
                            variant="tertiary"
                            icon={external}
                            onClick={() => onExport(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text={__('Edit general data', 'obatala')}>
                        <Button
                            variant="tertiary"
                            icon={edit}
                            onClick={() => onEdit(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text={__('Delete model', 'obatala')}>
                        <Button
                            variant="tertiary"
                            icon={trash}
                            onClick={() => onDelete(row.original)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ], [onExport, onEdit, onDelete, onManager]);

    const data = useMemo(() => processTypes, [processTypes]);

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
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <Panel>
            <PanelRow>
                <div className='container_searchAndSelect'>
                    <TextControl
                        className="mb-1"
                        value={globalFilter || ''}
                        onChange={value => setGlobalFilter(value)}
                        placeholder={__('Search by title or description', 'obatala')}
                        type="search"
                    />
                    <ProcessTypeFilter
                        status={status}
                        setStatus={setStatus}
                    />         
                </div>    
                {processTypes.length > 0 ? (
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
                                {__('Previous', 'obatala')}
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
                                {__('Next', 'obatala')}
                            </Button>
                        </div>
                    </>
                ) : (
                    <Notice isDismissible={false} status="warning">{__('No existing process models.', 'obatala')}</Notice>
                )}
            </PanelRow>
        </Panel>
    );
};

export default ProcessTypeList;