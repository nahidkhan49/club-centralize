import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../context/AuthContext';
import { createEvent } from '../api/eventApi';
import api from '../api/axiosInstance';
import ImageUpload from '../components/ImageUpload';
import Button from '../components/Button';

const EventCreate = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { systemRole, presidentOfClubs, secretaryOfClubs } = useAuth();

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
    <Box sx={{ maxWidth: 880, mx: 'auto', py: 2, pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Box
          onClick={() => navigate(backPath)}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            mb: 2,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Events
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: '#20202A',
            fontSize: { xs: '1.5rem', sm: '1.85rem' },
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.02em',
            mb: 0.5,
          }}
        >
          Create New Event / Workshop
        </Typography>
        <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
          Schedule a seminar, workshop, meetup, or competition for your club community.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4.5 },
          borderRadius: '24px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 20px rgba(79, 43, 203, 0.04)',
        }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* Club Selection Dropdown */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Host Club Organization *
              </Typography>
              <TextField
                select
                fullWidth
                value={selectedClubId}
                onChange={(e) => setSelectedClubId(e.target.value)}
                disabled={loadingClubs}
              >
                {clubs.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name} {c.category ? `(${c.category})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <ImageUpload
              label="Event Photo / Promotional Banner"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              aspect="banner"
              helperText="Upload event promotional poster or cover photo (PNG, JPG, WEBP under 5MB)"
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Event Title *
              </Typography>
              <TextField
                fullWidth
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Annual Machine Learning & AI Bootcamp 2026"
                required
              />
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
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
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                  Location / Venue *
                </Typography>
                <TextField
                  fullWidth
                  name="location"
                  placeholder="e.g. Auditorium Hall B / Zoom Link"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Event Details & Schedule
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                placeholder="Detail what attendees will learn, prerequisites, guest speakers, etc..."
                value={form.description}
                onChange={handleChange}
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={1.5} pt={2} borderTop="1px solid #F1EFF8">
              <Button
                variant="ghost"
                onClick={() => navigate(backPath)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
                sx={{ px: 3.5 }}
              >
                Publish Event
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default EventCreate;
