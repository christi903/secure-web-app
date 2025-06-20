import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ColorModeContext, useMode } from './theme';
import { useAuth } from './context/AuthContext';
import { SpeedInsights } from '@vercel/speed-insights/react'; // ✅ Vercel Speed Insights for React

// Auth Pages
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';

// App Layout & Pages
import MainLayout from './scenes/global/MainLayout';
import Dashboard from './scenes/dashboard';
import Team from './scenes/team';
import TransactionReview from './scenes/transactionreview';
import TransactionRecords from './scenes/transactionrecords';
import AccountSettings from './scenes/account_settings';
import Calendar from './scenes/calendar';
import FAQ from './scenes/faq';
import Bar from './components/BarChart';
import Pie from './components/PieChart';
import Line from './components/LineChart';
import GeographyChart from './components/GeographyChart';

function App() {
  const [theme, colorMode] = useMode();
  const { currentUser, loading } = useAuth();

  if (loading) return null; // or a loader like <CircularProgress />

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {currentUser ? (
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/team" element={<Team />} />
              <Route path="/transactionreview" element={<TransactionReview />} />
              <Route path="/transactionrecords" element={<TransactionRecords />} />
              <Route path="/account_settings" element={<AccountSettings />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/geography" element={<GeographyChart />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          ) : (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
        <ToastContainer position="top-right" autoClose={5000} />
        <SpeedInsights /> {/* ✅ Vercel performance metrics */}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
