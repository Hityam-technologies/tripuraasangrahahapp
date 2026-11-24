import { Linking, PermissionsAndroid, Platform } from 'react-native';

/**
 * Shared photo picker for profile + try-on.
 * - Asks for camera / gallery permission before opening the system picker
 * - Never returns raw library / Manifest error text to show to customers
 */

function looksTechnical(message) {
  const text = String(message || '');
  return (
    /Manifest\.permission|PERMISSION_|EACCES|EPERM|RNPermissions|react-native-image-picker|at [A-Za-z0-9_.]+\(|Exception|stack/i.test(text)
  );
}

/** Map any picker/upload failure into a short boutique-safe sentence. */
export function friendlyPhotoError(raw, source = 'library') {
  const text = String(raw || '').trim();
  if (!text || looksTechnical(text)) {
    return source === 'camera'
      ? 'Camera access is needed to take a photo. Please allow it in Settings and try again.'
      : 'Photo library access is needed to choose a picture. Please allow it in Settings and try again.';
  }
  if (/permission|denied|blocked|unavailable/i.test(text)) {
    return source === 'camera'
      ? 'Camera access is needed to take a photo. Please allow it in Settings and try again.'
      : 'Photo library access is needed to choose a picture. Please allow it in Settings and try again.';
  }
  return text;
}

async function ensureCameraPermission() {
  if (Platform.OS !== 'android') return { ok: true };
  const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
  const already = await PermissionsAndroid.check(permission);
  if (already) return { ok: true };

  const result = await PermissionsAndroid.request(permission, {
    title: 'Camera access',
    message: 'Tripuraa needs the camera so you can take a profile or try-on photo.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });

  if (result === PermissionsAndroid.RESULTS.GRANTED) return { ok: true };
  return {
    ok: false,
    message: 'Camera access is needed to take a photo. Please allow it in Settings and try again.',
    openSettings: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  };
}

async function ensureLibraryPermission() {
  if (Platform.OS !== 'android') return { ok: true };

  // Android 13+ uses READ_MEDIA_IMAGES; older versions use READ_EXTERNAL_STORAGE
  const permission = Platform.Version >= 33
    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  if (!permission) return { ok: true };

  const already = await PermissionsAndroid.check(permission);
  if (already) return { ok: true };

  const result = await PermissionsAndroid.request(permission, {
    title: 'Photo access',
    message: 'Tripuraa needs photo access so you can choose a profile or try-on picture.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });

  if (result === PermissionsAndroid.RESULTS.GRANTED) return { ok: true };
  return {
    ok: false,
    message: 'Photo library access is needed to choose a picture. Please allow it in Settings and try again.',
    openSettings: result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
  };
}

/**
 * Open camera or gallery after permissions are granted.
 * @param {'camera'|'library'} source
 * @param {object} [options] image-picker options
 * @returns {Promise<{ cancelled?: boolean, asset?: object, error?: string, openSettings?: boolean }>}
 */
export async function pickPhoto(source = 'library', options = {}) {
  let picker;
  try {
    picker = require('react-native-image-picker');
  } catch {
    return {
      error: 'Photos are not available in this build yet. Please update the app and try again.',
    };
  }

  const permission = source === 'camera'
    ? await ensureCameraPermission()
    : await ensureLibraryPermission();

  if (!permission.ok) {
    return {
      error: permission.message,
      openSettings: Boolean(permission.openSettings),
    };
  }

  const launch = source === 'camera' ? picker.launchCamera : picker.launchImageLibrary;
  let result;
  try {
    result = await launch({
      mediaType: 'photo',
      quality: 0.85,
      maxWidth: 1200,
      maxHeight: 1200,
      saveToPhotos: false,
      ...options,
    });
  } catch (error) {
    return {
      error: friendlyPhotoError(error?.message, source),
    };
  }

  if (result?.didCancel) return { cancelled: true };

  if (result?.errorCode || result?.errorMessage) {
    // image-picker surfaces Manifest.permission.CAMERA text when permission was not requested
    return {
      error: friendlyPhotoError(result.errorMessage || result.errorCode, source),
      openSettings: /permission/i.test(String(result.errorCode || result.errorMessage || '')),
    };
  }

  const asset = result?.assets?.[0];
  if (!asset?.uri) {
    return {
      error: source === 'camera'
        ? 'No photo was captured. Please try again.'
        : 'No photo was selected. Please try again.',
    };
  }

  return { asset };
}

export async function openAppSettings() {
  try {
    await Linking.openSettings();
  } catch {
    // Ignore — Settings may be unavailable on some devices
  }
}
