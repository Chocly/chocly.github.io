// scripts/debugBarcode.js
import axios from 'axios';

/**
 * Test if an image URL actually works
 */
const testImageUrl = async (url) => {
  try {
    console.log(`Testing: ${url}`);
    const response = await axios.head(url, { timeout: 5000 });
    console.log(`✅ Status: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
};

/**
 * Debug a specific barcode to see what images are available
 */
const debugBarcode = async (barcode) => {
  console.log(`\n🔍 Debugging barcode: ${barcode}`);
  console.log(`Length: ${barcode.length}`);
  
  // Format the barcode for path construction
  let formattedPath;
  if (barcode.length === 13) {
    formattedPath = `${barcode.slice(0, 3)}/${barcode.slice(3, 6)}/${barcode.slice(6, 9)}/${barcode.slice(9, 13)}`;
    console.log(`Formatted path (13-digit): ${formattedPath}`);
  } else if (barcode.length === 12) {
    // For 12-digit barcodes, try padding with 0 to make 13 digits
    const paddedBarcode = '0' + barcode;
    formattedPath = `${paddedBarcode.slice(0, 3)}/${paddedBarcode.slice(3, 6)}/${paddedBarcode.slice(6, 9)}/${paddedBarcode.slice(9, 13)}`;
    console.log(`Formatted path (12-digit padded): ${formattedPath}`);
  } else {
    formattedPath = barcode;
    console.log(`Formatted path (other): ${formattedPath}`);
  }
  
  // Test all possible image URLs
  const imageTypes = [
    'front.400',
    'front.200', 
    'front',
    '1.400',
    '1.200',
    '1',
    '2.400',
    '2',
    '3.400',
    '3',
    'packaging.400',
    'packaging'
  ];
  
  const baseUrl = `https://images.openfoodfacts.org/images/products/${formattedPath}`;
  console.log(`\nBase URL: ${baseUrl}`);
  
  console.log(`\n📸 Testing image URLs:`);
  
  const workingUrls = [];
  
  for (const imageType of imageTypes) {
    const imageUrl = `${baseUrl}/${imageType}.jpg`;
    const works = await testImageUrl(imageUrl);
    
    if (works) {
      workingUrls.push(imageUrl);
    }
    
    // Small delay to be nice to their servers
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n🎉 Working URLs found: ${workingUrls.length}`);
  workingUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  if (workingUrls.length === 0) {
    console.log(`\n🤔 No working direct URLs found. Let's try some alternatives:`);
    
    // Try without the path formatting (sometimes works for shorter barcodes)
    const alternativeBase = `https://images.openfoodfacts.org/images/products/${barcode}`;
    console.log(`\nTrying alternative base: ${alternativeBase}`);
    
    for (const imageType of ['front.400', 'front', '1.400', '1']) {
      const altUrl = `${alternativeBase}/${imageType}.jpg`;
      const works = await testImageUrl(altUrl);
      if (works) {
        workingUrls.push(altUrl);
      }
    }
  }
  
  return workingUrls;
};

// Get barcode from command line
const barcode = process.argv[2];

if (!barcode) {
  console.log('Usage: node debugBarcode.js <barcode>');
  console.log('Example: node debugBarcode.js 850008751134');
  process.exit(1);
}

debugBarcode(barcode).then((urls) => {
  if (urls.length > 0) {
    console.log(`\n✅ Found ${urls.length} working image URL(s) for barcode ${barcode}`);
    console.log(`Best URL: ${urls[0]}`);
  } else {
    console.log(`\n❌ No working image URLs found for barcode ${barcode}`);
    console.log(`This might mean:`);
    console.log(`- The barcode path format is different`);
    console.log(`- Images exist but in different formats`);
    console.log(`- Images are only available through the API`);
  }
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});