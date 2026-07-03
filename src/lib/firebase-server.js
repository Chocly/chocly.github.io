// src/lib/firebase-server.js - Server-side Firestore data fetching
// Uses the REST API to fetch data without requiring Firebase Admin SDK credentials
// This is used in Next.js Server Components and generateMetadata()

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "chocolate-review-web";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Parse a Firestore REST API document into a plain JS object
 */
function parseFirestoreDocument(doc) {
  if (!doc || !doc.fields) return null;

  const result = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    result[key] = parseFirestoreValue(value);
  }

  // Extract document ID from the name path
  if (doc.name) {
    const parts = doc.name.split('/');
    result.id = parts[parts.length - 1];
  }

  return result;
}

function parseFirestoreValue(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.arrayValue) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  if (value.mapValue) {
    return parseFirestoreDocument({ fields: value.mapValue.fields });
  }
  return null;
}

/**
 * Fetch a maker name by ID (for legacy chocolates with makerId reference)
 */
async function getMakerNameServer(makerId) {
  if (!makerId) return null;
  try {
    const res = await fetch(`${FIRESTORE_BASE}/makers/${makerId}`, {
      next: { revalidate: 86400 }
    });
    if (!res.ok) return null;
    const doc = await res.json();
    const maker = parseFirestoreDocument(doc);
    return maker?.name || maker?.brand || maker?.title || maker?.maker || null;
  } catch {
    return null;
  }
}

/**
 * Fetch a single chocolate by Firestore document ID
 */
async function resolveMakerName(chocolate) {
  if (!chocolate.maker || chocolate.maker === 'Unknown Maker') {
    const makerId = chocolate.makerId || chocolate.MakerID;
    if (makerId) {
      const makerName = await getMakerNameServer(makerId);
      chocolate.maker = makerName || 'Unknown Maker';
    } else {
      chocolate.maker = chocolate.maker || 'Unknown Maker';
    }
  }
  return chocolate;
}

