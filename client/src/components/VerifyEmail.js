import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  CssBaseline,
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

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        toast.error('Verification token is missing');
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get(`/api/auth/verify-email?token=${token}`);
        if (res.data.success) {
          setVerified(true);
          toast.success(res.data.message);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <ThemeProvider theme={fixedTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: fixedTheme.palette.background.default,
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
              textAlign: 'center',
            }}
          >
            {verifying ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">Verifying your email...</Typography>
              </Box>
            ) : verified ? (
              <>
                <Typography variant="h5" gutterBottom>
                  Email Verified Successfully!
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Your email has been verified. You can now sign in to your account.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    mt: 2,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                  }}
                >
                  Go to Sign In
                </Button>
              </>
            ) : (
              <>
                <Typography variant="h5" gutterBottom color="error">
                  Verification Failed
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  We couldn't verify your email. The link may have expired or is invalid.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    mt: 2,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                  }}
                >
                  Back to Sign In
                </Button>
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default VerifyEmail;
