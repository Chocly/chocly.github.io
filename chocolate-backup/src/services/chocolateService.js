// Update src/services/chocolateFirebaseService.js
import { enrichChocolateData } from '../utils/dataUtils';
import { getProductByBarcode } from '../services/openFoodFactsService';

// Modify your existing getChocolateById function
export const getChocolateById = async (id) => {
  const docRef = doc(db, 'chocolates', id);
  const snapshot = await getDoc(docRef);
  
  if (snapshot.exists()) {
    const chocolateData = {
      id: snapshot.id,
      ...snapshot.data()
    };
    
    // Enrich data with Open Food Facts
    const enrichedData = await enrichChocolateData(chocolateData);
    return enrichedData;
  } else {
    throw new Error('Chocolate not found');
  }
};

// Add a new function to get chocolate by barcode
export const getChocolateByBarcode = async (barcode) => {
  try {
    // First check if we already have this barcode in our database
    const q = query(chocolatesCollection, where("barcode", "==", barcode));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // We already have this chocolate
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    // If not in our database, fetch from Open Food Facts
    const productData = await getProductByBarcode(barcode);
    
    if (productData) {
      // Format data from Open Food Facts to match our schema
      const newChocolate = {
        name: productData.product_name || "Unknown",
        maker: productData.brands || "Unknown",
        type: determineChocolateType(productData),
        origin: productData.origins || "Unknown",
        cacaoPercentage: extractCacaoPercentage(productData),
        description: productData.generic_name || "",
        ingredients: formatIngredients(productData.ingredients_text),
        imageUrl: productData.image_url,
        barcode: barcode,
        openFoodFactsId: productData._id,
        averageRating: 0,
        reviewCount: 0,
        // Add more fields as needed
      };
      
      // Save to our database (optional - you might want to review before saving)
      const docRef = await addDoc(chocolatesCollection, {
        ...newChocolate,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return {
        id: docRef.id,
        ...newChocolate
      };
    }
    
    throw new Error('Chocolate not found with this barcode');
  } catch (error) {
    console.error("Error in getChocolateByBarcode:", error);
    throw error;
  }
};

// Helper function to determine chocolate type
const determineChocolateType = (productData) => {
  const name = productData.product_name?.toLowerCase() || "";
  const category = productData.categories?.toLowerCase() || "";
  
  if (name.includes("dark") || category.includes("dark chocolate")) return "Dark";
  if (name.includes("milk") || category.includes("milk chocolate")) return "Milk";
  if (name.includes("white") || category.includes("white chocolate")) return "White";
  if (name.includes("ruby") || category.includes("ruby chocolate")) return "Ruby";
  
  return "Unknown";
};

// Helper function to extract cacao percentage
const extractCacaoPercentage = (productData) => {
  // Try to extract from the product name
  const name = productData.product_name || "";
  const percentMatch = name.match(/(\d+)%/);
  
  if (percentMatch && percentMatch[1]) {
    return parseInt(percentMatch[1]);
  }
  
  // Try to find in nutriments or other fields
  if (productData.nutriments && productData.nutriments.cocoa) {
    return productData.nutriments.cocoa;
  }
  
  return 0; // Default if we can't determine
};