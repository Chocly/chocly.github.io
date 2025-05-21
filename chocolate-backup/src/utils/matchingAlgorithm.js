// src/utils/matchingAlgorithm.js
import * as fuzzball from 'fuzzball';
/**
 * Calculate a match score between a chocolate from our database and a potential match from Open Food Facts
 * @param {Object} ourChocolate - Chocolate from our database
 * @param {Object} offChocolate - Chocolate from Open Food Facts
 * @returns {Number} - Score representing match confidence (0-100)
 */
export const calculateMatchScore = (ourChocolate, offChocolate) => {
  let totalScore = 0;
  
  // 1. Brand matching (max 40 points)
  // If the brand names are similar, give points based on similarity
  const brandScore = fuzzball.ratio(
    (ourChocolate.maker || '').toLowerCase(), 
    (offChocolate.brands || '').toLowerCase()
  );
  totalScore += (brandScore / 100) * 40; // Convert 0-100 to 0-40 points
  
  // 2. Product name matching (max 30 points)
  const nameScore = fuzzball.ratio(
    (ourChocolate.name || '').toLowerCase(), 
    (offChocolate.product_name || '').toLowerCase()
  );
  totalScore += (nameScore / 100) * 30; // Convert 0-100 to 0-30 points
  
  // 3. Cacao percentage matching (max 20 points)
  if (ourChocolate.cacaoPercentage && offChocolate.cacao_percentage) {
    // If percentages are within 2%, give full points
    const percentageDifference = Math.abs(
      parseFloat(ourChocolate.cacaoPercentage) - 
      parseFloat(offChocolate.cacao_percentage)
    );
    
    if (percentageDifference <= 2) {
      totalScore += 20;
    } else if (percentageDifference <= 5) {
      totalScore += 10;
    }
  }
  
  // 4. Chocolate type matching (max 10 points)
  if (ourChocolate.type && offChocolate.categories) {
    const offCategories = offChocolate.categories.toLowerCase();
    const ourType = ourChocolate.type.toLowerCase();
    
    // Check if type is mentioned in categories
    if (
      (ourType.includes('dark') && offCategories.includes('dark chocolate')) ||
      (ourType.includes('milk') && offCategories.includes('milk chocolate')) ||
      (ourType.includes('white') && offCategories.includes('white chocolate'))
    ) {
      totalScore += 10;
    }
  }
  
  return totalScore;
};

// Add this to matchingAlgorithm.js

/**
 * Search Open Food Facts API for potential matches to our chocolate
 * @param {Object} chocolate - Chocolate from our database
 * @returns {Promise<Array>} - Array of potential matches with scores
 */
export const findPotentialMatches = async (chocolate) => {
    try {
      // Build search query based on available data
      const searchTerms = [];
      
      if (chocolate.maker) {
        searchTerms.push(chocolate.maker);
      }
      
      if (chocolate.name) {
        searchTerms.push(chocolate.name);
      }
      
      if (chocolate.type) {
        searchTerms.push(chocolate.type + " chocolate");
      }
      
      // If we have cacao percentage, add it to the search
      if (chocolate.cacaoPercentage) {
        searchTerms.push(chocolate.cacaoPercentage + "%");
      }
      
      // Create the search query
      const searchQuery = encodeURIComponent(searchTerms.join(' '));
      
      // Make API call to Open Food Facts
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&json=1&page_size=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Open Food Facts API');
      }
      
      const data = await response.json();
      
      // If no products found, return empty array
      if (!data.products || data.products.length === 0) {
        return [];
      }
      
      // Calculate match scores for each product
      const potentialMatches = data.products.map(product => {
        const score = calculateMatchScore(chocolate, product);
        
        return {
          offProduct: product,
          score,
          // Make it easier to see what we're matching
          matchDetails: {
            ourChocolate: {
              brand: chocolate.maker,
              name: chocolate.name,
              type: chocolate.type,
              cacaoPercentage: chocolate.cacaoPercentage
            },
            offChocolate: {
              brand: product.brands,
              name: product.product_name,
              categories: product.categories,
              cacaoPercentage: product.cacao_percentage
            }
          }
        };
      });
      
      // Sort by score (highest first)
      return potentialMatches.sort((a, b) => b.score - a.score);
      
    } catch (error) {
      console.error('Error finding potential matches:', error);
      return [];
    }
  };

  // Add this to matchingAlgorithm.js

