import React, { useContext, useState } from 'react';
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
  Button as MuiButton,
  Chip,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';

export default function Profile() {
  const { user, updateUserAvatar } = useContext(AuthContext);

  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || user?.username || 'Nahid Khan',
    username: user?.username || 'nahid',
    email: user?.email || 'nahid@example.com',
    role: user?.role || 'President',
    department: user?.department || 'Computer Science & Engineering',
    contact: '+880 1712-345678',
    bio: 'Passionate computer science student and president of the University Computer Society.',
  });

  const [editOpen, setEditOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState(user?.avatarUrl || '');
  const [tempData, setTempData] = useState({ ...profileData });

  const initial = (profileData.username || 'N').charAt(0).toUpperCase();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrlInput(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    updateUserAvatar(photoUrlInput);
    setPhotoDialogOpen(false);
  };

  const handleRemovePhoto = () => {
    setPhotoUrlInput('');
    updateUserAvatar(null);
    setPhotoDialogOpen(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileData({ ...tempData });
    setEditOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', py: 2 }}>
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
            My Profile
          </Typography>
          <Typography variant="body2" sx={{ color: '#777788', mt: 0.5 }}>
            View and manage your profile information & avatar photo.
          </Typography>
        </Box>

        <Button
          variant="ghost"
          onClick={() => {
            setTempData({ ...profileData });
            setEditOpen(true);
          }}
          startIcon={<EditIcon />}
          sx={{
            borderColor: '#E9E7F2',
            color: '#4F2BCB',
            borderRadius: '10px',
            fontWeight: 700,
            px: 2.5,
            py: 1,
            '&:hover': { backgroundColor: '#F3F0FF', borderColor: '#4F2BCB' },
          }}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Main Profile Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          mb: 4,
        }}
      >
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" gap={3}>
          {/* Avatar with Camera Icon Overlay */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user?.avatarUrl || ''}
              sx={{
                width: 96,
                height: 96,
                backgroundColor: '#E0DBFF',
                color: '#4F2BCB',
                fontWeight: 800,
                fontSize: '2.4rem',
                border: '3px solid #F3F0FF',
                boxShadow: '0 4px 12px rgba(79, 43, 203, 0.15)',
              }}
            >
              {user?.avatarUrl ? null : initial}
            </Avatar>
            <IconButton
              onClick={() => {
                setPhotoUrlInput(user?.avatarUrl || '');
                setPhotoDialogOpen(true);
              }}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#4F2BCB',
                color: '#FFFFFF',
                width: 32,
                height: 32,
                '&:hover': { backgroundColor: '#39209A' },
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
              size="small"
            >
              <PhotoCameraIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#20202A', mb: 0.5 }}>
              {profileData.fullName}
            </Typography>

            <Box display="flex" flexWrap="wrap" justifyContent={{ xs: 'center', sm: 'flex-start' }} gap={1} alignItems="center">
              <Chip
                label={profileData.role}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  borderRadius: '12px',
                }}
              />
              <Typography variant="body2" sx={{ color: '#777788' }}>
                • {profileData.department}
              </Typography>
            </Box>

            <MuiButton
              onClick={() => {
                setPhotoUrlInput(user?.avatarUrl || '');
                setPhotoDialogOpen(true);
              }}
              size="small"
              startIcon={<PhotoCameraIcon />}
              sx={{ mt: 1.5, textTransform: 'none', color: '#4F2BCB', fontWeight: 600, fontSize: '0.82rem' }}
            >
              {user?.avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}
            </MuiButton>
          </Box>
        </Box>
      </Paper>

      {/* Profile Details Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#20202A', mb: 3, fontSize: '1.15rem' }}>
          Profile Information
        </Typography>

        <Grid container spacing={3.5}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <PersonOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Full Name
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#20202A', pl: 4 }}>
              {profileData.fullName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <BadgeOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Username
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#20202A', pl: 4 }}>
              @{profileData.username}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <EmailOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Email Address
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#20202A', pl: 4 }}>
              {profileData.email}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <SchoolOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Department
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#20202A', pl: 4 }}>
              {profileData.department}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <PhoneOutlinedIcon sx={{ color: '#4F2BCB', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase' }}>
                Contact
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#20202A', pl: 4 }}>
              {profileData.contact}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1, borderColor: '#E9E7F2' }} />
            <Typography variant="caption" sx={{ color: '#777788', fontWeight: 600, textTransform: 'uppercase', display: 'block', mb: 1 }}>
              Bio
            </Typography>
            <Typography variant="body1" sx={{ color: '#525266', lineHeight: 1.6 }}>
              {profileData.bio}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Upload / Change Photo Modal */}
      <Dialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 440, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#20202A' }}>
          Update Profile Photo
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" my={2}>
            <Avatar
              src={photoUrlInput}
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                backgroundColor: '#E0DBFF',
                color: '#4F2BCB',
                fontSize: '2.5rem',
                fontWeight: 800,
              }}
            >
              {photoUrlInput ? null : initial}
            </Avatar>

            <MuiButton
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
              sx={{
                borderRadius: '10px',
                borderColor: '#4F2BCB',
                color: '#4F2BCB',
                textTransform: 'none',
                fontWeight: 600,
                mb: 2,
              }}
            >
              Choose Image File
              <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
            </MuiButton>

            <Typography variant="caption" sx={{ color: '#777788', mb: 2 }}>
              Or enter an image URL directly:
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="https://example.com/my-photo.jpg"
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', backgroundColor: '#F3F6FC' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          {user?.avatarUrl ? (
            <MuiButton
              onClick={handleRemovePhoto}
              color="error"
              startIcon={<DeleteOutlinedIcon />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Remove Photo
            </MuiButton>
          ) : (
            <div />
          )}

          <Box display="flex" gap={1}>
            <MuiButton onClick={() => setPhotoDialogOpen(false)} sx={{ color: '#777788', textTransform: 'none' }}>
              Cancel
            </MuiButton>
            <MuiButton
              onClick={handleSavePhoto}
              sx={{
                backgroundColor: '#4F2BCB',
                color: '#FFFFFF',
                px: 3,
                py: 0.8,
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#39209A' },
              }}
            >
              Save Photo
            </MuiButton>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Information Modal */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1, maxWidth: 500, width: '100%' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#20202A' }}>
          Edit Profile Information
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveProfile}>
          <DialogContent display="flex" flexDirection="column" gap={2}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                value={tempData.fullName}
                onChange={(e) => setTempData({ ...tempData, fullName: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#F3F6FC', borderRadius: '10px' } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Department
              </Typography>
              <TextField
                fullWidth
                value={tempData.department}
                onChange={(e) => setTempData({ ...tempData, department: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#F3F6FC', borderRadius: '10px' } }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Contact Number
              </Typography>
              <TextField
                fullWidth
                value={tempData.contact}
                onChange={(e) => setTempData({ ...tempData, contact: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#F3F6FC', borderRadius: '10px' } }}
              />
            </Box>

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
                Bio
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={tempData.bio}
                onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#F3F6FC', borderRadius: '10px' } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <MuiButton onClick={() => setEditOpen(false)} sx={{ color: '#777788', textTransform: 'none' }}>
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
              Save Changes
            </MuiButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
