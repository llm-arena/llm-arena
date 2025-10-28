/**
 * Security utility to prevent open redirect vulnerabilities
 */

/**
 * Sanitizes a callback URL to ensure it's a safe same-origin path
 * @param callbackUrl - The URL to sanitize (can be from user input)
 * @param fallback - Fallback path if the URL is invalid (default: '/dashboard')
 * @returns A safe relative path
 */
export function sanitizeCallbackUrl(
  callbackUrl: string | undefined,
  fallback = '/dashboard',
): string {
  // If no callback URL provided, use fallback
  if (!callbackUrl || typeof callbackUrl !== 'string') {
    return fallback;
  }

  // Remove any leading/trailing whitespace
  const trimmed = callbackUrl.trim();

  // Only allow relative paths that start with /
  // This prevents redirects to external domains like https://evil.com
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    // Remove any potential URL encoding attacks
    try {
      // Decode and re-validate to prevent encoded attacks like /%2F/evil.com
      const decoded = decodeURIComponent(trimmed);
      if (decoded.startsWith('/') && !decoded.startsWith('//')) {
        return trimmed;
      }
    } catch {
      // If decoding fails, fall back to default
      return fallback;
    }
  }

  // If validation fails, use fallback
  return fallback;
}
