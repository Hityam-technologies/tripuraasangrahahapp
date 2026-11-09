import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { DEMO_SAREE_IMAGES } from '../assets/sareeImages';

const TryOnContext = createContext(null);

export const DEFAULT_PROFILES = [
  {
    id: 'user_default',
    name: 'Samyuktha Rao',
    label: 'Primary Profile Photo',
    source: require('../assets/userAvatar.jpg'),
  },
  {
    id: 'profile_standing',
    name: 'Studio Standing Pose',
    label: 'Full Length Silhouette',
    source: require('../assets/category_saree.jpg'),
  },
  {
    id: 'profile_festive',
    name: 'Festive Ceremony Pose',
    label: 'Warm Ambient Lighting',
    source: require('../assets/category_lehenga.jpg'),
  },
];

const INITIAL_TRY_ON_LOOKS = [
  {
    id: 'look-saree-1',
    sareeId: 'saree-1',
    sareeTitle: 'Swarna Kanchipuram Pure Zari Silk',
    sareePrice: '₹28,500',
    weave: 'Kanchipuram Handloom',
    drapeImage: require('../assets/sareeModelPink_nobg.png'),
    flatImage: DEMO_SAREE_IMAGES[0],
    userPhotoSource: require('../assets/userAvatar.jpg'),
    savedAt: 'Today',
  },
  {
    id: 'look-saree-2',
    sareeId: 'saree-2',
    sareeTitle: 'Emerald Brocade Royal Zari Drape',
    sareePrice: '₹38,000',
    weave: 'Banarasi Katan Silk',
    drapeImage: require('../assets/sareeEmerald.jpg'),
    flatImage: DEMO_SAREE_IMAGES[1],
    userPhotoSource: require('../assets/userAvatar.jpg'),
    savedAt: 'Yesterday',
  },
  {
    id: 'look-saree-3',
    sareeId: 'saree-3',
    sareeTitle: 'Crimson Bridal Handwoven Silk',
    sareePrice: '₹32,900',
    weave: 'Varanasi Bridal Weave',
    drapeImage: require('../assets/sareeCrimson_nobg.png'),
    flatImage: DEMO_SAREE_IMAGES[4],
    userPhotoSource: require('../assets/userAvatar.jpg'),
    savedAt: '3 days ago',
  },
];

export function TryOnProvider({ children }) {
  // Saved person photo: Defaults to user's saved portrait. Saved once, persists until changed!
  const [activeProfile, setActiveProfile] = useState(DEFAULT_PROFILES[0]);
  const [tryOnLooks, setTryOnLooks] = useState(INITIAL_TRY_ON_LOOKS);

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

  // Save a try-on look to user's profile
  const saveTryOnLook = useCallback((look) => {
    setTryOnLooks((prev) => {
      const existingIdx = prev.findIndex((item) => item.sareeId === look.sareeId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...look, savedAt: 'Just now' };
        return updated;
      }
      return [{ ...look, savedAt: 'Just now' }, ...prev];
    });
  }, []);

  // Remove a look from saved try-on looks
  const removeTryOnLook = useCallback((sareeId) => {
    setTryOnLooks((prev) => prev.filter((item) => item.sareeId !== sareeId && item.id !== sareeId));
  }, []);

  // Check if a saree look is saved
  const isLookSaved = useCallback(
    (sareeId) => tryOnLooks.some((look) => look.sareeId === sareeId),
    [tryOnLooks],
  );

  const value = useMemo(
    () => ({
      userPhoto: activeProfile.source,
      activeProfile,
      availableProfiles: DEFAULT_PROFILES,
      changeUserPhoto,
      tryOnLooks,
      saveTryOnLook,
      removeTryOnLook,
      isLookSaved,
    }),
    [
      activeProfile,
      changeUserPhoto,
      tryOnLooks,
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

