import React, { useState, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Avatar } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadImage } from '../api/uploadApi';
import { getImageUrl } from '../api/axiosInstance';

const ImageUpload = ({ value, onChange, label = 'Upload Image', aspect = 'square', helperText = 'Recommended: PNG, JPG, WEBP under 5MB' }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      console.error('Image upload failed', err);
      setError(err?.response?.data?.detail || 'Failed to upload image. Please check file format and size.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const isSquare = aspect === 'square';

  return (
    <Box>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.8 }}>
          {label}
        </Typography>
      )}

      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        style={{ display: 'none' }}
      />

      {value ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            p: 2,
            borderRadius: '14px',
            border: '1px solid #E9E7F2',
            backgroundColor: '#F9F8FE',
          }}
        >
          {isSquare ? (
            <Avatar
              src={getImageUrl(value)}
              variant="rounded"
              sx={{ width: 72, height: 72, borderRadius: '12px', border: '1px solid #E2D9FF' }}
            />
          ) : (
            <Box
              component="img"
              src={getImageUrl(value)}
              alt="Preview"
              sx={{
                width: 140,
                height: 80,
                objectFit: 'cover',
                borderRadius: '10px',
                border: '1px solid #E2D9FF',
              }}
            />
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#20202A', mb: 0.5 }}>
              Image selected
            </Typography>
            <Typography variant="caption" sx={{ color: '#777788', display: 'block', mb: 1 }}>
              {value.split('/').pop()}
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                sx={{
                  borderColor: '#4F2BCB',
                  color: '#4F2BCB',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  py: 0.3,
                  '&:hover': { borderColor: '#39209A', backgroundColor: '#F3F0FF' },
                }}
              >
                Change Image
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleRemove}
                startIcon={<DeleteIcon fontSize="small" />}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  py: 0.3,
                }}
              >
                Remove
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed #D6D2EB',
            borderRadius: '14px',
            p: 3,
            textAlign: 'center',
            backgroundColor: '#F9F8FE',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:hover': {
              borderColor: '#4F2BCB',
              backgroundColor: '#F3F0FF',
            },
          }}
        >
          {uploading ? (
            <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
              <CircularProgress size={28} sx={{ color: '#4F2BCB' }} />
              <Typography variant="body2" sx={{ color: '#777788', fontSize: '0.85rem' }}>
                Uploading image...
              </Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" alignItems="center" gap={0.8}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: '#4F2BCB' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#20202A' }}>
                Click to upload {label.toLowerCase()}
              </Typography>
              <Typography variant="caption" sx={{ color: '#777788' }}>
                {helperText}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
