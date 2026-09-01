import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  TextField,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEvent, updateEvent } from '../api/eventApi';
import ImageUpload from '../components/ImageUpload';
import Button from '../components/Button';

const EventEdit = () => {
  const { clubId, eventId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getEvent(eventId);
        setForm({
          title: data.title || data.name || '',
          date: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : '',
          location: data.location || '',
          description: data.description || '',
          image_url: data.image_url || '',
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load event', err);
        setError(err?.response?.data?.detail || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [eventId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.location.trim()) {
      setError('Title, date, and location are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateEvent(eventId, {
        title: form.title.trim(),
        start_time: new Date(form.date).toISOString(),
        location: form.location.trim(),
        description: form.description.trim(),
        image_url: form.image_url.trim() || undefined,
      });
      navigate(`/clubs/${clubId}/events/${eventId}`);
    } catch (err) {
      console.error('Failed to update event', err);
      setError(err?.response?.data?.detail || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 880, mx: 'auto', py: 2, pb: 6 }}>
      <Box sx={{ mb: 3.5 }}>
        <Box
          onClick={() => navigate(`/clubs/${clubId}/events/${eventId}`)}
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
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Event Details
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
          Edit Event Details
        </Typography>
        <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
          Update schedule, promotional banner, venue location, or event information.
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
                required
              />
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                  Date & Time *
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
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={1.5} pt={2} borderTop="1px solid #F1EFF8">
              <Button
                variant="ghost"
                onClick={() => navigate(`/clubs/${clubId}/events/${eventId}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={saving}
                sx={{ px: 3.5 }}
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default EventEdit;
