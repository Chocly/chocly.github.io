// src/services/visionService.js — chocolate label identification + fuzzy matching.
// Image analysis happens server-side (/api/scan) so no AI keys ship to the
// browser; this module just uploads the photo and interprets the result.
import * as fuzz from 'fuzzball';

/**
 * Send an image to the server-side scanner and extract chocolate details.
 * @param {File|Blob} imageFile
 * @returns {{ success: boolean, data?: object, error?: string }}
 */
export const analyzeChocolateImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/api/scan', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json().catch(() => null);

    if (!result) {
      return { success: false, error: 'Unexpected server response. Please try again.' };
    }

    return result;
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
