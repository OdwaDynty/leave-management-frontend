// ─── NOTIFICATION API CALLS ───────────────────────────

import api from './axios';

// Get all notifications for the logged in user
// Optional: { is_read: false } for unread only
export const getNotifications = (params) =>
  api.get('/notifications', { params });

// Mark a single notification as read
export const markAsRead = (id) =>
  api.put(`/notifications/${id}/read`);

// Mark all notifications as read
export const markAllAsRead = () =>
  api.put('/notifications/read-all');

// Delete a notification
export const deleteNotification = (id) =>
  api.delete(`/notifications/${id}`);