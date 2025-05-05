import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ColorModeContext, useMode } from './theme';
import { useAuth } from './context/AuthContext'; // 🔑 Corrected path

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
import Form from './scenes/form';
import Calendar from './scenes/calendar';
import FAQ from './scenes/faq';
import Bar from './components/BarChart';
import Pie from './components/PieChart';
import Line from './components/LineChart';
import GeographyChart from './components/GeographyChart';
import ManualTransactions from './scenes/manualrecords';


function App() {
  const [theme, colorMode] = useMode();
  const { currentUser } = useAuth(); // ✅ Firebase currentUser object

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Authenticated Routes */}
          {currentUser ? (
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/team" element={<Team />} />
              <Route path="/transactionreview" element={<TransactionReview />} />
              <Route path="/transactionrecords" element={<TransactionRecords />} />
              <Route path="/manualrecords" element={<ManualTransactions />} />
              <Route path="/form" element={<Form />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/geography" element={<GeographyChart />} />
              {/* fallback if a user tries to go to auth page while logged in */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          ) : (
            // Unauthenticated Routes
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
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
