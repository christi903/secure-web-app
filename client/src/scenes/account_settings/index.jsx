import React, { useEffect, useState } from 'react'; // React hooks
import { // Material UI components
  Box, Button, TextField, Typography, Avatar, Grid,
  Stack, CircularProgress, Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles'; // Theme access
import { useNavigate } from 'react-router-dom'; // Navigation
import { supabase } from '../../supabaseClient'; // Supabase client
import { PhotoCamera } from '@mui/icons-material'; // Camera icon

export default function AccountSettings() {
  const theme = useTheme(); // Access MUI theme
  const navigate = useNavigate(); // Navigation function

  // User profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState(null); // Selected image file
  const [previewURL, setPreviewURL] = useState(''); // Image preview URL
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message
  const [success, setSuccess] = useState(''); // Success message

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      // Get current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      // Redirect to login if not authenticated
      if (authError || !user) {
        navigate('/login');
        return;
      }

      try {
        setEmail(user.email || 'Not set'); // Set email from auth

        // Fetch additional user data from database
        const { data, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) {
          setError('User not found in the database');
        } else {
          // Set user data from database
          setFirstName(data.first_name || 'Not set');
          setLastName(data.last_name || 'Not set');
          setRole(data.role || 'Not set');
          // Add timestamp to URL to prevent caching
          setPreviewURL(data.profile_url ? `${data.profile_url}?${Date.now()}` : '');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handle profile image selection
  const handleImageChange = (e) => {
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success messages

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)');
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file); // Store file
      setPreviewURL(URL.createObjectURL(file)); // Create preview URL
    }
  };

  // Save profile picture to storage
  const handleSave = async () => {
    // Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!profileImage) {
      setError('Please select an image to upload');
      return;
    }

    setLoading(true); // Start loading
    setError(''); // Clear errors
    setSuccess(''); // Clear success messages

    try {
      // 1. First delete any existing profile pictures for this user
      try {
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('profile-pictures')
          .list(`${user.id}/`);

        if (!listError && existingFiles.length > 0) {
          const filesToRemove = existingFiles.map(x => `${user.id}/${x.name}`);
          await supabase.storage
            .from('profile-pictures')
            .remove(filesToRemove);
        }
      } catch (cleanupError) {
        console.warn('Error cleaning up old profile pictures:', cleanupError);
      }

      // 2. Upload new profile picture
      const fileExt = profileImage.name.split('.').pop();
      const fileName = `profile.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, profileImage, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: true, // Overwrite if exists
          contentType: profileImage.type, // Set content type
        });

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data: urlData } = supabase
        .storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      const publicURL = urlData?.publicUrl;

      if (!publicURL) throw new Error('Failed to get public URL');

      // 4. Update user record with new URL
      const { error: dbError } = await supabase
        .from('users')
        .update({
          profile_url: publicURL,
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // 5. Update UI with fresh URL (add timestamp to prevent caching)
      setPreviewURL(`${publicURL}?${Date.now()}`);
      setProfileImage(null); // Clear selected file
      setSuccess('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setLoading(false); // End loading
    }
  };

  // Delete user account
  const handleDeleteAccount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Confirm deletion
    if (!window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.')) return;

    try {
      // First delete profile picture if exists
      try {
        const { data: existingFiles } = await supabase.storage
          .from('profile-pictures')
          .list(`${user.id}/`);

        if (existingFiles && existingFiles.length > 0) {
          const filesToRemove = existingFiles.map(x => `${user.id}/${x.name}`);
          await supabase.storage
            .from('profile-pictures')
            .remove(filesToRemove);
        }
      } catch (storageError) {
        console.warn('Error deleting profile picture:', storageError);
      }

      // Then delete user record
      await supabase.from('users').delete().eq('id', user.id);
      
      // Finally delete auth user (requires admin privileges)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) throw deleteError;
      
      navigate('/login'); // Redirect to login after deletion
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please contact support.');
    }
  };

  // Handle password reset
  const handleForgotPassword = () => {
    supabase.auth.signOut(); // Sign out current user
    navigate('/forgot-password'); // Navigate to password reset
  };

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      {/* Page title */}
      <Typography variant="h5" gutterBottom>Account Settings</Typography>

      {/* Error/success alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Profile picture section */}
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
          {/* Show initials if no image */}
          {!previewURL && firstName && lastName
            ? `${firstName.charAt(0)}${lastName.charAt(0)}`
            : null}
        </Avatar>
        {/* Hidden file input */}
        <label htmlFor="upload-photo">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            id="upload-photo"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <Button
            component="span"
            variant="outlined"
            startIcon={<PhotoCamera />}
          >
            Change Photo
          </Button>
        </label>
      </Stack>

      {/* User info display (read-only) */}
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

      {/* Action buttons */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        {/* Delete account button */}
        <Button
          color="error"
          variant="outlined"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </Button>
        <Stack direction="row" spacing={2}>
          {/* Password reset link */}
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

          {/* Save button */}
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