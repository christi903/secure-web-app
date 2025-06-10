import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ensure to import your Supabase client
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CssBaseline,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Fixed dark theme
const fixedTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0b1120',
      paper: '#1e293b',
    },
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8',
    },
    primary: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!tokenParam) {
      toast.error('Reset token is missing');
      navigate('/login');
    } else {
      setToken(tokenParam);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Reset password using Supabase
      const { error } = await supabase.auth.api.updateUser(token, {
        password,
      });

      if (error) {
        throw error;
      }

      toast.success('Password has been reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'An error occurred');
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
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={3}
            sx={{
              padding: 4,
              backgroundColor: fixedTheme.palette.background.paper,
              color: fixedTheme.palette.text.primary,
            }}
          >
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Reset Password
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ResetPassword;
