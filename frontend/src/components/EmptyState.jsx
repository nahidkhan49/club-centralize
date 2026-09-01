import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const EmptyState = ({
  icon,
  title = 'No items found',
  message = 'There are no items to display at this moment.',
  action,
  sx = {},
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 7,
        px: 3,
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1.5px dashed #E2DFEF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            backgroundColor: '#F3F0FF',
            color: '#4F2BCB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            border: '1px solid #D4CCF7',
            '& .MuiSvgIcon-root': { fontSize: 32 },
          }}
        >
          {icon}
        </Box>
      )}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: '#20202A',
          mb: 0.8,
          fontSize: '1.1rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {title}
      </Typography>

      {message && (
        <Typography
          variant="body2"
          sx={{
            color: '#777788',
            maxWidth: 440,
            mb: action ? 2.5 : 0,
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      )}

      {action && <Box sx={{ mt: 0.5 }}>{action}</Box>}
    </Paper>
  );
};

export default EmptyState;
