import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Grid,
  MenuItem,
  TextField,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/axiosInstance';
import ImageUpload from '../components/ImageUpload';
import Button from '../components/Button';

const CATEGORIES = [
  'Technology & Coding',
  'Sports & Fitness',
  'Arts & Culture',
  'Science & Research',
  'Business & Entrepreneurship',
  'Social & Community',
  'Debate & Public Speaking',
  'Music & Drama',
  'Other',
];

const ClubCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    department: 'CSE',
    description: '',
    category: 'Technology & Coding',
    contact_email: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Club name is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.post('/clubs/', {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category || undefined,
        contact_email: form.contact_email.trim() || undefined,
        logo_url: form.logo_url.trim() || undefined,
        department: form.department || undefined,
      });

      navigate('/admin/clubs');
    } catch (err) {
      console.error('Failed to create club', err);
      setError(err?.response?.data?.detail || 'Failed to create club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 880, mx: 'auto', py: 2, pb: 6 }}>
      {/* Top Header */}
      <Box sx={{ mb: 3.5 }}>
        <Box
          onClick={() => navigate('/admin/clubs')}
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
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Club Directory
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
          Create New Student Club
        </Typography>
        <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
          Establish a new student organization on the Club Centralize portal.
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
              label="Organization Logo"
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              helperText="Upload a square logo for the club profile (PNG, JPG, WEBP under 5MB)"
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Club Name *
              </Typography>
              <TextField
                fullWidth
                name="name"
                placeholder="e.g. AI & Robotics Research Society"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Box>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                  Department
                </Typography>
                <TextField
                  fullWidth
                  name="department"
                  placeholder="e.g. CSE / EEE / BBA"
                  value={form.department}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                  Category
                </Typography>
                <TextField
                  fullWidth
                  select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Contact Email
              </Typography>
              <TextField
                fullWidth
                name="contact_email"
                type="email"
                placeholder="e.g. contact@ai-robotics.club"
                value={form.contact_email}
                onChange={handleChange}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Organization Description
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                placeholder="Tell students about this club's mission, activities, and goals..."
                value={form.description}
                onChange={handleChange}
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" gap={1.5} pt={2} borderTop="1px solid #F1EFF8">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/clubs')}
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
                Create Club
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ClubCreate;
