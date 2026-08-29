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
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import BrandingWatermarkOutlinedIcon from '@mui/icons-material/BrandingWatermarkOutlined';
import AndroidIcon from '@mui/icons-material/Android';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';

import { useSiteSettings } from '../context/SiteSettingsContext';
import { uploadImage } from '../api/adminApi';
import { uploadApk } from '../api/eventApi';
import { getImageUrl } from '../api/axiosInstance';
import Button from './Button';

const AdminBrandingModal = ({ open, onClose }) => {
  const {
    siteName,
    rawSiteLogo,
    tagline,
    rawApkUrl,
    appVersion,
    welcomeBannerImage,
    rawWelcomeBannerImage,
    welcomeBannerTitle,
    welcomeBannerSubtitle,
    welcomeBannerEnabled,
    updateBranding,
  } = useSiteSettings();

  const [name, setName] = useState(siteName);
  const [logo, setLogo] = useState(rawSiteLogo);
  const [siteTagline, setSiteTagline] = useState(tagline);
  const [apk, setApk] = useState(rawApkUrl);
  const [version, setVersion] = useState(appVersion || '1.0.0');

  // Custom Welcome Banner states
  const [bannerEnabled, setBannerEnabled] = useState(welcomeBannerEnabled);
  const [bannerImage, setBannerImage] = useState(rawWelcomeBannerImage);
  const [bannerTitle, setBannerTitle] = useState(welcomeBannerTitle);
  const [bannerSubtitle, setBannerSubtitle] = useState(welcomeBannerSubtitle);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingApkFile, setUploadingApkFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      setName(siteName);
      setLogo(rawSiteLogo);
      setSiteTagline(tagline);
      setApk(rawApkUrl);
      setVersion(appVersion || '1.0.0');
      setBannerEnabled(welcomeBannerEnabled);
      setBannerImage(rawWelcomeBannerImage);
      setBannerTitle(welcomeBannerTitle);
      setBannerSubtitle(welcomeBannerSubtitle);
      setError('');
      setSuccess('');
    }
  }, [open, siteName, rawSiteLogo, tagline, rawApkUrl, appVersion, welcomeBannerEnabled, rawWelcomeBannerImage, welcomeBannerTitle, welcomeBannerSubtitle]);

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

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    setError('');
    try {
      const res = await uploadImage(file);
      setBannerImage(res.url);
      setSuccess('Banner image uploaded successfully!');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to upload banner image.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleApkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingApkFile(true);
    setError('');
    try {
      const res = await uploadApk(file);
      setApk(res.url);
      setSuccess(`APK package uploaded successfully: ${res.filename}`);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to upload APK file.');
    } finally {
      setUploadingApkFile(false);
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
        apk_url: apk.trim(),
        app_version: version.trim(),
        welcome_banner_image: bannerImage.trim(),
        welcome_banner_title: bannerTitle.trim(),
        welcome_banner_subtitle: bannerSubtitle.trim(),
        welcome_banner_enabled: bannerEnabled,
      });
      setSuccess('Website settings updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update settings.');
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
            Website Control Panel
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
            </Box>
          </Paper>

          {/* Logo URL Input */}
          <TextField
            label="Logo Image URL (Direct link or Upload above)"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            fullWidth
            size="small"
            helperText="Enter a direct HTTPS image URL or upload a file above."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          {/* 2. Website Name & Tagline */}
          <TextField
            label="Website Name (Brand Title)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            helperText="Replaces 'Club Centralize' throughout the website."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <TextField
            label="Website Tagline / University Subtitle"
            value={siteTagline}
            onChange={(e) => setSiteTagline(e.target.value)}
            fullWidth
            helperText="Optional subtitle displayed below the site brand."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />

          <Divider sx={{ my: 0.5 }} />

          {/* 3. Welcome Banner Settings (Admin customization requested by user) */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FBFBFE',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1.2}>
                <PhotoSizeSelectActualIcon sx={{ color: '#4F2BCB' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                    Dashboard Welcome Banner
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#777788' }}>
                    Custom banner displayed at the top of all dashboards.
                  </Typography>
                </Box>
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={bannerEnabled}
                    onChange={(e) => setBannerEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label={bannerEnabled ? "Enabled" : "Disabled"}
                sx={{ mr: 0 }}
              />
            </Box>

            {bannerEnabled && (
              <Stack spacing={2} mt={1}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    component="img"
                    src={getImageUrl(bannerImage)}
                    alt="Banner Preview"
                    sx={{
                      width: 100,
                      height: 56,
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #E9E7F2',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="small"
                    component="label"
                    startIcon={uploadingBanner ? <CircularProgress size={16} /> : <CloudUploadOutlinedIcon />}
                    disabled={uploadingBanner}
                    sx={{ color: '#4F2BCB', borderColor: '#D4CCF7', fontSize: '0.78rem' }}
                  >
                    {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                    <input type="file" hidden accept="image/*" onChange={handleBannerUpload} />
                  </Button>
                </Box>

                <TextField
                  label="Banner Background Image URL"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <TextField
                  label="Welcome Banner Title"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g. Welcome to Club Centralize"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />

                <TextField
                  label="Welcome Banner Subtitle"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Enter custom banner subtitle description..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Stack>
            )}
          </Paper>

          <Divider sx={{ my: 0.5 }} />

          {/* 4. Android Mobile App (.APK) Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: '1px solid #E9E7F2',
              backgroundColor: '#FBFBFE',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AndroidIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#20202A' }}>
                  Mobile Application (.APK Package)
                </Typography>
                <Typography variant="caption" sx={{ color: '#777788' }}>
                  Upload the Android build package so users can download it from the top navbar.
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <Button
                variant="primary"
                size="small"
                component="label"
                startIcon={uploadingApkFile ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />}
                disabled={uploadingApkFile}
                sx={{ backgroundColor: '#059669', fontSize: '0.82rem', py: 0.8 }}
              >
                {uploadingApkFile ? 'Uploading APK...' : 'Upload New .APK File'}
                <input type="file" hidden accept=".apk,.zip" onChange={handleApkUpload} />
              </Button>
            </Stack>

            <TextField
              label="APK File Path / Direct Download Link"
              value={apk}
              onChange={(e) => setApk(e.target.value)}
              fullWidth
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || uploadingLogo || uploadingBanner || uploadingApkFile}
          sx={{ backgroundColor: '#4F2BCB', px: 3 }}
        >
          {saving ? 'Saving...' : 'Save Site Settings'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminBrandingModal;
