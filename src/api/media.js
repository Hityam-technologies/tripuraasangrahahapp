/**
 * ImageKit answers a .jpg link with a WebP file when the phone asks for one.
 * The card then draws a blank box. Force a JPEG so the bytes match the link.
 */
function catalogImageUrl(url) {
  if (typeof url !== 'string' || !/^https?:\/\/ik\.imagekit\.io\//.test(url)) return url;
  if (/[?&]tr=[^#]*f-jpg/.test(url)) return url;
  if (/[?&]tr=/.test(url)) return url.replace(/([?&]tr=)/, '$1f-jpg,');
  const join = url.includes('?') ? '&' : '?';
  return `${url}${join}tr=f-jpg,w-900,c-at_max,q-80`;
}

/** Accept a bundled require() number or an API url. */
export function imageSource(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return { uri: catalogImageUrl(value) };
  if (typeof value === 'object' && typeof value.uri === 'string') {
    return { ...value, uri: catalogImageUrl(value.uri) };
  }
  if (typeof value === 'object' && value.url) return { uri: catalogImageUrl(value.url) };
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
