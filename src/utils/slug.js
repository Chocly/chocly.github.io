// Slug helpers shared by the app and scripts. Keep generateSlug in sync with
// scripts/generate-slugs.mjs — same algorithm, same URLs.

export function generateSlug(name, maker) {
  const raw = `${maker || ''} ${name || ''}`.toLowerCase();
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')            // Spaces to hyphens
    .replace(/-+/g, '-')             // Collapse multiple hyphens
    .replace(/^-|-$/g, '')           // Trim hyphens
    .substring(0, 80);               // Max length
}

// Canonical URL for a chocolate: slug when present, ID as fallback (ID URLs
// 301 to the slug URL server-side, so old links never break).
export function chocolateUrl(chocolate) {
  if (!chocolate) return '/browse';
  return `/chocolate/${chocolate.slug || chocolate.id}`;
}

// Deterministic slug for a maker NAME. Falls back to a stable hash-based slug
// for names that are entirely non-alphanumeric (e.g. "☆☆☆") so no maker is
// ever dropped. Must stay in sync with getAllMakersServer's keying.
export function makerSlug(makerName) {
  const base = generateSlug(makerName, '');
  if (base) return base;
  // Stable fallback from the raw name so the same maker always maps to the
  // same slug across renders.
  const raw = (makerName || '').trim();
  if (!raw) return '';
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return `maker-${hash.toString(36)}`;
}

// Canonical URL for a maker page, derived from the maker name.
export function makerUrl(makerName) {
  const slug = makerSlug(makerName);
  return slug ? `/maker/${slug}` : '/browse';
}
