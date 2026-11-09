import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { MASTER_COLLECTIONS, INITIAL_WISHLIST } from '../data';

const WardrobeContext = createContext(null);

export function WardrobeProvider({ children }) {
  const [wardrobe, setWardrobe] = useState(INITIAL_WISHLIST);

  // Check if item is saved in wardrobe
  const isInWardrobe = useCallback(
    (id) => !!wardrobe[id],
    [wardrobe],
  );

  // Toggle wardrobe state
  const toggleWardrobe = useCallback((id) => {
    setWardrobe((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
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

  // Remove specifically from wardrobe
  const removeFromWardrobe = useCallback((id) => {
    setWardrobe((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // Clear all wardrobe items
  const clearWardrobe = useCallback(() => {
    setWardrobe({});
  }, []);

  // Derived array of full product objects currently saved in wardrobe
  const wardrobeItems = useMemo(() => {
    return MASTER_COLLECTIONS.filter((item) => !!wardrobe[item.id]);
  }, [wardrobe]);

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

