import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ icon, title = 'Nothing here yet', message = '', action }) => {
  const IconComponent = icon || <InboxIcon sx={{ fontSize: 48, color: '#C7C5D3' }} />;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 7,
        px: 3,
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px dashed #E9E7F2',
      }}
    >
      {icon ? React.cloneElement(icon, { sx: { fontSize: 48, color: '#C7C5D3' } }) : IconComponent}
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mt: 2, mb: 0.5 }}>
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" sx={{ color: '#777788', maxWidth: 360 }}>
          {message}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
