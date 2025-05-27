import React, { useState, useEffect, useCallback } from 'react';
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
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { motion } from "framer-motion";
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

/**
 * Configuration object for transaction statuses with their display labels and colors
 */
const STATUS_CONFIG = {
  BLOCKED: { label: 'Blocked', color: 'error' },
  LEGIT: { label: 'Legit', color: 'success' },
  FLAGGED: { label: 'Flagged', color: 'warning' },
  COMPLETED: { label: 'Completed', color: 'success' },
  PENDING: { label: 'Pending', color: 'warning' },
  FAILED: { label: 'Failed', color: 'error' },
  CONFIRMED: { label: 'Confirmed', color: 'info' }
};

const TransactionHistory = () => {
  // Access the current theme
  const theme = useTheme();
  
  /**
   * Safely get colors with comprehensive fallbacks in case the theme tokens are not available
   */
  const colorTokens = tokens(theme.palette.mode);
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
      400: "#434957", // Key color that was missing
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

  // State declarations
  const [open, setOpen] = useState(false); // Controls modal visibility
  const [selectedTransaction, setSelectedTransaction] = useState(null); // Stores currently selected transaction
  const [anchorEl, setAnchorEl] = useState(null); // Anchor for filter menu
  const [filters, setFilters] = useState({ // Filter state
    search: '',
    type: '',
    status: '',
    minAmount: '',
    maxAmount: '',
    fraudOnly: false
  });
  const [transactions, setTransactions] = useState([]); // Transaction data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [snackbar, setSnackbar] = useState({ // Snackbar notification state
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [paginationModel, setPaginationModel] = useState({ // Pagination state
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0); // Total row count for pagination

  /**
   * Generates a description for a transaction based on its type and parties involved
   * @param {Object} transaction - The transaction object
   * @returns {string} - Generated description
   */
  const generateDescription = useCallback((transaction) => {
    const actions = {
      TRANSFER: 'Transfer',
      PAYMENT: 'Payment',
      WITHDRAWAL: 'Withdrawal',
      DEPOSIT: 'Deposit'
    };
    const action = actions[transaction.transaction_type] || 'Transaction';
    return `${action} from ${transaction.initiator_id} to ${transaction.recipient_id}`;
  }, []);

  /**
   * Formats a raw transaction object into a display-friendly format
   * @param {Object} transaction - The raw transaction data
   * @returns {Object} - Formatted transaction data
   */
  const formatTransaction = useCallback((transaction) => ({
    id: transaction.id,
    date: new Date(transaction.transaction_time).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    transactionId: `TRX-${transaction.id.toString().slice(0, 8).toUpperCase()}`,
    type: transaction.transaction_type,
    amount: transaction.amount,
    status: transaction.status || 'PENDING',
    description: transaction.description || generateDescription(transaction),
    sender: transaction.sender_phone || `+255${Math.floor(100000000 + Math.random() * 900000000)}`,
    receiver: transaction.recipient_phone || `+255${Math.floor(100000000 + Math.random() * 900000000)}`,
    is_fraud: transaction.is_fraud,
    fraud_probability: transaction.fraud_probability,
    fraud_alert_severity: transaction.fraud_alert_severity
  }), [generateDescription]);

  // Handler functions

  /**
   * Opens the filter menu
   * @param {Event} event - The click event
   */
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Closes the filter menu
   */
  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  /**
   * Handles changes to filter inputs
   * @param {string} prop - The filter property to update
   * @returns {Function} - Event handler function
   */
  const handleFilterChange = (prop) => (event) => {
    setFilters({ ...filters, [prop]: event.target.value });
  };

  /**
   * Resets all filters to their default values
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      status: '',
      minAmount: '',
      maxAmount: '',
      fraudOnly: false
    });
  };

  /**
   * Opens the transaction details modal
   * @param {Object} transaction - The transaction to display
   */
  const handleOpen = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  /**
   * Closes the transaction details modal
   */
  const handleClose = () => {
    setOpen(false);
  };

  /**
   * Fetches transactions from the database with applied filters
   */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Initialize the query
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('transaction_time', { ascending: false });

      // Apply filters if they exist
      if (filters.search) {
        query = query.or(`description.ilike.%${filters.search}%,initiator_id.ilike.%${filters.search}%,recipient_id.ilike.%${filters.search}%`);
      }
      if (filters.type) {
        query = query.eq('transaction_type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
      }
      if (filters.fraudOnly) {
        query = query.eq('is_fraud', true);
      }

      // Execute the query with pagination
      const { data, count, error } = await query
        .range(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize - 1
        );

      if (error) throw error;

      // Format and set the transaction data
      setTransactions(data.map(formatTransaction));
      setRowCount(count || 0);
    } catch (err) {
      setError(err.message);
      setSnackbar({ 
        open: true, 
        message: `Error loading transactions: ${err.message}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }, [filters, paginationModel, formatTransaction]);

  // Fetch transactions when component mounts or filters/pagination changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Set up real-time subscription to transaction changes
  useEffect(() => {
    const subscription = supabase
      .channel('transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions'
      }, (payload) => {
        // Refresh transactions when changes occur
        fetchTransactions();
        if (payload.eventType === 'INSERT') {
          // Show notification for new transactions
          const newTransaction = formatTransaction(payload.new);
          setSnackbar({
            open: true,
            message: `New transaction: ${newTransaction.transactionId}`,
            severity: 'info'
          });
        }
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchTransactions, formatTransaction]);

  /**
   * Exports transactions to Excel format
   */
  const exportToXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, 'transactions.xlsx');
  };
  
  /**
   * Exports transactions to CSV format
   */
  const exportToCSV = () => {
    const csv = Papa.unparse(transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'transactions.csv');
  };

  /**
   * Column definitions for the DataGrid
   */
  const columns = [
    { field: "date", headerName: "Date/Time", flex: 1, minWidth: 180 },
    { field: "transactionId", headerName: "Transaction ID", flex: 1, minWidth: 150 },
    { field: "type", headerName: "Type", flex: 1, minWidth: 120 },
    { 
      field: "amount", 
      headerName: "Amount (TZS)", 
      flex: 1,
      minWidth: 120,
      renderCell: ({ row }) => (
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
      renderCell: ({ row }) => {
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
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: '1.2' }}>
          {row.description}
        </Typography>
      )
    },
  ];

  /**
   * Filters transactions based on current filter state
   */
  const filteredTransactions = transactions.filter(transaction => {
    return (
      (filters.search === '' || 
       transaction.transactionId.toLowerCase().includes(filters.search.toLowerCase()) || 
       transaction.description.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.type === '' || transaction.type === filters.type) &&
      (filters.status === '' || transaction.status === filters.status) &&
      (filters.minAmount === '' || transaction.amount >= Number(filters.minAmount)) &&
      (filters.maxAmount === '' || transaction.amount <= Number(filters.maxAmount)) &&
      (!filters.fraudOnly || transaction.is_fraud)
    );
  });

  /**
   * Refreshes the transaction data
   */
  const handleRefresh = () => {
    fetchTransactions();
    setSnackbar({ 
      open: true, 
      message: 'Transactions refreshed', 
      severity: 'success' 
    });
  };

  /**
   * Closes the snackbar notification
   */
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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
            
            {/* Export to Excel button */}
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
              XLSX
            </Button>
            
            {/* Export to CSV button */}
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
        
        {/* Fraud-only toggle */}
        <Box display="flex" alignItems="center" mt={2}>
          <TextField
            label="Fraud Only"
            value={filters.fraudOnly}
            onChange={(e) => setFilters({...filters, fraudOnly: e.target.checked})}
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
              fetchTransactions();
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
            border: 'none',
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
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: colors.blueAccent[700],
            minHeight: "40px",
            borderTop: "1px solid #ccc",
            alignItems: "center",
          },
          "& .MuiTablePagination-root": {
            fontSize: "0.8rem",
          },
          "& .MuiDataGrid-row": {
            cursor: "pointer",
            "&:hover": {
              backgroundColor: colors.blueAccent[500],
            },
          }
        }}
      >
        {loading ? (
          // Loading indicator
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          // Data grid component
          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            rowCount={rowCount}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            onRowClick={(params) => handleOpen(params.row)}
            slots={{
              toolbar: GridToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                printOptions: { disableToolbarButton: true },
                csvOptions: { disableToolbarButton: true },
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
          timeout: 500,
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
            bgcolor: colors.primary[400],
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
                
                {/* Sender/Receiver visualization */}
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
                  
                  {/* Animated transfer visualization */}
                  <Box sx={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)',
                    width: '20%'
                  }}>
                    <motion.div
                      animate={{
                        x: [-10, 10, -10],
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
                        x: [-5, 5, -5],
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
                        x: [-10, 10, -10],
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
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Transaction ID:</Typography>
                      <Typography variant="body1">{selectedTransaction.transactionId}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Date/Time:</Typography>
                      <Typography variant="body1">{selectedTransaction.date}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Type:</Typography>
                      <Typography variant="body1">{selectedTransaction.type}</Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px' }}>
                      <Typography variant="body2" color="textSecondary">Status:</Typography>
                      <Chip 
                        label={STATUS_CONFIG[selectedTransaction.status.toUpperCase()]?.label || selectedTransaction.status}
                        color={STATUS_CONFIG[selectedTransaction.status.toUpperCase()]?.color || 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>
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
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
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