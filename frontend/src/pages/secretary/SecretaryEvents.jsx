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
import AssignmentIcon from '@mui/icons-material/Assignment';
import InsightsIcon from '@mui/icons-material/Insights';

import { useAuth } from '../../context/AuthContext';
import { fetchEventsByClub, deleteEvent } from '../../api/eventApi';
import api, { getImageUrl } from '../../api/axiosInstance';
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

const SecretaryEvents = () => {
  const { secretaryOfClubs, presidentOfClubs } = useAuth();
  const myClubId = secretaryOfClubs?.[0]?.club_id || presidentOfClubs?.[0]?.club_id;
  const myClubName =
    secretaryOfClubs?.[0]?.club_name || presidentOfClubs?.[0]?.club_name || 'My Club';
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

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
    if (!window.confirm('Are you sure you want to delete this event? This will also remove tasks and registrations.')) return;
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
    if (selectedDateFilter) {
      if (!ev.start_time) return false;
      const d = new Date(ev.start_time);
      if (
        d.getFullYear() !== year ||
        d.getMonth() !== month ||
        d.getDate() !== selectedDateFilter
      ) {
        return false;
      }
    }
    if (filterType === 'UPCOMING') {
      return ev.start_time && new Date(ev.start_time) >= new Date();
    }
    if (filterType === 'PAST') {
      return ev.start_time && new Date(ev.start_time) < new Date();
    }
    return true;
  });

  const upcomingCount = events.filter((e) => e.start_time && new Date(e.start_time) >= new Date()).length;
  const thisMonthCount = events.filter((e) => {
    if (!e.start_time) return false;
    const d = new Date(e.start_time);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 6 }}>
      {/* Top Header Bar */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3.5}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#20202A',
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            Secretary Event Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Club: <strong>{myClubName}</strong> — Schedule events, manage task allocations, and review signups.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <Button
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
            sx={{ px: 2.5 }}
          >
            + Create Event
          </Button>
          <Button
            variant={filterType === 'ALL' && !selectedDateFilter ? 'subtle' : 'ghost'}
            onClick={() => {
              setFilterType('ALL');
              setSelectedDateFilter(null);
            }}
          >
            View All Events
          </Button>
          <Button
            variant={filterType === 'PAST' ? 'subtle' : 'ghost'}
            startIcon={<HistoryIcon />}
            onClick={() => {
              setFilterType('PAST');
              setSelectedDateFilter(null);
            }}
          >
            Past Archive
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Main 2-Column Layout */}
      <Grid container spacing={3.5}>
        {/* Left Column: Interactive Month Calendar Widget */}
        <Grid item xs={12} md={5} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(79, 43, 203, 0.04)',
              position: 'sticky',
              top: 80,
            }}
          >
            {/* Calendar Month Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <IconButton size="small" onClick={handlePrevMonth} sx={{ color: '#5E5D6E' }}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {MONTH_NAMES[month]} {year}
              </Typography>
              <IconButton size="small" onClick={handleNextMonth} sx={{ color: '#5E5D6E' }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* Days of Week */}
            <Grid container spacing={0.5} mb={1}>
              {DAYS.map((day) => (
                <Grid item xs={12 / 7} key={day} textAlign="center">
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#8E90A2',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  >
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Matrix */}
            <Grid container spacing={0.5} mb={3}>
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
                const isSelected = selectedDateFilter === dayNum;

                return (
                  <Grid item xs={12 / 7} key={dayNum} textAlign="center">
                    <Box
                      onClick={() => {
                        if (hasEvent) {
                          setSelectedDateFilter(isSelected ? null : dayNum);
                        }
                      }}
                      sx={{
                        width: 34,
                        height: 34,
                        mx: 'auto',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.84rem',
                        fontWeight: isSelected || isToday || hasEvent ? 900 : 500,
                        backgroundColor: isSelected
                          ? '#4F2BCB'
                          : isToday
                          ? '#F3F0FF'
                          : hasEvent
                          ? '#EDE9FE'
                          : 'transparent',
                        color: isSelected
                          ? '#FFFFFF'
                          : isToday
                          ? '#4F2BCB'
                          : hasEvent
                          ? '#4F2BCB'
                          : '#20202A',
                        border: isSelected
                          ? 'none'
                          : isToday
                          ? '1.5px solid #4F2BCB'
                          : hasEvent
                          ? '1px solid #D4CCF7'
                          : 'none',
                        cursor: hasEvent ? 'pointer' : 'default',
                        transition: 'all 0.18s ease',
                        '&:hover': hasEvent
                          ? {
                              backgroundColor: '#4F2BCB',
                              color: '#FFFFFF',
                              transform: 'scale(1.08)',
                            }
                          : {},
                      }}
                    >
                      {dayNum}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Quick Action Filters */}
            <Stack spacing={1.2}>
              <Button
                variant={filterType === 'UPCOMING' && !selectedDateFilter ? 'primary' : 'ghost'}
                fullWidth
                onClick={() => {
                  setFilterType('UPCOMING');
                  setSelectedDateFilter(null);
                }}
                sx={{ py: 1.1, borderRadius: '12px', fontWeight: 800 }}
              >
                Upcoming Events ({upcomingCount})
              </Button>
              <Button
                variant={filterType === 'ALL' && !selectedDateFilter ? 'subtle' : 'ghost'}
                fullWidth
                onClick={() => {
                  setFilterType('ALL');
                  setSelectedDateFilter(null);
                }}
                sx={{ py: 1.1, borderRadius: '12px', fontWeight: 800 }}
              >
                View All Events ({events.length})
              </Button>
              {selectedDateFilter && (
                <Button
                  variant="danger"
                  fullWidth
                  onClick={() => setSelectedDateFilter(null)}
                  sx={{ py: 0.8, borderRadius: '12px', fontSize: '0.78rem' }}
                >
                  Clear Date Filter ({selectedDateFilter} {MONTH_NAMES[month]})
                </Button>
              )}
            </Stack>

            {/* Quick Stats Summary */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: '16px',
                backgroundColor: '#F8F7FD',
                border: '1px solid #E9E7F2',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <InsightsIcon />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: '#20202A',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.86rem',
                  }}
                >
                  Monthly Schedule
                </Typography>
                <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                  This month: <strong>{thisMonthCount}</strong> events planned
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Column: Events List */}
        <Grid item xs={12} md={7} lg={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                color: '#20202A',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '1.15rem',
              }}
            >
              Scheduled Events ({filteredEvents.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label="All"
                size="small"
                clickable
                onClick={() => {
                  setFilterType('ALL');
                  setSelectedDateFilter(null);
                }}
                sx={{
                  backgroundColor: filterType === 'ALL' && !selectedDateFilter ? '#4F2BCB' : '#F1F5F9',
                  color: filterType === 'ALL' && !selectedDateFilter ? '#FFFFFF' : '#475569',
                  fontWeight: 800,
                  borderRadius: '20px',
                  px: 1,
                }}
              />
              <Chip
                label="Upcoming"
                size="small"
                clickable
                onClick={() => {
                  setFilterType('UPCOMING');
                  setSelectedDateFilter(null);
                }}
                sx={{
                  backgroundColor: filterType === 'UPCOMING' && !selectedDateFilter ? '#4F2BCB' : '#F1F5F9',
                  color: filterType === 'UPCOMING' && !selectedDateFilter ? '#FFFFFF' : '#475569',
                  fontWeight: 800,
                  borderRadius: '20px',
                  px: 1,
                }}
              />
            </Stack>
          </Box>

          {filteredEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarMonthIcon />}
              title="No events found"
              message="Schedule your club's next seminar, workshop, or competition."
              action={
                <Button
                  variant="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/clubs/${myClubId}/events/create`)}
                >
                  Create Event
                </Button>
              }
            />
          ) : (
            <Stack spacing={2.2}>
              {filteredEvents.map((ev, index) => {
                const evDate = ev.start_time ? new Date(ev.start_time) : new Date();
                const day = evDate.getDate();
                const monthName = evDate.toLocaleDateString(undefined, { month: 'short' });
                const fallbackImg = DEFAULT_EVENT_IMAGES[index % DEFAULT_EVENT_IMAGES.length];
                const posterUrl = ev.image_url ? getImageUrl(ev.image_url) : fallbackImg;

                return (
                  <Paper
                    key={ev.id}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: '20px',
                      border: '1px solid #E9E7F2',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: 2.5,
                      boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                      transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
                      '&:hover': {
                        borderColor: '#4F2BCB',
                        boxShadow: '0 8px 24px rgba(79, 43, 203, 0.09)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {/* Poster Thumbnail */}
                    <Box
                      sx={{
                        width: { xs: '100%', sm: 140 },
                        height: { xs: 150, sm: 100 },
                        borderRadius: '16px',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                        backgroundColor: '#F3F0FF',
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

                    {/* Title & Metadata */}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 800,
                          color: '#20202A',
                          fontSize: '1.05rem',
                          mb: 0.8,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {ev.title || ev.name}
                      </Typography>

                      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={0.8}>
                        <Box
                          sx={{
                            px: 1.2,
                            py: 0.4,
                            borderRadius: '8px',
                            backgroundColor: '#F3F0FF',
                            color: '#4F2BCB',
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            border: '1px solid #D4CCF7',
                          }}
                        >
                          {day} {monthName}
                        </Box>

                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: '#8E90A2' }} />
                          <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                            {evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>

                        <Typography variant="caption" sx={{ color: '#CCD0DC' }}>•</Typography>

                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LocationOnIcon sx={{ fontSize: 16, color: '#8E90A2' }} />
                          <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                            {ev.location || 'University Campus'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Action Controls */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'row', sm: 'column' },
                        alignItems: { xs: 'center', sm: 'flex-end' },
                        justifyContent: 'space-between',
                        gap: 1.2,
                        width: { xs: '100%', sm: 'auto' },
                        flexShrink: 0,
                      }}
                    >
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="primary"
                          size="small"
                          startIcon={<AssignmentIcon sx={{ fontSize: 15 }} />}
                          onClick={() => navigate(`/clubs/${myClubId}/events/${ev.id}/manage`)}
                          sx={{ py: 0.6, px: 1.5, fontSize: '0.78rem', borderRadius: '8px' }}
                        >
                          Tasks
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          startIcon={<HowToRegOutlinedIcon sx={{ fontSize: 15 }} />}
                          onClick={() => navigate(`/secretary/events/${ev.id}/registrations`)}
                          sx={{ py: 0.6, px: 1.5, fontSize: '0.78rem', borderRadius: '8px' }}
                        >
                          Registrations
                        </Button>
                      </Stack>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit Event">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/clubs/${myClubId}/events/${ev.id}/edit`)}
                            sx={{ color: '#4F2BCB', backgroundColor: '#F3F0FF', borderRadius: '8px' }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Event">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(ev.id)}
                            sx={{ color: '#EF4444', backgroundColor: '#FEE2E2', borderRadius: '8px' }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecretaryEvents;
