import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', password: '' });
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
      // Determine dashboard based on systemRole returned from login
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
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4.5 },
          borderRadius: '20px',
          border: '1px solid #E9E7F2',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{
            fontWeight: 800,
            color: '#20202A',
            fontSize: '1.75rem',
            mb: 0.5,
          }}
        >
          Welcome Back!
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{ color: '#777788', mb: 3 }}
        >
          Login to continue to Club Centralize
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#20202A', mb: 0.8, fontSize: '0.88rem' }}
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
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F6FC',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#C7B8FF' },
                  '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: '#20202A', mb: 0.8, fontSize: '0.88rem' }}
            >
              Password *
            </Typography>
            <TextField
              fullWidth
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#F3F6FC',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#C7B8FF' },
                  '&.Mui-focused fieldset': { borderColor: '#4F2BCB' },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#4F2BCB',
              color: '#FFFFFF',
              py: 1.3,
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#39209A',
                boxShadow: '0 6px 16px rgba(79, 43, 203, 0.25)',
              },
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#777788', fontSize: '0.88rem' }}>
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  color: '#4F2BCB',
                  fontWeight: 700,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
