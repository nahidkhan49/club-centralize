import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, CircularProgress, Alert,
  TextField, InputAdornment, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { fetchAllClubs } from '../../api/adminApi';
import EmptyState from '../../components/EmptyState';

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, clubsData] = await Promise.all([
          api.get('/events/?limit=200'),
          fetchAllClubs(),
        ]);
        setEvents(eventsRes.data || []);
        setClubs(clubsData);
      } catch (e) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getClubName = (clubId) => clubs.find((c) => c.id === clubId)?.name || `Club #${clubId}`;

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    getClubName(e.club_id).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress sx={{ color: '#4F2BCB' }} /></Box>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>All Events</Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>{events.length} events across all clubs</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

      <TextField
        fullWidth
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#FFFFFF', '& fieldset': { borderColor: '#E9E7F2' } } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9DA0AE' }} /></InputAdornment> }}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<EventOutlinedIcon />} title="No events found" />
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((ev) => (
            <Grid item xs={12} sm={6} md={4} key={ev.id}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid #E9E7F2', cursor: 'pointer', '&:hover': { boxShadow: '0 4px 20px rgba(79,43,203,0.08)' } }} onClick={() => navigate(`/clubs/${ev.club_id}/events/${ev.id}`)}>
                <Chip label={getClubName(ev.club_id)} size="small" sx={{ mb: 1.5, backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700, fontSize: '0.72rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', fontSize: '0.95rem', mb: 1 }}>{ev.title}</Typography>
                {ev.start_time && (
                  <Box display="flex" alignItems="center" gap={0.8} mb={0.5}>
                    <CalendarMonthIcon sx={{ fontSize: 14, color: '#4F2BCB' }} />
                    <Typography variant="body2" sx={{ color: '#6E6D7A', fontSize: '0.8rem' }}>
                      {new Date(ev.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                )}
                {ev.location && (
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <LocationOnIcon sx={{ fontSize: 14, color: '#777788' }} />
                    <Typography variant="body2" sx={{ color: '#777788', fontSize: '0.8rem' }}>{ev.location}</Typography>
                  </Box>
                )}
                <Chip label={ev.is_active ? 'Active' : 'Inactive'} size="small" sx={{ mt: 1.5, fontSize: '0.68rem', backgroundColor: ev.is_active ? '#D1FAE5' : '#FEE2E2', color: ev.is_active ? '#059669' : '#DC2626' }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminEvents;
