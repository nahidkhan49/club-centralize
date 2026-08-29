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
      (club?.description && club.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' || club?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 2 }}>
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
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.8rem' }}>
            All Clubs
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', mt: 0.5 }}>
            Discover and join active university student organizations.
          </Typography>
        </Box>

        {/* Club Creation only visible for Website Admin */}
        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => navigate('/clubs/create')}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#4F2BCB',
              color: '#FFFFFF',
              px: 2.5,
              py: 1,
              borderRadius: '10px',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(79, 43, 203, 0.2)',
              whiteSpace: 'nowrap',
              '&:hover': { backgroundColor: '#39209A' },
            }}
          >
            + Create Club
          </Button>
        )}
      </Box>

      {/* Search Bar & Category Chips */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#777788' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            backgroundColor: '#F3F6FC',
            borderRadius: '12px',
            mb: 2,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#E9E7F2',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#C7B8FF',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4F2BCB',
            },
          }}
        />

        {/* Categories scroll row */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
          }}
        >
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 600,
                fontSize: '0.82rem',
                backgroundColor: selectedCategory === cat ? '#4F2BCB' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : '#6E6D7A',
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#4F2BCB' : '#E9E7F2',
                borderRadius: '20px',
                '&:hover': {
                  backgroundColor: selectedCategory === cat ? '#39209A' : '#F3F0FF',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress sx={{ color: '#4F2BCB' }} />
        </Box>
      ) : error ? (
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
          <Button variant="primary" onClick={fetchClubs}>Retry</Button>
        </Box>
      ) : filteredClubs.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px dashed #E9E7F2',
          }}
        >
          <GroupsIcon sx={{ fontSize: 56, color: '#9DA0AE', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 1 }}>
            No clubs found
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', maxWidth: 400, mx: 'auto', mb: 3 }}>
            {search || selectedCategory !== 'All'
              ? 'Try changing your search keywords or category filters.'
              : 'No student clubs have been established yet.'}
          </Typography>
        </Paper>
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
                  borderRadius: '16px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(79, 43, 203, 0.08)',
                    borderColor: '#C7B8FF',
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar
                    src={getClubLogoUrl(club)}
                    variant="rounded"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      backgroundColor: '#F3F0FF',
                      color: '#4F2BCB',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      border: '1.5px solid #E2D9FF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                        fontWeight: 600,
                        backgroundColor: '#F3F0FF',
                        color: '#4F2BCB',
                        borderRadius: '12px',
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#20202A',
                    mb: 0.8,
                    fontSize: '1.1rem',
                  }}
                >
                  {club.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#777788',
                    mb: 2.5,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {club.description || 'This club is managed by the student community.'}
                </Typography>

                <Box pt={1.5} borderTop="1px solid #E9E7F2" display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                    {club.department ? `${club.department} Dept` : 'University Club'}
                  </Typography>

                  <Button
                    variant="ghost"
                    onClick={() => navigate(`/clubs/${club.id}`)}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#4F2BCB',
                      p: 0,
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
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
