import { useState, useContext } from "react";
import { Box, IconButton, Menu, MenuItem, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { ColorModeContext } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const userMenuOpen = Boolean(anchorEl);

  const handlePersonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccountSettings = () => {
    handleClose();
    navigate("/account_settings");
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate("/login");
  };

  return (
    <Box 
      display="flex" 
      justifyContent="flex-end" 
      p={1}  // Reduced from p={2} to p={1}
      bgcolor={colors.primary[400]}
      sx={{
        height: '48px',  // Explicit height control
        alignItems: 'center'  // Vertically center the icons
      }}
    >
      <Box display="flex">
        <IconButton 
          onClick={colorMode.toggleColorMode}
          size="small"  // Smaller icon button
        >
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon fontSize="small" sx={{ color: colors.grey[100] }} />
          ) : (
            <LightModeOutlinedIcon fontSize="small" sx={{ color: colors.grey[900] }} />
          )}
        </IconButton>

        <IconButton 
          onClick={handlePersonClick}
          size="small"  // Smaller icon button
        >
          <PersonOutlinedIcon fontSize="small" sx={{ color: colors.grey[100] }} />
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