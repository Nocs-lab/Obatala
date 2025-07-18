import React, { useState, useMemo } from 'react';
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, ButtonGroup, Tooltip, Panel, PanelRow, Notice, TextControl  } from '@wordpress/components';
import { edit, trash, layout, external } from '@wordpress/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProcessTypeFilter from './ProcessTypeFilters';

const ProcessTypeList = ({ processTypes, onExport, onEdit, onDelete, onManager, status, setStatus, authorsById }) => {
    const columns = useMemo(() => [
        {
            Header: 'Title',
            accessor: 'title.rendered',
        },
        {
            Header: 'Description',
            accessor: 'description',
        },
        {
            Header: 'Status',
            accessor: 'meta.status[0]',
            Cell: ({ value }) => (
                <span className={`badge ${value === 'Active' ? 'success' : 'error'}`}>{value}</span>
            ),
        },
        {
            Header: 'Created at',
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
            Header: 'Last update',
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
            Header: 'Actions',
            accessor: 'id',
            Cell: ({ row }) => (
                <ButtonGroup>
                    <Button
                        variant="primary"
                        icon={layout}
                        onClick={() => onManager(row.original.id)}
                    >
                        Manage steps
                    </Button>
                    <Tooltip text="Edit export data">
                        <Button
                            variant="secondary"
                            icon={external}
                            onClick={() => onExport(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text="Edit general data">
                        <Button
                            variant="secondary"
                            icon={edit}
                            onClick={() => onEdit(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text="Delete model">
                        <Button
                            variant="secondary"
                            icon={trash}
                            onClick={() => onDelete(row.original)}
                        />
                    </Tooltip>
                </ButtonGroup>
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
                        placeholder="Search by title or description"
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
                                Previous
                            </Button>
                            <span>
                                Page{' '}
                                <strong>
                                    {pageIndex + 1} of {pageOptions.length}
                                </strong>{' '}
                            </span>
                            <Button onClick={() => nextPage()} disabled={!canNextPage}>
                                Next
                            </Button>
                        </div>
                    </>
                ) : (
                    <Notice isDismissible={false} status="warning">No existing process models.</Notice>
                )}
            </PanelRow>
        </Panel>
    );
};

export default ProcessTypeList;