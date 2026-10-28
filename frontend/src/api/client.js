const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const TOKEN_KEY = 'foodRescueToken';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: the user will simply need to sign in again */
  }
}

// Called when the server says the session is no longer valid (401 outside the login call).
let unauthorizedHandler = null;
export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function fallbackMessage(status) {
  if (status === 401) return 'Please sign in to continue.';
  if (status === 403) return 'You do not have permission to do this.';
  if (status === 404) return 'The requested item was not found.';
  if (status >= 500) return 'The server had a problem. Please try again.';
  return 'The request could not be completed.';
}

async function request(method, path, { body, params } = {}) {
  let url = BASE_URL + path;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') qs.append(key, value);
    });
    const text = qs.toString();
    if (text) url += '?' + text;
  }

  const options = { method, headers: {} };
  const token = getToken();
  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new ApiError(`Cannot reach the server. Check that the backend is running (${BASE_URL}).`, 0);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      setToken(null);
      if (unauthorizedHandler) unauthorizedHandler();
    }
    // The backend puts the user-facing explanation in "error".
    const message = (data && (data.error || data.message)) || fallbackMessage(response.status);
    throw new ApiError(message, response.status);
  }
  return data;
}

export const get = (path, params) => request('GET', path, { params });
export const post = (path, body, params) => request('POST', path, { body, params });
export const put = (path, body, params) => request('PUT', path, { body, params });
export const patch = (path, body, params) => request('PATCH', path, { body, params });
export const del = (path) => request('DELETE', path);
