import { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { supabase } from "../../supabaseClient";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("id, first_name, last_name, email, role")
          .order("created_at", { ascending: true });

        if (error) throw error;

        // Transform data to match our table structure
        const formattedUsers = data.map(user => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
          email: user.email || "No email",
          access: user.role?.toLowerCase() || "user" // Default to 'user' if not specified
        }));

        setUsers(formattedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
      // Optional: Add a valueGetter if you want to display first/last separately
      // valueGetter: (params) => `${params.row.first_name} ${params.row.last_name}`
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "access",
      headerName: "Role",
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

  if (loading) {
    return (
      <Box m="20px">
        <Header title="TEAM" subtitle="Fraud Detection Team" />
        <Box
          mt="40px"
          height="75vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.primary[400]}
          borderRadius="4px"
        >
          <Typography variant="h5" color={colors.grey[100]}>
            Loading team members...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="20px">
        <Header title="TEAM" subtitle="Fraud Detection Team" />
        <Box
          mt="40px"
          height="75vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
          backgroundColor={colors.primary[400]}
          borderRadius="4px"
        >
          <Typography variant="h5" color={colors.redAccent[500]}>
            Error: {error}
          </Typography>
        </Box>
      </Box>
    );
  }

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
          rows={users}
          columns={columns}
          loading={loading}
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