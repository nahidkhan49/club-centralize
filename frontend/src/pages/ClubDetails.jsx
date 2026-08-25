import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Chip,
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import api from '../api/axiosInstance';
import { fetchEventsByClub } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';

const ROLE_CONFIGS = {
  president: { label: 'President', bg: '#FEF3C7', color: '#B45309' },
  vice_president: { label: 'Vice President', bg: '#EEF2FF', color: '#4F2BCB' },
  secretary: { label: 'Secretary', bg: '#F3F0FF', color: '#7C3AED' },
  treasurer: { label: 'Treasurer', bg: '#E6F4EA', color: '#15803D' },
  member: { label: 'Member', bg: '#F1F5F9', color: '#475569' },
};

const ClubDetails = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { systemRole, user } = useAuth();
  const isAdmin = systemRole === 'admin';

  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingClub, setLoadingClub] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchClub = async () => {
    try {
      setLoadingClub(true);
      const response = await api.get(`/clubs/${clubId}`);
      setClub(response.data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load club');
    } finally {
      setLoadingClub(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await api.get(`/clubs/${clubId}/members`);
      setMembers(response.data || []);
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await fetchEventsByClub(clubId);
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchClub();
    fetchMembers();
    fetchEvents();
  }, [clubId]);

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      await api.post(`/clubs/${clubId}/join`);
      await fetchMembers();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to join club');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setActionLoading(true);
      await api.delete(`/clubs/${clubId}/leave`);
      await fetchMembers();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to leave club');
    } finally {
      setActionLoading(false);
    }
  };

  const currentUserId = user?.id || Number(localStorage.getItem('user_id'));
  const myMembership = members.find((m) => m.user_id === currentUserId);
  const isMember = Boolean(myMembership);
  const myRole = myMembership?.role;

  // Permission Check: President or Secretary of this club can manage events
  const isClubManager =
    isAdmin || myRole === 'president' || myRole === 'secretary' || myRole === 'vice_president';

  if (loadingClub) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (error && !club) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/clubs')}>
          Back to Clubs
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 2 }}>
      {/* Top Back Link & Admin Shortcuts */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box
          component={RouterLink}
          to="/clubs"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Clubs
        </Box>

        {isAdmin && (
          <Button
            variant="ghost"
            component={RouterLink}
            to="/admin/clubs"
            sx={{ color: '#4F2BCB', borderColor: '#E9E7F2', fontSize: '0.85rem' }}
          >
            Admin Management
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Club Details Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          gap: 3,
          mb: 4,
        }}
      >
        <Avatar
          src={club?.logo_url || ''}
          variant="rounded"
          sx={{
            width: 100,
            height: 100,
            borderRadius: '20px',
            backgroundColor: '#F3F0FF',
            color: '#4F2BCB',
            fontWeight: 800,
            fontSize: '2rem',
            border: '2px solid #E2D9FF',
            flexShrink: 0,
            boxShadow: '0 4px 20px rgba(79, 43, 203, 0.08)',
          }}
        >
          {club?.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }} mb={0.5}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#20202A', fontSize: { xs: '1.5rem', sm: '1.9rem' } }}
            >
              {club?.name}
            </Typography>
            {club?.category && (
              <Chip
                label={club.category}
                size="small"
                sx={{
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>

          <Typography variant="body2" sx={{ color: '#777788', mb: 2 }}>
            {club?.description || 'University student organization.'}
          </Typography>

          {isMember ? (
            <Box display="flex" alignItems="center" gap={2} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Chip
                icon={<AdminPanelSettingsOutlinedIcon style={{ color: '#4F2BCB' }} />}
                label={`Your Role: ${(myRole || 'member').replace('_', ' ').toUpperCase()}`}
                sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700 }}
              />
              {/* Normal members or officers can leave; presidents can leave if not locked */}
              <Button
                variant="ghost"
                onClick={handleLeave}
                disabled={actionLoading}
                sx={{
                  color: '#EF4444',
                  borderColor: '#E9E7F2',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 0.8,
                  '&:hover': { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
                }}
              >
                {actionLoading ? 'Leaving...' : 'Leave Club'}
              </Button>
            </Box>
          ) : (
            <Button
              variant="primary"
              onClick={handleJoin}
              disabled={actionLoading}
              sx={{
                backgroundColor: '#4F2BCB',
                color: '#FFFFFF',
                borderRadius: '8px',
                px: 3.5,
                py: 0.9,
                fontWeight: 600,
                fontSize: '0.9rem',
                '&:hover': { backgroundColor: '#39209A' },
              }}
            >
              {actionLoading ? 'Joining...' : 'Join Club'}
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#E9E7F2', mb: 4 }} />

      {/* Members Section */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', fontSize: '1.1rem', mb: 2.5 }}>
          Club Members ({members.length})
        </Typography>

        {loadingMembers ? (
          <CircularProgress sx={{ color: '#4F2BCB' }} />
        ) : members.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#9DA0AE' }}>No members in this club yet.</Typography>
        ) : (
          <Grid container spacing={2.5}>
            {members.map((member) => {
              const roleInfo = ROLE_CONFIGS[member.role] || ROLE_CONFIGS.member;

              return (
                <Grid item xs={12} sm={6} md={3} key={member.user_id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: '16px',
                      border: '1px solid #E9E7F2',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        backgroundColor: '#E0DBFF',
                        color: '#4F2BCB',
                        fontWeight: 700,
                        fontSize: '1.2rem',
                        mb: 1.5,
                      }}
                    >
                      {member.username?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: '#20202A', fontSize: '0.95rem', mb: 0.8 }}
                    >
                      {member.username}
                    </Typography>

                    <Chip
                      label={roleInfo.label}
                      size="small"
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: roleInfo.bg,
                        color: roleInfo.color,
                        borderRadius: '12px',
                        height: 24,
                        px: 1,
                      }}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Events Section Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: '#E9E7F2', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: '#777788',
              '&.Mui-selected': { color: '#4F2BCB' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 3 },
          }}
        >
          <Tab icon={<EventIcon fontSize="small" />} iconPosition="start" label={`Events (${events.length})`} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A' }}>
              Club Events
            </Typography>
            {isClubManager && (
              <Button
                variant="primary"
                onClick={() => navigate(`/clubs/${clubId}/events/create`)}
                startIcon={<AddIcon />}
                sx={{ backgroundColor: '#4F2BCB' }}
              >
                Create Event
              </Button>
            )}
          </Box>

          {loadingEvents ? (
            <CircularProgress sx={{ color: '#4F2BCB' }} />
          ) : events.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 5,
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px dashed #E9E7F2',
              }}
            >
              <EventIcon sx={{ fontSize: 42, color: '#9DA0AE', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#20202A' }}>
                No events scheduled yet
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {events.map((ev) => (
                <Grid item xs={12} sm={6} md={4} key={ev.id}>
                  <Card
                    sx={{
                      p: 2.5,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      border: '1px solid #E9E7F2',
                    }}
                  >
                    {ev.image_url && (
                      <Box
                        component="img"
                        src={ev.image_url}
                        alt={ev.title}
                        sx={{
                          width: '100%',
                          height: 140,
                          objectFit: 'cover',
                          borderRadius: '10px',
                          mb: 1.5,
                        }}
                      />
                    )}

                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 1 }}>
                      {ev.title || ev.name}
                    </Typography>

                    {ev.start_time && (
                      <Box display="flex" alignItems="center" gap={1} mb={0.8}>
                        <CalendarMonthIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                        <Typography variant="body2" sx={{ color: '#6E6D7A' }}>
                          {new Date(ev.start_time).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    )}

                    {ev.location && (
                      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#777788' }} />
                        <Typography variant="body2" sx={{ color: '#777788' }}>
                          {ev.location}
                        </Typography>
                      </Box>
                    )}

                    <Box mt="auto" pt={1}>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/clubs/${clubId}/events/${ev.id}`)}
                        sx={{ fontWeight: 600, color: '#4F2BCB' }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ClubDetails;
