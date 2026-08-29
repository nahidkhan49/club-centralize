import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  TextField,
  MenuItem,
  Button as MuiButton,
  Stack,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { useAuth } from '../context/AuthContext';
import { createEvent } from '../api/eventApi';
import api from '../api/axiosInstance';
import ImageUpload from '../components/ImageUpload';
import Button from '../components/Button';

const EventCreate = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, systemRole, presidentOfClubs, secretaryOfClubs } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(clubId ? String(clubId) : '');
  const [loadingClubs, setLoadingClubs] = useState(true);

  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    image_url: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoadingClubs(true);
        const res = await api.get('/clubs');
        const list = Array.isArray(res.data) ? res.data : [];
        setClubs(list);

        if (!selectedClubId || selectedClubId === 'undefined' || selectedClubId === 'null') {
          const defaultId =
            presidentOfClubs?.[0]?.club_id ||
            secretaryOfClubs?.[0]?.club_id ||
            list[0]?.id;
          if (defaultId) {
            setSelectedClubId(String(defaultId));
          }
        }
      } catch (err) {
        console.error('Failed to load clubs list', err);
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();
  }, [clubId, presidentOfClubs, secretaryOfClubs]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      setError('Title, date, and location are required.');
      return;
    }

    const targetClubId = Number(selectedClubId);
    if (!targetClubId || isNaN(targetClubId)) {
      setError('Please select a valid club for this event.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const isoDate = new Date(form.date).toISOString();
      const endIsoDate = new Date(new Date(form.date).getTime() + 2 * 60 * 60 * 1000).toISOString();

      await createEvent({
        title: form.title.trim(),
        date: isoDate,
        start_time: isoDate,
        end_time: endIsoDate,
        location: form.location.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || undefined,
        club_id: targetClubId,
      });

      if (systemRole === 'president') {
        navigate('/president/events');
      } else if (systemRole === 'secretary') {
        navigate('/secretary/events');
      } else if (systemRole === 'admin') {
        navigate('/admin/events');
      } else {
        navigate(`/clubs/${targetClubId}`);
      }
    } catch (err) {
      console.error('Failed to create event', err);
      setError(err?.response?.data?.detail || 'Failed to create event. Please ensure you have permission to manage this club.');
    } finally {
      setLoading(false);
    }
  };

  const backPath =
    systemRole === 'president'
      ? '/president/events'
      : systemRole === 'secretary'
      ? '/secretary/events'
      : systemRole === 'admin'
      ? '/admin/events'
      : selectedClubId
      ? `/clubs/${selectedClubId}`
      : '/events';

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
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
            mb: 2,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Events
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.8rem', mb: 0.5 }}>
          Create Club Event
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>
          Schedule a workshop, seminar, meetup, or hackathon for your club community.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Club Selection Dropdown */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A', mb: 0.8 }}>
                Club Organizing This Event *
              </Typography>
              <TextField
                select
                fullWidth
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                disabled={loadingClubs}
                helperText="Select which club will host and manage this event."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                    '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                  },
                }}
              >
                {clubs.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name} {c.category ? `(${c.category})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <ImageUpload
                label="Event Photo / Promotional Banner"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                aspect="banner"
                helperText="Upload event promotional banner or photo (PNG, JPG, WEBP under 5MB)"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A', mb: 0.8 }}>
                Event Title *
              </Typography>
              <TextField
                fullWidth
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Annual Public Speaking Workshop 2026"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                    '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A', mb: 0.8 }}>
                Date & Start Time *
              </Typography>
              <TextField
                fullWidth
                name="date"
                type="datetime-local"
                value={form.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                    '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A', mb: 0.8 }}>
                Location / Venue *
              </Typography>
              <TextField
                fullWidth
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Auditorium 101 / Campus Center"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                    '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A', mb: 0.8 }}>
                Event Description & Goals
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Details about speaker, agenda, prerequisites, workshop goals..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                    '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 1, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <MuiButton
                onClick={() => navigate(backPath)}
                disabled={loading}
                sx={{ color: '#777788', textTransform: 'none', fontWeight: 600 }}
              >
                Cancel
              </MuiButton>
              <MuiButton
                type="submit"
                disabled={loading}
                sx={{
                  backgroundColor: '#4F2BCB',
                  color: '#FFFFFF',
                  px: 4,
                  py: 1.1,
                  borderRadius: '10px',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#39209A' },
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Publish Event'}
              </MuiButton>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default EventCreate;
