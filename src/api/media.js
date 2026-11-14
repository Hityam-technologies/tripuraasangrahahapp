/** Accept a bundled require() number or an API url. */
export function imageSource(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return { uri: value };
  if (typeof value === 'object' && value.uri) return value;
  if (typeof value === 'object' && value.url) return { uri: value.url };
  return value;
}

export function presentSaree(row) {
  if (!row) return null;
  const images = (Array.isArray(row.images) ? row.images : [])
    .map((image) => imageSource(image.url || image))
    .filter(Boolean);
  const image = imageSource(row.image) || images[0] || null;
  return {
    ...row,
    image,
    images: images.length ? images : (image ? [image] : []),
    tryOnImage: imageSource(row.tryOnImage) || image,
  };
}
