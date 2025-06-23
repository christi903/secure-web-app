import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Chip,
  useMediaQuery,
  CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { 
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  AccountBalanceWallet as WalletIcon,
  Receipt as BillIcon,
  PhoneAndroid as MobileIcon,
  Error as BlockedIcon
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode) || {};
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (supabaseError) throw supabaseError;
        
        const formattedTransactions = data.map(tx => ({
          id: tx.id,
          type: getTransactionType(tx.type),
          amount: `Tshs ${tx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
          time: formatDistanceToNow(new Date(tx.created_at), { addSuffix: true }),
          status: tx.status,
          icon: getTransactionIcon(tx.type, tx.status)
        }));
        
        setTransactions(formattedTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getTransactionType = (type) => {
    const typeMap = {
      'DEPOSIT': 'Mobile Money Deposit',
      'WITHDRAWAL': 'Mobile Money Withdrawal',
      'BILL_PAYMENT': 'Bill Payment',
      'TRANSFER': 'Money Transfer'
    };
    return typeMap[type] || type;
  };

  const getTransactionIcon = (type, status) => {
    if (status === 'BLOCKED') return <BlockedIcon />;
    
    const iconMap = {
      'DEPOSIT': <MobileIcon />,
      'WITHDRAWAL': <WalletIcon />,
      'BILL_PAYMENT': <BillIcon />,
      'TRANSFER': <WalletIcon />
    };
    return iconMap[type] || <WalletIcon />;
  };

  const getStatusChip = (status) => {
    // Default color values
    const defaultColors = {
      color: theme.palette.text.primary,
      bgcolor: theme.palette.background.default
    };

    const statusProps = {
      "LEGITIMATE": {
        icon: <CheckCircleIcon fontSize="small" />,
        color: colors.greenAccent?.[500] || '#4caf50',
        bgcolor: colors.greenAccent?.[900] || '#1b5e20',
        label: "Completed"
      },
      "PENDING": {
        icon: <PendingIcon fontSize="small" />,
        color: colors.yellowAccent?.[500] || '#ffc107',
        bgcolor: colors.yellowAccent?.[900] || '#ff8f00',
        label: "Pending"
      },
      "FLAGGED": {
        icon: <PendingIcon fontSize="small" />,
        color: colors.orangeAccent?.[500] || '#ff9800',
        bgcolor: colors.orangeAccent?.[900] || '#e65100',
        label: "Flagged"
      },
      "BLOCKED": {
        icon: <BlockedIcon fontSize="small" />,
        color: colors.redAccent?.[500] || '#f44336',
        bgcolor: colors.redAccent?.[900] || '#b71c1c',
        label: "Blocked"
      }
    };
    
    const props = statusProps[status] || {
      ...defaultColors,
      icon: <PendingIcon fontSize="small" />,
      label: status
    };
    
    return (
      <Chip
        size="small"
        label={props.label}
        icon={props.icon}
        sx={{
          color: props.color,
          backgroundColor: props.bgcolor,
          ml: 1,
          '& .MuiChip-icon': {
            color: props.color
          }
        }}
      />
    );
  };
  
  const handleViewAllTransactions = () => {
    navigate('/transactionsreview');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        p={3} 
        sx={{ 
          backgroundColor: colors.redAccent?.[900] || '#d32f2f',
          borderRadius: "8px",
          color: colors.grey?.[100] || '#ffffff'
        }}
      >
        <Typography>{error}</Typography>
        <Button 
          onClick={() => window.location.reload()} 
          sx={{ mt: 2, color: colors.grey?.[100] || '#ffffff' }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      p={isSmallScreen ? 2 : 3}
      sx={{
        backgroundColor: colors.primary?.[400] || theme.palette.background.paper,
        borderRadius: "8px",
        maxWidth: isSmallScreen ? "100%" : "500px",
        width: "100%",
        boxShadow: theme.shadows[10]
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" sx={{ color: colors.grey?.[100] || theme.palette.text.primary, fontWeight: 600 }}>
          Recent Transactions
        </Typography>
        <Typography variant="caption" sx={{ color: colors.grey?.[500] || theme.palette.text.secondary }}>
          {new Date().toLocaleDateString()}
        </Typography>
      </Box>
      
      <List sx={{ p: 0 }}>
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <Box key={transaction.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  px: isSmallScreen ? 0 : 1,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: colors.primary?.[300] || theme.palette.action.hover,
                    borderRadius: '4px'
                  }
                }}
              >
                <Box sx={{ 
                  mr: 2,
                  color: colors.greenAccent?.[500] || '#4caf50',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {transaction.icon}
                </Box>
                
                <ListItemText
                  primary={
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: colors.grey?.[100] || theme.palette.text.primary,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap'
                      }}
                    >
                      {transaction.type}
                      {getStatusChip(transaction.status)}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: colors.greenAccent?.[500] || '#4caf50',
                          fontWeight: 600,
                          mt: 0.5
                        }}
                      >
                        {transaction.amount}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: colors.grey?.[300] || theme.palette.text.secondary,
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        {transaction.time}
                      </Typography>
                    </>
                  }
                  sx={{ my: 0 }}
                />
              </ListItem>
              <Divider 
                sx={{ 
                  backgroundColor: colors.primary?.[300] || theme.palette.divider,
                  my: isSmallScreen ? 1 : 0.5
                }} 
              />
            </Box>
          ))
        ) : (
          <Typography 
            variant="body1" 
            sx={{ 
              color: colors.grey?.[300] || theme.palette.text.secondary,
              textAlign: 'center',
              py: 2
            }}
          >
            No recent transactions found
          </Typography>
        )}
      </List>

      <Box mt={3} display="flex" justifyContent="center">
        <Button 
          variant="outlined" 
          fullWidth={isSmallScreen}
          sx={{ 
            color: colors.grey?.[100] || theme.palette.text.primary,
            borderColor: colors.primary?.[300] || theme.palette.divider,
            '&:hover': {
              borderColor: colors.primary?.[100] || theme.palette.action.active,
              backgroundColor: colors.primary?.[300] || theme.palette.action.hover
            },
            px: 3,
            py: 1
          }}
          onClick={handleViewAllTransactions}
        >
          View All Transactions
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationsPage;