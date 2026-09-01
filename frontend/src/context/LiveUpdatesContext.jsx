import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from './AuthContext';

export const LiveUpdatesContext = createContext(null);

export const LiveUpdatesProvider = ({ children }) => {
  const { user, systemRole, presidentOfClubs, secretaryOfClubs } = useContext(AuthContext);

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [pendingJoinRequestsCount, setPendingJoinRequestsCount] = useState(0);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);

  const isMountedRef = useRef(true);

  // Compute officer club ID if any
  const officerClubId =
    presidentOfClubs?.[0]?.club_id || secretaryOfClubs?.[0]?.club_id || null;

  // 1. Silent Notification Fetcher
  const fetchNotificationsData = useCallback(async () => {
    if (!user) return;
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications/'),
        api.get('/notifications/unread-count'),
      ]);
      if (isMountedRef.current) {
        setNotifications(listRes.data || []);
        setUnreadNotificationsCount(countRes.data?.unread_count || 0);
      }
    } catch (err) {
      // Silently catch in background
    }
  }, [user]);

  // 2. Silent Officer Requests Fetcher (Join Requests & Registrations)
  const fetchOfficerRequestsData = useCallback(async () => {
    if (!user || !officerClubId) {
      if (isMountedRef.current) {
        setPendingJoinRequestsCount(0);
        setPendingRegistrationsCount(0);
      }
      return;
    }

    try {
      const statsRes = await api.get(`/clubs/${officerClubId}/stats`);
      if (isMountedRef.current && statsRes.data) {
        setPendingJoinRequestsCount(statsRes.data.pending_requests_count || 0);
      }
    } catch (err) {
      // Silently catch in background
    }
  }, [user, officerClubId]);

  // Combined refresh helper for manual triggers
  const refreshLiveUpdates = useCallback(() => {
    fetchNotificationsData();
    fetchOfficerRequestsData();
  }, [fetchNotificationsData, fetchOfficerRequestsData]);

  // Polling loop with safe cleanup
  useEffect(() => {
    isMountedRef.current = true;

    if (user) {
      // Initial silent fetch
      fetchNotificationsData();
      fetchOfficerRequestsData();

      // Notifications interval (every 7 seconds)
      const notiTimer = setInterval(() => {
        if (isMountedRef.current) {
          fetchNotificationsData();
        }
      }, 7000);

      // Officer requests interval (every 8 seconds)
      const reqTimer = setInterval(() => {
        if (isMountedRef.current) {
          fetchOfficerRequestsData();
        }
      }, 8000);

      return () => {
        clearInterval(notiTimer);
        clearInterval(reqTimer);
      };
    } else {
      setUnreadNotificationsCount(0);
      setNotifications([]);
      setPendingJoinRequestsCount(0);
      setPendingRegistrationsCount(0);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [user, fetchNotificationsData, fetchOfficerRequestsData]);

  return (
    <LiveUpdatesContext.Provider
      value={{
        unreadNotificationsCount,
        notifications,
        pendingJoinRequestsCount,
        pendingRegistrationsCount,
        refreshLiveUpdates,
        fetchNotificationsData,
        fetchOfficerRequestsData,
        officerClubId,
      }}
    >
      {children}
    </LiveUpdatesContext.Provider>
  );
};

export const useLiveUpdates = () => useContext(LiveUpdatesContext);
