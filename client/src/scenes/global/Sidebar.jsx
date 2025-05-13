import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { MenuOutlined as MenuOutlinedIcon, HomeOutlined as HomeOutlinedIcon, PeopleOutlined as PeopleOutlinedIcon, ContactsOutlined as ContactsOutlinedIcon, ReceiptOutlined as ReceiptOutlinedIcon, PersonOutlined as PersonOutlinedIcon, CalendarTodayOutlined as CalendarTodayOutlinedIcon, HelpOutlined as HelpOutlinedIcon, BarChartOutlined as BarChartOutlinedIcon, PieChartOutlineOutlined as PieChartOutlineOutlinedIcon, TimelineOutlined as TimelineOutlinedIcon, MapOutlined as MapOutlinedIcon } from "@mui/icons-material";
import SecureLogo from "../../assets/securelogo";
import { supabase } from "../../supabaseClient";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography component={Link} to={to} style={{ textDecoration: "none", color: "inherit" }}>
        {title}
      </Typography>
    </MenuItem>
  );
};

const SidebarComponent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser) return;

        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) throw profileError;
        
        // Get a signed URL if the image is in Supabase Storage
        if (profile.profile_url?.startsWith('supabase://')) {
          const path = profile.profile_url.replace('supabase://', '');
          const { data: { publicUrl } } = supabase
            .storage
            .from('avatars') // replace with your bucket name
            .getPublicUrl(path);
          
          setUser({ ...profile, profilePictureUrl: publicUrl });
        } else {
          setUser(profile);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <Box sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      "& .pro-sidebar-inner": { background: `${colors.primary[400]} !important` },
      "& .pro-icon-wrapper": { backgroundColor: "transparent !important" },
      "& .pro-inner-item": { padding: "5px 35px 5px 20px !important" },
      "& .pro-inner-item:hover": { color: "#868dfb !important" },
      "& .pro-menu-item.active": { color: "#6870fa !important" },
    }}>
      <ProSidebar collapsed={isCollapsed} collapsedWidth="80px" width="250px">
        <Menu>
          <MenuItem
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {!isCollapsed && (
              <Box display="flex" justifyContent="center" alignItems="center" ml="15px">
                <SecureLogo color={colors.greenAccent[500]} />
                <IconButton sx={{ ml: 2 }} color="inherit">
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && user && (
            <Box mb="25px" display="flex" flexDirection="column" alignItems="center">
              <Box
                component="img"
                alt="profile-user"
                width="100px"
                height="100px"
                src={
                  user.profile_url || 
                  user.profilePictureUrl || 
                  "/assets/user.jpg"
                }
                sx={{
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  backgroundColor: colors.primary[900],
                  border: `2px solid ${colors.greenAccent[400]}`,
                }}
                onError={(e) => {
                  e.target.src = "/assets/user.jpg";
                }}
              />
              <Box textAlign="center" mt={2}>
                <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" sx={{ mt: "10px", fontSize: "1.1rem" }}>
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography variant="h6" color={colors.greenAccent[400]} sx={{ fontStyle: "italic", fontSize: "0.9rem" }}>
                  {user.role}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10px"}>
            <Item title="Dashboard" to="/" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>Data</Typography>
            <Item title="Manage Team" to="/team" icon={<PeopleOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Transaction Review" to="/transactionreview" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Transaction Records" to="/transactionrecords" icon={<ReceiptOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Transaction Entry" to="/TransactionEntry" icon={<ReceiptOutlinedIcon />} selected={selected} setSelected={setSelected} />

            <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>Pages</Typography>
            <Item title="Account Settings" to="/form" icon={<PersonOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Calendar" to="/calendar" icon={<CalendarTodayOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="FAQ Page" to="/faq" icon={<HelpOutlinedIcon />} selected={selected} setSelected={setSelected} />

            <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>Charts</Typography>
            <Item title="Bar Chart" to="/bar" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Pie Chart" to="/pie" icon={<PieChartOutlineOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Line Chart" to="/line" icon={<TimelineOutlinedIcon />} selected={selected} setSelected={setSelected} />
            <Item title="Geography Chart" to="/geography" icon={<MapOutlinedIcon />} selected={selected} setSelected={setSelected} />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default SidebarComponent;