import { Box, useTheme, Button, Menu, MenuItem, TextField, InputAdornment } from "@mui/material"; // Material UI components
import { DataGrid, GridToolbar } from "@mui/x-data-grid"; // Data table components
import { tokens } from "../../theme"; // Theme colors
import Header from "../../components/Header"; // Custom header
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Check icon
import CancelIcon from '@mui/icons-material/Cancel'; // Cancel icon
import FilterListIcon from '@mui/icons-material/FilterList'; // Filter icon
import { useState } from "react"; // React state hook

const TransactionReview = () => {
  const theme = useTheme(); // Access MUI theme
  const colors = tokens(theme.palette.mode); // Get theme colors
  const [anchorEl, setAnchorEl] = useState(null); // Filter menu anchor
  const [filters, setFilters] = useState({ // Filter values
    account: '',
    initialStatus: '',
    currentStatus: '',
    reviewedBy: '',
    minAmount: '',
    maxAmount: ''
  });

  // Mock data for reviewed transactions
  const transactionRows = [
    {
      id: 1,
      account: "0784-123456",
      amount: 50000,
      date: "2025-04-01",
      initialStatus: "Flagged", // Initial status
      currentStatus: "Legit", // Reviewed status
      reviewedBy: "Officer Feruzy", // Reviewer name
      reviewDate: "2025-04-02" // Review date
    },
    // ... other transactions
  ];

  // DataGrid columns configuration
  const columns = [
    { field: "id", headerName: "ID", width: 70 }, // ID column
    { field: "account", headerName: "Account", flex: 1 }, // Account column
    { field: "amount", headerName: "Amount (TZS)", flex: 1, type: "number" }, // Amount column
    { field: "date", headerName: "Trans-Date", flex: 1 }, // Date column
    {
      field: "initialStatus",
      headerName: "Before Rev", // Before review status
      flex: 1,
      cellClassName: (params) => `status-${params.value.toLowerCase()}` // Dynamic class
    },
    {
      field: "currentStatus",
      headerName: "Review", // Review status
      flex: 1,
      renderCell: (params) => { // Custom rendering
        return (
          <Box
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {params.value === "Legit" ? ( // Show checkmark for legit
              <CheckCircleIcon style={{ color: "#4caf50", fontSize: '28px' }} />
            ) : ( // Show cancel for fraudulent
              <CancelIcon style={{ color: "#f44336", fontSize: '28px' }} />
            )}
          </Box>
        );
      }
    },
    { field: "reviewedBy", headerName: "Reviewer", flex: 1 }, // Reviewer column
    { field: "reviewDate", headerName: "Date", flex: 1 } // Review date column
  ];

  // Filter menu handlers
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget); // Open filter menu
  };

  const handleFilterClose = () => {
    setAnchorEl(null); // Close filter menu
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value }); // Update filter state
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      account: '',
      initialStatus: '',
      currentStatus: '',
      reviewedBy: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  // Apply filters to rows
  const filteredRows = transactionRows.filter(row => {
    return (
      (filters.account === '' || row.account.includes(filters.account)) &&
      (filters.initialStatus === '' || row.initialStatus === filters.initialStatus) &&
      (filters.currentStatus === '' || row.currentStatus === filters.currentStatus) &&
      (filters.reviewedBy === '' || row.reviewedBy.includes(filters.reviewedBy)) &&
      (filters.minAmount === '' || row.amount >= Number(filters.minAmount)) &&
      (filters.maxAmount === '' || row.amount <= Number(filters.maxAmount))
    );
  });

  return (
    <Box m="20px">
      {/* Page header */}
      <Header
        title="SUSPICIOUS TRANSACTIONS REVIEW"
        subtitle="Review flagged and blocked transactions"
      />
      <Box display="flex" justifyContent="flex-end" mb={2}>
        {/* Filter button */}
        <Button
          variant="contained"
          color="secondary"
          startIcon={<FilterListIcon />}
          onClick={handleFilterClick}
          sx={{
            backgroundColor: colors.blueAccent[600],
            '&:hover': {
              backgroundColor: colors.blueAccent[700]
            }
          }}
        >
          Filters
        </Button>
        {/* Filter menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFilterClose}
          PaperProps={{
            style: {
              width: 300,
              padding: '16px',
              backgroundColor: colors.primary[400]
            }
          }}
        >
          {/* Account filter */}
          <TextField
            label="Account Number"
            value={filters.account}
            onChange={handleFilterChange('account')}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          {/* Initial status filter */}
          <TextField
            label="Initial Status"
            value={filters.initialStatus}
            onChange={handleFilterChange('initialStatus')}
            fullWidth
            margin="normal"
            variant="outlined"
            select
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Flagged">Flagged</MenuItem>
            <MenuItem value="Blocked">Blocked</MenuItem>
          </TextField>
          {/* Current status filter */}
          <TextField
            label="Current Status"
            value={filters.currentStatus}
            onChange={handleFilterChange('currentStatus')}
            fullWidth
            margin="normal"
            variant="outlined"
            select
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Legit">Legit</MenuItem>
            <MenuItem value="Fraudulent">Fraudulent</MenuItem>
          </TextField>
          {/* Reviewed by filter */}
          <TextField
            label="Reviewed By"
            value={filters.reviewedBy}
            onChange={handleFilterChange('reviewedBy')}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          {/* Amount range filters */}
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Min Amount"
              value={filters.minAmount}
              onChange={handleFilterChange('minAmount')}
              fullWidth
              margin="normal"
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">TZS</InputAdornment>,
              }}
            />
            <TextField
              label="Max Amount"
              value={filters.maxAmount}
              onChange={handleFilterChange('maxAmount')}
              fullWidth
              margin="normal"
              variant="outlined"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">TZS</InputAdornment>,
              }}
            />
          </Box>
          {/* Filter actions */}
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button 
              variant="outlined" 
              onClick={clearFilters}
              sx={{ color: colors.grey[100] }}
            >
              Clear
            </Button>
            <Button 
              variant="contained" 
              onClick={handleFilterClose}
              sx={{ backgroundColor: colors.blueAccent[600] }}
            >
              Apply
            </Button>
          </Box>
        </Menu>
      </Box>
      {/* DataGrid showing reviewed transactions */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" }, // Remove borders
          "& .MuiDataGrid-cell": { borderBottom: "none" }, // Remove cell borders
          "& .status-blocked": { // Styling for blocked status
            color: colors.blueAccent[600],
            fontWeight: "bold",
            backgroundColor: theme.palette.mode === "dark" ? "#1a1a2e" : "#f5f5ff"
          },
          "& .status-flagged": { // Styling for flagged status
            color: colors.grey[500],
            fontWeight: "bold",
            backgroundColor: theme.palette.mode === "dark" ? "#1a1a2e" : "#f5f5ff"
          },
          "& .status-legit": { // Styling for legit status
            color: colors.greenAccent[500],
            backgroundColor: theme.palette.mode === "dark" ? "#1a2e1a" : "#f5fff5"
          },
          '& .MuiDataGrid-columnHeaders': { // Column header styling
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: '16px',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold', // Bold headers
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: colors.blueAccent[700],
            '&:focus, &:focus-within': {
              outline: 'none !important', // Remove focus outline
            },
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400] // Background color
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none", // Remove footer border
            backgroundColor: colors.blueAccent[700] // Footer background
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important` // Checkbox color
          }
        }}
      >
        <DataGrid
          rows={filteredRows} // Filtered data
          columns={columns} // Column configuration
          components={{ Toolbar: GridToolbar }} // Add toolbar
          checkboxSelection // Enable row selection
          sx={{
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important` // Toolbar button color
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold" // Bold column headers
            },
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
              "&:focus, &:focus-within": {
                outline: "none !important" // Remove focus outline
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default TransactionReview;