import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Avatar, Grid,
  Stack, IconButton, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, deleteUser, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase'; // adjust path
import axios from 'axios';
import { PhotoCamera } from '@mui/icons-material';

export default function AccountSettings() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch user details from backend
      axios.get(`/api/user/${user.uid}`).then(res => {
        const { first_name, last_name, username, email, role, profile_url } = res.data;
        setFirstName(first_name);
        setLastName(last_name);
        setUsername(username);
        setEmail(email);
        setRole(role);
        setPreviewURL(profile_url);
      });
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) setPreviewURL(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let downloadURL = previewURL;

      if (profileImage) {
        const imageRef = ref(storage, `profiles/${user.uid}`);
        await uploadBytes(imageRef, profileImage);
        downloadURL = await getDownloadURL(imageRef);
      }

      await updateProfile(user, { displayName: `${firstName} ${lastName}`, photoURL: downloadURL });

      await axios.put(`/api/user/${user.uid}`, {
        first_name: firstName,
        last_name: lastName,
        profile_url: downloadURL,
      });

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await axios.delete(`/api/user/${user.uid}`);
      await deleteUser(user);
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account.');
    }
  };

  const handleForgotPassword = async () => {
    await signOut(auth);
    navigate('/forgot-password');
  };

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>Account Settings</Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Avatar
          src={previewURL}
          sx={{ width: 80, height: 80 }}
        />
        <label htmlFor="upload-photo">
          <input
            type="file"
            accept="image/*"
            id="upload-photo"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <IconButton color="primary" component="span">
            <PhotoCamera />
          </IconButton>
        </label>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth label="First Name" value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth label="Last Name" value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Username" value={username} InputProps={{ readOnly: true }} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Email" value={email} InputProps={{ readOnly: true }} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Role" value={role} InputProps={{ readOnly: true }} />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button color="error" variant="outlined" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
        <Stack direction="row" spacing={2}>
          <Button onClick={handleForgotPassword}>Need new password?</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default AccountSettingsForm;