import axios from 'axios';

export const API_BASE_URL = 'https://tripuraabackend.onrender.com';

let accessToken = null;
let refreshToken = null;
let refreshFlight = null;
let onSessionExpired = null;

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  // Render free tier can cold-start in 30–50s; 20s made login succeed later
  // while the first catalog fetch already failed with "atelier unreachable".
  timeout: 60000,
});

function keychain() {
  try {
    return require('react-native-keychain');
  } catch {
    return null;
  }
}

export async function saveRefreshToken(token) {
  refreshToken = token || null;
  const Keychain = keychain();
  if (!Keychain) return;
  if (token) {
    await Keychain.setGenericPassword('refresh', token, { service: 'tripuraa.refresh' });
  } else {
    await Keychain.resetGenericPassword({ service: 'tripuraa.refresh' });
  }
}

export async function loadRefreshToken() {
  const Keychain = keychain();
  if (Keychain) {
    const creds = await Keychain.getGenericPassword({ service: 'tripuraa.refresh' });
    refreshToken = creds ? creds.password : null;
  }
  return refreshToken;
}

export function setAccessToken(token) {
  accessToken = token || null;
}

export async function clearSession() {
  accessToken = null;
  await saveRefreshToken(null);
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

async function refreshOnce() {
  if (!refreshToken) await loadRefreshToken();
  if (!refreshToken) return null;
  if (!refreshFlight) {
    refreshFlight = axios
      .post(`${API_BASE_URL}/api/v1/auth/refresh`, { refreshToken })
      .then(async (response) => {
        accessToken = response.data?.data?.accessToken || null;
        await saveRefreshToken(response.data?.data?.refreshToken);
        return response.data?.data || null;
      })
      .catch(() => null)
      .finally(() => {
        refreshFlight = null;
      });
  }
  return refreshFlight;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};
    const url = original.url || '';
    const isAuth = url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/verify');
    if (error.response?.status === 401 && !original._retry && !isAuth) {
      original._retry = true;
      const next = await refreshOnce();
      if (!next?.accessToken) {
        await clearSession();
        onSessionExpired?.();
        return Promise.reject(error);
      }
      original.headers = { ...(original.headers || {}), Authorization: `Bearer ${accessToken}` };
      return api(original);
    }
    return Promise.reject(error);
  },
);

const FRIENDLY_BY_CODE = {
  EMAIL_NOT_CONFIGURED:
    'We could not send the verification email right now. Please try again shortly, or contact the atelier on WhatsApp.',
  EMAIL_SEND_FAILED:
    'We could not send the verification email. Please check the address and try again in a moment.',
  ACCOUNT_EXISTS: 'An account with that email or phone already exists.',
  ACCOUNT_BLOCKED: 'This account is paused. Please contact the atelier.',
  NETWORK: 'The atelier is unreachable. Check that the API is running.',
  TIMEOUT:
    'The atelier took too long to respond. If you just created an account, wait a moment and try again — the email may still arrive.',
};

function normalizeApiError(errorBody, httpStatus) {
  const raw = errorBody?.error || {};
  const code = raw.code || (httpStatus === 403 ? 'ACCOUNT_BLOCKED' : 'NETWORK');
  const generic = !raw.message || /something went wrong/i.test(raw.message);
  return {
    code,
    message: generic && FRIENDLY_BY_CODE[code] ? FRIENDLY_BY_CODE[code] : (raw.message || FRIENDLY_BY_CODE.NETWORK),
    ...(raw.details ? { details: raw.details } : {}),
  };
}

export async function apiCall(method, url, data, config = {}) {
  try {
    const response = await api.request({ method, url, data, ...config });
    return response.data;
  } catch (error) {
    const body = error.response?.data;
    if (body && body.success === false) {
      return { ...body, error: normalizeApiError(body, error.response?.status) };
    }
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
      return {
        success: false,
        error: { code: 'TIMEOUT', message: FRIENDLY_BY_CODE.TIMEOUT },
      };
    }
    if (!error.response) {
      return {
        success: false,
        error: { code: 'NETWORK', message: FRIENDLY_BY_CODE.NETWORK },
      };
    }
    const blocked = error.response?.status === 403 && body?.error?.code === 'ACCOUNT_BLOCKED';
    return {
      success: false,
      error: normalizeApiError(
        blocked ? { error: { code: 'ACCOUNT_BLOCKED' } } : body,
        error.response?.status,
      ),
    };
  }
}

export async function restoreSession() {
  const stored = await loadRefreshToken();
  if (!stored) return null;
  const next = await refreshOnce();
  return next || null;
}

export { api };
