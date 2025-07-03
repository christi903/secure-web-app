// TransactionHistory.jsx
import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  Modal,
  Fade,
  Backdrop,
  Button,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Alert,
  Snackbar,
  IconButton
} from "@mui/material"; // Material UI components
import { DataGrid, GridToolbar } from "@mui/x-data-grid"; // Data grid components
import { tokens } from "../../theme"; // Theme colors
import Header from "../../components/Header"; // Custom header component
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'; // Phone icon
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Arrow icon
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'; // Currency icon
import FilterListIcon from '@mui/icons-material/FilterList'; // Filter icon
import CloseIcon from '@mui/icons-material/Close'; // Close icon
import RefreshIcon from '@mui/icons-material/Refresh'; // Refresh icon
import DownloadIcon from '@mui/icons-material/Download'; // Download icon
import { motion } from "framer-motion"; // Animation library
import { useTransactionData } from './data'; // Custom hook for transaction data

// Configuration for transaction status display
const STATUS_CONFIG = {
  BLOCKED: { label: 'Blocked', color: 'error' }, // Blocked transaction styling
  LEGIT: { label: 'Legit', color: 'success' }, // Legitimate transaction styling
  FLAGGED: { label: 'Flagged', color: 'warning' }, // Flagged transaction styling
  COMPLETED: { label: 'Completed', color: 'success' }, // Completed transaction styling
  PENDING: { label: 'Pending', color: 'info' }, // Pending transaction styling
  FAILED: { label: 'Failed', color: 'error' }, // Failed transaction styling
  CONFIRMED: { label: 'Confirmed', color: 'success' } // Confirmed transaction styling
};

