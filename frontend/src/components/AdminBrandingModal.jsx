import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';

import { useSiteSettings } from '../context/SiteSettingsContext';
import { uploadImage } from '../api/adminApi';
import { getImageUrl } from '../api/axiosInstance';
import Button from './Button';

const AdminBrandingModal = ({ open, onClose }) => {
  const { siteName, rawSiteLogo, tagline, updateBranding } = useSiteSettings();

  const [name, setName] = useState(siteName);
  const [logo, setLogo] = useState(rawSiteLogo);
  const [siteTagline, setSiteTagline] = useState(tagline);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      setName(siteName);
      setLogo(rawSiteLogo);
      setSiteTagline(tagline);
      setError('');
      setSuccess('');
    }
  }, [open, siteName, rawSiteLogo, tagline]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setError('');
    try {
      const res = await uploadImage(file);
      setLogo(res.url);
      setSuccess('Logo uploaded successfully!');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Website name cannot be empty.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateBranding({
        site_name: name.trim(),
        site_logo: logo.trim(),
        tagline: siteTagline.trim(),
      });
      setSuccess('Website branding updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update website branding.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          p: 1,
          boxShadow: '0 20px 60px rgba(79, 43, 203, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <BrandingWatermarkOutlinedIcon sx={{ color: '#4F2BCB' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#20202A' }}>
            Customize Website Branding
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: '#E9E7F2' }}>
        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px' }}>{success}</Alert>}

        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          {/* 1. Website Logo Preview & Upload */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FBFBFE',
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            <Avatar
              src={getImageUrl(logo)}
              variant="rounded"
              sx={{
                width: 64,
                height: 64,
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                color: '#4F2BCB',
                fontWeight: 900,
                fontSize: '1.5rem',
                border: '2px solid #E9E7F2',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}
            >
              {name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A', mb: 0.5 }}>
                Website Logo
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788', display: 'block', mb: 1.5 }}>
                Shown on top navigation bar, sidebar, and welcome headers.
              </Typography>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="ghost"
                  size="small"
                  component="label"
                  startIcon={uploadingLogo ? <CircularProgress size={16} /> : <CloudUploadOutlinedIcon />}
                  disabled={uploadingLogo}
                  sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.8rem' }}
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload Image'}
                  <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                </Button>
              </Stack>
            </Box>
          </Paper>

          {/* Logo URL Input (Alternative) */}
          <TextField
            label="Logo Image URL (Direct link or Upload above)"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            fullWidth
            size="small"
            helperText="Enter a direct HTTPS image URL or upload a file from your computer."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          {/* 2. Website Name Input */}
          <TextField
            label="Website Name (Brand Title)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            helperText="Replaces 'Club Centralize' throughout the navbar, sidebar, and dashboard."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          {/* 3. Website Tagline */}
          <TextField
            label="Website Tagline / University Subtitle"
            value={siteTagline}
            onChange={(e) => setSiteTagline(e.target.value)}
            fullWidth
            helperText="Optional subtitle displayed below the site brand."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || uploadingLogo}
          sx={{ backgroundColor: '#4F2BCB', px: 3 }}
        >
          {saving ? 'Saving...' : 'Save Branding Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminBrandingModal;
