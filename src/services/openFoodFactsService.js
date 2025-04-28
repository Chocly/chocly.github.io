// src/services/openFoodFactsService.js
const BASE_URL = 'https://world.openfoodfacts.org/api/v2';

// Function to search for chocolate products
export const searchChocolateProducts = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search?categories_tags=chocolates&search_terms=${query}&json=true`);
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error searching chocolate products:", error);
    throw error;
  }
};

// Function to get product by barcode
export const getProductByBarcode = async (barcode) => {
  try {
    const response = await fetch(`${BASE_URL}/product/${barcode}.json`);
    const data = await response.json();
    
    // Check if product exists
    if (data.status === 0) {
      throw new Error("Product not found");
    }
    
    return data.product;
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    throw error;
  }
};

// Function to search by brand name (chocolate maker)
export const searchByBrand = async (brand) => {
  try {
    const response = await fetch(`${BASE_URL}/search?categories_tags=chocolates&brands=${brand}&json=true`);
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error searching by brand:", error);
    throw error;
  }
};