import React, { useEffect, useMemo, useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from "@wordpress/api-fetch";
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, Tooltip, Panel, PanelRow, Notice, Modal, TextControl } from '@wordpress/components';
import { edit, trash, people, info } from '@wordpress/icons';
import UsersManager from './UserManager/UserManager';
import SectorFilter from './SectorFilters';

const SectorList = ({ sectors, onEdit, onDelete, status, setStatus, group, setGroup, loadSectorsUsers }) => {
    const data = useMemo(() => sectors, [sectors]);
    const [addingUsers, setAddingUsers] = useState(null);

    const handleManagerUsers = (sector) => {
        setAddingUsers(sector);
    };

    const handleViewSector = (sector) => {
        window.location.href = `?page=sector-details&sector_id=${sector.id}`;
        console.log(sector);
    };
    const handleCancel = () => {
        setAddingUsers(null);
    };

    // Função para buscar usuários do setor
    const fetchUserCount = async (sectorId) => {
        try {
            const data = await apiFetch({ path: `/obatala/v1/sector_obatala/${sectorId}/users` });
            return data.length;
        } catch (error) {
            console.error(`Erro ao buscar usuários do setor ${sectorId}:`, error);
            return 0;
        }
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
            const [userCount, setUserCount] = useState(null);

            if (userCount === null) {
                fetchUserCount(row.original.id).then(count => setUserCount(count));
            }

            return userCount !== null ? userCount : __('Loading...', 'obatala');
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
                    <Tooltip text={__('Manage users', 'obatala')}>
                        <Button
                            variant="tertiary"
                            icon={people}
                            onClick={() => handleManagerUsers(row.original)}
                        >{__('Manage users', 'obatala')}</Button>
                    </Tooltip>
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
    ], [addingUsers]);

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
                        group={group}
                        setGroup={setGroup} 
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
                {addingUsers && (
                    <Modal
                        title={<>{__('Manage users', 'obatala')}: {addingUsers.name}</>}
                        onRequestClose={handleCancel}
                        isDismissible={true}
                        size="large"
                    >
                        <UsersManager
                            sector={addingUsers}
                            loadSectorsUsers={loadSectorsUsers}
                        />
                    </Modal>
                )}
            </PanelRow>
        </Panel>
    );
};

export default SectorList;

