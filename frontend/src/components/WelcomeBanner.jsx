import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useSiteSettings } from '../context/SiteSettingsContext';

const WelcomeBanner = ({ username, roleLabel, actionButton, action }) => {
  const finalAction = actionButton || action;
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
        minHeight: { xs: 180, sm: 210, md: 230 },
        background: welcomeBannerImage
          ? `linear-gradient(135deg, rgba(20, 10, 60, 0.58) 0%, rgba(79, 43, 203, 0.40) 50%, rgba(124, 58, 237, 0.58) 100%), url(${welcomeBannerImage})`
          : 'linear-gradient(135deg, #4F2BCB 0%, #6838EE 50%, #7C3AED 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        color: '#FFFFFF',
        p: { xs: 3, sm: 4, md: 4.5 },
        boxShadow: '0 12px 36px rgba(79, 43, 203, 0.22)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        flexWrap="wrap"
        gap={3}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={{ xs: 2, sm: 3 }}
          flexWrap="wrap"
          sx={{
            flex: 1,
            minWidth: 260,
            p: { xs: 1.5, sm: 2 },
            borderRadius: '20px',
            backgroundColor: 'rgba(15, 8, 48, 0.28)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          <Avatar
            src={siteLogo}
            alt="Site Logo"
            variant="rounded"
            sx={{
              width: { xs: 58, sm: 72, md: 80 },
              height: { xs: 58, sm: 72, md: 80 },
              borderRadius: '20px',
              border: '2.5px solid rgba(255, 255, 255, 0.85)',
              backgroundColor: '#FFFFFF',
              color: '#4F2BCB',
              fontWeight: 900,
              fontSize: '1.8rem',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              flexShrink: 0,
            }}
          >
            {welcomeBannerTitle?.charAt(0) || 'C'}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            {roleLabel && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mb: 1,
                  px: 1.5,
                  py: 0.35,
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontSize: '0.7rem',
                    color: '#FFFFFF',
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  {roleLabel}
                </Typography>
              </Box>
            )}

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.45rem', sm: '1.85rem', md: '2.2rem' },
                lineHeight: 1.2,
                mb: 0.8,
                letterSpacing: '-0.025em',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#FFFFFF',
                textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              }}
            >
              {welcomeBannerTitle}
              {username && `, ${username}`}! 👋
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#F8F7FD',
                opacity: 0.98,
                fontSize: { xs: '0.88rem', sm: '0.98rem' },
                maxWidth: '640px',
                lineHeight: 1.55,
                fontWeight: 600,
                textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              }}
            >
              {welcomeBannerSubtitle}
            </Typography>
          </Box>
        </Box>

        {finalAction && <Box sx={{ flexShrink: 0 }}>{finalAction}</Box>}
      </Box>
    </Box>
  );
};

export default WelcomeBanner;
