import React, { useState, useMemo } from 'react';
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, ButtonGroup, Icon, Tooltip, Panel, PanelHeader, PanelRow, Notice, TextControl } from '@wordpress/components';
import { edit, trash, layout } from '@wordpress/icons';
import { format } from 'date-fns';

const ProcessTypeList = ({ processTypes, onEdit, onDelete, onManager }) => {
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
            Header: 'Created At',
            accessor: 'date',
            Cell: ({ value }) => format(new Date(value), 'MM/dd/yyyy'),
        },
        {
            Header: 'Number of Steps',
            accessor: 'meta.flowData.nodes',
            Cell: ({ value }) => (value ? value.length : 0),
        },
        {
            Header: 'Status',
            accessor: 'meta.status[0]',
            Cell: ({ value }) => (
                <span className={`badge ${value === 'Active' ? 'success' : 'error'}`}>{value}</span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({ row }) => (
                <ButtonGroup>
                    <Tooltip text='Manage steps'>
                        <Button
                            icon={<Icon icon={layout}/>}
                            onClick={() => onManager(row.original.id)}
                        >Manage steps</Button>
                    </Tooltip>
                    <Tooltip text="Edit general data">
                        <Button
                            icon={<Icon icon={edit} />}
                            onClick={() => onEdit(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text="Delete process model">
                        <Button
                            icon={<Icon icon={trash} />}
                            onClick={() => onDelete(row.original)}
                        />
                    </Tooltip>
                </ButtonGroup>
            ),
        },
    ], [onEdit, onDelete, onManager]);

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
            <PanelHeader>
                <h3>Existing process models</h3>
                <span className="badge">{processTypes.length}</span>
            </PanelHeader>
            <PanelRow>
                <TextControl
                    className="mb-1"
                    value={globalFilter || ''}
                    onChange={value => setGlobalFilter(value)}
                    placeholder="Search by title or description"
                    type="search"
                />
                {processTypes.length > 0 ? (
                    <>
                        <table {...getTableProps()} className="wp-list-table widefat fixed striped table-view-list">
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