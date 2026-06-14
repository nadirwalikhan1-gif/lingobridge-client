import { supabase } from './supabase';

// Normalize: remove ALL trailing slashes
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/+$/, '');

let cachedToken = null;

function getTokenFromStorage() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const parsed = JSON.parse(localStorage.getItem(key));
        return parsed?.access_token || parsed?.currentSession?.access_token || null;
      }
    }
  } catch (e) {
    console.error('localStorage read error:', e);
  }
  return null;
}

async function getToken() {
  // Always try Supabase session first (works even when localStorage is blocked)
  try {
    if (supabase?.auth?.getSession) {
      const result = await supabase.auth.getSession();
      const token = result?.data?.session?.access_token;
      if (token) {
        cachedToken = token;
        return cachedToken;
      }
    }
  } catch (e) {
    console.error('Supabase getSession error:', e);
  }

  // Fallback to localStorage (may be blocked by Edge tracking prevention)
  if (cachedToken) return cachedToken;
  const storageToken = getTokenFromStorage();
  if (storageToken) {
    cachedToken = storageToken;
    return cachedToken;
  }

  return null;
}

function clearTokenCache() {
  cachedToken = null;
}

async function apiCall(endpoint, options = {}) {
  const token = await getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const { params, ...fetchOptions } = options;
  const queryString = params
    ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v != null))).toString()
    : "";

  // Bulletproof URL construction
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}${queryString}`;

  console.log('📡 API URL:', url); // DEBUG: verify in console

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearTokenCache();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Keep your existing exports
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
