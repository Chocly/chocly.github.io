// src/scripts/enrichChocolateDatabase.js
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { enrichChocolateData } from '../utils/dataUtils';

const enrichChocolateDatabase = async () => {
  try {
    console.log('Starting database enrichment process...');
    
    // Get all chocolates
    const chocolatesCollection = collection(db, 'chocolates');
    const snapshot = await getDocs(chocolatesCollection);
    
    if (snapshot.empty) {
      console.log('No chocolates found in database.');
      return;
    }
    
    console.log(`Found ${snapshot.size} chocolates to process.`);
    
    // Process each chocolate
    let processed = 0;
    let enriched = 0;
    
    for (const chocolateDoc of snapshot.docs) {
      const chocolate = {
        id: chocolateDoc.id,
        ...chocolateDoc.data()
      };
      
      console.log(`Processing [${++processed}/${snapshot.size}]: ${chocolate.name}`);
      
      // Skip chocolates that already have barcode and image
      if (chocolate.barcode && chocolate.imageUrl) {
        console.log(`- Already has barcode and image, skipping`);
        continue;
      }
      
      // Enrich the chocolate data
      const enrichedChocolate = await enrichChocolateData(chocolate);
      
      // Check if anything changed
      if (JSON.stringify(enrichedChocolate) !== JSON.stringify(chocolate)) {
        // Update the document with enriched data
        const chocolateRef = doc(db, 'chocolates', chocolate.id);
        
        // Remove the id from the data (it's part of the document reference)
        const { id, ...updateData } = enrichedChocolate;
        
        await updateDoc(chocolateRef, {
          ...updateData,
          updatedAt: new Date()
        });
        
        console.log(`- Updated with barcode: ${enrichedChocolate.barcode || 'None'}`);
        console.log(`- Updated with image: ${enrichedChocolate.imageUrl ? 'Yes' : 'No'}`);
        enriched++;
      } else {
        console.log(`- No matching data found in Open Food Facts`);
      }
      
      // Add a delay to avoid API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Enrichment complete! Processed ${processed} chocolates, enriched ${enriched}.`);
    
  } catch (error) {
    console.error("Error enriching database:", error);
  }
};

export default enrichChocolateDatabase;