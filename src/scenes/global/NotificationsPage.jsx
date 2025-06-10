import { Box, Typography, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";

const NotificationsPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Sample transaction notifications data
  const transactions = [
    {
      id: 1,
      type: "Mobile Money Deposit",
      amount: "Tshs 12,500.00",
      time: "10 mins ago",
      status: "Completed"
    },
    {
      id: 2,
      type: "Mobile Money Withdrawal",
      amount: "Tshs 111,200.00",
      time: "25 mins ago",
      status: "Completed"
    },
    {
      id: 3,
      type: "Bill Payment",
      amount: "Tshs 25,000.00",
      time: "1 hour ago",
      status: "Pending"
    },
  ];

  return (
    <Box
      p={3}
      sx={{
        backgroundColor: colors.primary[400],
        borderRadius: "8px",
        maxWidth: "400px",
        boxShadow: theme.shadows[10]
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ color: colors.grey[100] }}>
        Recent Transactions
      </Typography>
      
      <List>
        {transactions.map((transaction) => (
          <Box key={transaction.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <Typography variant="body1" sx={{ color: colors.grey[100] }}>
                    {transaction.type}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" sx={{ color: colors.greenAccent[500] }}>
                      {transaction.amount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.grey[300] }}>
                      {transaction.time} • {transaction.status}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider sx={{ backgroundColor: colors.primary[300] }} />
          </Box>
        ))}
      </List>

      <Box mt={2} display="flex" justifyContent="center">
        <Button 
          variant="outlined" 
          sx={{ 
            color: colors.grey[100],
            borderColor: colors.primary[300],
            '&:hover': {
              borderColor: colors.primary[100]
            }
          }}
        >
          See More Transactions
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationsPage;