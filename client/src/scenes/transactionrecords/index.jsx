import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const TransactionHistory = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: "date", headerName: "Date/Time", flex: 1 },
    { field: "transactionId", headerName: "Transaction ID", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "amount", headerName: "Amount ($)", flex: 1 },
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

  const transactionRecords = [
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
    { id: 11, date: "Mar 20, 2025, 01:00 PM", transactionId: "TRX-12355", type: "Deposit", amount: 450.0, status: "Completed", description: "Bank deposit" },
    { id: 12, date: "Mar 19, 2025, 10:15 AM", transactionId: "TRX-12356", type: "Transfer", amount: 75.0, status: "Confirmed", description: "Peer transfer" },
    { id: 13, date: "Mar 18, 2025, 03:00 PM", transactionId: "TRX-12357", type: "Withdrawal", amount: 120.0, status: "Pending", description: "ATM withdrawal" },
    { id: 14, date: "Mar 17, 2025, 09:45 AM", transactionId: "TRX-12358", type: "Payment", amount: 59.0, status: "Completed", description: "Bill payment" },
    { id: 15, date: "Mar 16, 2025, 06:10 PM", transactionId: "TRX-12359", type: "Refund", amount: 80.0, status: "Completed", description: "Returned item" },
    { id: 16, date: "Mar 15, 2025, 12:00 PM", transactionId: "TRX-12360", type: "Deposit", amount: 350.0, status: "Completed", description: "Mobile deposit" },
    { id: 17, date: "Mar 14, 2025, 11:00 AM", transactionId: "TRX-12361", type: "Payment", amount: 65.0, status: "Failed", description: "Online subscription" },
    { id: 18, date: "Mar 13, 2025, 02:30 PM", transactionId: "TRX-12362", type: "Transfer", amount: 210.0, status: "Confirmed", description: "To personal account" },
    { id: 19, date: "Mar 12, 2025, 09:00 AM", transactionId: "TRX-12363", type: "Refund", amount: 33.0, status: "Completed", description: "Excess charge refund" },
    { id: 20, date: "Mar 11, 2025, 04:45 PM", transactionId: "TRX-12364", type: "Withdrawal", amount: 190.0, status: "Pending", description: "Bank ATM withdrawal" },
  ];

  return (
    <Box m="20px">
      <Header title="TRANSACTION HISTORY" subtitle="List of recent financial transactions" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
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
        }}
      >
        <DataGrid
          rows={transactionRecords}
          columns={columns}
          pageSize={100}
          rowsPerPageOptions={[100]}
        />
      </Box>
    </Box>
  );
};

export default TransactionHistory;
