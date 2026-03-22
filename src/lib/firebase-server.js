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
export async function getChocolateByIdServer(id) {
  try {
    const res = await fetch(`${FIRESTORE_BASE}/chocolates/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) return null;

    const doc = await res.json();
    const chocolate = parseFirestoreDocument(doc);

    if (!chocolate) return null;

    // Resolve maker name if it's a reference (legacy chocolates)
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
  } catch (error) {
    console.error('Error fetching chocolate:', error);
    return null;
  }
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
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'chocolates' }],
        select: { fields: [{ fieldPath: 'name' }, { fieldPath: 'maker' }] },
        limit: 1000
      }
    };

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    );

    if (!res.ok) return [];

    const results = await res.json();
    return results
      .filter(r => r.document)
      .map(r => parseFirestoreDocument(r.document))
      .filter(Boolean);
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

/**
 * Fetch chocolates by category (server-side)
 */
export async function getChocolatesByCategoryServer(field, value, limitCount = 100) {
  try {
    const body = {
      structuredQuery: {
        from: [{ collectionId: 'chocolates' }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: 'EQUAL',
            value: { stringValue: value }
          }
        },
        orderBy: [{ field: { fieldPath: 'averageRating' }, direction: 'DESCENDING' }],
        limit: limitCount
      }
    };

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        next: { revalidate: 21600 } // Cache for 6 hours
      }
    );

    if (!res.ok) return [];

    const results = await res.json();
    return results
      .filter(r => r.document)
      .map(r => parseFirestoreDocument(r.document))
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching chocolates by category:', error);
    return [];
  }
}
