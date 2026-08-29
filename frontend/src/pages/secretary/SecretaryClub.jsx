import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventIcon from '@mui/icons-material/Event';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { fetchClubMembers, fetchClubStats } from '../../api/adminApi';
import Button from '../../components/Button';

const ROLE_CONFIGS = {
  president: { label: 'President', bg: '#FEF3C7', color: '#B45309' },
  vice_president: { label: 'Vice President', bg: '#EEF2FF', color: '#4F2BCB' },
  secretary: { label: 'Secretary', bg: '#F3F0FF', color: '#7C3AED' },
  treasurer: { label: 'Treasurer', bg: '#E6F4EA', color: '#15803D' },
  member: { label: 'Member', bg: '#F1F5F9', color: '#475569' },
};

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80',
];

const GALLERY_ITEMS = [
  {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
    title: 'Executive Meeting',
  },
  {
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
    title: 'Club Orientation & Workshop',
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    title: 'Competitions & Project Display',
  },
  {
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
    title: 'Annual Celebration Gathering',
  },
];

const SecretaryClub = () => {
  const { secretaryOfClubs } = useAuth();
  const navigate = useNavigate();
  const myClubId = secretaryOfClubs?.[0]?.club_id;
  const myClubName = secretaryOfClubs?.[0]?.club_name || 'My Club';

  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!myClubId) {
      setLoading(false);
      return;
    }
    const loadClubDetails = async () => {
      try {
        setLoading(true);
        const [clubRes, membersData, statsData] = await Promise.all([
          api.get(`/clubs/${myClubId}`),
          fetchClubMembers(myClubId),
          fetchClubStats(myClubId),
        ]);
        setClub(clubRes.data);
        setMembers(membersData || []);
        setStats(statsData);
      } catch (err) {
        setError('Failed to fetch club information.');
      } finally {
        setLoading(false);
      }
    };
    loadClubDetails();
  }, [myClubId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (!myClubId) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
        <Alert severity="warning">You are not assigned as Secretary of any active club.</Alert>
      </Box>
    );
  }

  const coverUrl =
    club?.cover_url ||
    DEFAULT_COVERS[(club?.id || 0) % DEFAULT_COVERS.length];

  const leadershipRoles = ['president', 'vice_president', 'secretary', 'treasurer'];
  const leadershipMembers = members.filter((m) => leadershipRoles.includes(m.role));

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 6 }}>
      {/* Header Info */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            My Club Details (Secretary View)
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Club: <strong>{myClubName}</strong> — Full organization branding, leadership, and public view.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="ghost"
            onClick={() => navigate(`/clubs/${myClubId}`)}
            sx={{ color: '#4F2BCB', borderColor: '#E9E7F2', fontSize: '0.85rem' }}
          >
            Open Public View
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/secretary/events')}
            sx={{ backgroundColor: '#4F2BCB', fontSize: '0.85rem' }}
          >
            Manage Events
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* ========================================================================= */}
      {/* 1. HERO COVER BANNER SECTION                                             */}
      {/* ========================================================================= */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 4,
          boxShadow: '0 8px 30px rgba(79, 43, 203, 0.05)',
        }}
      >
        <Box
          sx={{
            height: { xs: 180, sm: 260, md: 300 },
            width: '100%',
            position: 'relative',
            backgroundImage: `linear-gradient(to bottom, rgba(15, 10, 40, 0.2), rgba(15, 10, 40, 0.75)), url(${coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {club?.category && (
            <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
              <Chip
                label={club.category}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#4F2BCB',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </Box>
          )}
        </Box>

        {/* Profile Card Overlay */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            pb: 3,
            pt: 0,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-end' },
              gap: 2.5,
              mt: { xs: -7, sm: -8 },
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Avatar
              src={club?.logo_url || ''}
              variant="rounded"
              sx={{
                width: { xs: 90, sm: 110 },
                height: { xs: 90, sm: 110 },
                borderRadius: '22px',
                backgroundColor: '#FFFFFF',
                color: '#4F2BCB',
                fontWeight: 900,
                fontSize: '2.5rem',
                border: '4px solid #FFFFFF',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                flexShrink: 0,
              }}
            >
              {club?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ pb: 0.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontSize: { xs: '1.6rem', sm: '1.9rem' },
                  mb: 0.5,
                }}
              >
                {club?.name}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.6}>
                  <GroupsOutlinedIcon sx={{ fontSize: 18, color: '#777788' }} />
                  <Typography variant="body2" sx={{ color: '#777788', fontWeight: 600 }}>
                    {members.length} Members
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#CCD0DC' }}>•</Typography>
                <Box display="flex" alignItems="center" gap={0.6}>
                  <EventIcon sx={{ fontSize: 18, color: '#777788' }} />
                  <Typography variant="body2" sx={{ color: '#777788', fontWeight: 600 }}>
                    {stats?.event_count || 0} Events
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ alignSelf: { xs: 'center', md: 'flex-end' }, pb: 0.5 }}>
            <Chip
              label="Secretary Workspace Active"
              sx={{
                backgroundColor: '#F3F0FF',
                color: '#7C3AED',
                fontWeight: 800,
                fontSize: '0.82rem',
                py: 2,
                px: 1,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* ========================================================================= */}
      {/* 2. MAIN GRID (ABOUT US, LEADERSHIP TEAM, GALLERY, CONTACT)                */}
      {/* ========================================================================= */}
      <Grid container spacing={3.5}>
        {/* Left Column: About Us & Leadership Team */}
        <Grid item xs={12} md={7} lg={8}>
          {/* About Us */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 3.5 },
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3.5,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 1.5 }}>
              About Us
            </Typography>
            <Typography variant="body1" sx={{ color: '#555565', lineHeight: 1.8, fontSize: '0.96rem' }}>
              {club?.description ||
                'Welcome to our club! We are dedicated to bringing students together through engaging workshops, competitions, skill-building events, and community initiatives.'}
            </Typography>
          </Paper>

          {/* Leadership Team */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 3.5 },
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                  Leadership Team
                </Typography>
                <Typography variant="body2" sx={{ color: '#777788' }}>
                  Appointed executive officers managing club operations.
                </Typography>
              </Box>
              <Chip
                label={`${leadershipMembers.length} Officers`}
                size="small"
                sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700 }}
              />
            </Box>

            {leadershipMembers.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#9DA0AE', py: 2 }}>
                No leadership roles assigned yet.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {leadershipMembers.map((officer) => {
                  const roleConfig = ROLE_CONFIGS[officer.role] || ROLE_CONFIGS.member;
                  return (
                    <Grid item xs={12} sm={6} key={officer.user_id}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          border: '1px solid #F0EFF8',
                          backgroundColor: '#FBFBFE',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            backgroundColor: '#EAEAFF',
                            color: '#4F2BCB',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                          }}
                        >
                          {officer.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: '#20202A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {officer.username}
                          </Typography>
                          <Chip
                            label={roleConfig.label}
                            size="small"
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              backgroundColor: roleConfig.bg,
                              color: roleConfig.color,
                              height: 20,
                              px: 0.5,
                              mt: 0.3,
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Gallery & Contact Info */}
        <Grid item xs={12} md={5} lg={4}>
          {/* Gallery */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              mb: 3.5,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CollectionsOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                Gallery
              </Typography>
            </Box>

            <Grid container spacing={1.5}>
              {GALLERY_ITEMS.map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Tooltip title={item.title}>
                    <Box
                      sx={{
                        height: 100,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        '&:hover img': { transform: 'scale(1.08)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={item.url}
                        alt={item.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </Box>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Contact Details */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', mb: 2.5 }}>
              Contact Information
            </Typography>

            <Stack spacing={2}>
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <EmailOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Contact Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {club?.contact_email || 'Not configured'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <MeetingRoomOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Meeting Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    Student Center, Room 304
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <AccessTimeOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Meeting Schedule
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    Every Thursday at 4:30 PM
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecretaryClub;
