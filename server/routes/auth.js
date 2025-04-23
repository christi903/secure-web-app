const express = require('express');
const admin = require('firebase-admin');
const pool = require('../db'); // PostgreSQL pool setup (e.g., from pg)
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

// POST /api/auth/register
router.post('/register', verifyFirebaseToken, async (req, res) => {
  const { firstName, lastName, role } = req.body;
  const { uid, email } = req.user;

  if (!firstName || !lastName || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    if (userExists.rows.length > 0) {
      return res.status(200).json({ message: 'User already registered' });
    }

    // Insert into DB
    await pool.query(
      `INSERT INTO users (firebase_uid, email, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [uid, email, firstName, lastName, role]
    );

    res.status(201).json({ message: 'User registered in database' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
