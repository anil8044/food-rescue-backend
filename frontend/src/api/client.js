const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function fallbackMessage(status) {
  if (status === 401) return 'Invalid email or password';
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
