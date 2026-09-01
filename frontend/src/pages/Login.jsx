import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  Link,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  PersonOutlineOutlined,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  ShieldOutlined,
} from '@mui/icons-material';
import Button from '../components/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { siteName, siteLogo } = useSiteSettings();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(form.username.trim(), form.password);
      let dashboard = '/dashboard';
      if (result?.systemRole === 'admin') dashboard = '/admin/dashboard';
      else if (result?.systemRole === 'president') dashboard = '/president/dashboard';
      else if (result?.systemRole === 'secretary') dashboard = '/secretary/dashboard';
      navigate(dashboard);
    } catch (err) {
      console.error('Login error', err);
      let message = 'Invalid username or password';
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        message = detail;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
        px: 2,
        backgroundColor: '#FAF9FF',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 43, 203, 0.08) 0%, rgba(250, 249, 255, 0) 70%)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, rgba(250, 249, 255, 0) 70%)',
          zIndex: 0,
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3.5, sm: 4.5 },
          borderRadius: '24px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 16px 40px rgba(79, 43, 203, 0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3.5}>
          <Avatar
            src={siteLogo}
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              backgroundColor: '#F3F0FF',
              color: '#4F2BCB',
              border: '2px solid #E0DBFF',
              boxShadow: '0 4px 14px rgba(79, 43, 203, 0.15)',
              mb: 2,
            }}
          >
            <ShieldOutlined sx={{ fontSize: 30 }} />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            align="center"
            sx={{
              fontWeight: 900,
              color: '#20202A',
              fontSize: '1.65rem',
              letterSpacing: '-0.02em',
              mb: 0.5,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: '#5E5D6E', fontWeight: 500 }}
          >
            Sign in to access <strong>{siteName}</strong>
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 2.2 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: '#20202A', mb: 0.8, fontSize: '0.86rem' }}
            >
              Username *
            </Typography>
            <TextField
              fullWidth
              name="username"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlined sx={{ color: '#8E90A2', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: '#20202A', mb: 0.8, fontSize: '0.86rem' }}
            >
              Password *
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: '#8E90A2', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: '#8E90A2' }}
                    >
                      {showPassword ? (
                        <VisibilityOffOutlined fontSize="small" />
                      ) : (
                        <VisibilityOutlined fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            variant="primary"
            sx={{
              py: 1.3,
              borderRadius: '12px',
              fontSize: '0.95rem',
            }}
          >
            Sign In
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#5E5D6E', fontSize: '0.86rem' }}>
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: '#4F2BCB',
                  fontWeight: 800,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
