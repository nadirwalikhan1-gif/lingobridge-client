import { supabase } from './supabase';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/+$/, '');
const isDev = import.meta.env.DEV;

let cachedToken = null;
let tokenExpiry = null;

/** Extract exp timestamp from a JWT string without parsing the full payload */
function getJwtExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** Fast localStorage lookup for Supabase auth token */
function getTokenFromStorage() {
  try {
    const key = Object.keys(localStorage).find(
      k => k.startsWith('sb-') && k.endsWith('-auth-token')
    );
    if (!key) return null;
    const parsed = JSON.parse(localStorage.getItem(key));
    const token = parsed?.access_token || parsed?.currentSession?.access_token || null;
    if (token) {
      cachedToken = token;
      tokenExpiry = getJwtExpiry(token);
    }
    return token;
  } catch {
    return null;
  }
}

/**
 * Return a valid token synchronously when possible.
 * Only hits the async getSession() on cold start or near expiry.
 */
async function getToken() {
  // Fast path: valid cached token
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 30000) {
    return cachedToken;
  }

  // Try Supabase session (async, but only when cache miss or near expiry)
  try {
    if (supabase?.auth?.getSession) {
      const result = await supabase.auth.getSession();
      const token = result?.data?.session?.access_token;
      if (token) {
        cachedToken = token;
        tokenExpiry = getJwtExpiry(token);
        return cachedToken;
      }
    }
  } catch (e) {
    if (isDev) console.error('Supabase getSession error:', e);
  }

  // Fallback to localStorage
  if (cachedToken) return cachedToken;
  return getTokenFromStorage();
}

function clearTokenCache() {
  cachedToken = null;
  tokenExpiry = null;
}

async function apiCall(endpoint, options = {}) {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const { params, ...fetchOptions } = options;
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
      ).toString()
    : '';

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}${queryString}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) clearTokenCache();

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ─── Existing exports (unchanged API surface) ───────────────────────────────

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