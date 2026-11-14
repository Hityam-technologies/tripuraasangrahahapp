import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LoadingOverlay } from '../components/loadingSpinner';

const LoadingContext = createContext(null);

/**
 * Global loading overlay for long async actions (auth, sign-out, etc.).
 * Product sheets should show their own in-sheet loader — do not block them
 * with this overlay.
 */
export function LoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('Please wait...');
  const hideTimer = useRef(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const showLoading = useCallback((nextMessage = 'Please wait...') => {
    clearHideTimer();
    setMessage(nextMessage);
    setVisible(true);
  }, [clearHideTimer]);

  const hideLoading = useCallback(() => {
    clearHideTimer();
    setVisible(false);
  }, [clearHideTimer]);

  const runWithLoading = useCallback(
    async (action, nextMessage = 'Please wait...') => {
      showLoading(nextMessage);
      try {
        return await action();
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading],
  );

  /**
   * Navigate immediately. Heavy screens (CardDetail) show their own in-sheet loader.
   */
  const navigateWithLoading = useCallback(
    (navigation, routeName, params) => {
      if (!navigation?.navigate) return;
      navigation.navigate(routeName, params);
    },
    [],
  );

  const value = useMemo(
    () => ({
      visible,
      message,
      showLoading,
      hideLoading,
      runWithLoading,
      navigateWithLoading,
    }),
    [visible, message, showLoading, hideLoading, runWithLoading, navigateWithLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay visible={visible} message={message} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
