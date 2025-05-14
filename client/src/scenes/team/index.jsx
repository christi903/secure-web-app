import { mockDataTeam } from "../../data/mockData"; // Sample team data
import { Box, Typography, useTheme } from "@mui/material"; // Layout components
import { DataGrid } from "@mui/x-data-grid"; // Data table component
import { tokens } from "../../theme"; // Theme colors
import Header from "../../components/Header"; // Custom header
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"; // Admin icon
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined"; // User icon
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined"; // Manager icon
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"; // Fraud analyst icon

const Team = () => {
  const theme = useTheme(); // Access MUI theme
  const colors = tokens(theme.palette.mode); // Get theme colors

  // DataGrid columns configuration
  const columns = [
    { field: "id", headerName: "ID", width: 70 }, // ID column
    {
      field: "name",
      headerName: "Name",
      flex: 1, // Flexible width
      cellClassName: "name-column--cell", // Custom class for name cells
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1, // Flexible width
    },
    {
      field: "access",
      headerName: "Access Level",
      flex: 1, // Flexible width
      renderCell: ({ row: { access } }) => { // Custom cell rendering
        let bgColor; // Background color based on access level
        let icon; // Icon based on access level

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
          default: // Admin case
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
      {/* Page header */}
      <Header title="TEAM" subtitle="Fraud Detection Team" />

      {/* DataGrid showing team members */}
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none", // Remove default border
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none", // Remove cell borders
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300], // Custom color for name cells
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400], // Background color
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none", // Remove footer border
            backgroundColor: colors.blueAccent[700], // Footer background
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`, // Checkbox color
          },
        }}
      >
        <DataGrid
          rows={mockDataTeam} // Team data
          columns={columns} // Column configuration
          checkboxSelection // Enable row selection
          sx={{
            '& .MuiDataGrid-columnHeaders': { // Column header styling
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: '16px',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold', // Bold header titles
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: colors.blueAccent[700],
              '&:focus, &:focus-within': {
                outline: 'none !important', // Remove focus outline
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default Team;