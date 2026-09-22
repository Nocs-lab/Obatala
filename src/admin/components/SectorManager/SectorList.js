import React, { useMemo } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, Tooltip, Panel, PanelRow, Notice, TextControl } from '@wordpress/components';
import { edit, trash, info } from '@wordpress/icons';
import SectorFilter from './SectorFilters';

const SectorList = ({ sectors, sectorsUsers, onEdit, onDelete, status, setStatus }) => {
    const data = useMemo(() => sectors, [sectors]);

    const handleViewSector = (sector) => {
        window.location.href = `?page=sector-details&sector_id=${sector.id}`;
        console.log(sector);
    };
    const columns = useMemo(() => [
        {
            Header: __('Title', 'obatala'),
            accessor: 'name',
            Cell: ({ value, row }) => (
                <a 
                    href={`?page=sector-details&sector_id=${row.original.id}`}
                    onClick={(e) => {
                        e.preventDefault();
                        handleViewSector(row.original);
                    }}
                >
                    {value}
                </a>
            ),
        },
        {
        Header: __('Description', 'obatala'),
        accessor: 'description',
        },
        {
        Header: __('Status', 'obatala'),
        accessor: 'status',
        Cell: ({ value }) => (
            <span className={`badge ${value === 'Active' ? 'success' : 'error'}`}>
                {value === 'Active' ? __('Active', 'obatala') : __('Inactive', 'obatala')}
            </span>
        ),
        },
        {
        Header: __('Number of users', 'obatala'),
        accessor: 'userCount',
        Cell: ({ row }) => {
            const sectorWithUsers = sectorsUsers.find(
                sector => String(sector.sector_id) === String(row.original.id)
            );
            const userCount = Array.isArray(sectorWithUsers?.users)
                ? sectorWithUsers.users.length
                : 0;

            return userCount;
        },
        },
        {
            Header: __('Actions', 'obatala'),
            accessor: 'id',
            Cell: ({ row }) => (
                <div className="group-button">
                    <Button
                        variant="primary"
                        icon={info}
                        onClick={() => handleViewSector(row.original)}
                    >
                        {__('View group', 'obatala')}
                    </Button>
                    <Tooltip text={__('Edit', 'obatala')}>
                        <Button
                            variant="tertiary"
                            icon={edit}
                            onClick={() => onEdit(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text={__('Delete', 'obatala')}>
                        <Button
                            variant="tertiary"
                            icon={trash}
                            onClick={() => onDelete(row.original)}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ], [sectorsUsers]);

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
                    <SectorFilter
                        status={status}
                        setStatus={setStatus}
                    />
                </div>
                {sectors.length > 0 ? (
                    <>
                        <div className="table-responsive">
                            <table {...getTableProps()} className="wp-list-table widefat striped table-view-list">
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                                    {column.render('Header')}
                                                    <span>
                                                        {column.isSorted
                                                            ? column.isSortedDesc
                                                                ? ' 🔽'
                                                                : ' 🔼'
                                                            : ''}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {page.map(row => {
                                        prepareRow(row);
                                        return (
                                            <tr {...row.getRowProps()}>
                                                {row.cells.map(cell => (
                                                    <td {...cell.getCellProps()}>
                                                        {cell.render('Cell')}
                                                    </td>
                                                ))}
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
                    <Notice isDismissible={false} status="warning">{__('No existing groups.', 'obatala')}</Notice>
                )}
            </PanelRow>
        </Panel>
    );
};

export default SectorList;
