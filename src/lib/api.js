import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

// In-memory token cache
let cachedToken = null;
let tokenPromise = null;

async function getToken() {
  // Return cached token immediately if available
  if (cachedToken) return cachedToken;

  // If another call is already fetching, wait for it
  if (tokenPromise) return tokenPromise;

  // Start fetching (and lock so parallel calls share it)
  tokenPromise = (async () => {
    try {
      // 1. Try Supabase session
      const { data } = await supabase?.auth?.getSession();
      if (data?.session?.access_token) {
        cachedToken = data.session.access_token;
        return cachedToken;
      }

      // 2. Fallback: localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const parsed = JSON.parse(localStorage.getItem(key));
          const token = parsed?.access_token || parsed?.currentSession?.access_token;
          if (token) {
            cachedToken = token;
            return cachedToken;
          }
        }
      }
    } catch (e) {
      console.error('Token fetch error:', e);
    } finally {
      tokenPromise = null; // release lock
    }
    return null;
  })();

  return tokenPromise;
}

// Clear cache on 401 so next call refreshes
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
  
  const url = `${API_URL}${endpoint}${queryString}`;
  
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    clearTokenCache(); // Token expired, clear cache for next retry
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