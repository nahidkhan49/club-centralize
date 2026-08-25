import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';

export const AuthContext = createContext(null);

/**
 * Derive the system role based on:
 * 1. is_superuser → 'admin'
 * 2. Has 'president' membership → 'president'
 * 3. Has 'secretary' membership → 'secretary'
 * 4. Has 'vice_president' or 'treasurer' → 'officer'
 * 5. Otherwise → 'member'
 */
function deriveSystemRole(isAdmin, memberships) {
  if (isAdmin) return 'admin';
  const list = Array.isArray(memberships) ? memberships : [];
  const roles = list.map((m) => m.role);
  if (roles.includes('president')) return 'president';
  if (roles.includes('secretary')) return 'secretary';
  if (roles.includes('vice_president')) return 'vice_president';
  if (roles.includes('treasurer')) return 'treasurer';
  return 'member';
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    loading: true,
    systemRole: null,      // 'admin' | 'president' | 'secretary' | 'member'
    memberships: [],       // [{ club_id, club_name, role }]
    presidentOfClubs: [],  // clubs where user is president
    secretaryOfClubs: [],  // clubs where user is secretary
  });

  const fetchCurrentUser = async (token) => {
    try {
      const [userRes, membershipsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/clubs/my/memberships').catch(() => ({ data: [] })),
      ]);

      const userData = userRes.data;
      const memberships = Array.isArray(membershipsRes?.data) ? membershipsRes.data : [];

      localStorage.setItem('user_id', String(userData.id));
      localStorage.setItem('user_username', userData.username);

      const savedAvatar = localStorage.getItem('user_avatar');
      const systemRole = deriveSystemRole(userData.is_superuser, memberships);
      const presidentOfClubs = memberships.filter((m) => m.role === 'president');
      const secretaryOfClubs = memberships.filter((m) => m.role === 'secretary');

      setAuth({
        accessToken: token,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          is_superuser: userData.is_superuser,
          avatarUrl: savedAvatar || null,
        },
        isAuthenticated: true,
        loading: false,
        systemRole,
        memberships,
        presidentOfClubs,
        secretaryOfClubs,
      });

      return { userData, memberships, systemRole };
    } catch (err) {
      console.error('Failed to fetch current user profile', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      setAuth({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        systemRole: null,
        memberships: [],
        presidentOfClubs: [],
        secretaryOfClubs: [],
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setAuth((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', username);
    params.append('password', password);
    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    const result = await fetchCurrentUser(access_token);
    return result; // { userData, memberships, systemRole }
  };

  const register = async (username, email, password) => {
    const response = await api.post('/auth/register', {
      username: username.trim(),
      email: email.trim(),
      password: password,
    });
    return response.data;
  };

  const updateUserAvatar = (avatarUrl) => {
    if (avatarUrl) {
      localStorage.setItem('user_avatar', avatarUrl);
    } else {
      localStorage.removeItem('user_avatar');
    }
    setAuth((prev) => ({
      ...prev,
      user: { ...prev?.user, avatarUrl },
    }));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_avatar');
    localStorage.removeItem('user_username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_role');
    setAuth({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      systemRole: null,
      memberships: [],
      presidentOfClubs: [],
      secretaryOfClubs: [],
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        register,
        logout,
        updateUserAvatar,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/** Convenience hook */
export const useAuth = () => useContext(AuthContext);
