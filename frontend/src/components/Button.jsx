import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(MuiButton)(({ theme, variant }) => ({
 textTransform: 'none',
 borderRadius: 8,
 padding: '6px 16px',
 fontWeight: 500,
 ...(variant === 'primary' && {
 backgroundColor: theme.palette.primary.main,
 color: '#fff',
 '&:hover': { backgroundColor: theme.palette.primary.dark },
 }),
 ...(variant === 'secondary' && {
 backgroundColor: theme.palette.secondary.main,
 color: '#fff',
 '&:hover': { backgroundColor: theme.palette.secondary.dark },
 }),
 ...(variant === 'ghost' && {
 backgroundColor: 'transparent',
 color: theme.palette.text.primary,
 border: `1px solid ${theme.palette.divider}`,
 '&:hover': { backgroundColor: theme.palette.action.hover },
 }),
}));

export default function Button({ variant = 'primary', children, ...props }) {
 return (
 <StyledButton variant={variant} {...props}>
 {children}
 </StyledButton>
 );
}
