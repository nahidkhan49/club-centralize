import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'variant' && prop !== 'loading',
})(({ theme, variant }) => ({
  textTransform: 'none',
  borderRadius: 11,
  padding: '8px 18px',
  fontWeight: 700,
  fontSize: '0.88rem',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  letterSpacing: '0.01em',
  boxShadow: 'none',
  transition: 'all 0.2s cubic-bezier(0.2, 0, 0, 1)',

  ...(variant === 'primary' && {
    backgroundColor: '#4F2BCB',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#39209A',
      boxShadow: '0 4px 14px rgba(79, 43, 203, 0.25)',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
  }),

  ...(variant === 'secondary' && {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#6D28D9',
      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
  }),

  ...(variant === 'subtle' && {
    backgroundColor: '#F3F0FF',
    color: '#4F2BCB',
    border: '1px solid #E0DBFF',
    '&:hover': {
      backgroundColor: '#EDE9FE',
      borderColor: '#D4CCF7',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
  }),

  ...(variant === 'ghost' && {
    backgroundColor: 'transparent',
    color: '#20202A',
    border: '1px solid #E9E7F2',
    '&:hover': {
      backgroundColor: '#F8F7FD',
      borderColor: '#D4CCF7',
      color: '#4F2BCB',
    },
    '&:active': { transform: 'translateY(0)' },
  }),

  ...(variant === 'danger' && {
    backgroundColor: '#EF4444',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#DC2626',
      boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
      transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
  }),
}));

export default function Button({
  variant = 'primary',
  children,
  loading = false,
  disabled = false,
  startIcon,
  ...props
}) {
  return (
    <StyledButton
      variant={variant}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </StyledButton>
  );
}
