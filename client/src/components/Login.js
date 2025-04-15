import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure to export `auth` from your firebase config
import { toast } from 'react-toastify';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CssBaseline,
  CircularProgress,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

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

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.warn('Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const msg =
        error.code === 'auth/user-not-found'
          ? 'No user found with this email.'
          : error.code === 'auth/wrong-password'
          ? 'Incorrect password.'
          : 'Login failed. Please try again.';

      toast.error(msg);
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
          <Paper elevation={3} sx={{ padding: 4, backgroundColor: fixedTheme.palette.background.paper }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              Sign In
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                sx={{ '& .MuiInputBase-root': { backgroundColor: '#fff', color: '#000' } }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                sx={{ '& .MuiInputBase-root': { backgroundColor: '#fff', color: '#000' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, '&:hover': { backgroundColor: '#2563eb' } }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Forgot password?
                    </Typography>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} textAlign="right">
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Don't have an account? Sign Up
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

export default Login;
