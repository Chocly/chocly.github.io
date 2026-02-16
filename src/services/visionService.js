// src/services/visionService.js — Gemini Vision API + fuzzy database matching
import * as fuzz from 'fuzzball';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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

/**
 * Convert a File or Blob to a base64 string (without the data URI prefix).
 */
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * Parse Gemini's text response into structured data.
 * Handles markdown code fences and malformed JSON gracefully.
 */
const parseGeminiResponse = (responseText) => {
  let cleaned = responseText.trim();
  // Strip markdown code fences if present
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
};

/**
 * Send an image to Gemini Vision and extract chocolate details.
 * @param {File|Blob} imageFile
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export const analyzeChocolateImage = async (imageFile) => {
  if (!GEMINI_API_KEY) {
    return { success: false, error: 'Gemini API key not configured' };
  }

  try {
    const base64 = await toBase64(imageFile);
    const mimeType = imageFile.type || 'image/jpeg';

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
      return { success: false, error: 'Too many requests. Please wait a moment and try again.' };
    }

    if (!response.ok) {
      return { success: false, error: `API error (${response.status}). Please try again.` };
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return { success: false, error: 'No response from AI. Please try a different photo.' };
    }

    return parseGeminiResponse(text);
  } catch (err) {
    if (err instanceof TypeError) {
      return { success: false, error: 'Network error. Check your connection and try again.' };
    }
    return { success: false, error: 'Failed to identify chocolate. Please try again.' };
  }
};

/**
 * Score a single chocolate against the Gemini vision result.
 * Returns 0–100.
 */
const scoreChocolate = (chocolate, visionData) => {
  let totalScore = 0;
  let maxPossible = 0;

  // Brand/Maker match (40 points)
  if (visionData.brand && chocolate.maker) {
    const brandLower = visionData.brand.toLowerCase();
    const makerLower = chocolate.maker.toLowerCase();
    const brandScore = Math.max(
      fuzz.token_set_ratio(brandLower, makerLower),
      fuzz.partial_ratio(brandLower, makerLower)
    );
    totalScore += (brandScore / 100) * 40;
    maxPossible += 40;
  }

  // Product name match (40 points)
  if (visionData.productName && chocolate.name) {
    const nameLower = visionData.productName.toLowerCase();
    const chocolateNameLower = chocolate.name.toLowerCase();
    const nameScore = Math.max(
      fuzz.token_set_ratio(nameLower, chocolateNameLower),
      fuzz.partial_ratio(nameLower, chocolateNameLower)
    );
    totalScore += (nameScore / 100) * 40;
    maxPossible += 40;
  }

  // Type match (10 points)
  if (visionData.type && chocolate.type) {
    const typeScore = fuzz.ratio(
      visionData.type.toLowerCase(),
      chocolate.type.toLowerCase()
    );
    totalScore += (typeScore / 100) * 10;
    maxPossible += 10;
  }

  // Cacao percentage match (10 points)
  if (visionData.cacaoPercentage != null && chocolate.cocoaPercent) {
    const diff = Math.abs(visionData.cacaoPercentage - chocolate.cocoaPercent);
    const percentScore = diff <= 2 ? 100 : diff <= 5 ? 50 : 0;
    totalScore += (percentScore / 100) * 10;
    maxPossible += 10;
  }

  return maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;
};

/**
 * Fuzzy-match Gemini's extracted data against the local chocolate database.
 * @param {object} visionData — { brand, productName, type, cacaoPercentage, origin, confidence }
 * @param {Array} chocolateDatabase — array of chocolate objects with name, maker, type, cocoaPercent
 * @returns {Array} — top matches with matchScore added, sorted descending
 */
export const findMatchingChocolates = (visionData, chocolateDatabase) => {
  if (!visionData.brand && !visionData.productName) {
    return [];
  }

  return chocolateDatabase
    .map((chocolate) => ({
      ...chocolate,
      matchScore: scoreChocolate(chocolate, visionData),
    }))
    .filter((c) => c.matchScore > 30)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);
};
