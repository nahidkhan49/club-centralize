import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Paper,
  Grid,
  MenuItem,
  CircularProgress,
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

const ClubEdit = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Technology & Coding',
    contact_email: '',
    logo_url: '',
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        setInitialLoading(true);
        const res = await api.get(`/clubs/${clubId}`);
        const data = res.data;
        setForm({
          name: data.name || '',
          description: data.description || '',
          category: data.category || 'Technology & Coding',
          contact_email: data.contact_email || '',
          logo_url: data.logo_url || '',
        });
        setError(null);
      } catch (err) {
        console.error('Failed to load club', err);
        setError(err?.response?.data?.detail || 'Failed to load club details.');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchClub();
  }, [clubId]);

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
      setSaving(true);
      setError(null);
      await api.patch(`/clubs/${clubId}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        contact_email: form.contact_email.trim(),
        logo_url: form.logo_url.trim(),
      });
      navigate('/admin/clubs');
    } catch (err) {
      console.error('Failed to update club', err);
      setError(err?.response?.data?.detail || 'Failed to update club.');
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
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
          Edit Club Settings
        </Typography>
        <Typography variant="body2" sx={{ color: '#5E5D6E', fontWeight: 500 }}>
          Update core club settings, branding logo, contact information, and category.
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
              label="Club Logo"
              value={form.logo_url}
              onChange={(url) => setForm({ ...form, logo_url: url })}
              helperText="Upload or replace the square club logo (PNG, JPG, WEBP under 5MB)"
            />

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                Club Name *
              </Typography>
              <TextField
                fullWidth
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Box>

            <Grid container spacing={2.5}>
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

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
                  Contact Email
                </Typography>
                <TextField
                  fullWidth
                  name="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={handleChange}
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
                onClick={() => navigate('/admin/clubs')}
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

export default ClubEdit;
