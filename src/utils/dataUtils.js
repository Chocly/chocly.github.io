// src/utils/dataUtils.js
import { searchChocolateProducts, searchByBrand } from '../services/openFoodFactsService';

export const enrichChocolateData = async (chocolate) => {
  try {
    // Try to find a match by name and maker
    const searchQuery = `${chocolate.name} ${chocolate.maker}`;
    let products = await searchChocolateProducts(searchQuery);
    
    // If no results, try searching just by brand (maker)
    if (!products || products.length === 0) {
      products = await searchByBrand(chocolate.maker);
    }
    
    // Find the best match from returned products
    const bestMatch = findBestMatch(products, chocolate.name);
    
    if (bestMatch) {
      // Merge data, prioritizing your existing data
      return {
        ...chocolate,
        barcode: bestMatch.code || chocolate.barcode,
        imageUrl: bestMatch.image_url || chocolate.imageUrl,
        ingredients: chocolate.ingredients || formatIngredients(bestMatch.ingredients_text),
        // Add any other fields you want from Open Food Facts
        nutrimentData: bestMatch.nutriments || {},
        additionalImages: bestMatch.images || {},
        // Add OpenFoodFacts ID for future reference
        openFoodFactsId: bestMatch._id
      };
    }
    
    // Return original data if no match found
    return chocolate;
  } catch (error) {
    console.error("Error enriching chocolate data:", error);
    // Return original data in case of error
    return chocolate;
  }
};

// Helper function to find the best match from a list of products
const findBestMatch = (products, chocolateName) => {
  if (!products || products.length === 0) return null;
  
  // Simple matching algorithm - you can improve this based on your needs
  const lowerCaseName = chocolateName.toLowerCase();
  
  // Sort products by similarity score
  const scoredProducts = products.map(product => {
    const productName = (product.product_name || "").toLowerCase();
    const score = calculateSimilarity(lowerCaseName, productName);
    return { product, score };
  }).sort((a, b) => b.score - a.score);
  
  // Return the product with the highest score if it's above a threshold
  return scoredProducts[0].score > 0.5 ? scoredProducts[0].product : null;
};

// Simple string similarity function
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  let matchCount = 0;
  words1.forEach(word => {
    if (words2.includes(word)) matchCount++;
  });
  
  return matchCount / Math.max(words1.length, words2.length);
};

// Helper to format ingredients from API
const formatIngredients = (ingredientsText) => {
  if (!ingredientsText) return [];
  return ingredientsText.split(',').map(item => item.trim());
};