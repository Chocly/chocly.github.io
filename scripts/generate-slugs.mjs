#!/usr/bin/env node
/**
 * Slug Generation Script for Chocly
 *
 * Adds URL-friendly slugs to all chocolate documents in Firestore.
 * Usage:
 *   node scripts/generate-slugs.mjs           # dry run (log + JSON file only)
 *   node scripts/generate-slugs.mjs --write   # write slugs back to Firestore
 *
 * Write-back uses REST PATCH with an updateMask limited to the `slug` field,
 * so it can never touch any other data. Idempotent: documents that already
 * have a slug are skipped.
 *
 * NOTE: once the security rules in firestore.rules are deployed, this script
 * needs an OAuth token (set FIREBASE_TOKEN, e.g. from
 * `gcloud auth print-access-token` with a service account) — unauthenticated
 * writes will be rejected, which is the point of the rules.
 */

const PROJECT_ID = "chocolate-review-web";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const WRITE = process.argv.includes('--write');
const AUTH_HEADERS = process.env.FIREBASE_TOKEN
  ? { Authorization: `Bearer ${process.env.FIREBASE_TOKEN}` }
  : {};

function generateSlug(name, maker) {
  const raw = `${maker || ''} ${name || ''}`.toLowerCase();
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
    .replace(/\s+/g, '-')            // Spaces to hyphens
    .replace(/-+/g, '-')             // Collapse multiple hyphens
    .replace(/^-|-$/g, '')           // Trim hyphens
    .substring(0, 80);               // Max length
}

function parseFirestoreValue(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  return null;
}

async function fetchAllChocolates() {
  // Cursor-paginated: no silent 1000-doc ceiling.
  const chocolates = [];
  let lastDoc = null;

  for (;;) {
    const structuredQuery = {
      from: [{ collectionId: 'chocolates' }],
      select: {
        fields: [
          { fieldPath: 'name' },
          { fieldPath: 'maker' },
          { fieldPath: 'slug' }
        ]
      },
      orderBy: [{ field: { fieldPath: '__name__' }, direction: 'ASCENDING' }],
      limit: 300
    };
    if (lastDoc) {
      structuredQuery.startAt = {
        values: [{ referenceValue: lastDoc }],
        before: false
      };
    }

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...AUTH_HEADERS },
        body: JSON.stringify({ structuredQuery }),
      }
    );
    if (!res.ok) throw new Error(`Query failed: ${res.status} ${await res.text()}`);

    const results = await res.json();
    const docs = results.filter(r => r.document);
    if (docs.length === 0) break;

    for (const r of docs) {
      const fields = r.document.fields || {};
      const parts = r.document.name.split('/');
      chocolates.push({
        id: parts[parts.length - 1],
        docPath: r.document.name,
        name: fields.name ? parseFirestoreValue(fields.name) : null,
        maker: fields.maker ? parseFirestoreValue(fields.maker) : null,
        existingSlug: fields.slug ? parseFirestoreValue(fields.slug) : null,
      });
    }
    lastDoc = docs[docs.length - 1].document.name;
    if (docs.length < 300) break;
  }

  return chocolates;
}

async function writeSlug(id, slug) {
  const url = `${FIRESTORE_BASE}/chocolates/${id}?updateMask.fieldPaths=slug`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...AUTH_HEADERS },
    body: JSON.stringify({ fields: { slug: { stringValue: slug } } }),
  });
  if (!res.ok) {
    throw new Error(`PATCH ${id} failed: ${res.status} ${await res.text()}`);
  }
}

async function main() {
  console.log('Fetching all chocolates from Firestore...');
  const chocolates = await fetchAllChocolates();
  console.log(`Found ${chocolates.length} chocolates`);

  // Generate slugs and check for collisions (existing slugs claim their name
  // first so re-runs never steal a slug from a doc that already owns it)
  const slugCounts = {};
  for (const choc of chocolates) {
    if (choc.existingSlug) slugCounts[choc.existingSlug] = 1;
  }

  const slugMappings = [];
  let skipped = 0;

  for (const choc of chocolates) {
    if (choc.existingSlug) {
      skipped++;
      continue;
    }
    if (!choc.name) {
      console.log(`  SKIP: ${choc.id} has no name`);
      continue;
    }

    let slug = generateSlug(choc.name, choc.maker);
    if (!slug) slug = `chocolate-${choc.id.slice(0, 8).toLowerCase()}`;

    // Handle collisions
    if (slugCounts[slug]) {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 1;
    }

    slugMappings.push({
      id: choc.id,
      name: choc.name,
      maker: choc.maker,
      slug,
    });
  }

  console.log(`\n${skipped} already have slugs; ${slugMappings.length} new slugs generated.`);
  for (const mapping of slugMappings.slice(0, 10)) {
    console.log(`  ${mapping.name} by ${mapping.maker} -> /${mapping.slug}`);
  }
  if (slugMappings.length > 10) {
    console.log(`  ... and ${slugMappings.length - 10} more`);
  }

  // Save mappings for reference either way
  const fs = await import('fs');
  fs.writeFileSync('./scripts/slug-mappings.json', JSON.stringify(slugMappings, null, 2));

  if (!WRITE) {
    console.log('\nDry run (no writes). Re-run with --write to save slugs to Firestore.');
    return;
  }

  console.log('\nWriting slugs to Firestore (updateMask=slug only)...');
  let ok = 0, failed = 0;
  for (const m of slugMappings) {
    try {
      await writeSlug(m.id, m.slug);
      ok++;
      if (ok % 50 === 0) console.log(`  ${ok}/${slugMappings.length}...`);
    } catch (err) {
      failed++;
      console.error(`  FAILED ${m.id} (${m.name}):`, err.message);
      if (failed >= 5) {
        console.error('Too many failures, stopping. Fix the cause and re-run (idempotent).');
        process.exit(1);
      }
    }
  }
  console.log(`\nDone: ${ok} written, ${failed} failed.`);
}

main().catch(console.error);
