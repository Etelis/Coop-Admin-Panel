import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Checkbox, Container, Box, TextField, Typography, Paper, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, FormControlLabel
} from '@mui/material';
import { useTable, useGlobalFilter, useRowSelect, useFilters, useSortBy } from 'react-table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';

// Individual column filter input component
const ColumnFilter = ({ column: { filterValue, setFilter }, label }) => (
  <TextField
    variant="outlined"
    size="small"
    margin="dense"
    placeholder={`Search ${label}`}
    value={filterValue || ''}
    onChange={(e) => setFilter(e.target.value || undefined)}
    sx={{ width: '100%' }}
  />
);

const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
  },
  header: {
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
  const experimenterInfo = useSelector(state => state.auth.experimenterInfo); // Use useSelector to access Redux state
  const experimenter_names = experimenterInfo ? experimenterInfo.names : [];
  const [data, setData] = useState([]);
  const [createdData, setCreatedData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userCount, setUserCount] = useState('');
  const [grade, setGrade] = useState('');
  const [language, setLanguage] = useState('');
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
      } catch ( error ) {
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

  // Initialize table instance for created data
  const createdColumns = useMemo(
    () => [
      {
        Header: 'User ID',
        accessor: 'user_id',
      },
      {
        Header: 'Levels Played',
        accessor: 'levels_played',
      },
      {
        Header: 'Experimenter',
        accessor: 'experimenter',
      },
      {
        Header: 'Grade',
      },
    ],
    []
  );

  const {
    getTableProps: getCreatedTableProps,
    getTableBodyProps: getCreatedTableBodyProps,
    headerGroups: createdHeaderGroups,
    rows: createdRows,
    prepareRow: prepareCreatedRow,
  } = useTable({ columns: createdColumns, data: createdData });

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

  // Handle user creation
  const handleCreateUsers = async () => {
    setCreatedData([]);
    try {
      const response = await axios.post(
        'https://europe-central2-co-op-world-game.cloudfunctions.net/createUsers',
        null,
        {
          params: {
            experimenter: experimenter_names[0],
            grade,
            language,
            num: userCount,
          },
        }
      );

      // Prepare the data for CSV export
      const newCreatedData = response.data.map((id) => ({
        user_id: id,
        levels_played: 0,
        experimenter: experimenter_names[0],
        grade,
      }));

      // Update the data state
      setCreatedData([...createdData, ...newCreatedData]);
      setData([...data, ...newCreatedData]);

      // Create and download CSV
      const worksheet = XLSX.utils.json_to_sheet(newCreatedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Created Users');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'created_users.xlsx');

      // Close the dialog
      setDialogOpen(false);
    } catch (error) {
      console.error('Error creating users:', error);
    }
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
        <Box display="flex" justifyContent="flex-start" mt={3}>
          <FormControlLabel
            control={<Checkbox checked={includeNonPlayed} onChange={(e) => setIncludeNonPlayed(e.target.checked)} />}
            label="Include Inactive Users"
          />
        </Box>
      </Paper>

      {/* Create Users Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create Users</DialogTitle>
        <DialogContent>
          <TextField
            label="Number of Users"
            type="number"
            value={userCount}
            onChange={(e) => setUserCount(e.target.value)}
            fullWidth
            margin="dense"
            inputProps={{ min: 1, max: 100 }}
          />
          <TextField
            label="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            fullWidth
            margin="dense"
            select
          >
            <MenuItem value="Kindergarten">Kindergarten</MenuItem>
            <MenuItem value="1st">1st</MenuItem>
            <MenuItem value="2nd">2nd</MenuItem>
            <MenuItem value="3th">3th</MenuItem>
            <MenuItem value="4th">4th</MenuItem>
            <MenuItem value="5th">5th</MenuItem>
            <MenuItem value="6th">6th</MenuItem>
            <MenuItem value="6th">7th</MenuItem>
            {/* Add more grades as needed */}
          </TextField>
          <TextField
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            fullWidth
            margin="dense"
            select
          >
            <MenuItem value="Hebrew">Hebrew</MenuItem>
            <MenuItem value="Macedonian">Macedonian</MenuItem>
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Arabic">Arabic</MenuItem>
            {/* Add more languages as needed */}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateUsers} color="secondary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Display Created Users in a Table */}
      {createdData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, my: 4 }}>
          <Typography variant="h6">Created Users</Typography>
          <Box sx={{ overflow: 'auto', maxHeight: '400px' }}>
            <table {...getCreatedTableProps()} style={tableStyles.table}>
              <thead>
                {createdHeaderGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()} style={tableStyles.header}>
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getCreatedTableBodyProps()}>
                {createdRows.map((row) => {
                  prepareCreatedRow(row);
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
        </Paper>
      )}
    </Container>
  );
};

export default Users;
