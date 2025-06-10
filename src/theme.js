import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// Color Design Tokens
export const tokens = (mode) =>
  mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
        primary: {
          100: "#d0d1d5",
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#080b12",
          900: "#040509",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#4cceac",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632",
        },
        searchBar: { background: "#1F2A40", text: "#ffffff", border: "#444" },
      }
    : {
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
        primary: {
          100: "#040509",
          200: "#080b12",
          300: "#e0e0e0",
          400: "#f2f0f0",
          500: "#141b2d",
          600: "#434957",
          700: "#727681",
          800: "#a1a4ab",
          900: "#d0d1d5",
        },
        greenAccent: {
          100: "#0f2922",
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#4cceac",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee",
        },
        blueAccent: {
          100: "#151632",
          200: "#2a2d64",
          300: "#3e4396",
          400: "#535ac8",
          500: "#6870fa",
          600: "#868dfb",
          700: "#a4a9fc",
          800: "#c3c6fd",
          900: "#e1e2fe",
        },
        searchBar: { background: "#F3F4F6", text: "#333", border: "#ccc" },
      };

// MUI Theme Settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode,
      primary: { main: colors.primary[500] },
      secondary: { main: colors.greenAccent[500] },
      neutral: {
        dark: colors.grey[700],
        main: colors.grey[500],
        light: colors.grey[100],
      },
      background: {
        default: mode === "dark" ? colors.primary[500] : "#fcfcfc",
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            backgroundColor: colors.searchBar.background,
            "& .MuiOutlinedInput-root": {
              backgroundColor: colors.searchBar.background,
              "& fieldset": { borderColor: colors.searchBar.border },
              "&:hover fieldset": { borderColor: mode === "dark" ? "#666" : "#999" },
              "&.Mui-focused fieldset": {
                borderColor: mode === "dark" ? colors.grey[300] : colors.grey[700],
              },
            },
            "& .MuiInputBase-input": {
              color: colors.searchBar.text,
              backgroundColor: colors.searchBar.background,
            },
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "16px",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: colors.blueAccent[700],
              borderTop: "none",
            },
            "& .MuiDataGrid-toolbarContainer": {
              padding: "16px",
              "& button": {
                color: mode === "dark" ? colors.grey[100] : colors.grey[800],
                "&:hover": {
                  backgroundColor: mode === "dark" ? colors.primary[600] : colors.grey[200],
                },
              },
              "& .MuiInput-root": {
                color: mode === "dark" ? colors.grey[100] : colors.grey[800],
                "& .MuiSvgIcon-root": {
                  color: mode === "dark" ? colors.grey[100] : colors.grey[800],
                },
              },
            },
            "& .MuiDataGrid-menuIcon": {
              "& button": {
                color: mode === "dark" ? colors.grey[100] : colors.grey[800],
              },
            },
            "& .MuiDataGrid-menuList": {
              backgroundColor: mode === "dark" ? colors.primary[600] : colors.grey[100],
              "& .MuiMenuItem-root": {
                color: mode === "dark" ? colors.grey[100] : colors.grey[800],
                "&:hover": {
                  backgroundColor: mode === "dark" ? colors.primary[500] : colors.grey[200],
                },
              },
            },
            "& .MuiDataGrid-panel": {
              backgroundColor: mode === "dark" ? colors.primary[600] : colors.grey[100],
              "& .MuiDataGrid-panelHeader": {
                color: mode === "dark" ? colors.grey[100] : colors.grey[800],
              },
              "& .MuiFormControl-root": {
                "& .MuiInputBase-root": {
                  color: mode === "dark" ? colors.grey[100] : colors.grey[800],
                },
              },
            },
            "& .MuiCheckbox-root": {
              color: mode === "dark" ? colors.grey[100] : colors.grey[800],
            },
          },
        },
      },
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: { fontFamily: "Source Sans Pro, sans-serif", fontSize: 40 },
      h2: { fontFamily: "Source Sans Pro, sans-serif", fontSize: 32 },
      h3: { fontFamily: "Source Sans Pro, sans-serif", fontSize: 24 },
      h4: { fontFamily: "Source Sans Pro, sans-serif", fontSize: 20 },
      h5: { fontFamily: "Source Sans Pro, sans-serif", fontSize: 16 },
      h6: { fontFamily: "Source Sans Pro, sans-serif", fontSize: 14 },
    },
  };
};

// Context for Color Mode
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useMode = () => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};

// Helper to create a fixed theme for special pages
export const getFixedTheme = (mode = "dark") =>
  createTheme(themeSettings(mode));