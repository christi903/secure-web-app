import {
  Box,
  Typography,
  useTheme,
  Paper,
  Chip,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ReplayIcon from "@mui/icons-material/Replay";

const TransactionHistory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const transactionRecords = useMemo (() => [
    { id: 1, date: "Apr 02, 2025, 09:30 AM", transactionId: "TRX-12345", type: "Payment", amount: 125.5, status: "Completed", description: "Monthly subscription" },
    { id: 2, date: "Apr 02, 2025, 02:20 PM", transactionId: "TRX-12346", type: "Deposit", amount: 500.0, status: "Completed", description: "Account funding" },
    { id: 3, date: "Apr 01, 2025, 11:45 AM", transactionId: "TRX-12347", type: "Withdrawal", amount: 200.0, status: "Pending", description: "ATM withdrawal" },
    { id: 4, date: "Mar 30, 2025, 04:15 PM", transactionId: "TRX-12348", type: "Refund", amount: 75.25, status: "Completed", description: "Product return refund" },
    { id: 5, date: "Mar 28, 2025, 10:10 AM", transactionId: "TRX-12349", type: "Transfer", amount: 150.0, status: "Confirmed", description: "Transfer to savings account" },
    { id: 6, date: "Mar 25, 2025, 01:45 PM", transactionId: "TRX-12350", type: "Payment", amount: 42.99, status: "Failed", description: "Online purchase" },
    { id: 7, date: "Mar 24, 2025, 11:30 AM", transactionId: "TRX-12351", type: "Deposit", amount: 600.0, status: "Completed", description: "Cash deposit" },
    { id: 8, date: "Mar 23, 2025, 05:45 PM", transactionId: "TRX-12352", type: "Transfer", amount: 300.0, status: "Confirmed", description: "Transfer to business account" },
    { id: 9, date: "Mar 22, 2025, 02:00 PM", transactionId: "TRX-12353", type: "Refund", amount: 50.0, status: "Completed", description: "Service refund" },
    { id: 10, date: "Mar 21, 2025, 08:20 AM", transactionId: "TRX-12354", type: "Payment", amount: 29.99, status: "Failed", description: "Subscription failed" },
  ], []);

  const filteredRecords = useMemo(() => {
    return transactionRecords.filter((record) => {
      const matchesSearch = record.transactionId.toLowerCase().includes(searchText.toLowerCase()) ||
                            record.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesType = typeFilter ? record.type === typeFilter : true;
      const matchesStatus = statusFilter ? record.status === statusFilter : true;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchText, typeFilter, statusFilter, transactionRecords]);

  const columns = [
    { field: "date", headerName: "Date/Time", flex: 1 },
    { field: "transactionId", headerName: "Transaction ID", flex: 1 },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: ({ row: { type } }) => {
        let icon;
        switch (type) {
          case "Payment":
            icon = <PaymentIcon fontSize="small" sx={{ mr: 1 }} />;
            break;
          case "Deposit":
            icon = <AccountBalanceWalletIcon fontSize="small" sx={{ mr: 1 }} />;
            break;
          case "Withdrawal":
            icon = <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />;
            break;
          case "Transfer":
            icon = <AutorenewIcon fontSize="small" sx={{ mr: 1 }} />;
            break;
          case "Refund":
            icon = <ReplayIcon fontSize="small" sx={{ mr: 1 }} />;
            break;
          default:
            icon = null;
        }
        return (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {icon}
            <Typography variant="body2">{type}</Typography>
          </Box>
        );
      },
    },
    { field: "amount", headerName: "Amount ($)", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row: { status } }) => {
        let color;
        switch (status) {
          case "Completed":
            color = "success";
            break;
          case "Pending":
            color = "warning";
            break;
          case "Failed":
            color = "error";
            break;
          case "Confirmed":
            color = "info";
            break;
          default:
            color = "default";
        }
        return <Chip label={status} color={color} variant="outlined" />;
      },
    },
    { field: "description", headerName: "Description", flex: 2 },
  ];

  const exportCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Date/Time', 'Transaction ID', 'Type', 'Amount', 'Status', 'Description']],
      body: filteredRecords.map(record => [
        record.date,
        record.transactionId,
        record.type,
        `$${record.amount.toFixed(2)}`,
        record.status,
        record.description,
      ]),
    });
    doc.save('transactions.pdf');
  };

  return (
    <Box m="20px">
      <Header title="TRANSACTION HISTORY" subtitle="List of recent financial transactions" />

      {/* Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2} flexWrap="wrap" gap={2}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          label="Type"
          variant="outlined"
          select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="Payment">Payment</MenuItem>
          <MenuItem value="Deposit">Deposit</MenuItem>
          <MenuItem value="Withdrawal">Withdrawal</MenuItem>
          <MenuItem value="Transfer">Transfer</MenuItem>
          <MenuItem value="Refund">Refund</MenuItem>
        </TextField>
        <TextField
          label="Status"
          variant="outlined"
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Failed">Failed</MenuItem>
          <MenuItem value="Confirmed">Confirmed</MenuItem>
        </TextField>
        <Box display="flex" gap={2}>
          <Button variant="outlined" color="secondary" onClick={exportCSV}>
            Export CSV
          </Button>
          <Button variant="contained" color="secondary" onClick={exportPDF}>
            Export PDF
          </Button>
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 2, height: "75vh" }}>
        <DataGrid
          rows={filteredRecords}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          onRowClick={(params) =>
            navigate(`/transactions/${params.row.transactionId}`, { state: params.row })
          }
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: '16px',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: colors.primary[600],
              cursor: "pointer",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: colors.blueAccent[700],
              borderTop: "1px solid #ccc",
              minHeight: "40px",
              alignItems: "center",
            },
            "& .MuiTablePagination-root": {
              fontSize: "0.8rem",
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default TransactionHistory;
