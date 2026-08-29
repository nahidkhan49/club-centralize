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
  Alert,
  Stack,
  Avatar,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

import api, { getClubLogoUrl } from '../api/axiosInstance';
import { fetchAnnouncements } from '../api/announcementsApi';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const ANNOUNCEMENT_TYPES = ['All', 'Urgent', 'General', 'Event Notice', 'Achievement', 'Election'];

const TAG_CONFIG = {
  Urgent: { bg: '#FEE2E2', color: '#DC2626' },
  General: { bg: '#D1FAE5', color: '#059669' },
  'Event Notice': { bg: '#FEF3C7', color: '#D97706' },
  Achievement: { bg: '#E0F2FE', color: '#0284C7' },
  Election: { bg: '#F3F0FF', color: '#7C3AED' },
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
  const [error, setError] = useState(null);

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
    <Box sx={{ maxWidth: 1150, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#20202A', letterSpacing: '-0.02em' }}>
            Club Announcements & Bulletins
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', mt: 0.5 }}>
            Official notices, urgent updates, and event alerts across all student clubs.
          </Typography>
        </Box>
      </Box>

      {/* Filter and Search Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '16px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search announcements by keyword, topic, or club..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1,
              minWidth: 220,
              '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: '#E9E7F2' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9DA0AE' }} />
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
              minWidth: 200,
              '& .MuiOutlinedInput-root': { borderRadius: '12px', borderColor: '#E9E7F2' },
            }}
          >
            <MenuItem value="all">All Clubs</MenuItem>
            {clubs.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Category Pills */}
        <Stack direction="row" spacing={1} overflow="auto" pb={0.5}>
          {ANNOUNCEMENT_TYPES.map((type) => (
            <Chip
              key={type}
              label={type}
              clickable
              onClick={() => setSelectedType(type)}
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                backgroundColor: selectedType === type ? '#4F2BCB' : '#FBFBFE',
                color: selectedType === type ? '#FFFFFF' : '#6E6D7A',
                border: '1px solid',
                borderColor: selectedType === type ? '#4F2BCB' : '#E9E7F2',
                borderRadius: '10px',
              }}
            />
          ))}
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
                  borderRadius: '20px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#4F2BCB',
                    boxShadow: '0 6px 22px rgba(79, 43, 203, 0.06)',
                  },
                }}
              >
                {/* Header Row */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1.5} mb={1}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.1rem', mb: 0.5 }}>
                      {item.title}
                    </Typography>

                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                      {item.club_name && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <BusinessOutlinedIcon sx={{ fontSize: 16, color: '#4F2BCB' }} />
                          <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 700 }}>
                            {item.club_name}
                          </Typography>
                        </Box>
                      )}

                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 15, color: '#9DA0AE' }} />
                        <Typography variant="caption" sx={{ color: '#777788', fontWeight: 500 }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
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
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      borderRadius: '8px',
                      height: 24,
                    }}
                  />
                </Box>

                {/* Content */}
                <Typography variant="body2" sx={{ color: '#444455', lineHeight: 1.75, my: 1.5 }}>
                  {item.content}
                </Typography>

                {/* Action Buttons */}
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => alert(`Viewing full notice for "${item.title}"`)}
                    sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.78rem' }}
                  >
                    View Full Notice →
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
