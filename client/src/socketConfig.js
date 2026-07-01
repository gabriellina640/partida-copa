export function resolveSocketUrl({ explicitUrl, locationOrigin }) {
  if (explicitUrl) return explicitUrl;

  try {
    const url = new URL(locationOrigin);
    if (url.port === '5173') {
      url.port = '3001';
      return url.origin;
    }
  } catch {
    return locationOrigin;
  }

  return locationOrigin;
}
