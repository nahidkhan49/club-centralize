import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

export default function Card({ title, children, actions, sx }) {
  return (
    <StyledCard sx={sx}>
      {title && <CardHeader title={title} />}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </StyledCard>
  );
}
