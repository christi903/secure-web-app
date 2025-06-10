import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom"; // 🆕 Add this

const MainLayout = () => {
  return (
    <Box 
      display="flex" 
      height="100vh" 
      overflow="hidden"
      sx={{
        transition: "all 0.3s ease",
      }}
    >
      <Sidebar />
      
      <Box 
        component="main"
        flex={1}
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box 
          position="sticky" 
          top={0} 
          zIndex={1100}
          sx={{ 
            flexShrink: 0,
            backdropFilter: "blur(8px)",
          }}
        >
          <Topbar />
        </Box>

        <Box 
          flex={1}
          overflow="auto"
          p={3}
          sx={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'primary.light',
              borderRadius: '3px',
            },
          }}
        >
          <Outlet /> {/* 🧠 This is where child route content like Dashboard will render */}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
