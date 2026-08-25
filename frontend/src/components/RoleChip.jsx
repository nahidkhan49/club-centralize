import React from 'react';
import { Box, Typography } from '@mui/material';

const ROLE_STYLES = {
  president:      { bg: '#FEF3C7', color: '#B45309', label: 'President' },
  vice_president: { bg: '#EEF2FF', color: '#4F2BCB', label: 'Vice President' },
  secretary:      { bg: '#F3F0FF', color: '#7C3AED', label: 'Secretary' },
  treasurer:      { bg: '#E6F4EA', color: '#15803D', label: 'Treasurer' },
  member:         { bg: '#F1F5F9', color: '#475569', label: 'Member' },
  admin:          { bg: '#FEE2E2', color: '#DC2626', label: 'Admin' },
};

const RoleChip = ({ role, size = 'small' }) => {
  const config = ROLE_STYLES[role] || ROLE_STYLES.member;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: size === 'small' ? 1.2 : 1.8,
        py: size === 'small' ? 0.3 : 0.5,
        borderRadius: '20px',
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.72rem' : '0.82rem',
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </Box>
  );
};

export default RoleChip;
