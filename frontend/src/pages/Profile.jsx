import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../api/axiosInstance';
import Button from '../components/Button';

export default function Profile() {
  const { user, systemRole, updateUserAvatar, updateUserProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    role: systemRole === 'admin' ? 'Site Administrator' : (systemRole || 'Member').toUpperCase(),
    department: user?.department || '',
    contact: user?.contact || '',
    bio: user?.bio || '',
  });

  const [editOpen, setEditOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState(user?.avatarUrl || user?.avatar_url || '');
  const [tempData, setTempData] = useState({ ...profileData });
  const [photoUploading, setPhotoUploading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (user) {
      const data = {
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        role: systemRole === 'admin' ? 'Site Administrator' : (systemRole || 'Member').toUpperCase(),
        department: user.department || '',
        contact: user.contact || '',
        bio: user.bio || '',
      };
      setProfileData(data);
      setTempData(data);
    }
  }, [user, systemRole]);

  const initial = (profileData.username || 'U').charAt(0).toUpperCase();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setPhotoUploading(true);
        const { uploadImage } = await import('../api/adminApi');
        const res = await uploadImage(file);
        setPhotoUrlInput(res.url);
      } catch (err) {
        console.error('Failed to upload avatar', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoUrlInput(reader.result);
        };
        reader.readAsDataURL(file);
      } finally {
        setPhotoUploading(false);
      }
    }
  };

  const handleSavePhoto = async () => {
    try {
      const { default: api } = await import('../api/axiosInstance');
      await api.patch('/users/me', { avatar_url: photoUrlInput });
      updateUserAvatar(photoUrlInput);
      setPhotoDialogOpen(false);
      setSuccess('Profile avatar updated successfully!');
    } catch (err) {
      console.error('Failed to update avatar on backend', err);
      updateUserAvatar(photoUrlInput);
      setPhotoDialogOpen(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const { default: api } = await import('../api/axiosInstance');
      await api.patch('/users/me', { avatar_url: '' });
      setPhotoUrlInput('');
      updateUserAvatar(null);
      setPhotoDialogOpen(false);
      setSuccess('Avatar removed.');
    } catch (err) {
      setPhotoUrlInput('');
      updateUserAvatar(null);
      setPhotoDialogOpen(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { default: api } = await import('../api/axiosInstance');
      const payload = {
        username: tempData.username.trim(),
        email: tempData.email.trim(),
        full_name: tempData.fullName.trim() || null,
        department: tempData.department.trim() || null,
        contact: tempData.contact.trim() || null,
        bio: tempData.bio.trim() || null,
      };
      const res = await api.patch('/users/me', payload);
      updateUserProfile(res.data);
      setSuccess('Profile details saved successfully!');
      setEditOpen(false);
    } catch (err) {
      console.error('Failed to update profile', err);
      setError(err?.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', pb: 6, width: '100%' }}>
      {/* Top Header */}
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
            My Profile Account
          </Typography>
          <Typography variant="body2" sx={{ color: '#5E5D6E', mt: 0.5, fontWeight: 500 }}>
            Manage your personal profile, credentials, and avatar photo.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="primary"
            onClick={() => {
              setTempData({ ...profileData });
              setEditOpen(true);
            }}
            startIcon={<EditIcon />}
            sx={{ px: 2.5 }}
          >
            Edit Profile
          </Button>

          <Button
            variant="danger"
            onClick={handleLogout}
            startIcon={<LogoutOutlinedIcon />}
            sx={{ px: 2.5 }}
          >
            Logout
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Main Profile Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: '24px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
          boxShadow: '0 4px 20px rgba(79, 43, 203, 0.04)',
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          gap={3}
        >
          {/* Avatar with Camera Icon Overlay */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={getImageUrl(user?.avatarUrl || user?.avatar_url)}
              sx={{
                width: 100,
                height: 100,
                borderRadius: '24px',
                backgroundColor: '#EDE9FE',
                color: '#4F2BCB',
                fontWeight: 900,
                fontSize: '2.5rem',
                border: '3.5px solid #FFFFFF',
                boxShadow: '0 8px 24px rgba(79, 43, 203, 0.15)',
              }}
            >
              {initial}
            </Avatar>
            <IconButton
              onClick={() => {
                setPhotoUrlInput(user?.avatarUrl || user?.avatar_url || '');
                setPhotoDialogOpen(true);
              }}
              size="small"
              sx={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                backgroundColor: '#4F2BCB',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                '&:hover': { backgroundColor: '#39209A' },
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flex: 1 }}>
            <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }} mb={0.8}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: '#20202A',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {profileData.fullName || profileData.username}
              </Typography>
              <Chip
                label={profileData.role}
                size="small"
                sx={{
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  borderRadius: '8px',
                  border: '1px solid #D4CCF7',
                }}
              />
            </Box>

            <Typography variant="body2" sx={{ color: '#5E5D6E', mb: 1.5, fontWeight: 500 }}>
              @{profileData.username} • {profileData.email}
            </Typography>

            {profileData.bio && (
              <Typography
                variant="body2"
                sx={{ color: '#5E5D6E', maxWidth: 650, lineHeight: 1.6, fontSize: '0.88rem' }}
              >
                {profileData.bio}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Profile Details Matrix */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              height: '100%',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 900,
                color: '#20202A',
                mb: 2.5,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Personal Details
            </Typography>

            <Stack spacing={2.5}>
              <Box display="flex" alignItems="center" gap={1.8}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    backgroundColor: '#F3F0FF',
                    color: '#4F2BCB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Full Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {profileData.fullName || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1.8}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    backgroundColor: '#F3F0FF',
                    color: '#4F2BCB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BadgeOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Username
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    @{profileData.username}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1.8}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    backgroundColor: '#F3F0FF',
                    color: '#4F2BCB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmailOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {profileData.email}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: '22px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FFFFFF',
              height: '100%',
              boxShadow: '0 2px 8px rgba(79, 43, 203, 0.03)',
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 900,
                color: '#20202A',
                mb: 2.5,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Academic & Contact Info
            </Typography>

            <Stack spacing={2.5}>
              <Box display="flex" alignItems="center" gap={1.8}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    backgroundColor: '#EDE9FE',
                    color: '#4F2BCB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Department / Faculty
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {profileData.department || 'Computer Science & Engineering'}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1.8}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    backgroundColor: '#EDE9FE',
                    color: '#4F2BCB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhoneOutlinedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#8E90A2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    Phone Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                    {profileData.contact || '+1 (555) 019-2834'}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#20202A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Edit Profile Information
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveProfile}>
          <DialogContent dividers>
            <Stack spacing={2.2} pt={1}>
              <TextField
                label="Full Name"
                fullWidth
                value={tempData.fullName}
                onChange={(e) => setTempData({ ...tempData, fullName: e.target.value })}
              />
              <TextField
                label="Username *"
                fullWidth
                required
                value={tempData.username}
                onChange={(e) => setTempData({ ...tempData, username: e.target.value })}
              />
              <TextField
                label="Email Address *"
                type="email"
                fullWidth
                required
                value={tempData.email}
                onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
              />
              <TextField
                label="Department / Major"
                fullWidth
                value={tempData.department}
                onChange={(e) => setTempData({ ...tempData, department: e.target.value })}
              />
              <TextField
                label="Contact Number"
                fullWidth
                value={tempData.contact}
                onChange={(e) => setTempData({ ...tempData, contact: e.target.value })}
              />
              <TextField
                label="Bio / Introduction"
                multiline
                rows={3}
                fullWidth
                value={tempData.bio}
                onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Save Profile
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: '#20202A', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Update Profile Picture
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2.5} py={2}>
            <Avatar
              src={getImageUrl(photoUrlInput)}
              sx={{
                width: 90,
                height: 90,
                backgroundColor: '#EDE9FE',
                color: '#4F2BCB',
                fontWeight: 800,
                fontSize: '2rem',
                border: '3px solid #F3F0FF',
              }}
            >
              {initial}
            </Avatar>

            <Button
              variant="subtle"
              component="label"
              startIcon={<CloudUploadIcon />}
              loading={photoUploading}
              sx={{ borderRadius: '12px' }}
            >
              Upload Image File
              <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
            </Button>

            <TextField
              label="Or Image URL"
              size="small"
              fullWidth
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              placeholder="https://..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button
            variant="danger"
            size="small"
            onClick={handleRemovePhoto}
            startIcon={<DeleteOutlinedIcon />}
          >
            Remove
          </Button>
          <Stack direction="row" spacing={1}>
            <Button variant="ghost" onClick={() => setPhotoDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePhoto}>
              Save Photo
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
