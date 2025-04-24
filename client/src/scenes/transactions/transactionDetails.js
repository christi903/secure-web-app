import { Box, Typography, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

const TransactionDetails = () => {
  const location = useLocation();
  const transaction = location.state || {};
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box m="20px">
      <Header
        title="Transaction Details"
        subtitle={`Transaction ID: ${transaction.transactionId}`}
      />

      {/* Transaction Flow with Details */}
      <Box mt={6} display="flex" justifyContent="center" alignItems="center">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={8}
          p={2}
          maxWidth="800px"
          width="100%"
        >
          {/* Sender */}
          <Box textAlign="center">
            <Box mb={1}>
              <Typography fontWeight={600}>{transaction.senderName || "Sender Name"}</Typography>
              <Typography variant="body2" color="textSecondary">{transaction.senderPhone || "+000 000 0000"}</Typography>
            </Box>
            <Box
              width={90}
              height={90}
              borderRadius="50%"
              bgcolor={colors.blueAccent[400]}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
            >
              <SmartphoneIcon sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography mt={1} fontWeight={600}>Sender</Typography>
          </Box>

          {/* Arrow */}
          <ArrowForwardIosIcon
            sx={{
              fontSize: 36,
              color: colors.greenAccent[400],
            }}
          />

          {/* Receiver */}
          <Box textAlign="center">
            <Box mb={1}>
              <Typography fontWeight={600}>{transaction.receiverName || "Receiver Name"}</Typography>
              <Typography variant="body2" color="textSecondary">{transaction.receiverPhone || "+000 000 0000"}</Typography>
            </Box>
            <Box
              width={90}
              height={90}
              borderRadius="50%"
              bgcolor={colors.blueAccent[100]}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
            >
              <SmartphoneIcon sx={{ fontSize: 40, color: "#fff" }} />
            </Box>
            <Typography mt={1} fontWeight={600}>Receiver</Typography>
          </Box>
        </Box>
      </Box>

      {/* Transaction Info Section */}
      <Box
        mt={6}
        bgcolor={colors.primary[400]}
        p={4}
        borderRadius={2}
        boxShadow={3}
        maxWidth="600px"
        mx="auto"
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Transaction Information
        </Typography>
        <Typography variant="body1" mt={1}><strong>Date/Time:</strong> {transaction.date}</Typography>
        <Typography variant="body1" mt={1}><strong>Type:</strong> {transaction.type}</Typography>
        <Typography variant="body1" mt={1}><strong>Amount:</strong> ${transaction.amount}</Typography>
        <Typography variant="body1" mt={1}><strong>Status:</strong> {transaction.status}</Typography>
        <Typography variant="body1" mt={1}><strong>Description:</strong> {transaction.description}</Typography>
      </Box>
    </Box>
  );
};

export default TransactionDetails;
