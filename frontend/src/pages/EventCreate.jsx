import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Paper,
  Grid,
  CircularProgress,
  TextField,
  Button as MuiButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createEvent } from '../api/eventApi';
import ImageUpload from '../components/ImageUpload';

const EventCreate = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    image_url: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
        club_id: Number(clubId),
      });
      navigate(-1);
    } catch (err) {
      console.error('Failed to create event', err);
      setError(err?.response?.data?.detail || 'Failed to create event. Make sure you are a club leader.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          component={RouterLink}
          to={`/clubs/${clubId}`}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            color: '#4F2BCB',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
            mb: 2,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Club
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
            <Grid item xs={12}>
              <ImageUpload
                label="Event Photo / Banner"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                aspect="banner"
                helperText="Upload event promotional banner or photo (PNG, JPG, WEBP under 5MB)"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Event Title *
              </Typography>
              <TextField
                fullWidth
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Web Development Bootcamp 2026"
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
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
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
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Location / Venue *
              </Typography>
              <TextField
                fullWidth
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Auditorium / Room 402"
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
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Details about speaker, agenda, prerequisites..."
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
                onClick={() => navigate(`/clubs/${clubId}`)}
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
