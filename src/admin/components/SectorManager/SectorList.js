import React, { useEffect, useMemo, useState } from 'react';
import apiFetch from "@wordpress/api-fetch";
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, ButtonGroup, Icon, Tooltip, Panel, PanelHeader, PanelRow, Notice, Modal, TextControl } from '@wordpress/components';
import { edit, trash, people } from '@wordpress/icons';
import UsersManager from './UserManager/UserManager';

const SectorList = ({ sectors, onEdit, onDelete }) => {
    const data = useMemo(() => sectors, [sectors]);
    const [addingUsers, setAddingUsers] = useState(null);

    const handleManagerUsers = (sector) => {
        setAddingUsers(sector);
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
            Header: 'Title',
            accessor: 'name'
        },
        {
            Header: 'Description',
            accessor: 'description',
        },
        {
            Header: 'Number of Users',
            accessor: 'userCount',
            Cell: ({ row }) => {
                const [userCount, setUserCount] = useState(null);

                if (userCount === null) {
                    fetchUserCount(row.original.id).then(count => setUserCount(count));
                }

                return userCount !== null ? userCount : 'Loading...';
            },
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ value }) => (
                <span className={`badge ${value === 'Active' ? 'success' : 'error'}`}>{value}</span>
            ),
        },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({ row }) => (
                <ButtonGroup>
                    <Tooltip text="Manage users">
                        <Button
                            icon={<Icon icon={people} />}
                            onClick={() => handleManagerUsers(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text="Edit">
                        <Button
                            icon={<Icon icon={edit} />}
                            onClick={() => onEdit(row.original)}
                        />
                    </Tooltip>
                    <Tooltip text="Delete">
                        <Button
                            icon={<Icon icon={trash} />}
                            onClick={() => onDelete(row.original)}
                        />
                    </Tooltip>
                </ButtonGroup>
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
            <PanelHeader>
                <h3>Existing sectors</h3>
                <span className="badge">{sectors.length}</span>
            </PanelHeader>
            <PanelRow>
                <TextControl
                    className="mb-1"
                    value={globalFilter || ''}
                    onChange={value => setGlobalFilter(value)}
                    placeholder="Search by title or description"
                    type="search"
                />
                {sectors.length > 0 ? (
                    <>
                        <table {...getTableProps()} className="wp-list-table widefat fixed striped table-view-list">
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
                    <Notice isDismissible={false} status="warning">No existing sectors.</Notice>
                )}
                {addingUsers && (
                    <Modal
                        title={<>Manager users: {addingUsers.name}</>}
                        onRequestClose={handleCancel}
                        isDismissible={true}
                        size="large"
                    >
                        <UsersManager
                            sector={addingUsers}
                        />
                    </Modal>
                )}
            </PanelRow>
        </Panel>
    );
};

export default SectorList;

