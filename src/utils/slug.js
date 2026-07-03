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

// Canonical URL for a maker page, derived from the maker name.
export function makerUrl(makerName) {
  const slug = generateSlug(makerName, '');
  return slug ? `/maker/${slug}` : '/browse';
}
