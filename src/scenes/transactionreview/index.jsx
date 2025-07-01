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
  IconButton
} from "@mui/material";
import { supabase } from '../../supabaseClient';
import CloseIcon from '@mui/icons-material/Close';

export default function TransactionReview() {
  const [transactions, setTransactions] = useState([]);
  const [editedRows, setEditedRows] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
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
      
      // Check if user exists in users table, if not create them
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist, create them
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            id: data.user.id,
            email: data.user.email,
            first_name: data.user.user_metadata?.first_name || '',
            last_name: data.user.user_metadata?.last_name || '',
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error("Error creating user:", insertError);
          throw new Error("Failed to create user record");
        }
      } else if (userCheckError) {
        throw userCheckError;
      }
      
      setCurrentUserId(data.user.id);
      setCurrentUserEmail(data.user.email);
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
      
      console.log("Fetched transactions:", data); // Debug log
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

    setEditedRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        new_status: newStatus,
        previous_status: transaction.status || ""
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

      // 1. Update transaction status
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ status: changes.new_status })
        .eq("transactionid", id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      // 2. Insert into transaction_reviews
      // First, let's try to find the user in the users table by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("email", currentUserEmail)
        .single();

      let reviewerUserId;
      if (userError && userError.code === 'PGRST116') {
        // User not found, create them first
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            id: currentUserId,
            email: currentUserEmail,
            first_name: '',
            last_name: '',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error("Create user error:", createError);
          throw createError;
        }
        reviewerUserId = newUser.id;
      } else if (userError) {
        throw userError;
      } else {
        reviewerUserId = userData.id;
      }

      const { error: insertError } = await supabase
        .from("transaction_reviews")
        .insert({
          transaction_id: id,
          reviewed_by_user_id: reviewerUserId,
          previous_status: changes.previous_status,
          new_status: changes.new_status,
          notes: changes.notes || "",
          reviewed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      showSnackbar("Changes saved successfully", 'success');
      await fetchTransactions();
      
      // Clear the edited row
      setEditedRows(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error("Save error:", err);
      showSnackbar(`Failed to save changes: ${err.message}`, 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const columns = [
    { 
      field: "transactionid", 
      headerName: "ID", 
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        return params.row?.transactionid || 'N/A';
      }
    },
    { 
      field: "initiator", 
      headerName: "From", 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return params.row?.initiator || 'N/A';
      }
    },
    { 
      field: "recipient", 
      headerName: "To", 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return params.row?.recipient || 'N/A';
      }
    },
    { 
      field: "amount", 
      headerName: "Amount", 
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => {
        const amount = params.row?.amount;
        return amount != null ? amount.toString() : 'N/A';
      }
    },
    { 
      field: "transactiontype", 
      headerName: "Type", 
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        return params.row?.transactiontype || 'N/A';
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
        
        return (
          <Select
            size="small"
            value={editedRows[row.transactionid]?.new_status || row.status || ''}
            onChange={(e) => handleStatusChange(row.transactionid, e.target.value)}
            fullWidth
            sx={{ minHeight: '32px' }}
          >
            <MenuItem value="legitimate">Legitimate</MenuItem>
            <MenuItem value="flagged">Flagged</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
          </Select>
        );
      }
    },
    {
      field: "fraud_probability", 
      headerName: "Fraud Probability", 
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => {
        const probability = params.row?.fraud_probability;
        return probability != null ? `${(probability * 100).toFixed(1)}%` : 'N/A';
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
            placeholder="Optional notes"
            value={editedRows[row.transactionid]?.notes || ""}
            onChange={(e) => handleNotesChange(row.transactionid, e.target.value)}
            sx={{ minHeight: '32px' }}
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
        
        const hasChanges = editedRows[row.transactionid];
        
        return (
          <Button
            variant="contained"
            size="small"
            disabled={!hasChanges}
            onClick={() => handleSave(row.transactionid)}
            sx={{ 
              minWidth: '80px',
              opacity: hasChanges ? 1 : 0.5
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
        <Typography variant="h5" gutterBottom>
          Transaction Review
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Transaction Review
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {transactions.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No transactions found. Make sure your database contains transaction data.
        </Alert>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Found {transactions.length} transaction(s)
        </Typography>
      )}

      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={transactions}
          getRowId={(row) => {
            // Ensure we have a valid ID
            if (row && row.transactionid) {
              return row.transactionid;
            }
            console.warn("Row missing transactionid:", row);
            return `temp-${Math.random()}`;
          }}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          autoHeight={false}
          loading={loading}
          error={error}
          sx={{
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row': {
              minHeight: '60px !important',
            }
          }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
        />
      </div>

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
}