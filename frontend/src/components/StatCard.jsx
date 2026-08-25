import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const StatCard = ({ icon, label, value, color = '#4F2BCB', bgColor = '#F3F0FF' }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '1px solid #E9E7F2',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)' },
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '14px',
          backgroundColor: bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 26, color } })}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A', lineHeight: 1.2 }}>
          {value ?? '—'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788', fontWeight: 500, mt: 0.3 }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
