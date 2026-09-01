import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const StatCard = ({
  icon,
  title,
  label,
  value,
  subtitle,
  trend,
  color,
  iconColor,
  bgColor,
  iconBg,
  onClick,
}) => {
  const displayLabel = title || label || '';
  const finalColor = iconColor || color || '#4F2BCB';
  const finalBg = iconBg || bgColor || '#F3F0FF';
  const isClickable = Boolean(onClick);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.8,
        borderRadius: '18px',
        border: '1px solid #E9E7F2',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
        '&:hover': isClickable
          ? {
              transform: 'translateY(-3px)',
              boxShadow: '0 10px 24px rgba(79, 43, 203, 0.08)',
              borderColor: '#D4CCF7',
            }
          : {
              boxShadow: '0 6px 18px rgba(79, 43, 203, 0.05)',
            },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1, pr: 1.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: '#8E90A2',
            fontWeight: 800,
            fontSize: '0.74rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.5,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {displayLabel}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#20202A',
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            lineHeight: 1.1,
            mb: subtitle || trend ? 0.5 : 0,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {value ?? 0}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: '#5E5D6E',
              fontWeight: 500,
              fontSize: '0.78rem',
              display: 'block',
            }}
          >
            {subtitle}
          </Typography>
        )}

        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: '#059669',
              fontWeight: 700,
              fontSize: '0.72rem',
              display: 'inline-block',
              mt: 0.3,
            }}
          >
            {trend}
          </Typography>
        )}
      </Box>

      {icon && (
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '14px',
            backgroundColor: finalBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${finalColor}22`,
            boxShadow: `0 4px 12px ${finalColor}15`,
          }}
        >
          {React.cloneElement(icon, {
            sx: { fontSize: 26, color: finalColor },
          })}
        </Box>
      )}
    </Paper>
  );
};

export default StatCard;
