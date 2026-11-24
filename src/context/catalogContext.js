import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { apiCall } from '../api/client';
import { imageSource, presentSaree } from '../api/media';
import { useAuth } from './authContext';

const ALL_CATEGORY = { id: 'all', label: 'All', image: null, icon: 'grid-outline' };

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { user, ready } = useAuth();
  const [sarees, setSarees] = useState([]);
  const [categories, setCategories] = useState([ALL_CATEGORY]);
  const [faq, setFaq] = useState([]);
  const [store, setStore] = useState(null);
  const [support, setSupport] = useState(null);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const lastUserId = useRef(null);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!silent) setLoading(true);
    try {
      const [sareeRes, categoryRes, faqRes, storeRes, supportRes, heroRes] = await Promise.all([
        apiCall('get', '/sarees', null, { params: { limit: 50, sort: 'featured' } }),
        apiCall('get', '/categories'),
        apiCall('get', '/content/faq'),
        apiCall('get', '/content/store-address'),
        apiCall('get', '/content/support-channels'),
        apiCall('get', '/content/hero'),
      ]);
      if (sareeRes.success) {
        setSarees((sareeRes.data.items || []).map(presentSaree));
        setError('');
      } else {
        setError(sareeRes.error?.message || 'The collection could not be loaded.');
      }
      if (categoryRes.success && Array.isArray(categoryRes.data) && categoryRes.data.length) {
        const remote = categoryRes.data.map((item) => ({
          id: item.id,
          label: item.label || '-',
          image: imageSource(item.coverImageUrl || item.image),
        }));
        setCategories([ALL_CATEGORY, ...remote]);
      }
      if (faqRes.success && Array.isArray(faqRes.data)) setFaq(faqRes.data);
      if (storeRes.success) setStore(storeRes.data);
      if (supportRes.success) {
        const channels = Array.isArray(supportRes.data) ? supportRes.data : supportRes.data?.channels || [];
        const byType = Object.fromEntries(channels.map((channel) => [channel.type, channel]));
        setSupport({
          whatsappPhone: byType.whatsapp?.value,
          whatsappMessage: byType.whatsapp?.message,
          instagramUsername: byType.instagram?.value,
          helplinePhone: byType.phone?.value,
          helplineDisplay: byType.phone?.message || byType.phone?.value,
        });
      }
      if (heroRes.success) setHero(heroRes.data || null);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  // First load once auth bootstrap finishes (gives Render a moment if waking up)
  useEffect(() => {
    if (!ready) return undefined;
    refresh();
    return undefined;
  }, [ready, refresh]);

  // After login / account switch, reload catalog so a failed cold-start doesn't stick
  useEffect(() => {
    const nextId = user?.id || user?._id || user?.email || null;
    if (!ready) return;
    if (nextId && nextId !== lastUserId.current) {
      lastUserId.current = nextId;
      refresh({ silent: sarees.length > 0 });
    }
    if (!nextId) lastUserId.current = null;
  }, [user, ready, refresh, sarees.length]);

  // Retry when returning to the app if catalog is empty/errored
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && (error || sarees.length === 0)) {
        refresh({ silent: true });
      }
    });
    return () => sub.remove();
  }, [error, sarees.length, refresh]);

  const getSaree = useCallback((id) => sarees.find((item) => item.id === id) || null, [sarees]);

  const value = useMemo(() => ({
    sarees,
    categories,
    faq,
    store,
    support,
    hero,
    loading,
    error,
    refresh,
    getSaree,
  }), [sarees, categories, faq, store, support, hero, loading, error, refresh, getSaree]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used within CatalogProvider');
  return context;
}
