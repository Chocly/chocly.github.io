// src/scripts/addInitialChocolates.js
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';

const addInitialChocolates = async () => {
  console.log('Starting to add initial chocolates...');
  
  // First, get all makers and tags to find their IDs
  const makersSnapshot = await getDocs(collection(db, 'makers'));
  const tagsSnapshot = await getDocs(collection(db, 'tags'));
  
  // Create maps of maker and tag names to their IDs for easy lookup
  const makers = {};
  makersSnapshot.forEach(doc => {
    makers[doc.data().name] = doc.id;
  });
  
  const tags = {};
  tagsSnapshot.forEach(doc => {
    tags[doc.data().name] = doc.id;
  });
  
  console.log('Loaded makers and tags');
  
  // Define the chocolate data
  const chocolatesData = [
    {
      name: "Valrhona Guanaja 70%",
      makerId: makers["Valrhona"],
      type: "Dark",
      origin: "Blend (South America and Caribbean)",
      cacaoPercentage: 70,
      description: "A complex dark chocolate with intense bittersweet notes and hints of red fruits and coffee. Renowned among pastry chefs worldwide for its depth of flavor.",
      ingredients: "Cocoa beans, sugar, cocoa butter, soy lecithin, vanilla extract",
      tagIds: [tags["Dark"], tags["Fruity"], tags["Earthy"], tags["Single Origin"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Lindt Excellence 85% Cocoa",
      makerId: makers["Lindt"],
      type: "Dark",
      origin: "Various African and South American regions",
      cacaoPercentage: 85,
      description: "A robust dark chocolate with pronounced cocoa flavor, low sweetness, and subtle notes of dried fruit.",
      ingredients: "Chocolate, cocoa powder, cocoa butter, sugar, vanilla",
      tagIds: [tags["Dark"], tags["Earthy"], tags["Woody"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Godiva Signature Dark Chocolate",
      makerId: makers["Godiva"],
      type: "Dark",
      origin: "Blend (West Africa)",
      cacaoPercentage: 72,
      description: "A balanced dark chocolate with a smooth melt and refined flavor profile featuring subtle vanilla notes.",
      ingredients: "Cocoa mass, sugar, cocoa butter, soy lecithin, natural vanilla flavor",
      tagIds: [tags["Dark"], tags["Vanilla"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ghirardelli Intense Dark Midnight Reverie",
      makerId: makers["Ghirardelli"],
      type: "Dark",
      origin: "Blend (South America)",
      cacaoPercentage: 86,
      description: "An intensely dark chocolate with a full-bodied taste that reveals deep cocoa notes with minimal sweetness.",
      ingredients: "Unsweetened chocolate, cocoa butter, sugar, milk fat, soy lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Bittersweet"], tags["Earthy"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Theo Pure 70% Dark Chocolate",
      makerId: makers["Theo Chocolate"],
      type: "Dark",
      origin: "Congo and Peru",
      cacaoPercentage: 70,
      description: "Ethically sourced organic chocolate with bright fruity notes, a clean finish, and medium intensity.",
      ingredients: "Cocoa beans, cane sugar, cocoa butter",
      tagIds: [tags["Dark"], tags["Fruity"], tags["Organic"], tags["Fair Trade"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Amedei Porcelana",
      makerId: makers["Amedei"],
      type: "Dark",
      origin: "Venezuela (Criollo beans)",
      cacaoPercentage: 70,
      description: "One of the world's most exclusive chocolates, made from rare white Porcelana beans. Offers delicate floral notes with remarkable smoothness.",
      ingredients: "Cocoa mass, cane sugar, cocoa butter, vanilla",
      tagIds: [tags["Dark"], tags["Floral"], tags["Single Origin"], tags["Bean to Bar"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Mast Brothers Brooklyn Blend",
      makerId: makers["Mast Brothers"],
      type: "Dark",
      origin: "Blend (Dominican Republic, Madagascar, Venezuela)",
      cacaoPercentage: 73,
      description: "Artisanal chocolate with a distinctive flavor profile featuring notes of dried cherries, tobacco, and leather.",
      ingredients: "Cacao, cane sugar",
      tagIds: [tags["Dark"], tags["Fruity"], tags["Earthy"], tags["Bean to Bar"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Dandelion Ambanja, Madagascar",
      makerId: makers["Dandelion Chocolate"],
      type: "Dark",
      origin: "Madagascar",
      cacaoPercentage: 70,
      description: "Single-origin chocolate with bright citrus and raspberry notes characteristic of Madagascar beans.",
      ingredients: "Cocoa beans, cane sugar",
      tagIds: [tags["Dark"], tags["Fruity"], tags["Citrus"], tags["Berry"], tags["Single Origin"], tags["Bean to Bar"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Marou Tien Giang 70%",
      makerId: makers["Marou"],
      type: "Dark",
      origin: "Tien Giang, Vietnam",
      cacaoPercentage: 70,
      description: "Made from beans grown in Vietnam's Mekong Delta, offering woody and spice notes with a uniquely Vietnamese character.",
      ingredients: "Cacao beans, cane sugar, cacao butter",
      tagIds: [tags["Dark"], tags["Spicy"], tags["Woody"], tags["Single Origin"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Willie's Cacao Indonesian Black 100%",
      makerId: makers["Willie's Cacao"],
      type: "Dark",
      origin: "Sumatran, Indonesia",
      cacaoPercentage: 100,
      description: "An intense pure cacao experience with no added sugar. Features earthy, tobacco notes with a hint of spice.",
      ingredients: "Cacao",
      tagIds: [tags["Dark"], tags["Earthy"], tags["Spicy"], tags["Single Origin"], tags["Vegan"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Lindt Lindor Milk Chocolate Truffles",
      makerId: makers["Lindt"],
      type: "Milk",
      origin: "Blend",
      cacaoPercentage: 30,
      description: "Smooth milk chocolate shell with an irresistibly creamy melting filling.",
      ingredients: "Sugar, vegetable fat, cocoa butter, milk ingredients, chocolate, soy lecithin, barley malt, artificial flavoring",
      tagIds: [tags["Milk"], tags["Vanilla"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Valrhona Dulcey Blond Chocolate",
      makerId: makers["Valrhona"],
      type: "Milk",
      origin: "Blend",
      cacaoPercentage: 32,
      description: "A distinctive 'blond' chocolate with a unique caramelized flavor profile featuring biscuit notes and a velvety texture.",
      ingredients: "Sugar, cocoa butter, whole milk powder, dried skimmed milk, whey, butter, soy lecithin, natural vanilla extract",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Vanilla"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Godiva White Chocolate Vanilla Bean",
      makerId: makers["Godiva"],
      type: "White",
      origin: "N/A",
      cacaoPercentage: 0,
      description: "Luxurious white chocolate infused with real vanilla bean for a rich, creamy flavor profile.",
      ingredients: "Sugar, cocoa butter, milk powder, soy lecithin, vanilla extract, vanilla beans",
      tagIds: [tags["White"], tags["Vanilla"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ghirardelli Milk Chocolate Sea Salt Caramel Squares",
      makerId: makers["Ghirardelli"],
      type: "Milk",
      origin: "Blend",
      cacaoPercentage: 32,
      description: "Smooth milk chocolate squares filled with a flowing caramel center and a touch of sea salt.",
      ingredients: "Sugar, corn syrup, milk chocolate, cocoa butter, milk, soy lecithin, vanilla, salt",
      tagIds: [tags["Milk"], tags["Caramel"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Theo Salted Almond 70% Dark Chocolate",
      makerId: makers["Theo Chocolate"],
      type: "Dark",
      origin: "Blend (Congo and Peru)",
      cacaoPercentage: 70,
      description: "A crunchy dark chocolate bar with roasted almonds and a hint of sea salt, creating a perfect sweet-savory balance.",
      ingredients: "Cocoa beans, sugar, almonds, salt",
      tagIds: [tags["Dark"], tags["Nutty"], tags["Organic"], tags["Fair Trade"]],
      imageUrl: "https://placehold.co/300x300?text=Chocolate",
      averageRating: 0,
      reviewCount: 0
    }
  ];
  
  // Add each chocolate to Firestore
  const chocolatesCollection = collection(db, 'chocolates');
  for (const chocolate of chocolatesData) {
    try {
      // Check if we have the maker ID
      if (!chocolate.makerId) {
        console.error(`Missing maker ID for chocolate: ${chocolate.name}`);
        continue;
      }
      
      // Check if we have all the tag IDs
      const missingTags = chocolate.tagIds.some(id => !id);
      if (missingTags) {
        console.error(`Missing tag IDs for chocolate: ${chocolate.name}`);
        continue;
      }
      
      const now = Timestamp.now();
      await addDoc(chocolatesCollection, {
        ...chocolate,
        createdAt: now,
        updatedAt: now
      });
      console.log(`Added chocolate: ${chocolate.name}`);
    } catch (error) {
      console.error(`Error adding ${chocolate.name}:`, error);
    }
  }
  
  console.log('Finished adding initial chocolates');
};

export default addInitialChocolates;