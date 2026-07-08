import { NextResponse } from 'next/server';

// Server-side proxy for the chocolate label scanner. The Gemini API key lives
// only here (GEMINI_API_KEY, no NEXT_PUBLIC_ prefix) and is never shipped to
// the browser.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const PROMPT = `You are a chocolate product identifier. Analyze this image of chocolate packaging or a chocolate bar label.

Extract the following information and return ONLY a valid JSON object with no additional text:

{
  "brand": "The manufacturer or brand name (e.g., Lindt, Ghirardelli, Valrhona)",
  "productName": "The specific product name (e.g., Excellence 85% Cocoa, Sea Salt Dark)",
  "type": "One of: Dark, Milk, White, Dark Milk, Ruby, or Other",
  "cacaoPercentage": numeric percentage if visible (e.g., 72), or null,
  "origin": "Country or region of origin if stated (e.g., Ecuador, Madagascar), or null",
  "confidence": "high, medium, or low - how confident you are in this identification"
}

If this is not a chocolate product or you cannot identify it, return:
{"brand": null, "productName": null, "type": null, "cacaoPercentage": null, "origin": null, "confidence": "none"}`;

// Best-effort per-IP rate limit (resets on redeploy/cold start — first layer
// of defense, not the only one).
const RATE_LIMIT = 10; // scans per window
const RATE_WINDOW_MS = 60 * 1000;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function parseGeminiResponse(responseText) {
  let cleaned = responseText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  try {
    const parsed = JSON.parse(cleaned);
    return {
      success: true,
      data: {
        brand: parsed.brand || null,
        productName: parsed.productName || null,
        type: parsed.type || null,
        cacaoPercentage: parsed.cacaoPercentage ?? null,
        origin: parsed.origin || null,
        confidence: parsed.confidence || 'low',
      },
    };
  } catch {
    return { success: false, error: 'Failed to parse AI response' };
  }
}

export async function POST(request) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Scanner is not configured.' },
        { status: 500 }
      );
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (rateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many scans. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json(
        { success: false, error: 'No image provided.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image is too large (max 8MB).' },
        { status: 413 }
      );
    }
    const mimeType = file.type || 'image/jpeg';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
        },
      }),
    });

    if (response.status === 429) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `AI service error. Please try again.` },
        { status: 502 }
      );
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No response from AI. Please try a different photo.' },
        { status: 502 }
      );
    }

    return NextResponse.json(parseGeminiResponse(text));
  } catch (error) {
    console.error('Scan failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to identify chocolate. Please try again.' },
      { status: 500 }
    );
  }
}
