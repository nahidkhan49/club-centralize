import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Stack,
  Avatar,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SearchIcon from '@mui/icons-material/Search';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

import api, { getClubLogoUrl } from '../api/axiosInstance';
import { fetchAnnouncements } from '../api/announcementsApi';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const ANNOUNCEMENT_TYPES = ['All', 'Urgent', 'General', 'Event Notice', 'Achievement', 'Election'];

const TAG_CONFIG = {
  Urgent: { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' },
  General: { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
  'Event Notice': { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' },
  Achievement: { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' },
  Election: { bg: '#F3F0FF', color: '#7C3AED', border: '#DDD6FE' },
};

const FALLBACK_POSTS = [
  {
    id: 1,
    title: 'Spring University Club Fair 2026 Announced!',
    content: 'Join us at the Central Campus Plaza for the annual Spring Club Fair. Discover 50+ student organizations, meet club leaders, and register for exciting activities.',
    announcement_type: 'General',
    club_name: 'Campus Life & Student Affairs',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Important: Computer Society Annual Hackathon Registration Open',
    content: 'The annual 24-hour university hackathon is now accepting project submissions and team registrations. Cash awards and internship tracks available!',
    announcement_type: 'Urgent',
    club_name: 'Computer Society',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'National Inter-University Debate Championship Victory!',
    content: 'Congratulations to our club debate delegation for securing 1st place at the National Championship tournament this weekend!',
    announcement_type: 'Achievement',
    club_name: 'Debating Club',
    created_at: new Date().toISOString(),
  },
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState('all');
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [annData, clubsRes] = await Promise.all([
        fetchAnnouncements(selectedClubId !== 'all' ? selectedClubId : null).catch(() => []),
        api.get('/clubs').catch(() => ({ data: [] })),
      ]);

      const clubsList = Array.isArray(clubsRes?.data) ? clubsRes.data : [];
      setClubs(clubsList);

      if (Array.isArray(annData) && annData.length > 0) {
        setAnnouncements(annData);
      } else {
        setAnnouncements(FALLBACK_POSTS);
      }
    } catch (err) {
      console.error('Failed to load announcements', err);
      setAnnouncements(FALLBACK_POSTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClubId]);

  const filtered = announcements.filter((item) => {
    const titleMatch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      (item.club_name && item.club_name.toLowerCase().includes(search.toLowerCase()));

    const type = item.announcement_type || 'General';
    const typeMatch = selectedType === 'All' || type === selectedType;

    return titleMatch && typeMatch;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3.5} flexWrap="wrap" gap={2}>
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
            Club Announcements & Bulletins
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Official notices, urgent updates, and event alerts across all university organizations.
          </Typography>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.2,
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
        }}
      >
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search announcements by keyword, topic, or club name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 260 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8E90A2' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            value={selectedClubId}
            onChange={(e) => setSelectedClubId(e.target.value)}
            sx={{
              minWidth: { xs: '100%', sm: 220 },
            }}
          >
            <MenuItem value="all">All Student Clubs</MenuItem>
            {clubs.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Category Pills */}
        <Stack direction="row" spacing={1} overflow="auto" pb={0.5}>
          {ANNOUNCEMENT_TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <Chip
                key={type}
                label={type}
                clickable
                onClick={() => setSelectedType(type)}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  backgroundColor: isSelected ? '#4F2BCB' : '#F8F7FD',
                  color: isSelected ? '#FFFFFF' : '#5E5D6E',
                  border: '1px solid',
                  borderColor: isSelected ? '#4F2BCB' : '#E9E7F2',
                  borderRadius: '10px',
                  py: 1.8,
                  px: 0.5,
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    backgroundColor: isSelected ? '#39209A' : '#F3F0FF',
                    color: isSelected ? '#FFFFFF' : '#4F2BCB',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Paper>

      {/* Announcements List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress sx={{ color: '#4F2BCB' }} />
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CampaignOutlinedIcon />}
          title="No announcements found"
          message="Try adjusting your search query or category filter."
        />
      ) : (
        <Stack spacing={2.5}>
          {filtered.map((item) => {
            const assignedTag = item.announcement_type || 'General';
            const tagConfig = TAG_CONFIG[assignedTag] || TAG_CONFIG.General;

            return (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '22px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    borderColor: '#4F2BCB',
                    boxShadow: '0 8px 24px rgba(79, 43, 203, 0.08)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Header Row */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5} mb={1}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        color: '#20202A',
                        fontSize: '1.15rem',
                        mb: 0.6,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={0.5}>
                      {item.club_name && (
                        <Box display="flex" alignItems="center" gap={0.6}>
                          <BusinessOutlinedIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                          <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 800 }}>
                            {item.club_name}
                          </Typography>
                        </Box>
                      )}

                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 15, color: '#8E90A2' }} />
                        <Typography variant="caption" sx={{ color: '#5E5D6E', fontWeight: 600 }}>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Chip
                    label={assignedTag}
                    size="small"
                    sx={{
                      backgroundColor: tagConfig.bg,
                      color: tagConfig.color,
                      border: `1px solid ${tagConfig.border}`,
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      borderRadius: '8px',
                      height: 26,
                      px: 0.5,
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Content */}
                <Typography
                  variant="body2"
                  sx={{ color: '#5E5D6E', lineHeight: 1.75, my: 1.8, fontSize: '0.9rem' }}
                >
                  {item.content}
                </Typography>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
