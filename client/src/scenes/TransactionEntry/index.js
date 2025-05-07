import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
} from "@mui/material";

const TransactionEntry = () => {
  const [form, setForm] = useState({
    initiatorId: "",
    transactionType: "",
    transactionAmount: "",
    recipientId: "",
    oldInitiatorBalance: "",
    newInitiatorBalance: "",
    oldRecipientBalance: "",
    newRecipientBalance: "",
    transactionDateTime: "",
  });

  const [fraudScore, setFraudScore] = useState(null); // Percentage (0–100)
  const [classification, setClassification] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulate fraud classification (replace with real API call later)
    const randomScore = Math.floor(Math.random() * 101); // 0–100
    setFraudScore(randomScore);

    if (randomScore < 30) {
      setClassification("Legit ✅");
    } else if (randomScore < 70) {
      setClassification("Flagged ⚠️");
    } else {
      setClassification("Blocked ❌");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 4,
        flexWrap: "wrap",
        mt: 4,
      }}
    >
      {/* Transaction Form */}
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          padding: 4,
          borderRadius: 3,
          flex: 1,
          minWidth: 360,
        }}
      >
        <Typography variant="h5" gutterBottom align="center">
          Transaction Entry
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            {Object.entries(form).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  name={key}
                  type={
                    key === "transactionDateTime"
                      ? "datetime-local"
                      : key.toLowerCase().includes("amount") ||
                        key.toLowerCase().includes("balance")
                      ? "number"
                      : "text"
                  }
                  value={value}
                  onChange={handleChange}
                  InputLabelProps={
                    key === "transactionDateTime"
                      ? { shrink: true }
                      : undefined
                  }
                  required
                />
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 3 }}
          >
            Submit
          </Button>
        </Box>
      </Paper>

      {/* Result Panel */}
      <Paper
        elevation={3}
        sx={{
          width: 300,
          minHeight: 200,
          padding: 3,
          borderRadius: 3,
          textAlign: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Classification Result
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {fraudScore !== null ? (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Fraud Score:</strong> {fraudScore}%
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color:
                  fraudScore < 30
                    ? "green"
                    : fraudScore < 70
                    ? "orange"
                    : "red",
              }}
            >
              {classification}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Submit a transaction to see the result.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TransactionEntry;
