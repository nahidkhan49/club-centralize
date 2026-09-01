import React from 'react';
import { Chip } from '@mui/material';

const ROLE_CONFIG = {
  admin: {
    label: 'Platform Admin',
    bg: '#FEE2E2',
    color: '#DC2626',
    border: '#FECACA',
  },
  president: {
    label: 'President',
    bg: '#FEF3C7',
    color: '#B45309',
    border: '#FDE68A',
  },
  vice_president: {
    label: 'Vice President',
    bg: '#EEF2FF',
    color: '#4F2BCB',
    border: '#C7D2FE',
  },
  secretary: {
    label: 'Secretary',
    bg: '#F3F0FF',
    color: '#7C3AED',
    border: '#DDD6FE',
  },
  treasurer: {
    label: 'Treasurer',
    bg: '#D1FAE5',
    color: '#059669',
    border: '#A7F3D0',
  },
  event_manager: {
    label: 'Event Manager',
    bg: '#E0F2FE',
    color: '#0284C7',
    border: '#BAE6FD',
  },
  member: {
    label: 'Member',
    bg: '#F1F5F9',
    color: '#475569',
    border: '#E2E8F0',
  },
};

export default function RoleChip({ role = 'member', size = 'small', sx = {} }) {
  const norm = (role || 'member').toLowerCase().replace(' ', '_');
  const cfg = ROLE_CONFIG[norm] || ROLE_CONFIG.member;

  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        fontWeight: 800,
        fontSize: size === 'small' ? '0.72rem' : '0.8rem',
        borderRadius: '8px',
        height: size === 'small' ? 24 : 28,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        ...sx,
      }}
    />
  );
}
