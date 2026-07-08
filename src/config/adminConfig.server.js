// Server-only admin configuration. Never import this from client components —
// the UID list here is authorization, not UI. The client-side adminConfig.js
// remains for cosmetic UI hiding only.

const DEFAULT_ADMIN_UIDS = ['EZTtNncUcHYc5TikzewnB0tYmz03'];

export function getAdminUids() {
  const fromEnv = process.env.ADMIN_UIDS;
  if (fromEnv) {
    return fromEnv.split(',').map((uid) => uid.trim()).filter(Boolean);
  }
  return DEFAULT_ADMIN_UIDS;
}

export function isAdminUid(uid) {
  return Boolean(uid) && getAdminUids().includes(uid);
}
