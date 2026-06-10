import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function getToken() {
  // 1. Try Supabase session first (single attempt)
  const { data } = await supabase?.auth?.getSession();
  if (data?.session?.access_token) {
    return data.session.access_token;
  }

  // 2. Fallback: read from localStorage directly
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const parsed = JSON.parse(localStorage.getItem(key));
        return parsed?.access_token || parsed?.currentSession?.access_token;
      }
    }
  } catch (e) {
    console.error('localStorage read error:', e);
  }

  return null;
}

async function apiCall(endpoint, options = {}) {
  const token = await getToken();
  
  if (!token) {
    console.error('No auth token found.');
    throw new Error('Not authenticated');
  }

  const { params, ...fetchOptions } = options;
  const queryString = params 
    ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v != null))).toString() 
    : "";
  
  const url = `${API_URL}${endpoint}${queryString}`;
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Keep your existing exports below
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
export const api = {
  get: (endpoint, config = {}) => apiCall(endpoint, { method: 'GET', ...config }),
  post: (endpoint, data, config = {}) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(data), ...config }),
  put: (endpoint, data, config = {}) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data), ...config }),
  patch: (endpoint, data, config = {}) => apiCall(endpoint, { method: 'PATCH', body: JSON.stringify(data), ...config }),
  delete: (endpoint, config = {}) => apiCall(endpoint, { method: 'DELETE', ...config }),
};