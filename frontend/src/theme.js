import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F2BCB',
      dark: '#39209A',
      light: '#F3F0FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED',
      dark: '#6D28D9',
      light: '#EDE9FE',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF9FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#20202A',
      secondary: '#5E5D6E',
      disabled: '#8E90A2',
    },
    divider: '#E9E7F2',
    error: {
      main: '#EF4444',
      light: '#FEE2E2',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FEF3C7',
      dark: '#D97706',
    },
    success: {
      main: '#10B981',
      light: '#D1FAE5',
      dark: '#059669',
    },
    info: {
      main: '#3B82F6',
      light: '#DBEAFE',
      dark: '#1D4ED8',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 900,
      letterSpacing: '-0.03em',
      color: '#20202A',
    },
    h2: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#20202A',
    },
    h3: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: '#20202A',
    },
    h4: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: '#20202A',
    },
    h5: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.015em',
      color: '#20202A',
    },
    h6: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#20202A',
    },
    subtitle1: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      color: '#20202A',
    },
    subtitle2: {
      fontFamily: "'Inter', sans-serif",
      fontWeight: 600,
      color: '#5E5D6E',
    },
    body1: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.95rem',
      lineHeight: 1.6,
      color: '#20202A',
    },
    body2: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.86rem',
      lineHeight: 1.55,
      color: '#5E5D6E',
    },
    button: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.01em',
    },
    caption: {
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.75rem',
      color: '#8E90A2',
    },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FAF9FF',
          color: '#20202A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          boxShadow: 'none',
          padding: '8px 18px',
          transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            boxShadow: '0 4px 14px rgba(79, 43, 203, 0.22)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          backgroundColor: '#4F2BCB',
          '&:hover': {
            backgroundColor: '#39209A',
          },
        },
        outlinedPrimary: {
          borderColor: '#D4CCF7',
          color: '#4F2BCB',
          '&:hover': {
            borderColor: '#4F2BCB',
            backgroundColor: '#F3F0FF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '18px',
          boxShadow: '0 2px 8px rgba(79, 43, 203, 0.04)',
          border: '1px solid #E9E7F2',
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '16px',
        },
        elevation0: {
          border: '1px solid #E9E7F2',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: '8px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '& fieldset': {
              borderColor: '#E9E7F2',
            },
            '&:hover fieldset': {
              borderColor: '#D4CCF7',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4F2BCB',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '22px',
          boxShadow: '0 20px 48px rgba(79, 43, 203, 0.16)',
          border: '1px solid #E9E7F2',
        },
      },
    },
  },
});
