import { mockDataTeam } from "../../data/mockData";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"; // New icon for fraud analyst

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "access",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { access } }) => {
        let bgColor;
        let icon;

        switch (access) {
          case "fraud analyst":
            bgColor = colors.orangeAccent[600];
            icon = <ShieldOutlinedIcon />;
            break;
          case "manager":
            bgColor = colors.blueAccent[700];
            icon = <SecurityOutlinedIcon />;
            break;
          case "user":
            bgColor = colors.greenAccent[700];
            icon = <LockOpenOutlinedIcon />;
            break;
          default:
            bgColor = colors.grey[600];
            icon = <AdminPanelSettingsOutlinedIcon />;
        }

        return (
          <Box
            display="flex"
            alignItems="center"
            gap="8px"
            width="fit-content"
            px="12px"
            py="6px"
            mx="auto"
            borderRadius="8px"
            backgroundColor={bgColor}
            boxShadow={`0 2px 5px ${colors.primary[800]}`}
          >
            {icon}
            <Typography color={colors.grey[100]} fontWeight="bold" textTransform="capitalize">
              {access}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Fraud Detection Team" />

      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          rows={mockDataTeam}
          columns={columns}
          checkboxSelection
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
          }}
        />
      </Box>
    </Box>
  );
};

export default Team;
