const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseAdmin');

// GET user by UID
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const { data: user, error } = await supabase.auth.admin.getUserById(uid);
    if (error || !user) throw error;

    const [first_name = '', last_name = ''] = (user.user_metadata?.full_name || '').split(' ');
    res.json({
      first_name,
      last_name,
      username: user.email ? user.email.split('@')[0] : '',
      email: user.email,
      role: user.user_metadata?.role || '',
      profile_url: user.user_metadata?.profile_url || ''
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: 'User not found' });
  }
});

// PUT update user info
router.put('/:uid', async (req, res) => {
  const { uid } = req.params;
  const { first_name, last_name, profile_url } = req.body;

  try {
    const { error } = await supabase.auth.admin.updateUserById(uid, {
      user_metadata: {
        full_name: `${first_name} ${last_name}`,
        profile_url
      }
    });
    if (error) throw error;
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// DELETE user
router.delete('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const { error } = await supabase.auth.admin.deleteUser(uid);
    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
