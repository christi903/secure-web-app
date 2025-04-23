import { Box, Button, TextField, MenuItem, Typography, InputLabel, Select, FormControl, InputAdornment, IconButton } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+255",
  phoneNumber: "",
  role: "",
  lastPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorAuth: false,
  language: "",
  profilePicture: null,
};

const userSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("Invalid email").required("required"),
  phoneNumber: yup.string().required("required"),
  role: yup.string().oneOf(["Fraud Analyst", "Customer Support Agent"]).required("required"),
  newPassword: yup.string().min(6, "Minimum 6 characters"),
  confirmPassword: yup.string().oneOf([yup.ref("newPassword"), null], "Passwords must match"),
  language: yup.string().required("required"),
});

const AccountSettingsForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showPassword, setShowPassword] = useState(false);

  const handleFormSubmit = (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      formData.append(key, val);
    });
    console.log("Form submitted", values);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const countryCodes = [
    { code: "+255", label: "Tanzania 🇹🇿" },
    { code: "+254", label: "Kenya 🇰🇪" },
    { code: "+256", label: "Uganda 🇺🇬" },
    { code: "+250", label: "Rwanda 🇷🇼" },
    { code: "+251", label: "Ethiopia 🇪🇹" },
  ];

  return (
    <Box m="20px">
      <Header title="ACCOUNT SETTINGS" subtitle="Manage your profile and preferences" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={userSchema}
      >
        {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{ "& > div": { gridColumn: isNonMobile ? undefined : "span 4" } }}
            >
              {/* Profile Information */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="First Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Last Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />

              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 2" }}>
                <InputLabel>Country Code</InputLabel>
                <Select
                  name="countryCode"
                  value={values.countryCode}
                  onChange={handleChange}
                >
                  {countryCodes.map((c) => (
                    <MenuItem key={c.code} value={c.code}>{c.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Phone Number"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.phoneNumber}
                name="phoneNumber"
                error={!!touched.phoneNumber && !!errors.phoneNumber}
                helperText={touched.phoneNumber && errors.phoneNumber}
                sx={{ gridColumn: "span 2" }}
              />

              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.role && !!errors.role}
                >
                  <MenuItem value="Fraud Analyst">Fraud Analyst</MenuItem>
                  <MenuItem value="Customer Support Agent">Customer Support Agent</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ gridColumn: "span 4" }}>
                <Typography gutterBottom>Upload Profile Picture</Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFieldValue("profilePicture", event.currentTarget.files[0])}
                />
              </Box>

              {/* Security Settings */}
              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? "text" : "password"}
                label="Current Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastPassword}
                name="lastPassword"
                sx={{ gridColumn: "span 4" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? "text" : "password"}
                label="New Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.newPassword}
                name="newPassword"
                error={!!touched.newPassword && !!errors.newPassword}
                helperText={touched.newPassword && errors.newPassword}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? "text" : "password"}
                label="Confirm New Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.confirmPassword}
                name="confirmPassword"
                error={!!touched.confirmPassword && !!errors.confirmPassword}
                helperText={touched.confirmPassword && errors.confirmPassword}
                sx={{ gridColumn: "span 2" }}
              />

              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel>Two-Factor Authentication</InputLabel>
                <Select
                  name="twoFactorAuth"
                  value={values.twoFactorAuth}
                  onChange={handleChange}
                >
                  <MenuItem value={false}>Disabled</MenuItem>
                  <MenuItem value={true}>Enabled</MenuItem>
                </Select>
              </FormControl>

              {/* System Preferences */}
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel>Language</InputLabel>
                <Select
                  name="language"
                  value={values.language}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.language && !!errors.language}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="sw">Swahili</MenuItem>
                </Select>
              </FormControl>

              {/* Account Management */}
              <Box gridColumn="span 4">
                <Typography variant="h6" color="error" gutterBottom>
                  Danger Zone
                </Typography>
                <Button variant="contained" color="error">
                  Delete Account
                </Button>
              </Box>
            </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Save Settings
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AccountSettingsForm;