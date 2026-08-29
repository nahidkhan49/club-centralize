// src/api/eventApi.js
import api from './axiosInstance';

/**
 * Fetch events for a specific club.
 */
export const fetchEventsByClub = async (clubId, params = {}) => {
  const response = await api.get(`/events/club/${clubId}`, { params });
  return response.data;
};

/** Create a new event (president/secretary only). */
export const createEvent = async (eventData) => {
  const response = await api.post('/events/', eventData);
  return response.data;
};

/** Get event details by ID. */
export const getEvent = async (eventId) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

/** Update an existing event. */
export const updateEvent = async (eventId, updateData) => {
  const response = await api.patch(`/events/${eventId}`, updateData);
  return response.data;
};

/** Delete an event. */
export const deleteEvent = async (eventId) => {
  await api.delete(`/events/${eventId}`);
};

/** Join an event. */
export const joinEvent = async (eventId) => {
  const response = await api.post(`/events/${eventId}/join`);
  return response.data;
};

/** Leave an event. */
export const leaveEvent = async (eventId) => {
  const response = await api.delete(`/events/${eventId}/join`);
  return response.data;
};

/** Fetch participants/registrants of an event */
export const fetchEventParticipants = async (eventId) => {
  const response = await api.get(`/events/${eventId}/participants`);
  return response.data;
};

/** Manually add participant to event */
export const addEventParticipant = async (eventId, userId) => {
  const response = await api.post(`/events/${eventId}/participants/${userId}`);
  return response.data;
};

/** Remove participant from event */
export const removeEventParticipant = async (eventId, userId) => {
  await api.delete(`/events/${eventId}/participants/${userId}`);
};

/** Upload Android APK package */
export const uploadApk = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/apk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===== Event Tasks =====

/** Fetch all tasks for an event */
export const fetchEventTasks = async (eventId) => {
  const response = await api.get(`/events/${eventId}/tasks`);
  return response.data;
};

/** Create a new task for an event */
export const createEventTask = async (eventId, taskData) => {
  const response = await api.post(`/events/${eventId}/tasks`, taskData);
  return response.data;
};

/** Update an event task */
export const updateEventTask = async (eventId, taskId, updateData) => {
  const response = await api.patch(`/events/${eventId}/tasks/${taskId}`, updateData);
  return response.data;
};

/** Delete an event task */
export const deleteEventTask = async (eventId, taskId) => {
  await api.delete(`/events/${eventId}/tasks/${taskId}`);
};

