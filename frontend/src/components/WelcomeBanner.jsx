import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useSiteSettings } from '../context/SiteSettingsContext';

const WelcomeBanner = ({ username, roleLabel }) => {
  const {
    welcomeBannerImage,
    welcomeBannerTitle,
    welcomeBannerSubtitle,
    welcomeBannerEnabled,
    siteLogo,
  } = useSiteSettings();

  if (!welcomeBannerEnabled) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        mb: 4,
        minHeight: { xs: 160, sm: 200, md: 230 },
        backgroundImage: `linear-gradient(135deg, rgba(79, 43, 203, 0.9) 0%, rgba(124, 92, 231, 0.75) 100%), url(${welcomeBannerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: '#FFFFFF',
        p: { xs: 3, sm: 4, md: 5 },
        boxShadow: '0 8px 32px rgba(79, 43, 203, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Box display="flex" alignItems="center" gap={{ xs: 2, sm: 3 }} flexWrap="wrap">
        <Avatar
          src={siteLogo}
          alt="Site Logo"
          sx={{
            width: { xs: 60, sm: 80, md: 90 },
            height: { xs: 60, sm: 80, md: 90 },
            border: '3px solid #FFFFFF',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        />
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.4rem', sm: '1.9rem', md: '2.3rem' },
              mb: 1,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              letterSpacing: '-0.02em',
            }}
          >
            {welcomeBannerTitle}
            {username && `, ${username}`}! 👋
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.95,
              fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.05rem' },
              maxWidth: '650px',
              lineHeight: 1.5,
              fontWeight: 500,
              textShadow: '0 1px 5px rgba(0,0,0,0.15)',
            }}
          >
            {welcomeBannerSubtitle}
          </Typography>
          {roleLabel && (
            <Box
              sx={{
                display: 'inline-block',
                mt: 1.8,
                px: 2,
                py: 0.5,
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Access Tier: {roleLabel}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeBanner;
