import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button as MuiButton,
} from '@mui/material';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import api from '../api/axiosInstance';
import Button from '../components/Button';

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Spring Club Fair 2026 Announced!',
    description:
      'Join us at the Central Campus Plaza for the annual Spring Club Fair. Discover 50+ student organizations, meet club leaders, and register for exciting activities.',
    date: '2026-08-25',
    category: 'Notice',
    author: 'Student Affairs',
    clubName: 'Central Campus Community',
    sourceLocation: 'Central Campus Plaza & Student Affairs Office',
  },
  {
    id: 2,
    title: 'Computer Society Hackathon Registration Open',
    description:
      'The annual 24-hour university hackathon is now accepting project submissions and team registrations. Prizes up to $5,000 for top innovations!',
    date: '2026-08-22',
    category: 'Update',
    author: 'President (nahid)',
    clubName: 'Computer Society',
    sourceLocation: 'CSE Dept Lab 4 & Computer Society Headquarters',
  },
  {
    id: 3,
    title: 'New Club Registration & Grant Guidelines',
    description:
      'Review the updated university policies for starting new clubs and applying for annual activity grants for the upcoming academic semester.',
    date: '2026-08-18',
    category: 'General',
    author: 'Club Centralize Administration',
    clubName: 'University Administration',
    sourceLocation: 'Administration Building Room 204',
  },
  {
    id: 4,
    title: 'Campus Leadership Workshop Series',
    description:
      'All club presidents and secretaries are invited to attend our executive leadership and event planning workshop series starting next Monday.',
    date: '2026-08-15',
    category: 'Info',
    author: 'Student Development Center',
    clubName: 'Leadership & Debating Club',
    sourceLocation: 'Auditorium Hall 2',
  },
];

const CATEGORY_COLORS = {
  Notice: { bg: '#FEF3C7', color: '#B45309' },
  Update: { bg: '#E0F2FE', color: '#0369A1' },
  General: { bg: '#F3F0FF', color: '#4F2BCB' },
  Info: { bg: '#E6F4EA', color: '#15803D' },
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [clubs, setClubs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'General',
    clubName: 'Computer Society',
    sourceLocation: 'CSE Department',
  });

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await api.get('/clubs');
        if (res.data && res.data.length > 0) {
          setClubs(res.data);
          setNewPost((prev) => ({ ...prev, clubName: res.data[0].name }));
        }
      } catch (err) {
        console.error('Failed to load clubs', err);
      }
    };
    fetchClubs();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newPost.title.trim()) return;

    const created = {
      id: Date.now(),
      title: newPost.title.trim(),
      description: newPost.description.trim(),
      category: newPost.category,
      date: new Date().toISOString().split('T')[0],
      author: 'You (Club Leader)',
      clubName: newPost.clubName || 'Computer Society',
      sourceLocation: newPost.sourceLocation.trim() || 'Main Campus',
    };

    setAnnouncements([created, ...announcements]);
    setNewPost({
      title: '',
      description: '',
      category: 'General',
      clubName: clubs[0]?.name || 'Computer Society',
      sourceLocation: 'CSE Department',
    });
    setDialogOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', py: 2 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#20202A', fontSize: '1.8rem' }}>
            Announcements
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', mt: 0.5 }}>
            Stay informed with the latest updates from university clubs and departments.
          </Typography>
        </Box>

        <Button
          variant="primary"
          onClick={() => setDialogOpen(true)}
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
          + New Announcement
        </Button>
      </Box>

      {/* Announcements List */}
      <Grid container spacing={3}>
        {announcements.map((item) => {
          const badgeStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.General;
          return (
            <Grid item xs={12} key={item.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: '16px',
                  border: '1px solid #E9E7F2',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 3,
                  alignItems: 'flex-start',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(79, 43, 203, 0.06)',
                    borderColor: '#C7B8FF',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    backgroundColor: '#F3F0FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CampaignOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 28 }} />
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={1.5} mb={1}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', fontSize: '1.15rem' }}>
                      {item.title}
                    </Typography>

                    <Chip
                      label={item.category}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        borderRadius: '12px',
                        px: 0.5,
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: '#525266', lineHeight: 1.6, mb: 2 }}>
                    {item.description}
                  </Typography>

                  {/* Metadata Row: Posting Club, Source/Department, Date */}
                  <Box display="flex" flexWrap="wrap" alignItems="center" gap={2.5}>
                    {item.clubName && (
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <GroupsOutlinedIcon sx={{ fontSize: 18, color: '#4F2BCB' }} />
                        <Typography variant="caption" sx={{ color: '#4F2BCB', fontWeight: 700 }}>
                          Club: {item.clubName}
                        </Typography>
                      </Box>
                    )}

                    {item.sourceLocation && (
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#777788' }} />
                        <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                          Source: {item.sourceLocation}
                        </Typography>
                      </Box>
                    )}

                    <Box display="flex" alignItems="center" gap={0.8}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: '#777788' }} />
                      <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600 }}>
                        {item.date}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* New Announcement Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 520, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#20202A' }}>
          Create New Announcement
        </DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Announcement Title *
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. Annual Tech Symposium Announced"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                  },
                }}
              />
            </Box>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                  Posting Club *
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={newPost.clubName}
                  onChange={(e) => setNewPost({ ...newPost, clubName: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F3F6FC',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#E9E7F2' },
                    },
                  }}
                >
                  {clubs.length > 0 ? (
                    clubs.map((c) => (
                      <MenuItem key={c.id} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="Computer Society">Computer Society</MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                  Category
                </Typography>
                <TextField
                  fullWidth
                  select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#F3F6FC',
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#E9E7F2' },
                    },
                  }}
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Notice">Notice</MenuItem>
                  <MenuItem value="Update">Update</MenuItem>
                  <MenuItem value="Info">Info</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Source / Posting Location (e.g. CSE Dept, Auditorium)
              </Typography>
              <TextField
                fullWidth
                placeholder="e.g. CSE Department / Auditorium Hall 2"
                value={newPost.sourceLocation}
                onChange={(e) => setNewPost({ ...newPost, sourceLocation: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Announcement Content
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Details of the announcement..."
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#F3F6FC',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E9E7F2' },
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <MuiButton onClick={() => setDialogOpen(false)} sx={{ color: '#777788', textTransform: 'none', fontWeight: 600 }}>
              Cancel
            </MuiButton>
            <MuiButton
              type="submit"
              sx={{
                backgroundColor: '#4F2BCB',
                color: '#FFFFFF',
                px: 3,
                py: 1,
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#39209A' },
              }}
            >
              Post Announcement
            </MuiButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
