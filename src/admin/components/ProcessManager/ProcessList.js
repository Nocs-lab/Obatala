import React, { useMemo } from 'react';
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { Button, ButtonGroup, Icon, Tooltip, Panel, PanelHeader, PanelRow, Notice, TextControl } from '@wordpress/components';
import { edit, seen} from '@wordpress/icons';
import ProcessFilter from './ProcessFilters';

const ProcessList = ({ processes, onEdit, onViewProcess, processTypeMappings, processTypes, accessLevel, setAccessLevel, modelFilter, setModelFilter }) => {
    const columns = useMemo(() => [
        {
            Header: 'Process',
            accessor: 'title.rendered',
            Cell: ({ row }) => (
                <a href={`?page=process-viewer&process_id=${row.original.id}`}>
                        {row.original.title.rendered}
                </a>
            ),
        },
        {
            Header: 'Model',
            Cell: ({row}) => {
                const typeMapping = processTypeMappings.find(m => m.processId === row.original.id);
                const processType = typeMapping ? processTypes.find(type => type.id == typeMapping.processTypeId) : null;
  
                return processType ? processType.title.rendered : 'Unknown Model'
            }
        },
        {
            Header: 'Current Step',
            accessor: row => row.meta?.current_stage 
                ? `${row.meta.current_stage} - ${row.meta.groupResponsible || 'No group'}`
                : 'Not started'
        },
        {
          Header: 'Access level',
          accessor: 'meta.access_level',
          Cell: ({ value }) => (
  
              <span className={`badge ${value == 'Not restricted' || value == 'not restricted' ? 'success' : 'warning'}`}>
                  {value}
              </span> 
            ),
        },
        {
            Header: 'Actions',
            accessor: 'id',
            Cell: ({ row }) => (
              <ButtonGroup>
              <Tooltip text="View">
                  <Button
                  icon={<Icon icon={seen} />} 
                  onClick={() => onViewProcess(row.original.id)}
                  />
  
              </Tooltip>
              <Tooltip text="Edit">
                  <Button
                  icon={<Icon icon={edit} />}
                  onClick={() => onEdit(row.original)}
              />
  
              </Tooltip>
          </ButtonGroup>
            ),
        },
    ], [processTypeMappings, processTypes]);
  
    const data = useMemo(() => processes, [processes]);
  
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
                <h3>Existing Processes</h3>
                <span className="badge">{processes.length}</span>
            </PanelHeader>
            <PanelRow>
                <div className='container_searchAndSelect'>
                    <TextControl
                        className="mb-1"
                        value={globalFilter || ''}
                        onChange={value => setGlobalFilter(value)}
                        placeholder="Search by title"
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
                    <Notice isDismissible={false} status="warning">No existing processes.</Notice>
                )}
            </PanelRow>
        </Panel>
    );
};

export default ProcessList;
