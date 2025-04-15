import { Box, useTheme, Button, Menu, MenuItem, TextField, InputAdornment } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useState } from "react";

const TransactionReview = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    account: '',
    initialStatus: '',
    currentStatus: '',
    reviewedBy: '',
    minAmount: '',
    maxAmount: ''
  });

  const transactionRows = [
    {
      id: 1,
      account: "0784-123456",
      amount: 50000,
      date: "2025-04-01",
      initialStatus: "Flagged",
      currentStatus: "Legit",
      reviewedBy: "Officer Feruzy",
      reviewDate: "2025-04-02"
    },
    {
      id: 2,
      account: "0655-234567",
      amount: 750000,
      date: "2025-04-02",
      initialStatus: "Blocked",
      currentStatus: "Fraudulent",
      reviewedBy: "N/A",
      reviewDate: ""
    },
    {
      id: 3,
      account: "0712-345678",
      amount: 1000000,
      date: "2025-04-05",
      initialStatus: "Blocked",
      currentStatus: "Legit",
      reviewedBy: "Officer Sahili",
      reviewDate: "2025-04-06"
    },
    {
      id: 4,
      account: "0657-111222",
      amount: 47000,
      date: "2025-04-06",
      initialStatus: "Flagged",
      currentStatus: "Fraudulent",
      reviewedBy: "Officer Alex",
      reviewDate: "2025-04-07"
    },
    {
      id: 5,
      account: "0678-444555",
      amount: 250000,
      date: "2025-04-09",
      initialStatus: "Blocked",
      currentStatus: "Fraudulent",
      reviewedBy: "Officer Alex",
      reviewDate: "2025-04-10"
    },
    {
      id: 6,
      account: "0789-555666",
      amount: 999999,
      date: "2025-04-10",
      initialStatus: "Flagged",
      currentStatus: "Legit",
      reviewedBy: "Officer Alex",
      reviewDate: "2025-04-11"
    },
    {
      id: 7,
      account: "0755-111333",
      amount: 130000,
      date: "2025-04-03",
      initialStatus: "Blocked",
      currentStatus: "Fraudulent",
      reviewedBy: "Officer Feruzy",
      reviewDate: "2025-04-04"
    },
    {
      id: 8,
      account: "0744-222444",
      amount: 290000,
      date: "2025-04-04",
      initialStatus: "Flagged",
      currentStatus: "Legit",
      reviewedBy: "Officer Sahili",
      reviewDate: "2025-04-05"
    },
    {
      id: 9,
      account: "0733-333555",
      amount: 600000,
      date: "2025-04-07",
      initialStatus: "Blocked",
      currentStatus: "Legit",
      reviewedBy: "Officer Feruzy",
      reviewDate: "2025-04-08"
    },
    {
      id: 10,
      account: "0722-444666",
      amount: 870000,
      date: "2025-04-08",
      initialStatus: "Flagged",
      currentStatus: "Fraudulent",
      reviewedBy: "Officer Sahili",
      reviewDate: "2025-04-09"
    },
    {
      id: 11,
      account: "0711-555777",
      amount: 145000,
      date: "2025-04-10",
      initialStatus: "Blocked",
      currentStatus: "Fraudulent",
      reviewedBy: "Officer Alex",
      reviewDate: "2025-04-11"
    },
    {
      id: 12,
      account: "0700-666888",
      amount: 385000,
      date: "2025-04-11",
      initialStatus: "Flagged",
      currentStatus: "Legit",
      reviewedBy: "Officer Sahili",
      reviewDate: "2025-04-12"
    },
    {
      id: 13,
      account: "0699-777999",
      amount: 455000,
      date: "2025-04-12",
      initialStatus: "Blocked",
      currentStatus: "Fraudulent",
      reviewedBy: "Officer Sahili",
      reviewDate: "2025-04-13"
    },
    {
      id: 14,
      account: "0688-888000",
      amount: 20000,
      date: "2025-04-13",
      initialStatus: "Flagged",
      currentStatus: "Fraudulent",
      reviewedBy: "Officer Feruzy",
      reviewDate: "2025-04-14"
    },
    {
      id: 15,
      account: "0677-999111",
      amount: 310000,
      date: "2025-04-14",
      initialStatus: "Blocked",
      currentStatus: "Legit",
      reviewedBy: "Officer Feruzy",
      reviewDate: "2025-04-15"
    }
  ];

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "account", headerName: "Account", flex: 1 },
    { field: "amount", headerName: "Amount (TZS)", flex: 1, type: "number" },
    { field: "date", headerName: "Trans-Date", flex: 1 },
    {
      field: "initialStatus",
      headerName: "Before Rev",
      flex: 1,
      cellClassName: (params) => `status-${params.value.toLowerCase()}`
    },
    {
      field: "currentStatus",
      headerName: "Review",
      flex: 1,
      renderCell: (params) => {
        return (
          <Box
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {params.value === "Legit" ? (
              <CheckCircleIcon style={{ color: "#4caf50", fontSize: '28px' }} />
            ) : (
              <CancelIcon style={{ color: "#f44336", fontSize: '28px' }} />
            )}
          </Box>
        );
      }
    },
    { field: "reviewedBy", headerName: "Reviewer", flex: 1 },
    { field: "reviewDate", headerName: "Date", flex: 1 }
  ];

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

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
      <Header
        title="SUSPICIOUS TRANSACTIONS REVIEW"
        subtitle="Review flagged and blocked transactions"
      />
      <Box display="flex" justifyContent="flex-end" mb={2}>
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
          <TextField
            label="Account Number"
            value={filters.account}
            onChange={handleFilterChange('account')}
            fullWidth
            margin="normal"
            variant="outlined"
          />
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
          <TextField
            label="Reviewed By"
            value={filters.reviewedBy}
            onChange={handleFilterChange('reviewedBy')}
            fullWidth
            margin="normal"
            variant="outlined"
          />
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
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .status-blocked": {
            color: colors.blueAccent[600],
            fontWeight: "bold",
            backgroundColor: theme.palette.mode === "dark" ? "#1a1a2e" : "#f5f5ff"
          },
          "& .status-flagged": {
            color: colors.grey[500],
            fontWeight: "bold",
            backgroundColor: theme.palette.mode === "dark" ? "#1a1a2e" : "#f5f5ff"
          },
          "& .status-legit": {
            color: colors.greenAccent[500],
            backgroundColor: theme.palette.mode === "dark" ? "#1a2e1a" : "#f5fff5"
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: '16px',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: colors.blueAccent[700],
            '&:focus, &:focus-within': {
              outline: 'none !important',
            },
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400]
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700]
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`
          }
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          checkboxSelection
          sx={{
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold"
            },
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
              "&:focus, &:focus-within": {
                outline: "none !important"
              }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default TransactionReview;