/**
 * Process a batch of chocolates to find matches in Open Food Facts
 * @param {Array} chocolates - Array of chocolates from our database
 * @returns {Promise<Object>} - Results categorized by confidence level
 */
export const processBatchForMatching = async (chocolates) => {
    // Define confidence thresholds
    const HIGH_CONFIDENCE = 70;
    const MEDIUM_CONFIDENCE = 40;
    
    // Results object
    const results = {
      highConfidence: [], // Automatic matches
      mediumConfidence: [], // Quick review needed
      lowConfidence: [], // Manual review needed
      noMatches: [] // No potential matches found
    };
    
    // Process each chocolate
    for (const chocolate of chocolates) {
      const potentialMatches = await findPotentialMatches(chocolate);
      
      if (potentialMatches.length === 0) {
        // No matches found
        results.noMatches.push({
          ourChocolate: chocolate,
          potentialMatches: []
        });
        continue;
      }
      
      // Get the top match
      const topMatch = potentialMatches[0];
      
      if (topMatch.score >= HIGH_CONFIDENCE) {
        // High confidence match
        results.highConfidence.push({
          ourChocolate: chocolate,
          topMatch: topMatch,
          allMatches: potentialMatches
        });
      } else if (topMatch.score >= MEDIUM_CONFIDENCE) {
        // Medium confidence match
        results.mediumConfidence.push({
          ourChocolate: chocolate,
          topMatch: topMatch,
          allMatches: potentialMatches
        });
      } else {
        // Low confidence match
        results.lowConfidence.push({
          ourChocolate: chocolate,
          topMatch: topMatch,
          allMatches: potentialMatches
        });
      }
    }
    
    return results;
  };

  // Add this to matchingAlgorithm.js

/**
 * Test the matching algorithm with a single chocolate
 * @param {Object} chocolate - Chocolate from our database to test
 */
export const testMatchingAlgorithm = async (chocolate) => {
    console.log('Testing matching algorithm with:', chocolate);
    
    const potentialMatches = await findPotentialMatches(chocolate);
    
    console.log('Potential matches found:', potentialMatches.length);
    
    if (potentialMatches.length > 0) {
      console.log('Top match:');
      console.log('- Score:', potentialMatches[0].score);
      console.log('- OFF Product:', {
        name: potentialMatches[0].offProduct.product_name,
        brand: potentialMatches[0].offProduct.brands,
        image: potentialMatches[0].offProduct.image_url,
        categories: potentialMatches[0].offProduct.categories
      });
    }
    
    return potentialMatches;
  };

  // Add this to matchingAlgorithm.js

/**
 * Merge data from Open Food Facts into our chocolate object
 * @param {Object} ourChocolate - Chocolate from our database
 * @param {Object} offProduct - Matched product from Open Food Facts
 * @returns {Object} - Merged chocolate data
 */
export const mergeChocolateData = (ourChocolate, offProduct) => {
    // Create a copy of our chocolate
    const mergedChocolate = { ...ourChocolate };
    
    // Add barcode
    if (offProduct.code) {
      mergedChocolate.barcode = offProduct.code;
    }
    
    // Add image URL if we don't have one
    if (!mergedChocolate.imageUrl && offProduct.image_url) {
      mergedChocolate.imageUrl = offProduct.image_url;
    }
    
    // Add origin country if we don't have it
    if (!mergedChocolate.origin && offProduct.countries) {
      mergedChocolate.origin = offProduct.countries;
    }
    
    // Add ingredients if we don't have them
    if (!mergedChocolate.ingredients && offProduct.ingredients_text) {
      mergedChocolate.ingredients = offProduct.ingredients_text
        .split(',')
        .map(ingredient => ingredient.trim());
    }
    
    // Add nutrition info if we don't have it
    if (!mergedChocolate.nutritionalInfo && offProduct.nutriments) {
      mergedChocolate.nutritionalInfo = {
        servingSize: offProduct.serving_size || '100g',
        calories: offProduct.nutriments.energy_value || 0,
        fat: offProduct.nutriments.fat_value || 0,
        sugar: offProduct.nutriments.sugars_value || 0,
        protein: offProduct.nutriments.proteins_value || 0
      };
    }
    
    // Store reference to Open Food Facts
    mergedChocolate.openFoodFactsId = offProduct.code;
    
    return mergedChocolate;
  };