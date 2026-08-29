import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';

import { useAuth } from '../context/AuthContext';
import { getEvent, fetchEventParticipants } from '../api/eventApi';
import api, { getImageUrl } from '../api/axiosInstance';
import Button from '../components/Button';

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

const EventManage = () => {
  const { clubId, eventId } = useParams();
  const navigate = useNavigate();
  const { user, systemRole, presidentOfClubs, secretaryOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id || secretaryOfClubs?.[0]?.club_id;

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      let eventData = null;
      try {
        eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (e) {
        console.warn('Could not fetch single event by id', e);
        const allRes = await api.get('/events/?limit=200').catch(() => ({ data: [] }));
        eventData = (allRes.data || []).find((ev) => String(ev.id) === String(eventId));
        if (eventData) setEvent(eventData);
      }

      const participantsData = await fetchEventParticipants(eventId).catch(() => []);
      setParticipants(participantsData || []);

      const targetClubId = eventData?.club_id || clubId || myClubId;
      if (targetClubId) {
        try {
          const membersRes = await api.get(`/clubs/${targetClubId}/members`);
          if (Array.isArray(membersRes.data) && membersRes.data.length > 0) {
            setTeamMembers(membersRes.data);
          }
        } catch (e) {
          // No club members
        }
      }
    } catch (err) {
      console.error('Failed to load event management details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const exportCSV = () => {
    if (participants.length === 0) {
      alert('No registrations to export.');
      return;
    }
    const headers = ['ID', 'Username', 'Email', 'Full Name', 'Role'];
    const rows = participants.map((p) => [p.id, p.username || '', p.email || '', p.full_name || '', p.system_role || '']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `event_${eventId}_registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  const eventDate = event?.start_time ? new Date(event.start_time) : null;
  const eventEndDate = event?.end_time ? new Date(event.end_time) : null;
  const capacityPercent = participants.length > 0 ? Math.min(100, Math.round((participants.length / Math.max(participants.length, 50)) * 100)) : 0;

  const backPath =
    systemRole === 'president'
      ? '/president/events'
      : systemRole === 'secretary'
      ? '/secretary/events'
      : systemRole === 'admin'
      ? '/admin/events'
      : '/events';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Back & Actions Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
        <Box
          onClick={() => navigate(backPath)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Events
        </Box>

        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="ghost"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/clubs/${event?.club_id || clubId || myClubId}/events/${eventId}/edit`)}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
          >
            Edit Event
          </Button>
          <Button
            variant="ghost"
            startIcon={<GroupIcon />}
            onClick={() => {
              const regPath = systemRole === 'president'
                ? `/president/events/${eventId}/registrations`
                : systemRole === 'secretary'
                ? `/secretary/events/${eventId}/registrations`
                : `/events/${eventId}/registrations`;
              navigate(regPath);
            }}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
          >
            Manage Registrations
          </Button>
          <Button
            variant="ghost"
            startIcon={<DownloadIcon />}
            onClick={exportCSV}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.85rem' }}
          >
            Download Report
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ===== HERO BANNER ===== */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            height: { xs: 160, sm: 220, md: 260 },
            backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%), url(${getImageUrl(event?.image_url) || DEFAULT_POSTER})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            p: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ color: '#FFFFFF', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.8rem' }, mb: 0.8, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {event?.title || 'Event'}
            </Typography>
            <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
              {eventDate && (
                <Box display="flex" alignItems="center" gap={0.6}>
                  <CalendarMonthIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.95 }}>
                    {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </Typography>
                </Box>
              )}
              {eventDate && (
                <Box display="flex" alignItems="center" gap={0.6}>
                  <AccessTimeIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.95 }}>
                    {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {eventEndDate ? ` — ${eventEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </Typography>
                </Box>
              )}
              {event?.location && (
                <Box display="flex" alignItems="center" gap={0.6}>
                  <LocationOnIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.95 }}>
                    {event.location}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Status Pills */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={event?.is_active ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              backgroundColor: event?.is_active ? '#D1FAE5' : '#FEE2E2',
              color: event?.is_active ? '#059669' : '#DC2626',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          />
          <Chip
            label={`${participants.length} Registered`}
            size="small"
            sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.75rem' }}
          />
          {eventDate && (
            <Chip
              label={eventDate > new Date() ? 'Upcoming' : 'Past Event'}
              size="small"
              sx={{
                backgroundColor: eventDate > new Date() ? '#DBEAFE' : '#F3F4F6',
                color: eventDate > new Date() ? '#2563EB' : '#6B7280',
                fontWeight: 700,
                fontSize: '0.72rem',
              }}
            />
          )}
        </Box>
      </Paper>

      {/* ===== MAIN CONTENT GRID ===== */}
      <Grid container spacing={3}>
        {/* LEFT COLUMN: Event Info */}
        <Grid item xs={12} md={7}>
          <Stack spacing={3}>
            {/* Event Description */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A', mb: 1.5 }}>
                Event Description & Goals
              </Typography>
              <Typography variant="body2" sx={{ color: '#525266', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {event?.description || 'No description provided for this event.'}
              </Typography>
            </Paper>

            {/* Registered Participants Table */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A' }}>
                  Registered Participants ({participants.length})
                </Typography>
                <Button
                  variant="primary"
                  size="small"
                  startIcon={<PersonAddOutlinedIcon />}
                  onClick={() => {
                    const regPath = systemRole === 'president'
                      ? `/president/events/${eventId}/registrations`
                      : systemRole === 'secretary'
                      ? `/secretary/events/${eventId}/registrations`
                      : `/events/${eventId}/registrations`;
                    navigate(regPath);
                  }}
                  sx={{ backgroundColor: '#4F2BCB', fontSize: '0.78rem', py: 0.6 }}
                >
                  Manage
                </Button>
              </Box>

              {participants.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9DA0AE', textAlign: 'center', py: 3 }}>
                  No participants registered yet.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#FBFBFE' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#777788', fontSize: '0.78rem', textTransform: 'uppercase' }}>Participant</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#777788', fontSize: '0.78rem', textTransform: 'uppercase' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#777788', fontSize: '0.78rem', textTransform: 'uppercase' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {participants.slice(0, 10).map((p) => (
                        <TableRow key={p.id} sx={{ '&:hover': { backgroundColor: '#F9F8FD' } }}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1.2}>
                              <Avatar
                                src={getImageUrl(p.avatar_url)}
                                sx={{ width: 32, height: 32, backgroundColor: '#EAEAFF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.8rem' }}
                              >
                                {(p.username || p.email || 'U').charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A', fontSize: '0.85rem' }}>
                                {p.full_name || p.username || p.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#555565', fontSize: '0.82rem' }}>
                              {p.email || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Registered"
                              size="small"
                              sx={{ backgroundColor: '#D1FAE5', color: '#059669', fontWeight: 800, fontSize: '0.7rem', borderRadius: '8px' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {participants.length > 10 && (
                <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 700, mt: 1.5, display: 'block', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => {
                    const regPath = systemRole === 'president'
                      ? `/president/events/${eventId}/registrations`
                      : systemRole === 'secretary'
                      ? `/secretary/events/${eventId}/registrations`
                      : `/events/${eventId}/registrations`;
                    navigate(regPath);
                  }}
                >
                  View all {participants.length} participants →
                </Typography>
              )}
            </Paper>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: Team & Quick Info */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* Event Quick Stats */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A', mb: 2 }}>
                Event Overview
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F3F0FF', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#4F2BCB' }}>{participants.length}</Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>Registered</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F0FDF4', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#059669' }}>{teamMembers.length}</Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>Club Members</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#EFF6FF', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#2563EB' }}>
                      {eventDate ? (eventDate > new Date() ? Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24)) : 0) : '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>Days Left</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#FEF3C7', textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#D97706' }}>
                      {eventDate && eventEndDate ? `${Math.round((eventEndDate - eventDate) / (1000 * 60 * 60))}h` : '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>Duration</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Club Team Members (Dynamic) */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A', mb: 1.5 }}>
                Club Team Members
              </Typography>

              {teamMembers.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#9DA0AE', textAlign: 'center', py: 2 }}>
                  No club members found.
                </Typography>
              ) : (
                <Stack spacing={1.5} mb={2}>
                  {teamMembers.map((m, idx) => (
                    <Box key={m.user_id || idx} display="flex" alignItems="center" gap={1.2}>
                      <Avatar sx={{ width: 34, height: 34, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 800, fontSize: '0.85rem' }}>
                        {(m.username || 'M').charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', fontSize: '0.85rem' }}>
                          {m.username || `Member #${m.user_id}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#777788' }}>
                          {m.role || 'Member'}
                        </Typography>
                      </Box>
                      {m.email && (
                        <Tooltip title={m.email}>
                          <IconButton size="small" sx={{ color: '#9DA0AE' }}>
                            <MailOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}

              {teamMembers.length > 0 && (
                <Button
                  variant="primary"
                  size="small"
                  fullWidth
                  onClick={() => {
                    const emails = teamMembers.filter((m) => m.email).map((m) => m.email).join(', ');
                    if (emails) {
                      navigator.clipboard?.writeText(emails);
                      alert('Team emails copied to clipboard:\n' + emails);
                    } else {
                      alert('No email addresses available for team members.');
                    }
                  }}
                  sx={{ backgroundColor: '#4F2BCB', fontSize: '0.8rem' }}
                >
                  Contact All ({teamMembers.length})
                </Button>
              )}
            </Paper>

            {/* Event Details Card */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E9E7F2', backgroundColor: '#FFFFFF' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#20202A', mb: 1.5 }}>
                Event Details
              </Typography>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase' }}>Title</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>{event?.title || '—'}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase' }}>Location</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>{event?.location || '—'}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase' }}>Start Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {eventDate ? eventDate.toLocaleString() : '—'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase' }}>End Time</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                    {eventEndDate ? eventEndDate.toLocaleString() : '—'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#9DA0AE', textTransform: 'uppercase' }}>Status</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: event?.is_active ? '#059669' : '#DC2626' }}>
                    {event?.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventManage;
