import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import useSelector for accessing Redux state
import {
  Button, Checkbox, Container, Box, TextField, Typography, Paper, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, FormControlLabel
} from '@mui/material';
import { useTable, useGlobalFilter, useRowSelect, useFilters, useSortBy } from 'react-table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Individual column filter input component
const ColumnFilter = ({ column: { filterValue, setFilter }, label }) => (
  <TextField
    variant="outlined"
    size="small"
    margin="dense"
    placeholder={`Search ${label}`}
    value={filterValue || ''}
    onChange={(e) => setFilter(e.target.value || undefined)}
    sx={{ width: '100%' }}/>
  )

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
  },
  header: {
    position: 'sticky',
    top: 0, // keep headers at the top
    zIndex: 1,
    borderBottom: '2px solid #ddd',
    borderRight: '1px solid #ddd',
    backgroundColor: '#e0e0e0',
    textAlign: 'left',
    padding: '8px',
    fontWeight: 'bold',
  },
  cell: {
    padding: '8px',
    borderBottom: '1px solid #ddd',
    borderRight: '1px solid #ddd',
    textAlign: 'left',
    backgroundColor: '#f9f9f9',
  },
  headerIcon: {
    marginLeft: '5px',
    fontWeight: 'bold',
  },
};

const Users = () => {
  const experimenter_names = useSelector(state => state.auth.experimenterInfo.names); // Fetch names from Redux
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [includeNonPlayed, setIncludeNonPlayed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('https://europe-central2-co-op-world-game.cloudfunctions.net/fetchAllUsers', {
          experimenters: experimenter_names,
          filter_non_played: !includeNonPlayed
        });

        const fetchedData = Object.keys(response.data).map((key, index) => ({
          id: index + 1,
          user_id: response.data[key].user_id,
          levels_played: response.data[key].levels_played,
          experimenter: response.data[key].experimenter,
          grade: response.data[key].grade,
        }));
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [experimenter_names, includeNonPlayed]);

  // Define columns using `useMemo`
  const columns = useMemo(
    () => [
      {
        Header: 'User ID',
        accessor: 'user_id',
        Filter: ColumnFilter,
      },
      {
        Header: 'Levels Played',
        accessor: 'levels_played',
        Filter: ColumnFilter,
      },
      {
        Header: 'Experimenter',
        accessor: 'experimenter',
        Filter: ColumnFilter,
      },
      {
        Header: 'Grade',
        accessor: 'grade',
        Filter: ColumnFilter,
      },
    ],
    []
  );

  // Initialize main table instance with filters, sorting, and selection
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = useTable(
    { columns, data },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => <input type="checkbox" {...row.getToggleRowSelectedProps()} />,
        },
        ...columns,
      ]);
    }
  );

  // Export selected rows to CSV
  const exportSelectedRows = () => {
    const selectedRowsData = selectedFlatRows.map((row) => row.original);
    const worksheet = XLSX.utils.json_to_sheet(selectedRowsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Users');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'selected_users.xlsx');
  };

  // Checkbox to include users that have not played yet
  const handleCheckboxChange = (event) => {
    setIncludeNonPlayed(event.target.checked);
  };

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 3, my: 4 }}>
        <Typography variant="h5" gutterBottom>
          Users
        </Typography>

        {/* Scrollable Table Container */}
        <Box sx={{ overflow: 'auto', maxHeight: '400px' }}>
          <table {...getTableProps()} style={tableStyles.table}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={tableStyles.header}
                    >
                      {column.render('Header')}
                      <span style={tableStyles.headerIcon}>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? '🔽'
                            : '🔼'
                          : ''}
                      </span>
                      <Box>{column.canFilter ? column.render('Filter') : null}</Box>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()} style={tableStyles.cell}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" justifyContent="flex-start" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={exportSelectedRows}
            disabled={Object.keys(selectedRowIds).length === 0}
          >
            Export Selected
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Create Users
          </Button>
        </Box>
        <FormControlLabel
          control={<Checkbox checked={includeNonPlayed} onChange={handleCheckboxChange} />}
          label="Include Inactive Users "
        />
      </Paper>
      
    </Container>
  );
};

export default Users;
