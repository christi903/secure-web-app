const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');

// GET user by UID
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userRecord = await admin.auth().getUser(uid);
    // You may want to fetch additional user info from your DB here
    res.json({
      first_name: userRecord.displayName ? userRecord.displayName.split(' ')[0] : '',
      last_name: userRecord.displayName ? userRecord.displayName.split(' ')[1] || '' : '',
      username: userRecord.email ? userRecord.email.split('@')[0] : '',
      email: userRecord.email,
      role: userRecord.customClaims ? userRecord.customClaims.role || '' : '',
      profile_url: userRecord.photoURL || ''
    });
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
});

// PUT update user info
router.put('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { first_name, last_name, profile_url } = req.body;
    await admin.auth().updateUser(uid, {
      displayName: `${first_name} ${last_name}`,
      photoURL: profile_url
    });
    // You may want to update additional user info in your DB here
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    await admin.auth().deleteUser(uid);
    // You may want to delete user from your DB here
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;