import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // import Supabase client
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const fixedTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0b1120', paper: '#1e293b' },
    text: { primary: '#ffffff', secondary: '#94a3b8' },
    primary: { main: '#3b82f6' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
});

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.api.resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
      toast.success('Password reset email sent!');
      setEmail('');
    } catch (error) {
      const message =
        error.message === 'User not found'
          ? 'No user found with this email'
          : error.message;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={fixedTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: fixedTheme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Container maxWidth="xs">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: fixedTheme.palette.background.paper,
              color: fixedTheme.palette.text.primary,
            }}
          >
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Forgot Password
            </Typography>
            <Typography variant="body2" align="center" color="textSecondary" paragraph>
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!error}
                helperText={error || ''}
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  '&:hover': {
                    backgroundColor: '#2563eb',
                  },
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Back to Sign In
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ForgotPassword;
