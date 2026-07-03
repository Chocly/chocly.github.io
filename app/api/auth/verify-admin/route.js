import { NextResponse } from 'next/server';
import { isAdminUid } from '../../../../src/config/adminConfig.server';

// Verifies a Firebase ID token server-side (via the Identity Toolkit REST API,
// which validates signature + expiry) and checks the UID against the
// server-only admin list. No Admin SDK credentials required.
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!idToken) {
      return NextResponse.json({ admin: false, error: 'Missing token' }, { status: 401 });
    }
    if (!API_KEY) {
      return NextResponse.json({ admin: false, error: 'Server misconfigured' }, { status: 500 });
    }

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      return NextResponse.json({ admin: false, error: 'Invalid token' }, { status: 401 });
    }

    const data = await res.json();
    const uid = data?.users?.[0]?.localId;

    if (!isAdminUid(uid)) {
      return NextResponse.json({ admin: false }, { status: 403 });
    }

    return NextResponse.json({ admin: true, uid });
  } catch (error) {
    console.error('verify-admin failed:', error);
    return NextResponse.json({ admin: false, error: 'Verification failed' }, { status: 500 });
  }
}
