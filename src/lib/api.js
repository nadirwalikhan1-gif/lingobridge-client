import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function apiCall(endpoint, options = {}) {
  const result = await supabase?.auth.getSession();
  const session = result?.data?.session;

  if (!session) {
    throw new Error('Not authenticated');
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function checkHealth() {
  return apiCall('/health');
}

export async function getWallet() {
  return apiCall('/api/wallet');
}

export async function getSessions() {
  return apiCall('/api/sessions');
}

export async function createSession(data) {
  return apiCall('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAgoraToken(channelName, uid = 0) {
  return apiCall('/agora/token', {
    method: 'POST',
    body: JSON.stringify({ channelName, uid }),
  });
}

export async function createCheckout(planId) {
  return apiCall('/create-checkout', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  });
}

export { API_URL };
// axios-style api object for components that import { api }
export const api = {
  get: (endpoint, config = {}) => apiCall(endpoint, { method: 'GET', ...config }),
  post: (endpoint, data, config = {}) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(data), ...config }),
  put: (endpoint, data, config = {}) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data), ...config }),
  patch: (endpoint, data, config = {}) => apiCall(endpoint, { method: 'PATCH', body: JSON.stringify(data), ...config }),
  delete: (endpoint, config = {}) => apiCall(endpoint, { method: 'DELETE', ...config }),
};
