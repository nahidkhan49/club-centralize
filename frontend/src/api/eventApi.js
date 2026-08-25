// src/api/eventApi.js
import api from './axiosInstance';

/**
 * Fetch events for a specific club.
 * Supports optional pagination via `skip` and `limit` query params.
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
  const response = await api.post(`/events/${eventId}/leave`);
  return response.data;
};
