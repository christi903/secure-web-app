import { useState, useContext } from "react";
import { Box, IconButton, InputBase, useTheme, Menu, MenuItem, Badge } from "@mui/material";
import { tokens } from "../../theme";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { ColorModeContext } from "../../theme";
import NotificationsPage from "./NotificationsPage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { logout } = useAuth();  // Accessing logout from context

  // State for user menu
  const [anchorEl, setAnchorEl] = useState(null);
  const userMenuOpen = Boolean(anchorEl);

  // State for notifications menu
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const notificationsOpen = Boolean(notificationsAnchorEl);

  // Sample notifications count (can be dynamic)
  const [notificationsCount] = useState(3);

  // Handle clicking on the person icon
  const handlePersonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle clicking on the notifications icon
  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  // Close all menus
  const handleClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  // Handle Account Settings action
  const handleAccountSettings = () => {
    console.log("Account Settings clicked");
    handleClose();
    navigate("/form"); // Navigate to the form page
  };

  // Handle Logout action
  const handleLogout = () => {
    console.log("Logout clicked");
    logout();  // Logout function from AuthContext
    handleClose();
    navigate("/login");  // Navigate to login page
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2} bgcolor={colors.primary[400]}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        alignItems="center"
        backgroundColor={colors.primary[300]}
        borderRadius="5px"
        p="5px 10px"
        sx={{
          "&:hover": {
            backgroundColor: colors.primary[300],
          },
        }}
      >
        <InputBase sx={{ ml: 1, flex: 1, color: colors.grey[100] }} placeholder="Search" />
        <IconButton>
          <SearchIcon sx={{ color: colors.grey[100] }} />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon sx={{ color: colors.grey[100] }} />
          ) : (
            <LightModeOutlinedIcon sx={{ color: colors.grey[900] }} />
          )}
        </IconButton>

        {/* Notifications Icon with Badge */}
        <IconButton onClick={handleNotificationsClick}>
          <Badge badgeContent={notificationsCount} color="error">
            <NotificationsOutlinedIcon sx={{ color: colors.grey[100] }} />
          </Badge>
        </IconButton>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationsAnchorEl}
          open={notificationsOpen}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            style: {
              width: "400px",
              maxWidth: "100%",
              padding: 0,
              backgroundColor: colors.primary[400],
              boxShadow: theme.shadows[10],
              borderRadius: "8px",
              overflow: "visible",
            },
          }}
          MenuListProps={{
            style: {
              padding: 0,
            },
          }}
        >
          <NotificationsPage />
        </Menu>

        {/* User Menu */}
        <IconButton onClick={handlePersonClick}>
          <PersonOutlinedIcon sx={{ color: colors.grey[100] }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={userMenuOpen}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={handleAccountSettings}>Account Settings</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