export async function getChocolateByIdServer(id) {
  try {
    const res = await fetch(`${FIRESTORE_BASE}/chocolates/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) return null;

    const doc = await res.json();
    const chocolate = parseFirestoreDocument(doc);

    if (!chocolate) return null;

    return await resolveMakerName(chocolate);
  } catch (error) {
    console.error('Error fetching chocolate:', error);
    return null;
  }
}

export async function getChocolateBySlugServer(slug) {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'chocolates' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'slug' },
                op: 'EQUAL',
                value: { stringValue: slug }
              }
            },
            limit: 1
          }
        }),
        next: { revalidate: 3600 }
      }
    );

    if (!res.ok) return null;

    const results = await res.json();
    const doc = results.find(r => r.document)?.document;
    if (!doc) return null;

    const chocolate = parseFirestoreDocument(doc);
    if (!chocolate) return null;

    return await resolveMakerName(chocolate);
  } catch (error) {
    console.error('Error fetching chocolate by slug:', error);
    return null;
  }
}

// Firestore auto-IDs are 20 chars of mixed-case letters/digits, never with
// hyphens; slugs are lowercase-with-hyphens. Try the likelier shape first,
// then fall back to the other so old links keep working during migration.
export async function resolveChocolateServer(param) {
  const looksLikeId = /^[A-Za-z0-9]{20}$/.test(param) && /[A-Z]/.test(param);

  if (looksLikeId) {
    return (
      (await getChocolateByIdServer(param)) ||
      (await getChocolateBySlugServer(param))
    );
  }
  return (
    (await getChocolateBySlugServer(param)) ||
    (await getChocolateByIdServer(param))
  );
}

/**
 * Fetch reviews for a chocolate (server-side)
 */
export async function getChocolateReviewsServer(chocolateId) {
  try {
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'reviews' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'chocolateId' },
            op: 'EQUAL',
            value: { stringValue: chocolateId }
          }
        },
        orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
        limit: 50
      }
    };

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        next: { revalidate: 3600 }
      }
    );

    if (!res.ok) return [];

    const results = await res.json();
    return results
      .filter(r => r.document)
      .map(r => parseFirestoreDocument(r.document))
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Fetch all chocolate document IDs (for sitemap and generateStaticParams)
 */
export async function getAllChocolateIdsServer() {
  try {
    // Cursor-paginated so chocolate #1001+ is never silently dropped from
    // the sitemap or static params.
    const all = [];
    let lastDocPath = null;

    for (let page = 0; page < 50; page++) {
      const structuredQuery = {
        from: [{ collectionId: 'chocolates' }],
        select: {
          fields: [
            { fieldPath: 'name' },
            { fieldPath: 'maker' },
            { fieldPath: 'slug' },
            { fieldPath: 'updatedAt' }
          ]
        },
        orderBy: [{ field: { fieldPath: '__name__' }, direction: 'ASCENDING' }],
        limit: 500
      };
      if (lastDocPath) {
        structuredQuery.startAt = {
          values: [{ referenceValue: lastDocPath }],
          before: false
        };
      }

      const res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ structuredQuery }),
          next: { revalidate: 86400 } // Cache for 24 hours
        }
      );

      if (!res.ok) break;

      const results = await res.json();
      const docs = results.filter(r => r.document);
      if (docs.length === 0) break;

      all.push(...docs.map(r => parseFirestoreDocument(r.document)).filter(Boolean));
      lastDocPath = docs[docs.length - 1].document.name;
      if (docs.length < 500) break;
    }

    return all;
  } catch (error) {
    console.error('Error fetching chocolate IDs:', error);
    return [];
  }
}

/**
 * Fetch featured chocolates (server-side, for homepage)
 */
export async function getFeaturedChocolatesServer(limitCount = 6) {
  try {
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'chocolates' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'averageRating' },
            op: 'GREATER_THAN',
            value: { doubleValue: 0 }
          }
        },
        orderBy: [
          { field: { fieldPath: 'averageRating' }, direction: 'DESCENDING' },
          { field: { fieldPath: 'reviewCount' }, direction: 'DESCENDING' }
        ],
        limit: limitCount
      }
    };

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        next: { revalidate: 3600 }
      }
    );

    if (!res.ok) return [];

    const results = await res.json();
    return results
      .filter(r => r.document)
      .map(r => parseFirestoreDocument(r.document))
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching featured chocolates:', error);
    return [];
  }
}

async function countCollection(collectionId) {
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runAggregationQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredAggregationQuery: {
          structuredQuery: { from: [{ collectionId }] },
          aggregations: [{ count: {}, alias: 'total' }]
        }
      }),
      next: { revalidate: 21600 } // 6 hours
    }
  );
  if (!res.ok) return null;
  const results = await res.json();
  const raw = results?.[0]?.result?.aggregateFields?.total?.integerValue;
  return raw != null ? parseInt(raw, 10) : null;
}

/**
 * Real site stats (computed, not hardcoded marketing numbers).
 */
export async function getSiteStatsServer() {
  try {
    const [chocolateCount, reviewCount, makers] = await Promise.all([
      countCollection('chocolates'),
      countCollection('reviews'),
      getAllMakersServer()
    ]);
    return {
      chocolates: chocolateCount,
      reviews: reviewCount,
      makers: makers.length || null
    };
  } catch (error) {
    console.error('Error fetching site stats:', error);
    return { chocolates: null, reviews: null, makers: null };
  }
}

/**
 * Distinct makers derived from the chocolates collection, with bar counts.
 * Maker slug = slugified maker name.
 */
export async function getAllMakersServer() {
  const chocolates = await getAllChocolateIdsServer();
  const makers = new Map();

  for (const choc of chocolates) {
    const name = (choc.maker || '').trim();
    if (!name || name === 'Unknown Maker') continue;
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 80);
    if (!slug) continue;

    const existing = makers.get(slug);
    if (existing) {
      existing.barCount++;
    } else {
      makers.set(slug, { slug, name, barCount: 1 });
    }
  }

  return [...makers.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMakerBySlugServer(slug) {
  const makers = await getAllMakersServer();
  return makers.find((m) => m.slug === slug) || null;
}

/**
 * First page of the browse catalog, server-side, for SSR + crawlers.
 * Card-level fields only to keep the payload lean.
 */
export async function getBrowseChocolatesServer(limitCount = 100) {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'chocolates' }],
            select: {
              fields: [
                { fieldPath: 'name' },
                { fieldPath: 'maker' },
                { fieldPath: 'slug' },
                { fieldPath: 'type' },
                { fieldPath: 'origin' },
                { fieldPath: 'cacaoPercentage' },
                { fieldPath: 'imageUrl' },
                { fieldPath: 'averageRating' },
                { fieldPath: 'reviewCount' }
              ]
            },
            orderBy: [{ field: { fieldPath: 'reviewCount' }, direction: 'DESCENDING' }],
            limit: limitCount
          }
        }),
        next: { revalidate: 21600 } // 6 hours
      }
    );

    if (!res.ok) return [];

    const results = await res.json();
    return results
      .filter(r => r.document)
      .map(r => parseFirestoreDocument(r.document))
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching browse chocolates:', error);
    return [];
  }
}

async function runChocolatesQuery(fieldFilter, limitCount, orderByRating) {
  const structuredQuery = {
    from: [{ collectionId: 'chocolates' }],
    where: { fieldFilter },
    limit: limitCount
  };
  if (orderByRating) {
    structuredQuery.orderBy = [
      { field: { fieldPath: 'averageRating' }, direction: 'DESCENDING' }
    ];
  }

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
      next: { revalidate: 21600 } // Cache for 6 hours
    }
  );

  if (!res.ok) {
    // Surface WHY (a missing composite index returns 400 with a
    // create-index link) instead of silently rendering an empty page.
    const errText = await res.text().catch(() => '');
    console.error(
      `Firestore category query failed (${res.status}) for`,
      JSON.stringify(fieldFilter),
      errText.slice(0, 500)
    );
    return null;
  }

  const results = await res.json();
  return results
    .filter(r => r.document)
    .map(r => parseFirestoreDocument(r.document))
    .filter(Boolean);
}

/**
 * Fetch chocolates by category (server-side)
 */
export async function getChocolatesByCategoryServer(field, value, limitCount = 100) {
  try {
    // Numbers (e.g. cacaoPercentage) need integerValue, not stringValue.
    const fieldFilter = {
      field: { fieldPath: field },
      op: 'EQUAL',
      value:
        typeof value === 'number'
          ? { integerValue: String(value) }
          : { stringValue: value }
    };

    let docs = await runChocolatesQuery(fieldFilter, limitCount, true);

    // The ordered query needs a composite index; while it's missing, fall
    // back to an unordered query and sort here so the page still renders.
    if (docs === null) {
      docs = await runChocolatesQuery(fieldFilter, limitCount, false);
      if (docs) {
        docs.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      }
    }

    return docs || [];
  } catch (error) {
    console.error('Error fetching chocolates by category:', error);
    return [];
  }
}
