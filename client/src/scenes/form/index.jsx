import React, { useEffect, useState } from 'react';
import {
  Box, Button, TextField, Typography, Avatar, Grid,
  Stack, IconButton, CircularProgress, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut, deleteUser, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { storage, db } from '../../firebase';
import { PhotoCamera } from '@mui/icons-material';

export default function AccountSettings() {
  const theme = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUserData = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setEmail(user.email || 'Not set');

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFirstName(userData.firstName || 'Not set');
        setLastName(userData.lastName || 'Not set');
        setRole(userData.role || 'Not set');

        if (userData.profileURL) {
          try {
            const storageRef = ref(storage, userData.profileURL);
            const downloadURL = await getDownloadURL(storageRef);
            setPreviewURL(downloadURL);
          } catch (err) {
            console.warn('Could not load profile image:', err);
            setPreviewURL('');
          }
        } else {
          setPreviewURL('');
        }
      } else {
        setError('User document not found in Firestore');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleImageChange = (e) => {
    setError('');
    setSuccess('');

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user || !profileImage) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const timestamp = Date.now();
      const storagePath = `user-profiles/${user.uid}/${timestamp}_profile.jpg`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, profileImage);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        profileURL: storagePath,
        updatedAt: new Date()
      }, { merge: true });

      await fetchUserData();
      setProfileImage(null);
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account?')) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. You may need to reauthenticate.');
    }
  };

  const handleForgotPassword = () => {
    signOut(auth);
    navigate('/forgot-password');
  };

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h5" gutterBottom>Account Settings</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Avatar
          src={previewURL}
          sx={{
            width: 80,
            height: 80,
            fontSize: '2rem',
            bgcolor: previewURL ? 'transparent' : theme.palette.primary.main,
            color: theme.palette.getContrastText(theme.palette.primary.main)
          }}
        >
          {!previewURL && firstName && lastName
            ? `${firstName.charAt(0)}${lastName.charAt(0)}`
            : null}
        </Avatar>
        <label htmlFor="upload-photo">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif"
            id="upload-photo"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <IconButton component="span">
            <PhotoCamera sx={{ color: theme.palette.text.primary }} />
          </IconButton>
        </label>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="First Name"
            value={firstName}
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Last Name"
            value={lastName}
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Role"
            value={role}
            InputProps={{ readOnly: true }}
            variant="outlined"
          />
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
          color="error"
          variant="outlined"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </Button>
        <Stack direction="row" spacing={2}>
          <Button
            onClick={handleForgotPassword}
            variant="text"
            sx={{
              textTransform: 'none',
              textDecoration: 'underline',
              color: theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.main,
              '&:hover': {
                textDecoration: 'none',
                backgroundColor: 'transparent',
              }
            }}
          >
            Need new password?
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || !profileImage}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : 'Save Profile Picture'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
