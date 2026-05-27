// ─── BILLING API CALLS ────────────────────────────────
// Functions for PayFast payment integration
// These call the billing endpoints on the backend

import api from './axios';

// Get all subscription plans with pricing
// Used to populate the pricing page
export const getPlans = () =>
  api.get('/billing/plans');

// Get the current company's active subscription
// Returns plan, status, employee count, period dates
export const getSubscription = () =>
  api.get('/billing/subscription');

// Initiate a PayFast payment for a plan upgrade
// Returns PayFast URL and signed form fields
// Body: { plan: 'starter' | 'professional' | 'enterprise' }
export const initiatePayment = (data) =>
  api.post('/billing/initiate', data);

// Cancel the current subscription
// Immediately reverts to the free plan
export const cancelSubscription = () =>
  api.post('/billing/cancel');