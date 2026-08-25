import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Alert,
  Paper,
  Grid,
  MenuItem,
  CircularProgress,
  TextField,
  Button as MuiButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/axiosInstance';
import ImageUpload from '../components/ImageUpload';

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
    <Box sx={{ maxWidth: 850, mx: 'auto', py: 2 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          component={RouterLink}
          to="/admin/clubs"
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
          <ArrowBackIcon sx={{ fontSize: 18 }} /> Back to Club Management
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.8rem', mb: 0.5 }}>
          Edit Club (Admin)
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>
          Update core club settings, branding logo, contact info, and category.
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
                label="Club Logo"
                value={form.logo_url}
                onChange={(url) => setForm({ ...form, logo_url: url })}
                helperText="Upload or change the square club logo (PNG, JPG, WEBP, SVG under 5MB)"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Club Name *
              </Typography>
              <TextField
                fullWidth
                name="name"
                value={form.name}
                onChange={handleChange}
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
                Category
              </Typography>
              <TextField
                fullWidth
                select
                name="category"
                value={form.category}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                    '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                  },
                }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Contact Email
              </Typography>
              <TextField
                fullWidth
                name="contact_email"
                type="email"
                value={form.contact_email}
                onChange={handleChange}
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
                onClick={() => navigate('/admin/clubs')}
                disabled={saving}
                sx={{ color: '#777788', textTransform: 'none', fontWeight: 600 }}
              >
                Cancel
              </MuiButton>
              <MuiButton
                type="submit"
                disabled={saving}
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
                {saving ? 'Saving...' : 'Save Changes'}
              </MuiButton>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ClubEdit;
