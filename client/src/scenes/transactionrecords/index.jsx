import React, { useState } from 'react';
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
  InputAdornment
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import FilterListIcon from '@mui/icons-material/FilterList';
import { motion } from "framer-motion";

const TransactionHistory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    minAmount: '',
    maxAmount: ''
  });

  const handleOpen = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

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
      search: '',
      type: '',
      status: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const columns = [
    { field: "date", headerName: "Date/Time", flex: 1 },
    { field: "transactionId", headerName: "Transaction ID", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { 
      field: "amount", 
      headerName: "Amount (TZS)", 
      flex: 1,
      renderCell: ({ row: { amount } }) => (
        <Typography fontWeight="bold">
          {amount.toLocaleString()} TZS
        </Typography>
      )
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row: { status } }) => {
        let color;
        switch (status) {
          case "Completed":
            color = "green";
            break;
          case "Pending":
            color = "orange";
            break;
          case "Failed":
            color = "red";
            break;
          case "Confirmed":
            color = "goldenrod";
            break;
          default:
            color = "gray";
        }
        return <Typography color={color}>{status}</Typography>;
      },
    },
    { field: "description", headerName: "Description", flex: 2 },
  ];

  // Enhanced transaction data with complete sender/receiver info
  const transactionRecords = [
    { 
      id: 1, 
      date: "Apr 02, 2025, 09:30 AM", 
      transactionId: "TRX-12345", 
      type: "Mobile Payment", 
      amount: 12500.0, 
      status: "Completed", 
      description: "Payment from +255693641590 (John M.) to +255784567890 (Mary K.) for plumbing services",
      sender: "+255693641590 (John M.)",
      receiver: "+255784567890 (Mary K.)"
    },
    { 
      id: 2, 
      date: "Apr 02, 2025, 02:20 PM", 
      transactionId: "TRX-12346", 
      type: "Mobile Deposit", 
      amount: 25000.0, 
      status: "Completed", 
      description: "Deposit from CRDB Bank (A/C 111234544567) to +255713456789 (James Peter)",
      sender: "CRDB Bank (A/C 111234544567)",
      receiver: "+255713456789 (James Peter)"
    },
    { 
      id: 3, 
      date: "Apr 01, 2025, 11:45 AM", 
      transactionId: "TRX-12347", 
      type: "Mobile Withdrawal", 
      amount: 1000000.0, 
      status: "Pending", 
      description: "Withdrawal from +255713456789 (Elizabeth Joseph) to NMB Bank (A/C 1113458910)",
      sender: "+255713456789 (Elizabeth Joseph)",
      receiver: "NMB Bank (A/C 1113458910)"
    },
    { 
      id: 4, 
      date: "Mar 30, 2025, 04:15 PM", 
      transactionId: "TRX-12348", 
      type: "Mobile Refund", 
      amount: 76000.0, 
      status: "Completed", 
      description: "Refund from Jumia TZ (+255766789012) to +255713456789 (Frank Joseph) for cancelled phone order",
      sender: "Jumia TZ (+255766789012)",
      receiver: "+255713456789 (Frank Joseph)"
    },
    { 
      id: 5, 
      date: "Mar 28, 2025, 10:10 AM", 
      transactionId: "TRX-12349", 
      type: "Mobile Transfer", 
      amount: 12000.0, 
      status: "Confirmed", 
      description: "Transfer from +255713456789 (Anna Japhet) to +255678909871 (Robert Shabaan.) for rent contribution",
      sender: "+255713456789 (Anna Japhet)",
      receiver: "+255678909871 (Robert Shabaan.)"
    },
    { 
      id: 6, 
      date: "Mar 25, 2025, 01:45 PM", 
      transactionId: "TRX-12350", 
      type: "Mobile Payment", 
      amount: 42000.0, 
      status: "Failed", 
      description: "Failed payment from +255713456789 (Tatu Juma) to Zuu Tronics LTD (+255752345678) for headphones",
      sender: "+255713456789 (Tatu Juma)",
      receiver: "Zuu Tronics LTD (+255752345678)"
    },
    { 
      id: 7, 
      date: "Mar 24, 2025, 11:30 AM", 
      transactionId: "TRX-12351", 
      type: "Mobile Deposit", 
      amount: 60000.0, 
      status: "Completed", 
      description: "Cash deposit from Agent 5482 (Happiness Simon) to +255713456789 (Mgonja Himo)",
      sender: "Agent 5482 (Happiness Simon)",
      receiver: "+255713456789 (Mgonja Himo)"
    },
    { 
      id: 8, 
      date: "Mar 23, 2025, 05:45 PM", 
      transactionId: "TRX-12352", 
      type: "Mobile Transfer", 
      amount: 33000.0, 
      status: "Confirmed", 
      description: "Transfer from +255713456789 (Anna Michael) to +255662778899 (Sarah Michael) for business supplies",
      sender: "+255713456789 (Anna Michael)",
      receiver: "+255662778899 (Sarah Michael)"
    },
    { 
      id: 9, 
      date: "Mar 22, 2025, 02:00 PM", 
      transactionId: "TRX-12353", 
      type: "Mobile Refund", 
      amount: 50000.0, 
      status: "Completed", 
      description: "Refund from DStv TZ (+255673445566) to +255713456789 (Daudi Selemani) for subscription overpayment",
      sender: "DStv TZ (+255673445566)",
      receiver: "+255713456789 (Daudi Selemani)"
    },
    { 
      id: 10, 
      date: "Mar 21, 2025, 08:20 AM", 
      transactionId: "TRX-12354", 
      type: "Mobile Payment", 
      amount: 29300.0, 
      status: "Failed", 
      description: "Failed Netflix payment from +255713456789 (Dennis Joseph) to Netflix EMEA (+442079836000)",
      sender: "+255713456789 (Dennis Joseph)",
      receiver: "Netflix EMEA (+442079836000)"
    },
    { 
      id: 11, 
      date: "Mar 20, 2025, 01:00 PM", 
      transactionId: "TRX-12355", 
      type: "Mobile Deposit", 
      amount: 450000.0, 
      status: "Completed", 
      description: "Salary deposit from ABC Company Ltd to +255713456789 (Juma Shabaan)",
      sender: "ABC Company Ltd",
      receiver: "+255713456789 (Juma Shabaan)"
    },
    { 
      id: 12, 
      date: "Mar 19, 2025, 10:15 AM", 
      transactionId: "TRX-12356", 
      type: "Peer Transfer", 
      amount: 75000.0, 
      status: "Confirmed", 
      description: "Transfer from +255713456789 (Fred Emmanuel) to +255713887766 (James Pickford) for weekend trip",
      sender: "+255713456789 (Fred Emmanuel)",
      receiver: "+255713887766 (James Pickford)"
    },
    { 
      id: 13, 
      date: "Mar 18, 2025, 03:00 PM", 
      transactionId: "TRX-12357", 
      type: "Mobile Withdrawal", 
      amount: 120000.0, 
      status: "Pending", 
      description: "Withdrawal from +255713456789 (Shabaan Msele) to Visa card 1112344567 (NMB Bank)",
      sender: "+255713456789 (Shabaan Msele)",
      receiver: "Visa card 1112344567 (NMB Bank)"
    },
    { 
      id: 14, 
      date: "Mar 17, 2025, 09:45 AM", 
      transactionId: "TRX-12358", 
      type: "Mobile Payment", 
      amount: 59000.0, 
      status: "Completed", 
      description: "Utility payment from +255713456789 (Hassan Mwampamba) to DAWASCO (+255222111000) for water bill",
      sender: "+255713456789 (Hassan Mwampamba)",
      receiver: "DAWASCO (+255222111000)"
    },
    { 
      id: 15, 
      date: "Mar 16, 2025, 06:10 PM", 
      transactionId: "TRX-12359", 
      type: "Mobile Refund", 
      amount: 80000.0, 
      status: "Completed", 
      description: "Refund from Kilimall (+255767890123) to +255713456789 (David Asante) for returned shoes",
      sender: "Kilimall (+255767890123)",
      receiver: "+255713456789 (David Asante)"
    },
    { 
      id: 16, 
      date: "Mar 15, 2025, 12:00 PM", 
      transactionId: "TRX-12360", 
      type: "Mobile Deposit", 
      amount: 35000.0, 
      status: "Completed", 
      description: "Cash deposit from Mobile Money Agent 1234 (Ali Hassan) to +255713456789 (Happiness Samwel)",
      sender: "Agent 1234 (Ali Hassan)",
      receiver: "+255713456789 (Happiness Samwel)"
    },
    { 
      id: 17, 
      date: "Mar 14, 2025, 11:00 AM", 
      transactionId: "TRX-12361", 
      type: "Mobile Payment", 
      amount: 6500000.0, 
      status: "Failed", 
      description: "Failed car payment from +255713456789 (Jane Manase) to Jackline Clo-Store (+255788698702)",
      sender: "+255713456789 (Jane Manase)",
      receiver: "Jackline Clo-Store (+255788698702)"
    },
    { 
      id: 18, 
      date: "Mar 13, 2025, 02:30 PM", 
      transactionId: "TRX-12362", 
      type: "Mobile Transfer", 
      amount: 210000.0, 
      status: "Confirmed", 
      description: "Transfer from +255713456789 (Sadiki Mwamba) to +255693547890 (Juliana Bashasha) for medical bills",
      sender: "+255713456789 (Sadiki Mwamba)",
      receiver: "+255693547890 (Juliana Bashasha)"
    },
    { 
      id: 19, 
      date: "Mar 12, 2025, 09:00 AM", 
      transactionId: "TRX-12363", 
      type: "Mobile Refund", 
      amount: 33700.0, 
      status: "Completed", 
      description: "Refund from Vodacom TZ (+255673445566) to +255713456789 (Your Account) for data bundle overcharge",
      sender: "Vodacom TZ (+255673445566)",
      receiver: "+255713456789 (Your Account)"
    },
    { 
      id: 20, 
      date: "Mar 11, 2025, 04:45 PM", 
      transactionId: "TRX-12364", 
      type: "Mobile Withdrawal", 
      amount: 1900000.0, 
      status: "Pending", 
      description: "Withdrawal from +255713456789 (Anna Sibisi) to Mastercard 11167893210 (CRDB Bank)",
      sender: "+255713456789 (Anna Sibisi)",
      receiver: "Mastercard 11167893210 (CRDB Bank)"
    }
  ];

  const filteredTransactions = transactionRecords.filter(transaction => {
    return (
      (filters.search === '' || 
       transaction.transactionId.toLowerCase().includes(filters.search.toLowerCase()) || 
       transaction.description.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.type === '' || transaction.type === filters.type) &&
      (filters.status === '' || transaction.status === filters.status) &&
      (filters.minAmount === '' || transaction.amount >= Number(filters.minAmount)) &&
      (filters.maxAmount === '' || transaction.amount <= Number(filters.maxAmount))
    );
  });

  return (
    <Box m="20px">
      <Header title="TRANSACTION HISTORY" subtitle="List of recent mobile transactions" />
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
            label="Search (ID or Description)"
            value={filters.search}
            onChange={handleFilterChange('search')}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Transaction Type"
            value={filters.type}
            onChange={handleFilterChange('type')}
            fullWidth
            margin="normal"
            variant="outlined"
            select
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Mobile Payment">Mobile Payment</MenuItem>
            <MenuItem value="Mobile Deposit">Mobile Deposit</MenuItem>
            <MenuItem value="Mobile Withdrawal">Mobile Withdrawal</MenuItem>
            <MenuItem value="Mobile Refund">Mobile Refund</MenuItem>
            <MenuItem value="Mobile Transfer">Mobile Transfer</MenuItem>
            <MenuItem value="Peer Transfer">Peer Transfer</MenuItem>
          </TextField>
          <TextField
            label="Status"
            value={filters.status}
            onChange={handleFilterChange('status')}
            fullWidth
            margin="normal"
            variant="outlined"
            select
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Failed">Failed</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
          </TextField>
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
          },
        }}
      >
        <DataGrid
          rows={filteredTransactions}
          columns={columns}
          pageSize={100}
          rowsPerPageOptions={[100]}
          onRowClick={(params) => handleOpen(params.row)}
        />
      </Box>

      {/* Transaction Visualization Modal */}
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
                <Typography variant="h4" gutterBottom sx={{ 
                  textAlign: 'center', 
                  mb: 4,
                  color: colors.greenAccent[500],
                  fontWeight: 'bold'
                }}>
                  <CurrencyExchangeIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
                  Transaction Flow
                </Typography>
                
                {/* Transaction Flow Visualization */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 4,
                  position: 'relative'
                }}>
                  {/* Sender Phone */}
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
                  
                  {/* Animated Waves */}
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
                      <ArrowForwardIcon sx={{ fontSize: 40, color: colors.greenAccent[500] }} />
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
                      <ArrowForwardIcon sx={{ fontSize: 40, color: colors.greenAccent[500] }} />
                    </motion.div>
                  </Box>
                  
                  {/* Receiver Phone */}
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
                
                {/* Transaction Details */}
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
                      <Typography variant="body1" sx={{ 
                        color: selectedTransaction.status === 'Completed' ? 'green' : 
                              selectedTransaction.status === 'Pending' ? 'orange' :
                              selectedTransaction.status === 'Failed' ? 'red' : 'goldenrod',
                        fontWeight: 'bold'
                      }}>
                        {selectedTransaction.status}
                      </Typography>
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
    </Box>
  );
};

export default TransactionHistory;