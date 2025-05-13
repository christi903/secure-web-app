const express = require('express');
const supabase = require('../config/supabaseAdmin');
const pool = require('../config/db');
const router = express.Router();

// Middleware to verify Supabase token
const verifySupabaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw error;
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// POST /api/auth/register
router.post('/register', verifySupabaseToken, async (req, res) => {
  const { firstName, lastName, role } = req.body;
  const { id: uid, email } = req.user;

  if (!firstName || !lastName || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    if (userExists.rows.length > 0) {
      return res.status(200).json({ message: 'User already registered' });
    }

    await pool.query(
      `INSERT INTO users (firebase_uid, email, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [uid, email, firstName, lastName, role]
    );
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET /api/auth/verify-email (Check if user email is verified)
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Missing token' });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw error;

    if (user.email_confirmed_at) {
      return res.status(200).json({ message: 'Email verified successfully', success: true });
    } else {
      return res.status(200).json({ message: 'Email not yet verified', success: false });
    }
  } catch (err) {
    console.error('Email verification check failed:', err);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// POST /api/auth/reset-password (Trigger email-based reset)
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Missing email' });

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/update-password`
    });
    if (error) throw error;
    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Password reset failed:', err);
    return res.status(400).json({ message: 'Failed to initiate password reset' });
  }
});

// DELETE /api/auth/delete-account
router.delete('/delete-account', verifySupabaseToken, async (req, res) => {
  const { id: uid } = req.user;

  try {
    // Delete user from Supabase
    const { error: deleteError } = await supabase.auth.admin.deleteUser(uid);
    if (deleteError) throw deleteError;

    // Delete from your own database
    await pool.query('DELETE FROM users WHERE firebase_uid = $1', [uid]);

    res.status(200).json({ message: 'Account successfully deleted' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
