import React from 'react';
import { Card as MuiCard, CardContent, CardHeader, CardActions } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(MuiCard)(() => ({
  borderRadius: 18,
  boxShadow: '0 2px 8px rgba(79, 43, 203, 0.04)',
  border: '1px solid #E9E7F2',
  backgroundColor: '#FFFFFF',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
}));

export default function Card({ title, subheader, children, actions, sx, ...props }) {
  return (
    <StyledCard sx={sx} {...props}>
      {title && (
        <CardHeader
          title={title}
          subheader={subheader}
          titleTypographyProps={{
            fontWeight: 800,
            fontSize: '1.05rem',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: '#20202A',
          }}
          subheaderTypographyProps={{
            fontSize: '0.82rem',
            color: '#5E5D6E',
          }}
          sx={{ pb: 1, px: 2.5, pt: 2.5 }}
        />
      )}
      <CardContent sx={{ px: 2.5, py: title ? 1.5 : 2.5 }}>{children}</CardContent>
      {actions && <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>{actions}</CardActions>}
    </StyledCard>
  );
}
