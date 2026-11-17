import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { apiCall } from '../api/client';
import { imageSource } from '../api/media';
import { useAuth } from './authContext';
const TryOnContext = createContext(null);

export function TryOnProvider({ children }) {
  const { user } = useAuth();
  const [activeProfile, setActiveProfile] = useState(null);
  const [tryOnLooks, setTryOnLooks] = useState([]);
  const [drapeStatus, setDrapeStatus] = useState('');
  const [lastJobId, setLastJobId] = useState(null);
  const [tryOnWallet, setTryOnWallet] = useState(null);

  const refreshWallet = useCallback(async () => {
    if (!user) {
      setTryOnWallet(null);
      return;
    }
    const result = await apiCall('get', '/try-on/wallet');
    if (result.success) setTryOnWallet(result.data);
  }, [user]);

  const refreshLooks = useCallback(async () => {
    if (!user) {
      setTryOnLooks([]);
      return;
    }
    const result = await apiCall('get', '/users/me/try-on-looks');
    if (!result.success) return;
    setTryOnLooks((result.data || []).map((look) => ({
      ...look,
      drapeImage: imageSource(look.drapeImage),
      flatImage: imageSource(look.flatImage),
      userPhotoSource: imageSource(look.userPhotoSource),
      savedAt: look.savedAt,
    })));
  }, [user]);

  useEffect(() => {
    refreshLooks();
    refreshWallet();
    if (!user) return undefined;
    apiCall('get', '/users/me/drape-profiles').then((result) => {
      const first = result.success ? result.data?.[0] : null;
      if (!first) return;
      setActiveProfile({
        id: first.id,
        name: 'Saved portrait',
        label: first.label || '-',
        source: imageSource(first.imageUrl),
      });
    });
    return undefined;
  }, [user, refreshLooks, refreshWallet]);

  // Change or update the saved photo
  const changeUserPhoto = useCallback((profileOrSource) => {
    if (profileOrSource && profileOrSource.source) {
      setActiveProfile(profileOrSource);
    } else if (profileOrSource) {
      setActiveProfile({
        id: `custom_${Date.now()}`,
        name: 'My Custom Photo',
        label: 'Saved Profile Photo',
        source: profileOrSource,
      });
    }
  }, []);

  const uploadPortrait = useCallback(async (asset) => {
    const body = new FormData();
    body.append('photo', {
      uri: asset.uri,
      type: asset.type || 'image/jpeg',
      name: asset.fileName || 'portrait.jpg',
    });
    const result = await apiCall('post', '/try-on/upload-photo', body, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (result.success) {
      setActiveProfile({
        id: result.data.id,
        name: 'Saved portrait',
        label: result.data.label,
        source: imageSource(result.data.imageUrl),
      });
    }
    return result;
  }, []);

  const generateDrape = useCallback(async (sareeId, isActive = () => true) => {
    if (!activeProfile?.id || !/^[a-f\d]{24}$/i.test(String(activeProfile.id))) {
      setDrapeStatus('Add your portrait before generating a drape.');
      return null;
    }
    setDrapeStatus('Preparing your drape...');
    const started = await apiCall('post', '/try-on/generate-drape', {
      sareeId,
      drapeProfileId: activeProfile.id,
    });
    if (!started.success) {
      setDrapeStatus(started.error?.message || 'The drape could not be started.');
      return null;
    }
    if (started.data.wallet) setTryOnWallet(started.data.wallet);
    const jobId = started.data.jobId;
    setLastJobId(jobId);
    const startedAt = Date.now();
    while (isActive() && Date.now() - startedAt < 120000) {
      const job = await apiCall('get', `/try-on/jobs/${jobId}`);
      if (!job.success) {
        setDrapeStatus(job.error?.message || 'The drape could not be checked.');
        return null;
      }
      if (job.data.status === 'completed') {
        setDrapeStatus('');
        refreshWallet();
        return imageSource(job.data.drapeImageUrl);
      }
      if (['failed', 'canceled', 'timed_out'].includes(job.data.status)) {
        setDrapeStatus(job.data.error?.message || 'The drape could not be created.');
        refreshWallet();
        return null;
      }
      setDrapeStatus(job.data.status === 'processing' ? 'Draping the saree...' : 'Waiting for the studio...');
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    setDrapeStatus('The drape took too long. Please try again.');
    return null;
  }, [activeProfile, refreshWallet]);

  const saveTryOnLook = useCallback(async (look) => {
    if (lastJobId) {
      const saved = await apiCall('post', '/users/me/try-on-looks', { jobId: lastJobId });
      if (saved.success) {
        await refreshLooks();
        return saved;
      }
      setDrapeStatus(saved.error?.message || 'Save the drape after it finishes.');
    }
    setTryOnLooks((prev) => {
      const existingIdx = prev.findIndex((item) => item.sareeId === look.sareeId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...look, savedAt: '-' };
        return updated;
      }
      return [{ ...look, savedAt: '-' }, ...prev];
    });
    return { success: false };
  }, [lastJobId, refreshLooks]);

  const removeTryOnLook = useCallback((sareeId) => {
    setTryOnLooks((prev) => prev.filter((item) => item.sareeId !== sareeId && item.id !== sareeId));
    apiCall('delete', `/users/me/try-on-looks/${sareeId}`);
  }, []);

  // Check if a saree look is saved
  const isLookSaved = useCallback(
    (sareeId) => tryOnLooks.some((look) => look.sareeId === sareeId),
    [tryOnLooks],
  );

  const value = useMemo(
    () => ({
      userPhoto: activeProfile?.source || null,
      activeProfile,
      availableProfiles: [],
      changeUserPhoto,
      tryOnLooks,
      drapeStatus,
      tryOnWallet,
      uploadPortrait,
      generateDrape,
      saveTryOnLook,
      removeTryOnLook,
      isLookSaved,
    }),
    [
      activeProfile,
      changeUserPhoto,
      tryOnLooks,
      drapeStatus,
      tryOnWallet,
      uploadPortrait,
      generateDrape,
      saveTryOnLook,
      removeTryOnLook,
      isLookSaved,
    ],
  );

  return <TryOnContext.Provider value={value}>{children}</TryOnContext.Provider>;
}

export function useTryOn() {
  const context = useContext(TryOnContext);
  if (!context) {
    throw new Error('useTryOn must be used within a TryOnProvider');
  }
  return context;
}

export default TryOnContext;

