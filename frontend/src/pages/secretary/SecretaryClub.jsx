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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import { useAuth } from '../../context/AuthContext';
import api, { getImageUrl, getClubLogoUrl } from '../../api/axiosInstance';
import { fetchClubMembers, fetchClubStats } from '../../api/adminApi';
import Button from '../../components/Button';
import EditClubModal from '../../components/EditClubModal';

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

const DEFAULT_GALLERY = [
  { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80', title: 'Executive Meeting' },
  { url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80', title: 'Orientation & Workshop' },
  { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80', title: 'Competitions & Projects' },
  { url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80', title: 'Annual Celebration' },
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
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadClubDetails = async () => {
    if (!myClubId) {
      setLoading(false);
      return;
    }
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

  useEffect(() => {
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

  const rawCover = club?.cover_url || DEFAULT_COVERS[(club?.id || 0) % DEFAULT_COVERS.length];
  const coverUrl = getImageUrl(rawCover);
  const logoUrl = getClubLogoUrl(club);

  let displayGallery = DEFAULT_GALLERY;
  if (club?.gallery) {
    try {
      const parsed = typeof club.gallery === 'string' ? JSON.parse(club.gallery) : club.gallery;
      if (Array.isArray(parsed) && parsed.length > 0) {
        displayGallery = parsed;
      }
    } catch (e) {
      displayGallery = DEFAULT_GALLERY;
    }
  }

  const leadershipRoles = ['president', 'vice_president', 'secretary', 'treasurer'];
  const leadershipMembers = members.filter((m) => leadershipRoles.includes(m.role));

  return (
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Header Info */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            My Club Details (Secretary)
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Club: <strong>{myClubName}</strong> — Full organization branding, leadership, and public view.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Button
            variant="ghost"
            onClick={() => navigate(`/clubs/${myClubId}`)}
            sx={{ color: '#4F2BCB', borderColor: '#E9E7F2', fontSize: '0.85rem' }}
          >
            Open Public View
          </Button>
          <Button
            variant="primary"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditModalOpen(true)}
            sx={{ backgroundColor: '#4F2BCB', fontSize: '0.85rem' }}
          >
            Edit Club & Media
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* 1. HERO COVER BANNER */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #E9E7F2',
          mb: 4,
          boxShadow: '0 8px 30px rgba(79, 43, 203, 0.08)',
          position: 'relative',
          height: { xs: 260, sm: 300, md: 340 },
          backgroundImage: `linear-gradient(180deg, rgba(15, 10, 40, 0.2) 0%, rgba(15, 10, 40, 0.88) 100%), url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 2.5, sm: 3.5 },
          boxSizing: 'border-box',
        }}
      >
        <Box display="flex" justifyContent="flex-end" gap={1}>
          {club?.category && (
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
          )}
          <Chip
            icon={<EditOutlinedIcon style={{ fontSize: 16, color: '#4F2BCB' }} />}
            label="Edit Media"
            clickable
            onClick={() => setEditModalOpen(true)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#4F2BCB',
              fontWeight: 800,
              fontSize: '0.82rem',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2.5,
            width: '100%',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Avatar
              src={logoUrl}
              variant="rounded"
              sx={{
                width: { xs: 72, sm: 96 },
                height: { xs: 72, sm: 96 },
                borderRadius: '20px',
                backgroundColor: '#FFFFFF',
                color: '#4F2BCB',
                fontWeight: 900,
                fontSize: '2.5rem',
                border: '3px solid #FFFFFF',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                flexShrink: 0,
              }}
            >
              {club?.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#FFFFFF',
                  fontSize: { xs: '1.5rem', sm: '2.1rem' },
                  letterSpacing: '-0.02em',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                  mb: 0.5,
                }}
              >
                {club?.name}
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={0.6}>
                  <GroupsOutlinedIcon sx={{ fontSize: 18, color: '#E0DBFF' }} />
                  <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 600 }}>
                    {members.length} Members
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>•</Typography>
                <Box display="flex" alignItems="center" gap={0.6}>
                  <EventIcon sx={{ fontSize: 18, color: '#E0DBFF' }} />
                  <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 600 }}>
                    {stats?.event_count || 0} Events
                  </Typography>
                </Box>
                {club?.meeting_location && (
                  <>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>•</Typography>
                    <Typography variant="body2" sx={{ color: '#F3F0FF', fontWeight: 600 }}>
                      📍 {club.meeting_location}
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Chip
              label="Secretary Workspace Active"
              sx={{
                backgroundColor: 'rgba(243, 240, 255, 0.95)',
                color: '#4F2BCB',
                fontWeight: 800,
                fontSize: '0.82rem',
                backdropFilter: 'blur(8px)',
                py: 2,
                px: 1,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* 2. MAIN GRID */}
      <Grid container spacing={3.5}>
        <Grid item xs={12} md={7} lg={8}>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                About Us
              </Typography>
              <Button
                variant="ghost"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditModalOpen(true)}
                sx={{ fontSize: '0.78rem', color: '#4F2BCB' }}
              >
                Edit
              </Button>
            </Box>
            <Typography variant="body1" sx={{ color: '#555565', lineHeight: 1.8, fontSize: '0.96rem' }}>
              {club?.description ||
                'Welcome to our club! We are dedicated to creating meaningful student experiences through workshops, competitions, skill-building sessions, and campus events.'}
            </Typography>
          </Paper>

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
                  Elected officers leading club operations.
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
                    <Grid item xs={12} sm={4} key={officer.user_id}>
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          border: '1px solid #F0EFF8',
                          backgroundColor: '#FBFBFE',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 4px 15px rgba(79, 43, 203, 0.08)',
                            borderColor: '#4F2BCB',
                          },
                        }}
                      >
                        <Avatar
                          src={getImageUrl(officer.avatar_url)}
                          sx={{
                            width: 54,
                            height: 54,
                            backgroundColor: '#EAEAFF',
                            color: '#4F2BCB',
                            fontWeight: 800,
                            fontSize: '1.2rem',
                            border: '2px solid #FFFFFF',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                          }}
                        >
                          {officer.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, width: '100%' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 800,
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
                              mt: 0.5,
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

        <Grid item xs={12} md={5} lg={4}>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <CollectionsOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                  Gallery
                </Typography>
              </Box>
              <Button
                variant="ghost"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditModalOpen(true)}
                sx={{ fontSize: '0.78rem', color: '#4F2BCB' }}
              >
                Manage
              </Button>
            </Box>

            <Grid container spacing={1.5}>
              {displayGallery.map((item, index) => (
                <Grid item xs={6} key={index}>
                  <Tooltip title={item.title || 'Photo'}>
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
                        src={getImageUrl(item.url || item)}
                        alt={item.title || 'Photo'}
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

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                Contact
              </Typography>
              <Button
                variant="ghost"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setEditModalOpen(true)}
                sx={{ fontSize: '0.78rem', color: '#4F2BCB' }}
              >
                Edit
              </Button>
            </Box>

            <Stack spacing={2}>
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <EmailOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {club?.contact_email || 'contact@clubcentralize.edu'}
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
                    {club?.meeting_location || 'Student Center, Room 304'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <AccessTimeOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20, mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, textTransform: 'uppercase' }}>
                    Regular Meetings
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {club?.meeting_time || 'Every Thursday at 4:30 PM'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {club && (
        <EditClubModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          club={club}
          onUpdated={(updated) => {
            setClub(updated);
            loadClubDetails();
          }}
        />
      )}
    </Box>
  );
};

export default SecretaryClub;
