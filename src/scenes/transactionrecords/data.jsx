import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export const useTransactionData = () => {
  // State declarations
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    minAmount: '',
    maxAmount: '',
    fraudOnly: false
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  /**
   * Generates a description for a transaction
   */
  const generateDescription = useCallback((transaction) => {
    const actions = {
      TRANSFER: 'Transfer',
      PAYMENT: 'Payment',
      WITHDRAWAL: 'Withdrawal',
      DEPOSIT: 'Deposit'
    };
    const action = actions[transaction.transactiontype] || 'Transaction';
    return `${action} from ${transaction.initiator} to ${transaction.recipient}`;
  }, []);

  /**
   * Formats a raw transaction object into a display-friendly format
   */
  const formatTransaction = useCallback((transaction) => ({
    id: transaction.transactionid,
    date: new Date(transaction.transaction_time).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    transactionId: `TRX-${transaction.transactionid.toString().slice(0, 8).toUpperCase()}`,
    type: transaction.transactiontype,
    amount: transaction.amount,
    status: transaction.status || 'PENDING',
    description: transaction.description || generateDescription(transaction),
    sender: transaction.initiator,
    receiver: transaction.recipient,
    is_fraud: transaction.fraud_probability > 0.7,
    fraud_probability: transaction.fraud_probability,
    fraud_alert_severity: transaction.fraud_probability > 0.7 ? 'high' : transaction.fraud_probability > 0.4 ? 'medium' : 'low'
  }), [generateDescription]);

  /**
   * Fetches transactions from the database with applied filters
   */
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('transaction_time', { ascending: false });

      if (filters.search) {
        query = query.or(`initiator.ilike.%${filters.search}%,recipient.ilike.%${filters.search}%`);
      }
      if (filters.type) {
        query = query.eq('transactiontype', filters.type);
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
        query = query.gt('fraud_probability', 0.7);
      }

      const { data, count, error } = await query
        .range(
          paginationModel.page * paginationModel.pageSize,
          (paginationModel.page + 1) * paginationModel.pageSize - 1
        );

      if (error) throw error;

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
        fetchTransactions();
        if (payload.eventType === 'INSERT') {
          const newTransaction = formatTransaction(payload.new);
          setSnackbar({
            open: true,
            message: `New transaction: ${newTransaction.transactionId}`,
            severity: 'info'
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchTransactions, formatTransaction]);

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
   * Handler functions
   */
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (prop) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFilters({ ...filters, [prop]: value });
  };

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

  const handleOpen = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRefresh = () => {
    fetchTransactions();
    setSnackbar({ 
      open: true, 
      message: 'Transactions refreshed', 
      severity: 'success' 
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return {
    transactions,
    loading,
    error,
    snackbar,
    paginationModel,
    rowCount,
    filters,
    selectedTransaction,
    open,
    anchorEl,
    handleFilterClick,
    handleFilterClose,
    handleFilterChange,
    clearFilters,
    handleOpen,
    handleClose,
    handleRefresh,
    handleCloseSnackbar,
    setPaginationModel,
    exportToXLSX,
    exportToCSV,
    filteredTransactions
  };
};