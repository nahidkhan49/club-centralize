import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Grid,
  MenuItem,
  CircularProgress,
  TextField,
  Button as MuiButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
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
      const response = await api.post('/clubs/', {
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
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 2 }}>
      {/* Top Header */}
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
          Create New Club (Admin)
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>
          Create a new student organization on the Club Centralize platform.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Side: Form Card */}
        <Grid item xs={12} md={7.5}>
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
              <Box sx={{ mb: 3 }}>
                <ImageUpload
                  label="Club Logo"
                  value={form.logo_url}
                  onChange={(url) => setForm({ ...form, logo_url: url })}
                  helperText="Upload a square logo (PNG, JPG, WEBP, SVG under 5MB)"
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                  Club Name *
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  placeholder="Enter club name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F3F6FC',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#E9E7F2' },
                      '&:hover fieldset': { borderColor: '#C7B8FF' },
                      '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                    },
                  }}
                />
              </Box>

              <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                    Department
                  </Typography>
                  <TextField
                    fullWidth
                    name="department"
                    placeholder="e.g. CSE"
                    value={form.department}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F3F6FC',
                        borderRadius: '10px',
                        '& fieldset': { borderColor: '#E9E7F2' },
                        '&:hover fieldset': { borderColor: '#C7B8FF' },
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
                        '&:hover fieldset': { borderColor: '#C7B8FF' },
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
              </Grid>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                  Contact Email
                </Typography>
                <TextField
                  fullWidth
                  name="contact_email"
                  type="email"
                  placeholder="Enter contact email"
                  value={form.contact_email}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F3F6FC',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#E9E7F2' },
                      '&:hover fieldset': { borderColor: '#C7B8FF' },
                      '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                  Description
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  placeholder="Tell us about this club..."
                  value={form.description}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F3F6FC',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#E9E7F2' },
                      '&:hover fieldset': { borderColor: '#C7B8FF' },
                      '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                    },
                  }}
                />
              </Box>

              <Box display="flex" gap={2} justifyContent="flex-end" pt={1}>
                <MuiButton
                  onClick={() => navigate('/admin/clubs')}
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
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Create Club'}
                </MuiButton>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Information Card */}
        <Grid item xs={12} md={4.5}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '20px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#F3F0FF',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <LightbulbOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4F2BCB' }}>
                Admin Controls
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#525266', lineHeight: 1.6, mb: 2 }}>
              As a Website Administrator, creating a club establishes a new organization on the platform.
            </Typography>
            <Typography variant="body2" sx={{ color: '#525266', lineHeight: 1.6 }}>
              After creating the club, you can assign a President and Secretary from the Admin Club Management page.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClubCreate;
