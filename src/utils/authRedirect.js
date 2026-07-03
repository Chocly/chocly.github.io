// Shared helpers for sending users to /auth and returning them to where they
// were acting. Keeps the "sign in to do X" moment from stranding people on an
// unrelated page.

// Only allow same-site paths ("/chocolate/abc"), never absolute URLs — this
// is what makes returnTo safe against open-redirect abuse.
export function safeReturnTo(raw) {
  if (typeof raw !== 'string') return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  return raw;
}

// Build an /auth URL that returns the user to `returnTo` after signing in.
// Defaults to the current page when called in the browser with no argument.
export function authUrl(returnTo) {
  const target =
    safeReturnTo(returnTo) ||
    (typeof window !== 'undefined'
      ? safeReturnTo(window.location.pathname + window.location.search)
      : null);
  return target ? `/auth?returnTo=${encodeURIComponent(target)}` : '/auth';
}

// Translate Firebase auth error codes into copy a person can act on.
export function friendlyAuthError(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return "That email and password don't match. Try again, or use “Forgot your password?”";
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Please choose a password with at least 6 characters.';
    case 'auth/invalid-email':
      return "That doesn't look like a valid email address.";
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return "Sign-in was cancelled. Please try again when you're ready.";
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong signing you in. Please try again.';
  }
}
