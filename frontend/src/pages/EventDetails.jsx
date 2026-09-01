import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { getEvent, joinEvent, leaveEvent, deleteEvent, fetchEventParticipants } from '../api/eventApi';
import api, { getImageUrl } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const DEFAULT_EVENT_BANNER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const EventDetails = () => {
  const { clubId, eventId } = useParams();
  const navigate = useNavigate();
  const { systemRole } = useAuth();
  const isAdmin = systemRole === 'admin';

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const data = await getEvent(eventId);
      setEvent(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch event', err);
      setError(err?.response?.data?.detail || 'Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const data = await fetchEventParticipants(eventId);
      setParticipants(data || []);
    } catch (err) {
      console.warn('Could not fetch participants', err);
    }
  };

  const fetchClubMembers = async () => {
    const targetClubId = clubId || event?.club_id;
    if (!targetClubId) return;
    try {
      const res = await api.get(`/clubs/${targetClubId}/members`);
      setClubMembers(res.data || []);
    } catch (err) {
      console.error('Failed to load club members', err);
    }
  };

  useEffect(() => {
    fetchEventData();
    loadParticipants();
  }, [eventId]);

  useEffect(() => {
    if (clubId || event?.club_id) {
      fetchClubMembers();
    }
  }, [clubId, event?.club_id]);

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      await joinEvent(eventId);
      await loadParticipants();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to join event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to cancel your event registration?')) return;
    try {
      setActionLoading(true);
      await leaveEvent(eventId);
      await loadParticipants();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to leave event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteEvent(eventId);
      navigate(clubId ? `/clubs/${clubId}` : '/events');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to delete event');
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const currentUserId = Number(localStorage.getItem('user_id'));
  const isParticipant = participants.some((p) => p.id === currentUserId || p.user_id === currentUserId);
  const isClubLeader =
    isAdmin ||
    systemRole === 'president' ||
    systemRole === 'secretary' ||
    systemRole === 'event_manager' ||
    clubMembers.some(
      (m) =>
        m.user_id === currentUserId &&
        (m.role === 'president' || m.role === 'secretary' || m.role === 'event_manager' || m.role === 'vice_president')
    );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (error && !event) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, width: '100%' }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>
        <Button variant="primary" onClick={() => navigate(clubId ? `/clubs/${clubId}` : '/events')}>
          Back
        </Button>
      </Box>
    );
  }

  const eventDate = event?.start_time ? new Date(event.start_time) : null;
  const isUpcoming = eventDate ? eventDate >= new Date() : true;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Top Header & Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1.5}>
        <Box
          component={RouterLink}
          to={clubId ? `/clubs/${clubId}` : '/events'}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 800,
            fontSize: '0.92rem',
            textDecoration: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to {clubId ? 'Club Hub' : 'Events'}
        </Box>

        {isClubLeader && (
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              variant="primary"
              startIcon={<SettingsOutlinedIcon />}
              onClick={() =>
                navigate(`/clubs/${event?.club_id || clubId || 1}/events/${eventId}/manage`)
              }
            >
              Task Management
            </Button>
            <Button
              variant="ghost"
              startIcon={<EditIcon />}
              onClick={() =>
                navigate(`/clubs/${event?.club_id || clubId || 1}/events/${eventId}/edit`)
              }
            >
              Edit Event
            </Button>
            <Button
              variant="danger"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Poster & Details Paper */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '24px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(79, 43, 203, 0.04)',
        }}
      >
        <Box
          component="img"
          src={getImageUrl(event?.image_url) || DEFAULT_EVENT_BANNER}
          alt={event?.title || 'Event poster'}
          onError={(e) => {
            e.target.src = DEFAULT_EVENT_BANNER;
          }}
          sx={{
            width: '100%',
            height: { xs: 220, sm: 320, md: 380 },
            objectFit: 'cover',
            borderBottom: '1px solid #E9E7F2',
            display: 'block',
          }}
        />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontSize: { xs: '1.5rem', sm: '1.9rem' },
                  letterSpacing: '-0.02em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  mb: 1.5,
                }}
              >
                {event?.title || event?.name}
              </Typography>

              <Stack direction="row" spacing={2.5} flexWrap="wrap" alignItems="center" gap={1}>
                {eventDate && (
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <CalendarMonthIcon sx={{ fontSize: 18, color: '#4F2BCB' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                      {eventDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                )}

                {event?.location && (
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <LocationOnIcon sx={{ fontSize: 18, color: '#8E90A2' }} />
                    <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                      {event.location}
                    </Typography>
                  </Box>
                )}

                <Chip
                  label={isUpcoming ? 'Registration Open' : 'Concluded'}
                  size="small"
                  sx={{
                    backgroundColor: isUpcoming ? '#D1FAE5' : '#F1F5F9',
                    color: isUpcoming ? '#059669' : '#475569',
                    fontWeight: 800,
                    borderRadius: '8px',
                  }}
                />
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              display="flex"
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            >
              {isParticipant ? (
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Chip
                    icon={<CheckCircleIcon style={{ color: '#059669' }} />}
                    label="You are Registered"
                    sx={{
                      backgroundColor: '#D1FAE5',
                      color: '#059669',
                      fontWeight: 800,
                      borderRadius: '8px',
                      height: 36,
                      px: 1,
                    }}
                  />
                  <Button
                    variant="danger"
                    size="small"
                    onClick={handleLeave}
                    loading={actionLoading}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : !isUpcoming ? (
                <Chip
                  label="Event Concluded — Registration Closed"
                  sx={{
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    fontWeight: 800,
                    borderRadius: '12px',
                    height: 42,
                    px: 2,
                    fontSize: '0.86rem',
                    border: '1px solid #E2E8F0',
                  }}
                />
              ) : (
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  loading={actionLoading}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                  }}
                >
                  Register for Event
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Tabs for About & Attendees */}
      <Box sx={{ borderBottom: 1, borderColor: '#E9E7F2', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: '#8E90A2',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              '&.Mui-selected': { color: '#4F2BCB' },
            },
            '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB', height: 3, borderRadius: '3px' },
          }}
        >
          <Tab label="About This Event" />
          <Tab label={`Registered Attendees (${participants.length})`} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Grid container spacing={3.5}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  mb: 1.5,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Event Description & Overview
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#5E5D6E', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '0.94rem' }}
              >
                {event?.description || 'Join us for this exciting university club event! All campus members are welcome.'}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '22px',
                border: '1px solid #E9E7F2',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  mb: 2.5,
                  fontSize: '1.05rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Event Schedule Highlights
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#4F2BCB', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                      Registration & Check-in
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E' }}>
                      Attendee arrival, credential verification, and welcome kit.
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#4F2BCB', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                      Keynote & Activities
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E' }}>
                      Speaker presentations, interactive hands-on sessions, or tournament rounds.
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1.5} alignItems="flex-start">
                  <AccessTimeIcon sx={{ fontSize: 18, color: '#4F2BCB', mt: 0.3 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                      Q&A, Networking & Awards
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5E5D6E' }}>
                      Open participant discussion, photo session, and closing remarks.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Paper
          elevation={0}
          sx={{
            p: 3.5,
            borderRadius: '22px',
            border: '1px solid #E9E7F2',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#20202A',
              mb: 2.5,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Registered Attendees ({participants.length})
          </Typography>

          {participants.length === 0 ? (
            <EmptyState icon={<CalendarMonthIcon />} title="No registered attendees yet" message="Be the first to register for this event!" />
          ) : (
            <Grid container spacing={2}>
              {participants.map((p) => (
                <Grid item xs={12} sm={6} md={4} key={p.id || p.user_id}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '16px',
                      border: '1px solid #F1EFF8',
                      backgroundColor: '#F8F7FD',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#EDE9FE',
                        color: '#4F2BCB',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                      }}
                    >
                      {(p.username || p.email || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: '#20202A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {p.full_name || p.username || p.email}
                      </Typography>
                      {p.email && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#5E5D6E',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {p.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '22px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#20202A' }}>
          Delete Event?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#5E5D6E' }}>
            Are you sure you want to delete this event? This action will permanently remove all event tasks and attendee registrations.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={actionLoading}
          >
            Delete Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetails;
