const express = require('express');
const admin = require('../config/firebaseAdmin');
const pool = require('../config/db');
const router = express.Router();

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Helper function to check if email exists in Firebase
const checkEmailInFirebase = async (email) => {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord ? true : false; // Return true if user exists, false otherwise
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return false; // Email not found in Firebase
    }
    console.error('Error checking email in Firebase:', error);
    throw new Error('Error checking Firebase user');
  }
};

// POST /api/auth/register
router.post('/register', verifyFirebaseToken, async (req, res) => {
  const { firstName, lastName, role } = req.body;
  const { uid, email } = req.user;

  if (!firstName || !lastName || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if the email exists in Firebase Authentication
    const emailExistsInFirebase = await checkEmailInFirebase(email);

    // Check if user already exists in the database
    const userExistsResult = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userExistsResult.rows.length > 0) {
      // User is already registered in the database
      return res.status(200).json({ message: 'User already registered' });
    }

    if (emailExistsInFirebase) {
      // The email exists in Firebase but not in the database, sync data
      await pool.query(
        `INSERT INTO users (firebase_uid, email, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [uid, email, firstName, lastName, role]
      );
      return res.status(201).json({ message: 'User synced and registered successfully' });
    } else {
      // The email does not exist in Firebase Authentication
      return res.status(400).json({ message: 'Email is not registered in Firebase' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

// GET /api/auth/verify-email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Missing token' });
  }
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.email_verified) {
      return res.status(200).json({ message: 'Email already verified' });
    }
    // Firebase automatically verifies email via the link, so just check status
    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Email verification failed:', err);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Missing email or new password' });
  }
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, { password: newPassword });
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Password reset failed:', err);
    return res.status(400).json({ message: 'Failed to reset password' });
  }
});

// DELETE /api/auth/delete-account
router.delete('/delete-account', verifyFirebaseToken, async (req, res) => {
  const { uid } = req.user;

  try {
    // First, delete the user from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Then, delete the user from the PostgreSQL database
    await pool.query('DELETE FROM users WHERE firebase_uid = $1', [uid]);

    res.status(200).json({ message: 'Account successfully deleted' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
