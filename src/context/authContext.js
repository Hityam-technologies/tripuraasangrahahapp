import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { apiCall, clearSession, getRefreshToken, restoreSession, saveRefreshToken, setAccessToken, setSessionExpiredHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [maintenance, setMaintenance] = useState({ active: false, notice: '' });
  const [referralOffer, setReferralOffer] = useState(null);
  const [maxOrderQuantity, setMaxOrderQuantity] = useState(99);

  const applySession = useCallback(async (payload) => {
    if (!payload?.accessToken) return null;
    setAccessToken(payload.accessToken);
    await saveRefreshToken(payload.refreshToken);
    setUser(payload.user || null);
    return payload.user || null;
  }, []);

  const signOut = useCallback(async () => {
    await apiCall('post', '/auth/logout', { refreshToken: getRefreshToken() }).catch(() => null);
    await clearSession();
    setUser(null);
  }, []);

  const readRuntimeConfig = useCallback(async () => {
    const config = await apiCall('get', '/system/config');
    if (!config.success) return;
    setForceUpdate(Boolean(config.data?.forceUpdate));
    setMaintenance({
      active: Boolean(config.data?.maintenanceMode),
      notice: config.data?.maintenanceNotice || '',
    });
    const limit = Math.floor(Number(config.data?.maxOrderQuantity));
    if (limit >= 1) setMaxOrderQuantity(Math.min(999, limit));
    const offer = config.data?.referral;
    if (offer && Number.isFinite(Number(offer.referrerOrderReward))) {
      setReferralOffer({
        enabled: offer.enabled !== false,
        refereeSignupBonus: Number(offer.refereeSignupBonus) || 0,
        referrerOrderReward: Number(offer.referrerOrderReward) || 0,
      });
    }
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    let live = true;
    (async () => {
      await readRuntimeConfig();
      const session = await restoreSession();
      if (live && session?.user) setUser(session.user);
      if (live) setReady(true);
    })();
    const timer = setInterval(() => {
      if (live) readRuntimeConfig();
    }, 15000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && live) readRuntimeConfig();
    });
    return () => {
      live = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [readRuntimeConfig]);

  const register = useCallback(async (body) => apiCall('post', '/auth/register', body), []);
  const verifyOtp = useCallback(async (body) => {
    const result = await apiCall('post', '/auth/verify-otp', body);
    if (result.success) applySession(result.data);
    return result;
  }, [applySession]);
  const resendOtp = useCallback(async (body) => apiCall('post', '/auth/resend-otp', body), []);
  const login = useCallback(async (body) => {
    const result = await apiCall('post', '/auth/login', body);
    if (result.success) applySession(result.data);
    return result;
  }, [applySession]);
  const forgotPassword = useCallback(async (email) => apiCall('post', '/auth/forgot-password', { email }), []);
  const resetPassword = useCallback(async (body) => apiCall('post', '/auth/reset-password', body), []);
  const updateProfile = useCallback(async (body) => {
    const result = await apiCall('put', '/users/me', body);
    if (result.success) setUser(result.data);
    return result;
  }, []);
  const uploadAvatar = useCallback(async (asset) => {
    if (!asset?.uri) {
      return { success: false, error: { code: 'BAD_IMAGE', message: 'Choose a photo to upload.' } };
    }
    const body = new FormData();
    body.append('avatar', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || `avatar_${Date.now()}.jpg`,
    });
    const result = await apiCall('post', '/media/upload/avatar', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (result.success) {
      // Prefer the full user object from the upload response; fall back to patching avatarUrl.
      if (result.data?.user) setUser(result.data.user);
      else if (result.data?.avatarUrl || result.data?.url) {
        setUser((prev) => (prev
          ? { ...prev, avatarUrl: result.data.avatarUrl || result.data.url }
          : prev));
      }
    }
    return result;
  }, []);
  const refreshUser = useCallback(async () => {
    const result = await apiCall('get', '/users/me');
    if (result.success && result.data) setUser(result.data);
    return result;
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    forceUpdate,
    maintenance,
    referralOffer,
    maxOrderQuantity,
    register,
    verifyOtp,
    resendOtp,
    login,
    forgotPassword,
    resetPassword,
    signOut,
    updateProfile,
    uploadAvatar,
    refreshUser,
  }), [user, ready, forceUpdate, maintenance, referralOffer, maxOrderQuantity, register, verifyOtp, resendOtp, login, forgotPassword, resetPassword, signOut, updateProfile, uploadAvatar, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || {};
}
