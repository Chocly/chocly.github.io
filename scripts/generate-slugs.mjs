#!/usr/bin/env node
/**
 * Slug Generation Script for Chocly
 *
 * Run this script to add URL-friendly slugs to all chocolate documents in Firestore.
 * Usage: node scripts/generate-slugs.mjs
 *
 * This is a one-time migration script. After running, each chocolate document
 * will have a `slug` field like "lindt-excellence-85-dark".
 *
 * Prerequisites:
 * - Set GOOGLE_APPLICATION_CREDENTIALS env var to your Firebase service account key
 * - Or run from a machine with Firebase auth configured
 */

// For now, this script generates slugs from the REST API and logs them.
// In production, you'd use Firebase Admin SDK to write back to Firestore.

const PROJECT_ID = "chocolate-review-web";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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

async function main() {
  console.log('Fetching all chocolates from Firestore...');

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'chocolates' }],
      select: {
        fields: [
          { fieldPath: 'name' },
          { fieldPath: 'maker' },
          { fieldPath: 'slug' }
        ]
      },
      limit: 1000
    }
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const results = await res.json();
  const chocolates = results
    .filter(r => r.document)
    .map(r => {
      const fields = r.document.fields || {};
      const parts = r.document.name.split('/');
      return {
        id: parts[parts.length - 1],
        name: fields.name ? parseFirestoreValue(fields.name) : null,
        maker: fields.maker ? parseFirestoreValue(fields.maker) : null,
        existingSlug: fields.slug ? parseFirestoreValue(fields.slug) : null,
      };
    });

  console.log(`Found ${chocolates.length} chocolates`);

  // Generate slugs and check for collisions
  const slugCounts = {};
  const slugMappings = [];

  for (const choc of chocolates) {
    if (choc.existingSlug) {
      console.log(`  SKIP: ${choc.name} (already has slug: ${choc.existingSlug})`);
      continue;
    }

    let slug = generateSlug(choc.name, choc.maker);

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

  console.log(`\nGenerated ${slugMappings.length} new slugs:`);
  for (const mapping of slugMappings.slice(0, 20)) {
    console.log(`  ${mapping.name} by ${mapping.maker} -> /${mapping.slug}`);
  }
  if (slugMappings.length > 20) {
    console.log(`  ... and ${slugMappings.length - 20} more`);
  }

  console.log(`\nTo write these slugs to Firestore, use Firebase Admin SDK.`);
  console.log(`Example update for each document:`);
  console.log(`  db.collection('chocolates').doc('<id>').update({ slug: '<slug>' })`);

  // Output as JSON for easy processing
  const outputPath = './scripts/slug-mappings.json';
  const fs = await import('fs');
  fs.writeFileSync(outputPath, JSON.stringify(slugMappings, null, 2));
  console.log(`\nSlug mappings saved to ${outputPath}`);
}

main().catch(console.error);
