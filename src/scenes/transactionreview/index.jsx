import { useEffect, useState, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Paper,
  Chip
} from "@mui/material";
import { supabase } from '../../supabaseClient';
import CloseIcon from '@mui/icons-material/Close';

export default function TransactionReview() {
  const [transactions, setTransactions] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        throw error || new Error("No user found");
      }
      
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", data.user.email)
        .single();

      if (userCheckError && userCheckError.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || '',
            last_name: data.user.user_metadata?.last_name || '',
            created_at: new Date().toISOString()
          })
          .select();

        if (insertError || !newUser) {
          console.error("Error creating user:", insertError);
          throw new Error("Failed to create user record");
        }
        setCurrentUserId(newUser[0].id);
        setCurrentUserEmail(newUser[0].email);
      } else if (userCheckError) {
        throw userCheckError;
      } else {
        setCurrentUserId(existingUser.id);
        setCurrentUserEmail(existingUser.email);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Failed to authenticate user");
      showSnackbar("Failed to authenticate user", 'error');
    }
  }, [showSnackbar]);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Fetched transactions:", data);
      setTransactions(data || []);
      
      if (!data || data.length === 0) {
        showSnackbar("No transactions found", 'info');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Failed to load transactions: ${err.message}`);
      showSnackbar(`Failed to load transactions: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      await fetchTransactions();
    };
    initializeData();
  }, [fetchUser, fetchTransactions]);

  const handleStatusChange = (id, newStatus) => {
    const transaction = transactions.find(t => t.transactionid === id);
    if (!transaction) {
      console.warn(`Transaction with ID ${id} not found`);
      return;
    }

    console.log(`Changing status for transaction ${id} from ${transaction.status} to ${newStatus}`);

    setEditedRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: newStatus, // Changed from new_status to status
        previous_status: transaction.status || "",
        hasStatusChange: true
      }
    }));
  };

  const handleNotesChange = (id, newNotes) => {
    setEditedRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes: newNotes
      }
    }));
  };

  const handleSave = async (id) => {
    try {
      const changes = editedRows[id];
      if (!changes || !currentUserId) {
        showSnackbar("No changes to save or user not authenticated", 'warning');
        return;
      }

      console.log("Saving changes for transaction:", id, changes);

      // Update transaction status if changed
      if (changes.hasStatusChange && changes.status !== changes.previous_status) {
        const { error: updateError } = await supabase
          .from("transactions")
          .update({ status: changes.status })
          .eq("transactionid", id);

        if (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }

        console.log(`Successfully updated transaction ${id} status to ${changes.status}`);
      }

      // Insert review record
      const { error: insertError } = await supabase
        .from("transaction_reviews")
        .insert({
          transaction_id: id,
          reviewed_by_user_id: currentUserId,
          previous_status: changes.previous_status || "",
          new_status: changes.status || changes.previous_status || "",
          notes: changes.notes || "",
          reviewed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      showSnackbar("Review saved successfully", 'success');
      
      // Clear the edited row
      setEditedRows(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      // Refresh transactions to show updated data
      await fetchTransactions();
      
    } catch (err) {
      console.error("Save error:", err);
      showSnackbar(`Failed to save review: ${err.message}`, 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const columns = [
    { 
      field: "transactionid", 
      headerName: "Transaction ID", 
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const id = params.row?.transactionid;
        return (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {id ? `${id.toString().slice(0, 8)}...` : 'N/A'}
          </Typography>
        );
      }
    },
    { 
      field: "initiator", 
      headerName: "From", 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return (
          <Typography variant="body2" noWrap>
            {params.row?.initiator || 'N/A'}
          </Typography>
        );
      }
    },
    { 
      field: "recipient", 
      headerName: "To", 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return (
          <Typography variant="body2" noWrap>
            {params.row?.recipient || 'N/A'}
          </Typography>
        );
      }
    },
    { 
      field: "amount", 
      headerName: "Amount", 
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const amount = params.row?.amount;
        return (
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {amount != null ? `TZS ${parseFloat(amount).toLocaleString('en-TZ')}` : 'N/A'}
          </Typography>
        );
      }
    },
    { 
      field: "transactiontype", 
      headerName: "Type", 
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        return (
          <Chip 
            label={params.row?.transactiontype || 'N/A'} 
            size="small" 
            variant="outlined"
          />
        );
      }
    },
    { 
      field: "fraud_probability", 
      headerName: "Fraud Probability", 
      flex: 0.8,
      minWidth: 130,
      renderCell: (params) => {
        const probability = params.row?.fraud_probability;
        
        if (probability == null) {
          return (
            <Typography variant="body2" color="text.secondary">
              N/A
            </Typography>
          );
        }
        
        // Convert to percentage if it's a decimal between 0 and 1
        const percentValue = probability <= 1 ? probability * 100 : probability;
        
        // Determine color based on probability
        let color = 'success';
        if (percentValue >= 80) {
          color = 'error';
        } else if (percentValue >= 50) {
          color = 'warning';
        }
        
        return (
          <Chip 
            label={`${percentValue.toFixed(1)}%`}
            size="small" 
            color={color}
            variant="filled"
          />
        );
      }
    },
    {
      field: "status", 
      headerName: "Status", 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const row = params.row;
        if (!row || !row.transactionid) return 'N/A';
        
        // Use the edited status if available, otherwise use the original status
        const currentStatus = editedRows[row.transactionid]?.status || row.status || '';
        
        console.log(`Rendering status for ${row.transactionid}: ${currentStatus}`);
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Select
              size="small"
              value={currentStatus}
              onChange={(e) => handleStatusChange(row.transactionid, e.target.value)}
              sx={{ 
                minWidth: '120px',
                '& .MuiSelect-select': {
                  py: 0.5
                }
              }}
            >
              <MenuItem value="legit">
                <Chip label="Legit" color="success" size="small" />
              </MenuItem>
              <MenuItem value="flagged">
                <Chip label="Flagged" color="warning" size="small" />
              </MenuItem>
              <MenuItem value="blocked">
                <Chip label="Blocked" color="error" size="small" />
              </MenuItem>
            </Select>
          </Box>
        );
      }
    },
    {
      field: "notes", 
      headerName: "Review Notes", 
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => {
        const row = params.row;
        if (!row || !row.transactionid) return null;
        
        return (
          <TextField
            size="small"
            fullWidth
            placeholder="Add review notes..."
            value={editedRows[row.transactionid]?.notes || ""}
            onChange={(e) => handleNotesChange(row.transactionid, e.target.value)}
            variant="outlined"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                height: '36px'
              }
            }}
          />
        );
      }
    },
    {
      field: "action", 
      headerName: "Action", 
      flex: 0.6,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => {
        const row = params.row;
        if (!row || !row.transactionid) return null;
        
        const hasChanges = editedRows[row.transactionid] && 
          (editedRows[row.transactionid].hasStatusChange || editedRows[row.transactionid].notes);
        
        return (
          <Button
            variant="contained"
            size="small"
            disabled={!hasChanges}
            onClick={() => handleSave(row.transactionid)}
            sx={{ 
              minWidth: '80px',
              height: '32px'
            }}
          >
            Save
          </Button>
        );
      }
    }
  ];

  if (loading) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Transaction Review
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3} sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Paper elevation={2} sx={{ 
        p: 3, 
        mb: 3,
        background: 'linear-gradient(to right, #141b2d, #1F2A40)',
        color: 'white'
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Transaction Review Dashboard
        </Typography>
        
        <Typography variant="body1">
          Review and update transaction statuses
        </Typography>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={1} sx={{ 
        p: 2, 
        mb: 2,
        background: 'linear-gradient(to right, #141b2d, #1F2A40)',
        color: 'white'
      }}>
        {transactions.length === 0 ? (
          <Alert severity="info">
            No transactions found. Make sure your database contains transaction data.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Total Transactions: {transactions.length}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={fetchTransactions}
              disabled={loading}
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Refresh Data
            </Button>
          </Box>
        )}
      </Paper>

      <Paper elevation={1} sx={{ height: 650, width: "100%", overflow: 'hidden' }}>
        <DataGrid
          rows={transactions}
          getRowId={(row) => {
            if (row && row.transactionid) {
              return row.transactionid;
            }
            console.warn("Row missing transactionid:", row);
            return `temp-${Math.random()}`;
          }}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          disableSelectionOnClick
          loading={loading}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              borderRight: '1px solid #f0f0f0',
            },
            '& .MuiDataGrid-row': {
              minHeight: '60px !important',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#141b2d !important',
              color: 'white !important',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#141b2d !important',
              color: 'white !important',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
              color: 'white !important',
            }
          }}
        />
      </Paper>

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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}