const TransactionHistory = () => {
  const theme = useTheme(); // Access MUI theme
  const colorTokens = tokens(theme.palette.mode); // Get theme tokens based on current mode
  
  // Use custom hook for all data-related logic
  const {
    loading, // Loading state
    error, // Error state
    snackbar, // Snackbar notification state
    paginationModel, // Pagination state
    rowCount, // Total row count
    filters, // Filter values
    selectedTransaction, // Currently selected transaction
    open, // Modal open state
    anchorEl, // Filter menu anchor element
    handleFilterClick, // Filter menu click handler
    handleFilterClose, // Filter menu close handler
    handleFilterChange, // Filter value change handler
    clearFilters, // Clear all filters handler
    handleOpen, // Open modal handler
    handleClose, // Close modal handler
    handleRefresh, // Refresh data handler
    handleCloseSnackbar, // Close snackbar handler
    setPaginationModel, // Pagination change handler
    exportToXLSX, // Export to Excel handler
    exportToCSV, // Export to CSV handler
    filteredTransactions // Filtered transactions data
  } = useTransactionData();

  // Colors with fallbacks in case theme tokens are not available
  const colors = {
    grey: colorTokens?.grey || {
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
    primary: colorTokens?.primary || {
      100: "#d0d1d5",
      200: "#a1a4ab",
      300: "#727681",
      400: "#434957",
      500: "#141b2d",
      600: "#101624",
      700: "#0c101b",
      800: "#080b12",
      900: "#040509",
    },
    greenAccent: colorTokens?.greenAccent || {
      100: "#dbf5ee",
      200: "#b7ebde",
      300: "#94e2cd",
      400: "#70d8bd",
      500: "#4cceac",
      600: "#3da58a",
      700: "#2e7c67",
      800: "#1e5245",
      900: "#0f2922",
    },
    blueAccent: colorTokens?.blueAccent || {
      100: "#e1e2fe",
      200: "#c3c6fd",
      300: "#a4a9fc",
      400: "#868dfb",
      500: "#6870fa",
      600: "#535ac8",
      700: "#3e4396",
      800: "#2a2d64",
      900: "#151632",
    },
    redAccent: colorTokens?.redAccent || {
      100: "#ffcccc",
      200: "#ff9999",
      300: "#ff6666",
      400: "#ff3333",
      500: "#ff6b6b",
      600: "#e05555",
      700: "#c13f3f",
      800: "#992b2b",
      900: "#661818",
    },
    searchBar: colorTokens?.searchBar || {
      100: "#f5f5f5",
      200: "#eeeeee",
      300: "#e0e0e0",
      400: "#bdbdbd",
      500: "#9e9e9e",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    }
  };

  // Column definitions for the DataGrid
  const columns = [
    { field: "date", headerName: "Date/Time", flex: 1, minWidth: 180 }, // Date column
    { field: "transactionId", headerName: "Transaction ID", flex: 1, minWidth: 150 }, // ID column
    { field: "type", headerName: "Type", flex: 1, minWidth: 120 }, // Transaction type column
    { 
      field: "amount", 
      headerName: "Amount (TZS)", 
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => ( // Custom render for amount with formatting
        <Typography fontWeight="bold">
          {row.amount.toLocaleString()} TZS
        </Typography>
      )
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => { // Custom render for status with chip component
        const statusConfig = STATUS_CONFIG[row.status.toUpperCase()] || STATUS_CONFIG.PENDING;
        return (
          <Chip 
            label={statusConfig.label} 
            color={statusConfig.color}
            variant="outlined"
            size="small"
          />
        );
      },
    },
    { 
      field: "description", 
      headerName: "Description", 
      flex: 2, 
      minWidth: 200,
      renderCell: ({ row }) => ( // Custom render for description with text wrapping
        <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
          {row.description}
        </Typography>
      )
    },
  ];

  return (
    <Box m="20px">
      {/* Header section with title and action buttons */}
      <Header 
        title="TRANSACTION RECORDS" 
        subtitle="Detailed list of financial transactions"
        rightContent={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Refresh button */}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                color: colors.grey[100],
                borderColor: colors.grey[700],
                '&:hover': {
                  borderColor: colors.blueAccent[500]
                }
              }}
            >
              Refresh
            </Button>
            
            {/* PDF Export button */}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={exportToXLSX}
              sx={{
                backgroundColor: colors.blueAccent[600],
                '&:hover': {
                  backgroundColor: colors.blueAccent[700]
                }
              }}
            >
              Excel
            </Button>
            
            {/* Excel Export button */}
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              sx={{
                backgroundColor: colors.blueAccent[600],
                '&:hover': {
                  backgroundColor: colors.blueAccent[700]
                }
              }}
            >
              CSV
            </Button>
          </Box>
        }
      />

      {/* Filter and error display section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box flex={1}>
          {/* Error alert display */}
          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}
        </Box>
        <Box>
          {/* Filter button */}
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            disabled={loading}
            sx={{
              backgroundColor: colors.blueAccent[600],
              '&:hover': {
                backgroundColor: colors.blueAccent[700]
              },
              '&:disabled': {
                backgroundColor: colors.grey[700]
              }
            }}
          >
            Filters
          </Button>
        </Box>
      </Box>

      {/* Filter menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          style: {
            width: 350,
            padding: '16px',
            backgroundColor: colors.primary[400]
          }
        }}
      >
        {/* Search filter */}
        <TextField
          label="Search (ID, Description)"
          value={filters.search}
          onChange={handleFilterChange('search')}
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={loading}
        />
        
        {/* Transaction type filter */}
        <TextField
          label="Transaction Type"
          value={filters.type}
          onChange={handleFilterChange('type')}
          fullWidth
          margin="normal"
          variant="outlined"
          select
          disabled={loading}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="TRANSFER">Transfer</MenuItem>
          <MenuItem value="PAYMENT">Payment</MenuItem>
          <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
          <MenuItem value="DEPOSIT">Deposit</MenuItem>
        </TextField>
        
        {/* Status filter */}
        <TextField
          label="Status"
          value={filters.status}
          onChange={handleFilterChange('status')}
          fullWidth
          margin="normal"
          variant="outlined"
          select
          disabled={loading}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        
        {/* Amount range filters */}
        <Box display="flex" gap={2} mt={2}>
          <TextField
            label="Min Amount (TZS)"
            value={filters.minAmount}
            onChange={handleFilterChange('minAmount')}
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
            disabled={loading}
            InputProps={{
              startAdornment: <InputAdornment position="start">TZS</InputAdornment>,
            }}
          />
          <TextField
            label="Max Amount (TZS)"
            value={filters.maxAmount}
            onChange={handleFilterChange('maxAmount')}
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
            disabled={loading}
            InputProps={{
              startAdornment: <InputAdornment position="start">TZS</InputAdornment>,
            }}
          />
        </Box>
        
        {/* Fraud only checkbox */}
        <Box display="flex" alignItems="center" mt={2}>
          <TextField
            label="Fraud Only"
            checked={filters.fraudOnly}
            onChange={handleFilterChange('fraudOnly')}
            type="checkbox"
            disabled={loading}
          />
          <Typography variant="body2" ml={1}>Show only fraudulent transactions</Typography>
        </Box>
        
        {/* Filter action buttons */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button 
            variant="outlined" 
            onClick={clearFilters}
            disabled={loading}
            sx={{ color: colors.grey[100] }}
          >
            Clear Filters
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleFilterClose();
              handleRefresh();
            }}
            disabled={loading}
            sx={{ backgroundColor: colors.blueAccent[600] }}
          >
            Apply Filters
          </Button>
        </Box>
      </Menu>

      {/* Main data grid */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none', // Remove border
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700], // Column header background
            color: colors.grey[100], // Column header text color
            fontSize: '16px', // Column header font size
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold', // Column header title weight
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: colors.blueAccent[700],
            '&:focus, &:focus-within': {
              outline: 'none !important', // Remove focus outline
            },
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400], // Table body background
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: colors.blueAccent[700], // Footer background
            minHeight: "40px",
            borderTop: "1px solid #ccc",
            alignItems: "center",
          },
          "& .MuiTablePagination-root": {
            fontSize: "0.8rem", // Pagination font size
          },
          "& .MuiDataGrid-row": {
            cursor: "pointer", // Row cursor
            "&:hover": {
              backgroundColor: colors.blueAccent[500], // Row hover background
            },
          }
        }}
      >
        {/* Loading indicator */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          // DataGrid component
          <DataGrid
            rows={filteredTransactions} // Data source
            columns={columns} // Column configuration
            rowCount={rowCount} // Total row count
            loading={loading} // Loading state
            pageSizeOptions={[10, 25, 50, 100]} // Page size options
            paginationModel={paginationModel} // Current pagination state
            paginationMode="server" // Server-side pagination
            onPaginationModelChange={setPaginationModel} // Pagination change handler
            onRowClick={(params) => handleOpen(params.row)} // Row click handler
            slots={{
              toolbar: GridToolbar, // Add grid toolbar
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true, // Enable quick filter
                printOptions: { disableToolbarButton: true }, // Disable print
                csvOptions: { disableToolbarButton: true }, // Disable built-in CSV export
              },
            }}
          />
        )}
      </Box>

      {/* Transaction details modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500, // Transition timeout
        }}
      >
        <Fade in={open}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: 800,
            bgcolor: colors.primary[400], // Modal background
            boxShadow: 24,
            p: 4,
            borderRadius: '16px',
            outline: 'none'
          }}>
            {selectedTransaction && (
              <>
                {/* Modal header */}
                <Typography variant="h4" gutterBottom sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  color: colors.greenAccent[500],
                  fontWeight: 'bold'
                }}>
                  <CurrencyExchangeIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
                  Transaction Details
                </Typography>
                
                {/* Sender and receiver visualization */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 4,
                  position: 'relative'
                }}>
                  {/* Sender box */}
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '12px',
                    backgroundColor: colors.blueAccent[700],
                    width: '40%'
                  }}>
                    <PhoneIphoneIcon sx={{ fontSize: 60, color: colors.grey[100] }} />
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Sender
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {selectedTransaction.sender}
                    </Typography>
                  </Box>
                  
                  {/* Animated transaction flow */}
                  <Box sx={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)',
                    width: '20%'
                  }}>
                    <motion.div
                      animate={{
                        x: [-10, 10, -10], // Animation path
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowForwardIcon sx={{ 
                        fontSize: 40, 
                        color: colors.greenAccent[500] 
                      }} />
                    </motion.div>
                    <motion.div
                      animate={{
                        x: [-5, 5, -5], // Animation path
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    >
                      <Typography variant="h6" sx={{ 
                        textAlign: 'center',
                        color: colors.greenAccent[500],
                        fontWeight: 'bold'
                      }}>
                        {selectedTransaction.amount.toLocaleString()} TZS
                      </Typography>
                    </motion.div>
                    <motion.div
                      animate={{
                        x: [-10, 10, -10], // Animation path
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    >
                      <ArrowForwardIcon sx={{ 
                        fontSize: 40, 
                        color: colors.greenAccent[500] 
                      }} />
                    </motion.div>
                  </Box>
                  
                  {/* Receiver box */}
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '12px',
                    backgroundColor: colors.blueAccent[700],
                    width: '40%'
                  }}>
                    <PhoneIphoneIcon sx={{ fontSize: 60, color: colors.grey[100] }} />
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Receiver
                    </Typography>
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {selectedTransaction.receiver}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Transaction details section */}
                <Box sx={{ 
                  mt: 4,
                  p: 3,
                  borderRadius: '12px',
                  backgroundColor: colors.blueAccent[700]
                }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Transaction Details
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {/* Transaction ID */}
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Transaction ID:</Typography>
                      <Typography variant="body1">{selectedTransaction.transactionId}</Typography>
                    </Box>
                    {/* Date/Time */}
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Date/Time:</Typography>
                      <Typography variant="body1">{selectedTransaction.date}</Typography>
                    </Box>
                    {/* Type */}
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Type:</Typography>
                      <Typography variant="body1">{selectedTransaction.type}</Typography>
                    </Box>
                    {/* Status */}
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Status:</Typography>
                      <Chip 
                        label={STATUS_CONFIG[selectedTransaction.status.toUpperCase()]?.label || selectedTransaction.status}
                        color={STATUS_CONFIG[selectedTransaction.status.toUpperCase()]?.color || 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  {/* Description */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">Description:</Typography>
                    <Typography variant="body1">{selectedTransaction.description}</Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000} // Auto-hide after 6 seconds
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Position
      >
        <Alert
          severity={snackbar.severity} // Alert type (error, warning, success, etc.)
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionHistory;