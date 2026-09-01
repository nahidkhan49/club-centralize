import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  InputAdornment,
  TextField,
  Chip,
  Avatar,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api, { getClubLogoUrl } from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const CATEGORIES = [
  'All',
  'Technology & Coding',
  'Sports & Fitness',
  'Arts & Culture',
  'Science & Research',
  'Business & Entrepreneurship',
  'Social & Community',
  'Debate & Public Speaking',
  'Music & Drama',
];

const Clubs = () => {
  const navigate = useNavigate();
  const { systemRole } = useAuth();
  const isAdmin = systemRole === 'admin';

  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clubs');
      setClubs(Array.isArray(response?.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch clubs', err);
      setError(err?.response?.data?.detail || 'Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const filteredClubs = (Array.isArray(clubs) ? clubs : []).filter((club) => {
    const matchesSearch =
      (club?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (club?.description && club.description.toLowerCase().includes(search.toLowerCase())) ||
      (club?.department && club.department.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' || club?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ maxWidth: 1320, mx: 'auto', width: '100%', pb: 5 }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#20202A',
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '-0.02em',
            }}
          >
            University Clubs & Societies
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Explore, join, and collaborate with student-led organizations.
          </Typography>
        </Box>

        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => navigate('/clubs/create')}
            startIcon={<AddIcon />}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: '12px',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            + Create New Club
          </Button>
        )}
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '18px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search clubs by name, keywords, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#8E90A2', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        {/* Categories scroll row */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            py: 0.5,
            '&::-webkit-scrollbar': { height: 4 },
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <Chip
                key={cat}
                label={cat}
                clickable
                onClick={() => setSelectedCategory(cat)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  backgroundColor: isSelected ? '#4F2BCB' : '#F8F7FD',
                  color: isSelected ? '#FFFFFF' : '#5E5D6E',
                  border: '1px solid',
                  borderColor: isSelected ? '#4F2BCB' : '#E9E7F2',
                  borderRadius: '20px',
                  py: 1.8,
                  px: 0.5,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    backgroundColor: isSelected ? '#39209A' : '#F3F0FF',
                    color: isSelected ? '#FFFFFF' : '#4F2BCB',
                    borderColor: isSelected ? '#39209A' : '#D4CCF7',
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress sx={{ color: '#4F2BCB' }} />
        </Box>
      ) : error ? (
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>
          <Button variant="primary" onClick={fetchClubs}>Retry</Button>
        </Box>
      ) : filteredClubs.length === 0 ? (
        <EmptyState
          icon={<GroupsIcon />}
          title="No clubs found"
          message={
            search || selectedCategory !== 'All'
              ? 'Try changing your search keywords or category filters.'
              : 'No student clubs have been established yet.'
          }
          action={
            isAdmin && (
              <Button variant="primary" onClick={() => navigate('/clubs/create')}>
                Create First Club
              </Button>
            )
          }
        />
      ) : (
        <Grid container spacing={3}>
          {filteredClubs.map((club) => (
            <Grid item xs={12} sm={6} md={4} key={club.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '20px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                  transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 28px rgba(79, 43, 203, 0.09)',
                    borderColor: '#D4CCF7',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar
                    src={getClubLogoUrl(club)}
                    variant="rounded"
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: '16px',
                      backgroundColor: '#F3F0FF',
                      color: '#4F2BCB',
                      fontWeight: 900,
                      fontSize: '1.25rem',
                      border: '1.5px solid #E0DBFF',
                      boxShadow: '0 4px 12px rgba(79, 43, 203, 0.08)',
                    }}
                  >
                    {club.name?.charAt(0).toUpperCase()}
                  </Avatar>

                  {club.category && (
                    <Chip
                      label={club.category}
                      size="small"
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: '#F3F0FF',
                        color: '#4F2BCB',
                        borderRadius: '8px',
                        border: '1px solid #D4CCF7',
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#20202A',
                    mb: 0.8,
                    fontSize: '1.1rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {club.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#5E5D6E',
                    mb: 2.5,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.6,
                    fontSize: '0.85rem',
                  }}
                >
                  {club.description || 'This club is managed by the student campus community.'}
                </Typography>

                <Box
                  pt={1.8}
                  borderTop="1px solid #F1EFF8"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#8E90A2',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontSize: '0.7rem',
                    }}
                  >
                    {club.department ? `${club.department} Dept` : 'General Club'}
                  </Typography>

                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => navigate(`/clubs/${club.id}`)}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    sx={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#4F2BCB',
                      py: 0.6,
                      px: 1.5,
                      borderRadius: '8px',
                    }}
                  >
                    View Club
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Clubs;
