/** Shared static UI helpers (not product catalog data). */
export * from './countryCodes';

/** Collection filter chips — UI labels only; catalog items always come from the API. */
export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

export const QUICK_CHIPS = [
  { id: 'all', label: 'All Weaves' },
  { id: 'pure_zari', label: 'Pure Zari' },
  { id: 'handloom', label: 'Handloom' },
  { id: 'wedding', label: 'Wedding Edit' },
  { id: 'under_30k', label: 'Under ₹30K' },
];
