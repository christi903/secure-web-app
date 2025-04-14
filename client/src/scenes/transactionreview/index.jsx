import { Box, useTheme } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";

const TransactionReview = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
      currentStatus: "Blocked",
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
      currentStatus: "Blocked",
      reviewedBy: "Officer Alex",
      reviewDate: "2025-04-07"
    },
    {
      id: 5,
      account: "0678-444555",
      amount: 250000,
      date: "2025-04-09",
      initialStatus: "Blocked",
      currentStatus: "Flagged",
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
      currentStatus: "Blocked",
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
      currentStatus: "Blocked",
      reviewedBy: "Officer Sahili",
      reviewDate: "2025-04-09"
    },
    {
      id: 11,
      account: "0711-555777",
      amount: 145000,
      date: "2025-04-10",
      initialStatus: "Blocked",
      currentStatus: "Flagged",
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
      currentStatus: "Blocked",
      reviewedBy: "Officer Sahili",
      reviewDate: "2025-04-13"
    },
    {
      id: 14,
      account: "0688-888000",
      amount: 20000,
      date: "2025-04-13",
      initialStatus: "Flagged",
      currentStatus: "Flagged",
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
      headerName: " After Review",
      flex: 1,
      cellClassName: (params) => `status-${params.value.toLowerCase()}`
    },
    { field: "reviewedBy", headerName: "Reviewer", flex: 1 },
    { field: "reviewDate", headerName: "Date", flex: 1 }
  ];

  return (
    <Box m="20px">
      <Header
        title="SUSPICIOUS TRANSACTIONS REVIEW"
        subtitle="Review flagged and blocked transactions"
      />
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

          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
            color: colors.grey[100],
            fontSize: "16px"
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
          rows={transactionRows}
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
