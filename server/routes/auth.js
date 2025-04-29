// routes/auth.js
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

// POST /api/auth/register
router.post('/register', verifyFirebaseToken, async (req, res) => {
  const { firstName, lastName, role } = req.body;
  const { uid, email } = req.user;

  if (!firstName || !lastName || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const userExistsResult = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userExistsResult.rows.length > 0) {
      return res.status(200).json({ message: 'User already registered' });
    }

    // Insert new user into DB
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
