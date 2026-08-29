import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import HistoryIcon from '@mui/icons-material/History';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';

import { useAuth } from '../../context/AuthContext';
import { fetchEventsByClub, deleteEvent } from '../../api/eventApi';
import { getImageUrl } from '../../api/axiosInstance';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DEFAULT_EVENT_IMAGES = [
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
];

const PresidentEvents = () => {
  const { presidentOfClubs } = useAuth();
  const myClubId = presidentOfClubs?.[0]?.club_id;
  const myClubName = presidentOfClubs?.[0]?.club_name || 'My Club';
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'PAST'

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      if (myClubId) {
        const data = await fetchEventsByClub(myClubId, { include_inactive: true });
        setEvents(data || []);
      } else {
        const res = await api.get('/events/?include_inactive=true&limit=200');
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load events', err);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [myClubId]);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(eventId);
      setSuccess('Event deleted successfully!');
      loadEvents();
    } catch (err) {
      setError('Failed to delete event.');
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const eventDays = new Set(
    events
      .filter((ev) => ev.start_time)
      .map((ev) => {
        const d = new Date(ev.start_time);
        if (d.getFullYear() === year && d.getMonth() === month) {
          return d.getDate();
        }
        return null;
      })
      .filter(Boolean)
  );

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'UPCOMING') {
      return ev.start_time && new Date(ev.start_time) >= new Date();
    }
    if (filterType === 'PAST') {
      return ev.start_time && new Date(ev.start_time) < new Date();
    }
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Top Header Bar Matching Mockup */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
            Event Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788' }}>
            Club: <strong>{myClubName}</strong> — Schedule, review, and manage event registrations.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
            sx={{ backgroundColor: '#4F2BCB' }}
          >
            + Create New Event
          </Button>
          <Button
            variant="ghost"
            onClick={() => setFilterType('ALL')}
            sx={{ color: '#4F2BCB', borderColor: '#D4CCF7' }}
          >
            View All Events
          </Button>
          <Button
            variant="ghost"
            startIcon={<HistoryIcon />}
            onClick={() => setFilterType('PAST')}
            sx={{ color: '#777788', borderColor: '#E9E7F2' }}
          >
            Past Events Archive
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Main 2-Column Layout Matching Top-Left / Top-Right Mockup */}
      <Grid container spacing={3.5}>
        {/* Left Column: Interactive Month Calendar Widget & Action Buttons */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(79, 43, 203, 0.04)',
            }}
          >
            {/* Calendar Month Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <IconButton size="small" onClick={handlePrevMonth}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#20202A' }}>
                {MONTH_NAMES[month]} {year}
              </Typography>
              <IconButton size="small" onClick={handleNextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Days of Week */}
            <Grid container spacing={1} mb={1}>
              {DAYS.map((day) => (
                <Grid item xs={12 / 7} key={day} textAlign="center">
                  <Typography variant="caption" sx={{ color: '#9DA0AE', fontWeight: 700, fontSize: '0.72rem' }}>
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Numbers Grid */}
            <Grid container spacing={1} mb={3}>
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <Grid item xs={12 / 7} key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const hasEvent = eventDays.has(dayNum);
                const isToday =
                  new Date().getDate() === dayNum &&
                  new Date().getMonth() === month &&
                  new Date().getFullYear() === year;

                return (
                  <Grid item xs={12 / 7} key={dayNum} textAlign="center">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        mx: 'auto',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: hasEvent || isToday ? 800 : 500,
                        backgroundColor: isToday ? '#4F2BCB' : hasEvent ? '#F3F0FF' : 'transparent',
                        color: isToday ? '#FFFFFF' : hasEvent ? '#4F2BCB' : '#20202A',
                        border: hasEvent && !isToday ? '1px solid #C7B8FF' : 'none',
                        cursor: hasEvent ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        '&:hover': hasEvent ? { backgroundColor: '#4F2BCB', color: '#FFFFFF' } : {},
                      }}
                    >
                      {dayNum}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* 3 Action Buttons Below Calendar Matching Mockup */}
            <Stack spacing={1.5}>
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(myClubId ? `/clubs/${myClubId}/events/create` : '/president/events/create')}
                sx={{ backgroundColor: '#4F2BCB', py: 1.1, borderRadius: '12px', fontWeight: 700 }}
              >
                Create New Event
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setFilterType('ALL')}
                sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', py: 1.1, borderRadius: '12px', fontWeight: 700 }}
              >
                View All Events
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setFilterType('PAST')}
                sx={{ color: '#777788', borderColor: '#E9E7F2', py: 1.1, borderRadius: '12px', fontWeight: 700 }}
              >
                Past Events Archive
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Right Column: Featured Upcoming Events List (Matching Mockup with Poster Thumbnail) */}
        <Grid item xs={12} md={7} lg={8}>
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
                Featured Upcoming Events ({filteredEvents.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label="All"
                  size="small"
                  clickable
                  onClick={() => setFilterType('ALL')}
                  sx={{
                    backgroundColor: filterType === 'ALL' ? '#4F2BCB' : '#F1F5F9',
                    color: filterType === 'ALL' ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label="Upcoming"
                  size="small"
                  clickable
                  onClick={() => setFilterType('UPCOMING')}
                  sx={{
                    backgroundColor: filterType === 'UPCOMING' ? '#4F2BCB' : '#F1F5F9',
                    color: filterType === 'UPCOMING' ? '#FFFFFF' : '#475569',
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </Box>

            {filteredEvents.length === 0 ? (
              <EmptyState
                icon={<CalendarMonthIcon />}
                title="No events found"
                message="Schedule your club's first workshop, seminar, or meetup."
                action={
                  <Button
                    variant="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
                    sx={{ backgroundColor: '#4F2BCB' }}
                  >
                    Schedule Event
                  </Button>
                }
              />
            ) : (
              <Stack spacing={2}>
                {filteredEvents.map((ev, index) => {
                  const evDate = ev.start_time ? new Date(ev.start_time) : new Date();
                  const day = evDate.getDate();
                  const monthName = evDate.toLocaleDateString(undefined, { month: 'short' });
                  const isDraft = !ev.is_active;

                  const fallbackImg = DEFAULT_EVENT_IMAGES[index % DEFAULT_EVENT_IMAGES.length];
                  const posterUrl = ev.image_url ? getImageUrl(ev.image_url) : fallbackImg;

                  return (
                    <Paper
                      key={ev.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '20px',
                        border: '1px solid #E9E7F2',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2.5,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: '#4F2BCB',
                          boxShadow: '0 6px 22px rgba(79, 43, 203, 0.08)',
                        },
                      }}
                    >
                      {/* Left: Event Poster Thumbnail Image */}
                      <Box
                        sx={{
                          width: { xs: '100%', sm: 130 },
                          height: { xs: 140, sm: 96 },
                          borderRadius: '14px',
                          overflow: 'hidden',
                          position: 'relative',
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          component="img"
                          src={posterUrl}
                          alt={ev.title || 'Event poster'}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </Box>

                      {/* Middle: Event Title & Meta Info */}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 800,
                            color: '#20202A',
                            fontSize: '1rem',
                            mb: 0.8,
                          }}
                        >
                          {ev.title || ev.name}
                        </Typography>

                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={0.5}>
                          <Box
                            sx={{
                              px: 1,
                              py: 0.3,
                              borderRadius: '6px',
                              backgroundColor: '#F3F0FF',
                              color: '#4F2BCB',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                            }}
                          >
                            {day} {monthName}
                          </Box>

                          <Box display="flex" alignItems="center" gap={0.5}>
                            <AccessTimeIcon sx={{ fontSize: 15, color: '#777788' }} />
                            <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                              {evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>

                          <Typography variant="caption" sx={{ color: '#CCD0DC' }}>•</Typography>

                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LocationOnIcon sx={{ fontSize: 15, color: '#777788' }} />
                            <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                              {ev.location || 'Campus Auditorium'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {/* Right: Status Pill & Action Buttons */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'row', sm: 'column' },
                          alignItems: { xs: 'center', sm: 'flex-end' },
                          justifyContent: 'space-between',
                          gap: 1.5,
                          width: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        <Chip
                          label={isDraft ? 'Draft' : 'Registration Open'}
                          size="small"
                          sx={{
                            backgroundColor: isDraft ? '#FEF3C7' : '#D1FAE5',
                            color: isDraft ? '#B45309' : '#059669',
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                          }}
                        />

                        <Stack direction="row" spacing={0.8}>
                          <Tooltip title="Event Management Workspace">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/president/events/${ev.id}/manage`)}
                              sx={{ color: '#FFFFFF', backgroundColor: '#4F2BCB', '&:hover': { backgroundColor: '#39209A' } }}
                            >
                              <DashboardCustomizeOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Manage Registrations">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/president/events/${ev.id}/registrations`)}
                              sx={{ color: '#059669', backgroundColor: '#D1FAE5' }}
                            >
                              <HowToRegOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/clubs/${myClubId}/events/${ev.id}`)}
                              sx={{ color: '#4F2BCB', backgroundColor: '#F3F0FF' }}
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Event">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/clubs/${myClubId}/events/${ev.id}/edit`)}
                              sx={{ color: '#0284C7', backgroundColor: '#E0F2FE' }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Event">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(ev.id)}
                              sx={{ color: '#DC2626', backgroundColor: '#FEE2E2' }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PresidentEvents;
