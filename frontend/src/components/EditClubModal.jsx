import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Grid,
  Avatar,
  IconButton,
  Button as MuiButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Paper,
  Tooltip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';

import { updateClub, uploadImage } from '../api/adminApi';
import Button from './Button';

const EditClubModal = ({ open, onClose, club, onUpdated }) => {
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState({
    description: '',
    contact_email: '',
    meeting_location: '',
    meeting_time: '',
    cover_url: '',
    logo_url: '',
  });
  const [galleryList, setGalleryList] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (club) {
      setFormData({
        description: club.description || '',
        contact_email: club.contact_email || '',
        meeting_location: club.meeting_location || '',
        meeting_time: club.meeting_time || '',
        cover_url: club.cover_url || '',
        logo_url: club.logo_url || '',
      });

      // Parse gallery from JSON string or array
      try {
        if (club.gallery) {
          const parsed = typeof club.gallery === 'string' ? JSON.parse(club.gallery) : club.gallery;
          setGalleryList(Array.isArray(parsed) ? parsed : []);
        } else {
          setGalleryList([]);
        }
      } catch (e) {
        setGalleryList([]);
      }
    }
  }, [club, open]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Cover Image Upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError('');
    try {
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, cover_url: res.url }));
      setSuccess('Cover photo uploaded successfully!');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  // Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError('');
    try {
      const res = await uploadImage(file);
      setFormData((prev) => ({ ...prev, logo_url: res.url }));
      setSuccess('Logo uploaded successfully!');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Add Gallery Photo (via file upload)
  const handleGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingGallery(true);
    setError('');
    try {
      const res = await uploadImage(file);
      const newPhoto = { url: res.url, title: newPhotoTitle.trim() || 'Club Activity' };
      setGalleryList((prev) => [...prev, newPhoto]);
      setNewPhotoTitle('');
      setSuccess('Photo added to gallery!');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to upload gallery photo');
    } finally {
      setUploadingGallery(false);
    }
  };

  // Add Gallery Photo (via URL)
  const handleAddPhotoByUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const newPhoto = { url: newPhotoUrl.trim(), title: newPhotoTitle.trim() || 'Club Activity' };
    setGalleryList((prev) => [...prev, newPhoto]);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
  };

  // Remove Gallery Photo
  const handleRemovePhoto = (index) => {
    setGalleryList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...formData,
        gallery: JSON.stringify(galleryList),
      };
      const updated = await updateClub(club.id, payload);
      setSuccess('Club information saved successfully!');
      if (onUpdated) {
        onUpdated(updated);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update club details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          p: { xs: 1, sm: 2 },
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
            Edit Club Profile & Media
          </Typography>
          <Typography variant="caption" sx={{ color: '#777788' }}>
            {club?.name} — Update cover photo, gallery, meeting information, and description.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: '#E9E7F2', px: 3 }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: '0.9rem' },
            '& .Mui-selected': { color: '#4F2BCB' },
            '& .MuiTabs-indicator': { backgroundColor: '#4F2BCB' },
          }}
        >
          <Tab icon={<CloudUploadOutlinedIcon fontSize="small" />} iconPosition="start" label="Branding & Cover" />
          <Tab icon={<InfoOutlinedIcon fontSize="small" />} iconPosition="start" label="General Info & Location" />
          <Tab icon={<CollectionsOutlinedIcon fontSize="small" />} iconPosition="start" label={`Gallery (${galleryList.length})`} />
        </Tabs>
      </Box>

      <DialogContent sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{success}</Alert>}

        {/* Tab 0: Branding & Cover */}
        {tab === 0 && (
          <Box>
            {/* Cover Photo */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A', mb: 1 }}>
              Club Cover Photo / Banner
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 180,
                borderRadius: '16px',
                border: '2px dashed #D4CCF7',
                backgroundColor: '#F9F8FE',
                backgroundImage: formData.cover_url ? `url(${formData.cover_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.88)',
                  backdropFilter: 'blur(6px)',
                  p: 1.5,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  id="cover-upload-input"
                  style={{ display: 'none' }}
                  onChange={handleCoverUpload}
                />
                <label htmlFor="cover-upload-input">
                  <MuiButton
                    component="span"
                    variant="contained"
                    size="small"
                    startIcon={uploadingCover ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />}
                    disabled={uploadingCover}
                    sx={{ backgroundColor: '#4F2BCB', '&:hover': { backgroundColor: '#39209A' } }}
                  >
                    {uploadingCover ? 'Uploading...' : 'Upload New Cover'}
                  </MuiButton>
                </label>
                {formData.cover_url && (
                  <MuiButton
                    size="small"
                    color="error"
                    onClick={() => setFormData((p) => ({ ...p, cover_url: '' }))}
                  >
                    Remove
                  </MuiButton>
                )}
              </Box>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Or enter Cover Photo URL"
              placeholder="https://example.com/cover.jpg"
              value={formData.cover_url}
              onChange={handleChange('cover_url')}
              sx={{ mb: 3.5 }}
            />

            <Divider sx={{ my: 2.5 }} />

            {/* Club Logo */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A', mb: 1.5 }}>
              Club Logo
            </Typography>
            <Box display="flex" alignItems="center" gap={3} mb={2}>
              <Avatar
                src={formData.logo_url}
                variant="rounded"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '16px',
                  backgroundColor: '#F3F0FF',
                  color: '#4F2BCB',
                  fontWeight: 800,
                  fontSize: '2rem',
                  border: '2px solid #E2D9FF',
                }}
              >
                {club?.name?.charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload-input"
                  style={{ display: 'none' }}
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload-input">
                  <MuiButton
                    component="span"
                    variant="outlined"
                    size="small"
                    startIcon={uploadingLogo ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />}
                    disabled={uploadingLogo}
                    sx={{ borderColor: '#4F2BCB', color: '#4F2BCB' }}
                  >
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                  </MuiButton>
                </label>
                <Typography variant="caption" sx={{ display: 'block', color: '#777788', mt: 0.5 }}>
                  Recommended size: 256x256 px. PNG, JPG or WebP.
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Or enter Logo URL"
              placeholder="https://example.com/logo.png"
              value={formData.logo_url}
              onChange={handleChange('logo_url')}
            />
          </Box>
        )}

        {/* Tab 1: General Info & Location */}
        {tab === 1 && (
          <Box display="flex" flexDirection="column" gap={2.5}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="About Us / Club Description"
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Describe your club mission, activities, regular schedules, and upcoming goals..."
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  value={formData.contact_email}
                  onChange={handleChange('contact_email')}
                  placeholder="contact@club.edu"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Meeting Location"
                  value={formData.meeting_location}
                  onChange={handleChange('meeting_location')}
                  placeholder="e.g. Student Center, Room 304"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Schedule"
                  value={formData.meeting_time}
                  onChange={handleChange('meeting_time')}
                  placeholder="e.g. Every Thursday at 4:30 PM"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Gallery Management */}
        {tab === 2 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#20202A', mb: 1 }}>
              Manage Photo Gallery
            </Typography>
            <Typography variant="body2" sx={{ color: '#777788', mb: 2.5 }}>
              Showcase workshops, tournaments, and social events.
            </Typography>

            {/* Add photo controls */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F9F8FE', border: '1px solid #E9E7F2', mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#4F2BCB', display: 'block', mb: 1.5 }}>
                + ADD NEW PHOTO TO GALLERY
              </Typography>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Photo title / caption (e.g. Annual Workshop)"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <input
                    type="file"
                    accept="image/*"
                    id="gallery-upload-input"
                    style={{ display: 'none' }}
                    onChange={handleGalleryUpload}
                  />
                  <label htmlFor="gallery-upload-input">
                    <MuiButton
                      component="span"
                      variant="contained"
                      fullWidth
                      size="small"
                      startIcon={uploadingGallery ? <CircularProgress size={16} color="inherit" /> : <AddPhotoAlternateOutlinedIcon />}
                      disabled={uploadingGallery}
                      sx={{ backgroundColor: '#4F2BCB', py: 1 }}
                    >
                      {uploadingGallery ? 'Uploading...' : 'Upload Image'}
                    </MuiButton>
                  </label>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="caption" sx={{ color: '#777788', textAlign: 'center', display: 'block' }}>
                    or enter URL below
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={9}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="https://example.com/photo.jpg"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <MuiButton
                    variant="outlined"
                    fullWidth
                    size="small"
                    onClick={handleAddPhotoByUrl}
                    disabled={!newPhotoUrl.trim()}
                    sx={{ borderColor: '#4F2BCB', color: '#4F2BCB', py: 0.9 }}
                  >
                    Add by URL
                  </MuiButton>
                </Grid>
              </Grid>
            </Paper>

            {/* Gallery Grid preview */}
            {galleryList.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, border: '1px dashed #E9E7F2', borderRadius: '14px' }}>
                <CollectionsOutlinedIcon sx={{ fontSize: 36, color: '#CCD0DC', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#777788' }}>
                  No photos added to gallery yet. Upload photos above.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {galleryList.map((item, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 120,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: '1px solid #E9E7F2',
                        '&:hover .delete-btn': { opacity: 1 },
                      }}
                    >
                      <Box
                        component="img"
                        src={item.url || item}
                        alt={item.title || 'Photo'}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton
                        className="delete-btn"
                        size="small"
                        onClick={() => handleRemovePhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#FFFFFF',
                          opacity: 0.8,
                          '&:hover': { backgroundColor: '#DC2626' },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          px: 1,
                          py: 0.4,
                        }}
                      >
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title || `Photo ${index + 1}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
        <MuiButton onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </MuiButton>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={loading}
          sx={{ backgroundColor: '#4F2BCB', px: 3.5, py: 1 }}
        >
          {loading ? 'Saving Changes...' : 'Save All Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditClubModal;
