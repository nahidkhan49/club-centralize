import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Grid, Avatar, Chip, Divider } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

const SecretaryClub = () => {
  const { secretaryOfClubs } = useAuth();
  const myClubId = secretaryOfClubs?.[0]?.club_id;
  const myClubName = secretaryOfClubs?.[0]?.club_name || 'My Club';

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!myClubId) return;
    const fetchClub = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/clubs/${myClubId}`);
        setClub(res.data);
      } catch (err) {
        setError('Failed to fetch club information.');
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [myClubId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#4F2BCB' }} />
      </Box>
    );
  }

  if (!myClubId) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3 }}>
        <Alert severity="warning">You are not assigned as Secretary of any active club.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', py: 2 }}>
      <Box mb={3.5}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A' }}>
          Club Information (Secretary View)
        </Typography>
        <Typography variant="body2" sx={{ color: '#777788' }}>
          Club: <strong>{myClubName}</strong> — Core club details and branding information.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 3.5, borderRadius: 2.5 }}>
        Core club details (Name, Logo, Category, Department) are centralized and managed by the <strong>Website Administration</strong>. If updates are needed, please contact the Website Administrator.
      </Alert>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box display="flex" alignItems="center" gap={3} mb={3.5} flexWrap="wrap">
          <Avatar
            src={club?.logo_url || ''}
            variant="rounded"
            sx={{
              width: 84,
              height: 84,
              borderRadius: '16px',
              backgroundColor: '#F3F0FF',
              color: '#4F2BCB',
              fontWeight: 800,
              fontSize: '1.8rem',
              border: '2px solid #E2D9FF',
            }}
          >
            {club?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A', mb: 0.8 }}>
              {club?.name}
            </Typography>
            <Box display="flex" gap={1} alignItems="center">
              {club?.category && (
                <Chip
                  label={club.category}
                  size="small"
                  sx={{ backgroundColor: '#F3F0FF', color: '#4F2BCB', fontWeight: 700 }}
                />
              )}
              <Chip
                label={club?.is_active ? 'Active Club' : 'Inactive'}
                size="small"
                sx={{
                  backgroundColor: club?.is_active ? '#D1FAE5' : '#FEE2E2',
                  color: club?.is_active ? '#059669' : '#DC2626',
                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#F3F0FF', mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F9F8FE', border: '1px solid #E9E7F2' }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <EmailOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700 }}>
                  Contact Email
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                {club?.contact_email || 'Not configured'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F9F8FE', border: '1px solid #E9E7F2' }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <CategoryOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700 }}>
                  Department / Unit
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A' }}>
                {club?.department || 'CSE Department'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ p: 2.5, borderRadius: '12px', backgroundColor: '#F9F8FE', border: '1px solid #E9E7F2' }}>
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 700, display: 'block', mb: 1 }}>
                Club Description
              </Typography>
              <Typography variant="body2" sx={{ color: '#525266', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {club?.description || 'No description has been provided for this organization yet.'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SecretaryClub;
