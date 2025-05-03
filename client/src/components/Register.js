import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword,
  sendEmailVerification 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  CssBaseline,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SecureLogo from "../assets/securelogo";

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

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.firstName) newErrors.firstName = 'First name required';
    if (!formData.lastName) newErrors.lastName = 'Last name required';
    if (!formData.role) newErrors.role = 'Role required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      // Create user document with consistent camelCase field names
      await setDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        profileURL: '', // Initialize empty profile URL
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast.success('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={fixedTheme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: fixedTheme.palette.background.default,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        px: 2 
      }}>
        <Grid container spacing={2} alignItems="center" justifyContent="center" sx={{ maxWidth: '1000px' }}>
          
          {/* Logo Panel */}
          <Grid item xs={12} md={6} sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px', 
            gap: 2 
          }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <SecureLogo color="#3b82f6" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <Typography variant="subtitle1" align="center" sx={{
                color: '#3b82f6', 
                fontStyle: 'italic', 
                fontWeight: 500,
                fontSize: '1rem', 
                letterSpacing: '0.5px' 
              }}>
                Your First Line of Defense Against Fraud
              </Typography>
            </motion.div>
          </Grid>

          {/* Register Form */}
          <Grid item xs={12} md={6}>
            <motion.div 
              initial={{ opacity: 0, x: 50 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Paper elevation={3} sx={{ 
                padding: 4, 
                backgroundColor: fixedTheme.palette.background.paper 
              }}>
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                  Create Account
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        required 
                        fullWidth 
                        id="firstName" 
                        label="First Name" 
                        name="firstName"
                        autoComplete="given-name" 
                        value={formData.firstName} 
                        onChange={handleChange}
                        error={!!errors.firstName} 
                        helperText={errors.firstName}
                        sx={{ '& .MuiInputBase-root': { backgroundColor: '#fff' } }} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField 
                        required 
                        fullWidth 
                        id="lastName" 
                        label="Last Name" 
                        name="lastName"
                        autoComplete="family-name" 
                        value={formData.lastName} 
                        onChange={handleChange}
                        error={!!errors.lastName} 
                        helperText={errors.lastName}
                        sx={{ '& .MuiInputBase-root': { backgroundColor: '#fff' } }} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        select 
                        required 
                        fullWidth 
                        label="Select Role" 
                        name="role"
                        value={formData.role} 
                        onChange={handleChange} 
                        error={!!errors.role}
                        helperText={errors.role}
                        sx={{ '& .MuiInputBase-root': { backgroundColor: '#fff', color: '#000' } }}
                      >
                        <MenuItem value="">Select a Role</MenuItem>
                        <MenuItem value="fraud_analyst">Fraud Analyst</MenuItem>
                        <MenuItem value="support_agent">Support Agent</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        required 
                        fullWidth 
                        id="email" 
                        label="Email Address" 
                        name="email"
                        type="email" 
                        autoComplete="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        error={!!errors.email} 
                        helperText={errors.email}
                        sx={{ '& .MuiInputBase-root': { backgroundColor: '#fff' } }} 
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField 
                        required 
                        fullWidth 
                        name="password" 
                        label="Password" 
                        type="password"
                        id="password" 
                        autoComplete="new-password" 
                        value={formData.password}
                        onChange={handleChange} 
                        error={!!errors.password} 
                        helperText={errors.password}
                        sx={{ '& .MuiInputBase-root': { backgroundColor: '#fff', color: '#000' } }} 
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 2,
                      '&:hover': { 
                        backgroundColor: '#2563eb' 
                      } 
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                  </Button>
                  <Grid container justifyContent="flex-end">
                    <Grid item>
                      <Link to="/login" style={{ textDecoration: 'none' }}>
                        <Typography variant="body2" color="primary">
                          Already have an account? Sign in
                        </Typography>
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Register;