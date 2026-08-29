import axios from 'axios';

// Determine default base URL based on environment
const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }
  return 'https://club-centralize.onrender.com';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      localStorage.removeItem('system_role');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const base = getBaseURL().replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

export const getClubLogoUrl = (club) => {
  if (club?.logo_url) {
    return getImageUrl(club.logo_url);
  }
  const name = (club?.name || '').toLowerCase();
  if (name.includes('computer') || name.includes('cse') || name.includes('tech') || name.includes('code') || name.includes('it')) {
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=240&q=80';
  }
  if (name.includes('english') || name.includes('language') || name.includes('literature')) {
    return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=240&q=80';
  }
  if (name.includes('debate') || name.includes('speaking')) {
    return 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=240&q=80';
  }
  if (name.includes('photo') || name.includes('film') || name.includes('media')) {
    return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=240&q=80';
  }
  if (name.includes('robot') || name.includes('ieee') || name.includes('engineer')) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=240&q=80';
  }
  if (name.includes('cultural') || name.includes('music') || name.includes('drama') || name.includes('art')) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=240&q=80';
  }
  if (name.includes('business') || name.includes('entrepreneur') || name.includes('career')) {
    return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=240&q=80';
  }
  return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=240&q=80';
};

export { getBaseURL };
export default api;
