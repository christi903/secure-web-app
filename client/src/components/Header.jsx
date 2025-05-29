import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle, rightContent }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    return (
        <Box 
            mb="30px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
        >
            <Box>
                <Typography
                    variant="h2"
                    color={colors.grey[100]}
                    fontWeight="bold"
                    sx={{ m: "0 0 5px 0" }}
                >
                    {title}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[400]}>
                    {subtitle}
                </Typography>
            </Box>
            
            {rightContent && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {rightContent}
                </Box>
            )}
        </Box>
    );
};

export default Header;