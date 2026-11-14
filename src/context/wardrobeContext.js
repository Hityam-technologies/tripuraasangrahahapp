import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { apiCall } from '../api/client';
import { useAuth } from './authContext';
import { useCatalog } from './catalogContext';

const WardrobeContext = createContext(null);

export function WardrobeProvider({ children }) {
  const { user } = useAuth();
  const { sarees } = useCatalog();
  const [wardrobe, setWardrobe] = useState({});

  useEffect(() => {
    if (!user) {
      setWardrobe({});
      return;
    }
    let live = true;
    apiCall('get', '/users/me/wishlist').then((result) => {
      if (!live || !result.success) return;
      const next = {};
      (result.data.ids || result.data.items?.map((item) => item.id) || []).forEach((id) => {
        next[id] = true;
      });
      setWardrobe(next);
    });
    return () => {
      live = false;
    };
  }, [user]);

  // Check if item is saved in wardrobe
  const isInWardrobe = useCallback(
    (id) => !!wardrobe[id],
    [wardrobe],
  );

  // Toggle wardrobe state
  const toggleWardrobe = useCallback((id) => {
    setWardrobe((prev) => {
      const had = !!prev[id];
      const next = { ...prev };
      if (had) delete next[id];
      else next[id] = true;
      const request = had
        ? apiCall('delete', `/users/me/wishlist/${id}`)
        : apiCall('post', `/users/me/wishlist/${id}`);
      request.then((result) => {
        if (result.success) return;
        setWardrobe((current) => {
          const rolled = { ...current };
          if (had) rolled[id] = true;
          else delete rolled[id];
          return rolled;
        });
      });
      return next;
    });
  }, []);

  // Add specifically to wardrobe
  const addToWardrobe = useCallback((id) => {
    setWardrobe((prev) => ({
      ...prev,
      [id]: true,
    }));
  }, []);

  // Hide the saree immediately, then delete it on the server.
  // If the request fails, put the saree back so a reload matches the screen.
  const removeFromWardrobe = useCallback((id) => {
    if (!id) return;
    setWardrobe((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    apiCall('delete', `/users/me/wishlist/${encodeURIComponent(id)}`).then((result) => {
      if (result.success) return;
      setWardrobe((current) => ({ ...current, [id]: true }));
    });
  }, []);

  // Clear all wardrobe items
  const clearWardrobe = useCallback(() => {
    setWardrobe({});
  }, []);

  // Derived array of full product objects currently saved in wardrobe
  const wardrobeItems = useMemo(() => {
    return sarees.filter((item) => !!wardrobe[item.id]);
  }, [wardrobe, sarees]);

  const wardrobeCount = wardrobeItems.length;

  const value = useMemo(
    () => ({
      // Primary Wardrobe API
      wardrobe,
      wardrobeItems,
      wardrobeCount,
      isInWardrobe,
      toggleWardrobe,
      addToWardrobe,
      removeFromWardrobe,
      clearWardrobe,

      // Backwards-compatible aliases
      wishlist: wardrobe,
      wishlistItems: wardrobeItems,
      wishlistCount: wardrobeCount,
      isWishlisted: isInWardrobe,
      toggleWishlist: toggleWardrobe,
      addToWishlist: addToWardrobe,
      removeFromWishlist: removeFromWardrobe,
      clearWishlist: clearWardrobe,
    }),
    [
      wardrobe,
      wardrobeItems,
      wardrobeCount,
      isInWardrobe,
      toggleWardrobe,
      addToWardrobe,
      removeFromWardrobe,
      clearWardrobe,
    ],
  );

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
}

// Aliases for seamless backwards compatibility
export const useWishlist = useWardrobe;
export const WishlistProvider = WardrobeProvider;

export default WardrobeContext;

