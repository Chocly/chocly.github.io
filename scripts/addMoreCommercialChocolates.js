// src/scripts/addMoreCommercialChocolates.js
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';

const addMoreCommercialChocolates = async () => {
  console.log('Starting to add 100 more commercial chocolates...');
  
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
  
  // Create any new makers needed
  const newMakers = [
    { name: "Godiva Chocolatier", country: "Belgium/USA", website: "https://www.godiva.com" },
    { name: "Russell Stover", country: "United States", website: "https://www.russellstover.com" },
    { name: "Whitman's", country: "United States", website: "https://www.russellstover.com/whitman-s" },
    { name: "Scharffen Berger", country: "United States", website: "https://www.scharffenberger.com" },
    { name: "Dagoba", country: "United States", website: "https://www.dagobachocolate.com" },
    { name: "Chuao Chocolatier", country: "United States", website: "https://chuaochocolatier.com" },
    { name: "Lake Champlain Chocolates", country: "United States", website: "https://www.lakechamplainchocolates.com" },
    { name: "Vosges Haut-Chocolat", country: "United States", website: "https://www.vosgeschocolate.com" },
    { name: "Raaka Chocolate", country: "United States", website: "https://www.raakachocolate.com" },
    { name: "Chocolat Moderne", country: "United States", website: "https://www.chocolatmoderne.com" },
    { name: "Gourmet Boutique", country: "United States", website: "https://gourmetboutique.com" },
    { name: "Venchi", country: "Italy", website: "https://us.venchi.com" },
    { name: "Neuhaus", country: "Belgium", website: "https://www.neuhauschocolate.com" },
    { name: "Lily's", country: "United States", website: "https://lilys.com" },
    { name: "Seattle Chocolate", country: "United States", website: "https://www.seattlechocolate.com" },
    { name: "Pascha", country: "Peru/Canada", website: "https://www.paschachocolate.com" },
    { name: "Kinder", country: "Italy", website: "https://www.kinder.com" },
    { name: "Trader Joe's", country: "United States", website: "https://www.traderjoes.com" },
    { name: "Moonstruck", country: "United States", website: "https://www.moonstruckchocolate.com" },
    { name: "Whittaker's", country: "New Zealand", website: "https://www.whittakers.co.nz" },
    { name: "Tcho", country: "United States", website: "https://tcho.com" },
    { name: "Chocolatier Blue", country: "United States", website: "https://www.chocolatierblue.com" },
    { name: "Cordial", country: "United States", website: "https://cordialorganics.com" },
    { name: "Bissinger's", country: "United States", website: "https://www.bissingers.com" },
    { name: "Valor", country: "Spain", website: "https://www.valor.es" },
    { name: "Callebaut", country: "Belgium", website: "https://www.callebaut.com" },
    { name: "Schogetten", country: "Germany", website: "https://www.schogetten.com" },
    { name: "Reese's", country: "United States", website: "https://www.hersheys.com/reeses/" },
    { name: "Twix", country: "United States", website: "https://www.twix.com" },
    { name: "Snickers", country: "United States", website: "https://www.snickers.com" },
    { name: "Kit Kat", country: "United States/Japan", website: "https://www.kitkat.com" },
    { name: "Brookside", country: "United States", website: "https://www.brooksidechocolate.com" },
    { name: "See's Candies", country: "United States", website: "https://www.sees.com" },
    { name: "Perugina", country: "Italy", website: "https://www.perugina.com" },
    { name: "Moser Roth", country: "Germany", website: "https://www.aldi.us" }
  ];
  
  // Add new makers if they don't exist yet
  const makersCollection = collection(db, 'makers');
  for (const makerData of newMakers) {
    // Skip if maker already exists in our map
    if (makers[makerData.name]) {
      console.log(`Maker "${makerData.name}" already exists, skipping`);
      continue;
    }
    
    try {
      const docRef = await addDoc(makersCollection, makerData);
      console.log(`Added new maker: ${makerData.name} with ID: ${docRef.id}`);
      makers[makerData.name] = docRef.id;
    } catch (error) {
      console.error(`Error adding maker ${makerData.name}:`, error);
    }
  }
  
  // Add any new tags needed
  const newTags = [
    { name: "Mint", category: "Flavor" },
    { name: "Coffee", category: "Flavor" },
    { name: "Coconut", category: "Flavor" },
    { name: "Toffee", category: "Flavor" },
    { name: "Raspberry", category: "Flavor" },
    { name: "Orange", category: "Flavor" },
    { name: "Cherry", category: "Flavor" },
    { name: "Peanut", category: "Flavor" },
    { name: "Hazelnut", category: "Flavor" },
    { name: "Almond", category: "Flavor" },
    { name: "Pecan", category: "Flavor" },
    { name: "Chili", category: "Flavor" },
    { name: "Sea Salt", category: "Flavor" },
    { name: "Crunchy", category: "Texture" },
    { name: "Filled", category: "Type" },
    { name: "Sugar-Free", category: "Attribute" },
    { name: "Limited Edition", category: "Attribute" },
    { name: "Ruby", category: "Type" },
    { name: "Semisweet", category: "Type" },
    { name: "Seasonal", category: "Attribute" }
  ];
  
  const tagsCollection = collection(db, 'tags');
  for (const tagData of newTags) {
    // Skip if tag already exists in our map
    if (tags[tagData.name]) {
      console.log(`Tag "${tagData.name}" already exists, skipping`);
      continue;
    }
    
    try {
      const docRef = await addDoc(tagsCollection, tagData);
      console.log(`Added new tag: ${tagData.name} with ID: ${docRef.id}`);
      tags[tagData.name] = docRef.id;
    } catch (error) {
      console.error(`Error adding tag ${tagData.name}:`, error);
    }
  }
  
  // Define 100 more commercial chocolates
  const moreCommercialChocolates = [
    // Mass Market Classics
    {
      name: "Reese's Peanut Butter Cups",
      makerId: makers["Reese's"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 25,
      description: "Iconic milk chocolate cups filled with sweetened peanut butter, creating a perfect balance of sweet and salty flavors.",
      ingredients: "Milk chocolate (sugar, cocoa butter, chocolate, milk, soy lecithin, PGPR), peanuts, sugar, dextrose, salt, TBHQ",
      tagIds: [tags["Milk"], tags["Peanut"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=Reeses",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Kit Kat",
      makerId: makers["Kit Kat"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 22,
      description: "Crispy wafer fingers covered in smooth milk chocolate, known for its distinctive snap when broken.",
      ingredients: "Sugar, wheat flour, cocoa butter, nonfat milk, chocolate, palm kernel oil, lactose, soy lecithin, PGPR, yeast, salt, baking soda, artificial flavor",
      tagIds: [tags["Milk"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=KitKat",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Snickers",
      makerId: makers["Snickers"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 20,
      description: "Nougat topped with caramel and peanuts, enrobed in milk chocolate. One of the best-selling candy bars in the US.",
      ingredients: "Milk chocolate, peanuts, corn syrup, sugar, palm oil, skim milk, lactose, salt, egg whites, artificial flavor",
      tagIds: [tags["Milk"], tags["Peanut"], tags["Caramel"], tags["Nutty"]],
      imageUrl: "https://placehold.co/300x300?text=Snickers",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Twix",
      makerId: makers["Twix"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 21,
      description: "Crunchy cookie bars topped with caramel and coated in milk chocolate, usually sold in pairs.",
      ingredients: "Milk chocolate, enriched wheat flour, sugar, palm oil, corn syrup, skim milk, butter, salt, cocoa powder, soy lecithin, vanilla extract",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=Twix",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Hershey's Cookies 'n' Creme",
      makerId: makers["Hershey's"],
      type: "White",
      origin: "United States",
      cacaoPercentage: 0,
      description: "White chocolate bar embedded with chocolate cookie pieces for a cookies and cream flavor.",
      ingredients: "Sugar, vegetable oil, cocoa butter, milk, lactose, chocolate cookie bits, soy lecithin, salt, artificial flavor",
      tagIds: [tags["White"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=HersheyCookies",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Kinder Bueno",
      makerId: makers["Kinder"],
      type: "Milk",
      origin: "Italy",
      cacaoPercentage: 28,
      description: "Thin wafer filled with hazelnut cream, covered in milk chocolate with a dark cocoa dusting.",
      ingredients: "Milk chocolate, sugar, palm oil, hazelnuts, wheat flour, milk powder, chocolate, soy lecithin, vanillin",
      tagIds: [tags["Milk"], tags["Hazelnut"], tags["Filled"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=KinderBueno",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Milky Way",
      makerId: makers["Mars"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 23,
      description: "Chocolate-malt nougat topped with caramel and covered with milk chocolate.",
      ingredients: "Milk chocolate, corn syrup, sugar, hydrogenated palm kernel oil, skim milk, less than 2% of lactose, salt, egg whites, chocolate, artificial flavor",
      tagIds: [tags["Milk"], tags["Caramel"]],
      imageUrl: "https://placehold.co/300x300?text=MilkyWay",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Butterfinger",
      makerId: makers["Ferrero"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 20,
      description: "Crispy, flaky peanut butter core covered in milk chocolate with a distinctive orange color.",
      ingredients: "Corn syrup, sugar, ground roasted peanuts, hydrogenated palm kernel oil, cocoa, molasses, milk, soy lecithin",
      tagIds: [tags["Milk"], tags["Peanut"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=Butterfinger",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "3 Musketeers",
      makerId: makers["Mars"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 22,
      description: "Fluffy chocolate-flavored nougat covered in milk chocolate, lighter than many other candy bars.",
      ingredients: "Milk chocolate, corn syrup, sugar, hydrogenated palm kernel oil, cocoa powder, egg whites, artificial flavor, soy lecithin",
      tagIds: [tags["Milk"]],
      imageUrl: "https://placehold.co/300x300?text=3Musketeers",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "York Peppermint Pattie",
      makerId: makers["Hershey's"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 50,
      description: "Strong mint-flavored fondant covered in dark chocolate, known for its refreshing taste.",
      ingredients: "Sugar, corn syrup, semi-sweet chocolate, invert sugar, egg whites, oil of peppermint",
      tagIds: [tags["Dark"], tags["Mint"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=YorkPeppermint",
      averageRating: 0,
      reviewCount: 0
    },
    
    // Popular Grocery Store Options
    {
      name: "Lindt Lindor Truffles Assorted",
      makerId: makers["Lindt"],
      type: "Milk",
      origin: "Switzerland",
      cacaoPercentage: 30,
      description: "Assorted flavors of the famous smooth-melting chocolate truffles with soft centers.",
      ingredients: "Sugar, vegetable fats, cocoa butter, milk ingredients, chocolate, soy lecithin, artificial flavors",
      tagIds: [tags["Milk"], tags["Filled"], tags["Creamy"]],
      imageUrl: "https://placehold.co/300x300?text=LindorAssorted",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Godiva Gold Ballotin",
      makerId: makers["Godiva Chocolatier"],
      type: "Milk",
      origin: "Belgium",
      cacaoPercentage: 31,
      description: "Assorted premium Belgian chocolate pralines in the signature gold box, perfect for gifting.",
      ingredients: "Sugar, cocoa butter, cocoa mass, whole milk powder, hazelnuts, cream, butter, glucose syrup, invert sugar, soy lecithin",
      tagIds: [tags["Milk"], tags["Filled"], tags["Hazelnut"]],
      imageUrl: "https://placehold.co/300x300?text=GodivaGold",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Russell Stover Assorted Chocolates",
      makerId: makers["Russell Stover"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 29,
      description: "Classic American boxed chocolates with various fillings like caramel, nougat, and fruit creams.",
      ingredients: "Sugar, corn syrup, chocolate, cocoa butter, milk, cream, butter, egg whites, soy lecithin, vanilla, various flavors",
      tagIds: [tags["Milk"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=RussellStover",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ghirardelli Squares Dark Chocolate Mint",
      makerId: makers["Ghirardelli"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 60,
      description: "Individually wrapped dark chocolate squares with a smooth mint filling.",
      ingredients: "Semi-sweet chocolate, sugar, cocoa butter, mint filling, milk fat, soy lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Mint"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=GhirardelliMint",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ghirardelli Squares Caramel",
      makerId: makers["Ghirardelli"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 32,
      description: "Individually wrapped milk chocolate squares with a flowing caramel center.",
      ingredients: "Milk chocolate, corn syrup, sugar, milk, butter, vanilla, soy lecithin, salt",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=GhirardelliCaramel",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Whitman's Sampler",
      makerId: makers["Whitman's"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 30,
      description: "Iconic yellow box of assorted chocolates with a guide printed inside the lid, a classic American gift.",
      ingredients: "Sugar, corn syrup, milk chocolate, cream, cocoa butter, various nuts, fruit concentrates, soy lecithin",
      tagIds: [tags["Milk"], tags["Filled"], tags["Nutty"]],
      imageUrl: "https://placehold.co/300x300?text=Whitmans",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Brookside Dark Chocolate Acai & Blueberry",
      makerId: makers["Brookside"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 60,
      description: "Fruit-flavored soft centers covered in dark chocolate, a popular choice for 'better-for-you' indulgence.",
      ingredients: "Dark chocolate, sugar, fruit juice concentrates (açai, blueberry), corn syrup, citric acid, natural flavors",
      tagIds: [tags["Dark"], tags["Berry"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=Brookside",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ferrero Rocher Collection",
      makerId: makers["Ferrero"],
      type: "Milk",
      origin: "Italy",
      cacaoPercentage: 30,
      description: "Assortment of Ferrero Rocher, Raffaello (coconut), and Rondnoir (dark) pralines in gold wrappers.",
      ingredients: "Milk chocolate, hazelnuts, sugar, palm oil, wheat flour, whey powder, cocoa powder, soy lecithin, vanillin",
      tagIds: [tags["Milk"], tags["Hazelnut"], tags["Coconut"], tags["Filled"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=FerreroCollection",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ritter Sport Marzipan",
      makerId: makers["Ritter Sport"],
      type: "Dark",
      origin: "Germany",
      cacaoPercentage: 50,
      description: "German dark chocolate square filled with marzipan (almond paste). A traditional European favorite.",
      ingredients: "Sugar, almonds, cocoa mass, cocoa butter, glucose syrup, invert sugar syrup, sweet whey powder, butterfat, soy lecithin",
      tagIds: [tags["Dark"], tags["Almond"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=RitterMarzipan",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Toblerone Dark",
      makerId: makers["Toblerone"],
      type: "Dark",
      origin: "Switzerland",
      cacaoPercentage: 60,
      description: "Distinctive triangular dark chocolate bar with honey and almond nougat, a darker version of the classic.",
      ingredients: "Dark chocolate, sugar, honey, almonds, cocoa butter, egg white, natural flavors",
      tagIds: [tags["Dark"], tags["Nutty"], tags["Honey"]],
      imageUrl: "https://placehold.co/300x300?text=TobleroneBlack",
      averageRating: 0,
      reviewCount: 0
    },
    
    // Whole Foods / Premium Grocery
    {
      name: "Scharffen Berger 70% Cacao Bittersweet",
      makerId: makers["Scharffen Berger"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 70,
      description: "Artisanal dark chocolate with complex fruity notes and balanced acidity. One of America's original craft chocolates.",
      ingredients: "Cacao beans, sugar, cocoa butter, vanilla beans, soy lecithin",
      tagIds: [tags["Dark"], tags["Fruity"], tags["Bittersweet"]],
      imageUrl: "https://placehold.co/300x300?text=ScharffenBerger",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Dagoba Organic Lavender Blueberry",
      makerId: makers["Dagoba"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 59,
      description: "Organic dark chocolate infused with lavender and blueberry essences for a floral berry flavor.",
      ingredients: "Organic chocolate, organic cane sugar, organic cocoa butter, organic blueberries, organic lavender, organic vanilla bean",
      tagIds: [tags["Dark"], tags["Organic"], tags["Berry"], tags["Floral"]],
      imageUrl: "https://placehold.co/300x300?text=Dagoba",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Chuao Chocolatier Potato Chip",
      makerId: makers["Chuao Chocolatier"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 41,
      description: "Gourmet milk chocolate bar with crunchy kettle potato chips and sea salt for a sweet-salty experience.",
      ingredients: "Milk chocolate, potato chips, sea salt, soy lecithin, vanilla",
      tagIds: [tags["Milk"], tags["Crunchy"], tags["Sea Salt"]],
      imageUrl: "https://placehold.co/300x300?text=ChuaoPotato",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Chuao Chocolatier Spicy Maya",
      makerId: makers["Chuao Chocolatier"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 60,
      description: "Spicy dark chocolate inspired by Mayan traditions, featuring cinnamon, pasilla chile, and cayenne pepper.",
      ingredients: "Dark chocolate, cane sugar, cinnamon, pasilla chile, cayenne pepper, soy lecithin",
      tagIds: [tags["Dark"], tags["Spicy"], tags["Chili"]],
      imageUrl: "https://placehold.co/300x300?text=ChuaoMaya",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Lily's Dark Chocolate",
      makerId: makers["Lily's"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 70,
      description: "Dark chocolate sweetened with stevia instead of sugar, popular with those limiting sugar intake.",
      ingredients: "Unsweetened chocolate, stevia extract, erythritol, inulin, cocoa butter, sunflower lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Sugar-Free"]],
      imageUrl: "https://placehold.co/300x300?text=Lilys",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Seattle Chocolate Truffle Bar",
      makerId: makers["Seattle Chocolate"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 34,
      description: "Smooth, truffle-like textured chocolate bars in various flavors with bright, modern packaging.",
      ingredients: "Chocolate, cocoa butter, heavy cream, sugar, vanilla, soy lecithin",
      tagIds: [tags["Milk"], tags["Creamy"]],
      imageUrl: "https://placehold.co/300x300?text=SeattleChoc",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Lake Champlain Five Star Bars",
      makerId: makers["Lake Champlain Chocolates"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 34,
      description: "Gourmet chocolate bars with generous fillings like caramel, hazelnut, and fruit. Similar to premium candy bars.",
      ingredients: "Milk chocolate, sugar, cream, butter, caramel, hazelnuts, soy lecithin, vanilla",
      tagIds: [tags["Milk"], tags["Filled"], tags["Caramel"]],
      imageUrl: "https://placehold.co/300x300?text=LakeChamplain",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Tcho Milk Chocolate",
      makerId: makers["Tcho"],
      type: "Milk",
      origin: "Blend",
      cacaoPercentage: 39,
      description: "Higher cacao milk chocolate with caramel and dairy notes, made by a tech-influenced craft chocolate company.",
      ingredients: "Cacao beans, cane sugar, whole milk powder, cocoa butter, soy lecithin, vanilla beans",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Fair Trade"]],
      imageUrl: "https://placehold.co/300x300?text=Tcho",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Pascha Organic 85% Dark Chocolate",
      makerId: makers["Pascha"],
      type: "Dark",
      origin: "Peru",
      cacaoPercentage: 85,
      description: "Allergen-free dark chocolate made in a dedicated facility without common allergens like dairy, nuts, and soy.",
      ingredients: "Organic cocoa mass, organic cocoa butter, organic cane sugar",
      tagIds: [tags["Dark"], tags["Organic"], tags["Vegan"], tags["Gluten-Free"]],
      imageUrl: "https://placehold.co/300x300?text=Pascha",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Raaka Virgin Chocolate Bourbon Cask Aged",
      makerId: makers["Raaka Chocolate"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 68,
      description: "Unroasted 'virgin' chocolate made from beans aged in bourbon casks for a unique flavor profile.",
      ingredients: "Organic cacao beans, organic cane sugar, organic maple sugar, organic cacao butter",
      tagIds: [tags["Dark"], tags["Organic"], tags["Bean to Bar"]],
      imageUrl: "https://placehold.co/300x300?text=Raaka",
      averageRating: 0,
      reviewCount: 0
    },
    
    // Popular Seasonal and Limited Edition
    {
      name: "Reese's Peanut Butter Christmas Trees",
      makerId: makers["Reese's"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 25,
      description: "Tree-shaped version of the classic peanut butter cups, available during the holiday season.",
      ingredients: "Milk chocolate, peanuts, sugar, dextrose, salt, TBHQ, soy lecithin",
      tagIds: [tags["Milk"], tags["Peanut"], tags["Seasonal"]],
      imageUrl: "https://placehold.co/300x300?text=ReesesTree",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Lindt Gold Bunny",
      makerId: makers["Lindt"],
      type: "Milk",
      origin: "Switzerland",
      cacaoPercentage: 30,
      description: "Iconic gold foil-wrapped hollow chocolate bunny, a classic Easter tradition.",
      ingredients: "Sugar, cocoa butter, milk powder, chocolate, soy lecithin, barley malt, artificial flavoring",
      tagIds: [tags["Milk"], tags["Seasonal"]],
      imageUrl: "https://placehold.co/300x300?text=Lindt",
      imageUrl: "https://placehold.co/300x300?text=LindtBunny",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Cadbury Creme Egg",
      makerId: makers["Cadbury"],
      type: "Milk",
      origin: "United Kingdom",
      cacaoPercentage: 26,
      description: "Egg-shaped milk chocolate shell with a sweet fondant filling that mimics an egg. Hugely popular Easter candy.",
      ingredients: "Milk chocolate, sugar, corn syrup, high fructose corn syrup, artificial color, egg whites, natural and artificial flavors",
      tagIds: [tags["Milk"], tags["Filled"], tags["Seasonal"]],
      imageUrl: "https://placehold.co/300x300?text=CremEgg",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Hershey's Kisses Pumpkin Spice",
      makerId: makers["Hershey's"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 23,
      description: "Fall seasonal variety of Hershey's Kisses with pumpkin spice flavored creme filling.",
      ingredients: "Milk chocolate, sugar, vegetable oil, corn syrup, milk, cocoa butter, pumpkin powder, cinnamon, nutmeg, cloves, artificial flavor",
      tagIds: [tags["Milk"], tags["Filled"], tags["Seasonal"]],
      imageUrl: "https://placehold.co/300x300?text=KissesPumpkin",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Godiva Limited Edition Valentine's Day Heart Box",
      makerId: makers["Godiva Chocolatier"],
      type: "Milk",
      origin: "Belgium",
      cacaoPercentage: 31,
      description: "Heart-shaped luxury gift box with a curated selection of milk and dark chocolates for Valentine's Day.",
      ingredients: "Sugar, cocoa butter, milk, chocolate liquor, hazelnut paste, butter, soy lecithin, natural and artificial flavors",
      tagIds: [tags["Milk"], tags["Filled"], tags["Seasonal"], tags["Limited Edition"]],
      imageUrl: "https://placehold.co/300x300?text=GodivaHeart",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Lindt White Chocolate Peppermint Truffles",
      makerId: makers["Lindt"],
      type: "White",
      origin: "Switzerland",
      cacaoPercentage: 0,
      description: "Holiday edition white chocolate truffles with peppermint pieces and candy cane-like red streaks.",
      ingredients: "White chocolate, sugar, vegetable fat, milk ingredients, peppermint oil, soy lecithin, red colorant, natural flavor",
      tagIds: [tags["White"], tags["Mint"], tags["Seasonal"]],
      imageUrl: "https://placehold.co/300x300?text=LindtPeppermint",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "KitKat Pumpkin Pie",
      makerId: makers["Kit Kat"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 22,
      description: "Fall limited edition KitKat featuring pumpkin pie flavored white creme coating instead of chocolate.",
      ingredients: "Sugar, white creme, wheat flour, nonfat milk, vegetable oils, cocoa butter, food starch, corn syrup, spices, artificial flavor",
      tagIds: [tags["Milk"], tags["Crunchy"], tags["Seasonal"], tags["Limited Edition"]],
      imageUrl: "https://placehold.co/300x300?text=KitKatPumpkin",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "M&M's Caramel",
      makerId: makers["Mars"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 23,
      description: "M&M's with a soft caramel center instead of the traditional chocolate center.",
      ingredients: "Milk chocolate, sugar, corn syrup, skim milk, cocoa butter, caramel, less than 2% of various ingredients (salt, artificial colors)",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=MandMsCaramel",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ghirardelli Peppermint Bark",
      makerId: makers["Ghirardelli"],
      type: "White",
      origin: "United States",
      cacaoPercentage: 0,
      description: "Holiday favorite featuring dark chocolate topped with white chocolate and peppermint pieces.",
      ingredients: "White chocolate, dark chocolate, sugar, cocoa butter, milk, vanilla, peppermint candy, soy lecithin",
      tagIds: [tags["White"], tags["Dark"], tags["Mint"], tags["Seasonal"]],
      imageUrl: "https://placehold.co/300x300?text=GhirardelliMintBark",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Terry's Chocolate Orange",
      makerId: makers["Cadbury"],
      type: "Milk",
      origin: "United Kingdom",
      cacaoPercentage: 25,
      description: "Ball of orange-flavored chocolate shaped like an orange and divided into segments. Popular during the holiday season.",
      ingredients: "Sugar, cocoa butter, cocoa mass, milk, vegetable fats, orange oil, emulsifiers, artificial flavors",
      tagIds: [tags["Milk"], tags["Orange"], tags["Seasonal"]],
      imageUrl: "https://placehold.co/300x300?text=TerryChocOrange",
      averageRating: 0,
      reviewCount: 0
    },
    
    // Classic Assortments and Gift Boxes
    {
      name: "See's Assorted Chocolates",
      makerId: makers["See's Candies"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 31,
      description: "Classic West Coast assorted boxed chocolates with nuts, caramels, and creams. A traditional American gift box.",
      ingredients: "Sugar, chocolate, butter, cream, milk, various nuts, corn syrup, soy lecithin, vanilla, salt",
      tagIds: [tags["Milk"], tags["Filled"], tags["Nutty"]],
      imageUrl: "https://placehold.co/300x300?text=Sees",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "See's Nuts & Chews",
      makerId: makers["See's Candies"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 31,
      description: "Popular See's assortment featuring only nut and caramel-based chocolates, no soft centers.",
      ingredients: "Sugar, chocolate, almonds, walnuts, peanuts, pecans, butter, cream, milk, corn syrup, soy lecithin, vanilla, salt",
      tagIds: [tags["Milk"], tags["Nutty"], tags["Caramel"]],
      imageUrl: "https://placehold.co/300x300?text=SeesNuts",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Godiva Dark Chocolate Assortment",
      makerId: makers["Godiva Chocolatier"],
      type: "Dark",
      origin: "Belgium",
      cacaoPercentage: 72,
      description: "Luxury gift box of dark chocolate pralines, ganaches, and truffles from this premium Belgian brand.",
      ingredients: "Dark chocolate, cocoa butter, hazelnuts, sugar, cream, butter, vanilla, soy lecithin",
      tagIds: [tags["Dark"], tags["Filled"], tags["Hazelnut"]],
      imageUrl: "https://placehold.co/300x300?text=GodivaDark",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Neuhaus Belgian Chocolate Collection",
      makerId: makers["Neuhaus"],
      type: "Milk",
      origin: "Belgium",
      cacaoPercentage: 33,
      description: "Assorted pralines from the inventor of the Belgian praline, in a luxurious gift box.",
      ingredients: "Milk chocolate, dark chocolate, white chocolate, hazelnuts, almonds, cream, butter, sugar, vanilla",
      tagIds: [tags["Milk"], tags["Filled"], tags["Nutty"]],
      imageUrl: "https://placehold.co/300x300?text=Neuhaus",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Venchi Assorted Chocolate Gift Box",
      makerId: makers["Venchi"],
      type: "Dark",
      origin: "Italy",
      cacaoPercentage: 56,
      description: "Elegant Italian chocolate assortment featuring gianduia (hazelnut chocolate), cremini, and dark chocolates.",
      ingredients: "Cocoa mass, sugar, hazelnuts, cocoa butter, whole milk powder, vanilla, soy lecithin",
      tagIds: [tags["Dark"], tags["Hazelnut"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=Venchi",
      averageRating: 0,
      reviewCount: 0
    },
    
    // Unique and Interesting
    {
      name: "Vosges Haut-Chocolat Exotic Truffle Collection",
      makerId: makers["Vosges Haut-Chocolat"],
      type: "Dark",
      origin: "United States/Blend",
      cacaoPercentage: 62,
      description: "Innovative truffles with unexpected flavors like curry, wasabi, and various herbs and spices.",
      ingredients: "Dark chocolate, milk chocolate, white chocolate, heavy cream, butter, various spices and herbs, soy lecithin",
      tagIds: [tags["Dark"], tags["Filled"], tags["Spicy"]],
      imageUrl: "https://placehold.co/300x300?text=Vosges",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Vosges Bacon Chocolate Bar",
      makerId: makers["Vosges Haut-Chocolat"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 41,
      description: "Famous gourmet chocolate bar combining smoky bacon with sweet milk chocolate and sea salt.",
      ingredients: "Milk chocolate, bacon, sea salt, soy lecithin, vanilla",
      tagIds: [tags["Milk"], tags["Sea Salt"]],
      imageUrl: "https://placehold.co/300x300?text=VosgesBacon",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Tony's Chocolonely Dark Chocolate Almond Sea Salt",
      makerId: makers["Tony's Chocolonely"],
      type: "Dark",
      origin: "Ghana/Ivory Coast",
      cacaoPercentage: 51,
      description: "Ethically sourced dark chocolate with almonds and sea salt in an irregularly divided bar.",
      ingredients: "Cocoa mass, sugar, almonds, cocoa butter, sea salt, soy lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Almond"], tags["Sea Salt"], tags["Fair Trade"]],
      imageUrl: "https://placehold.co/300x300?text=TonysAlmond",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Chocolat Moderne Avant-Garde Bar",
      makerId: makers["Chocolat Moderne"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 65,
      description: "Artist-designed bars with unexpected flavor combinations and beautiful transfer designs.",
      ingredients: "Dark chocolate, cocoa butter, vanilla, natural flavors, sea salt",
      tagIds: [tags["Dark"]],
      imageUrl: "https://placehold.co/300x300?text=ChocModerne",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Green & Black's Organic Maya Gold",
      makerId: makers["Green & Black's"],
      type: "Dark",
      origin: "Belize",
      cacaoPercentage: 55,
      description: "Organic dark chocolate infused with orange, cinnamon, nutmeg and vanilla, inspired by traditional Mayan spiced cocoa.",
      ingredients: "Organic chocolate, organic cane sugar, organic vanilla, orange oil, cinnamon, nutmeg, cloves",
      tagIds: [tags["Dark"], tags["Organic"], tags["Orange"], tags["Spicy"]],
      imageUrl: "https://placehold.co/300x300?text=MayaGold",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Moser Roth 70% Cocoa Dark Chocolate",
      makerId: makers["Moser Roth"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 70,
      description: "European-style dark chocolate in individually wrapped portions, sold at an affordable price at ALDI stores.",
      ingredients: "Cocoa mass, sugar, cocoa butter, soy lecithin, natural vanilla",
      tagIds: [tags["Dark"]],
      imageUrl: "https://placehold.co/300x300?text=MoserRoth",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Endangered Species Forest Mint 72% Dark Chocolate",
      makerId: makers["Endangered Species"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 72,
      description: "Smooth dark chocolate infused with mint, with a portion of proceeds supporting wildlife conservation.",
      ingredients: "Dark chocolate, cane sugar, peppermint oil, soy lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Mint"], tags["Fair Trade"]],
      imageUrl: "https://placehold.co/300x300?text=ForestMint",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Trader Joe's Pound Plus 72% Dark Chocolate",
      makerId: makers["Trader Joe's"],
      type: "Dark",
      origin: "Belgium",
      cacaoPercentage: 72,
      description: "Large block of Belgian dark chocolate at an affordable price, popular for baking and snacking.",
      ingredients: "Chocolate liquor, sugar, cocoa butter, soy lecithin, vanilla",
      tagIds: [tags["Dark"]],
      imageUrl: "https://placehold.co/300x300?text=TJDark",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Trader Joe's Dark Chocolate Peanut Butter Cups",
      makerId: makers["Trader Joe's"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 58,
      description: "Cult favorite peanut butter cups with dark chocolate shells and creamy peanut butter filling.",
      ingredients: "Dark chocolate, peanut butter, sugar, palm oil, salt, soy lecithin",
      tagIds: [tags["Dark"], tags["Peanut"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=TJPBCups",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Chocolove Toffee & Almonds in Milk Chocolate",
      makerId: makers["Chocolove"],
      type: "Milk",
      origin: "Blend",
      cacaoPercentage: 33,
      description: "Milk chocolate bar with crunchy toffee bits and roasted almonds, with a love poem printed inside the wrapper.",
      ingredients: "Milk chocolate, cane sugar, cocoa butter, almonds, toffee (sugar, butter), whole milk powder, soy lecithin, vanilla",
      tagIds: [tags["Milk"], tags["Toffee"], tags["Almond"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=ChocoloveToffee",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Valor Chocolate con Leche",
      makerId: makers["Valor"],
      type: "Milk",
      origin: "Spain",
      cacaoPercentage: 33,
      description: "Classic Spanish milk chocolate with a smooth texture and rich dairy flavor. Popular in Europe.",
      ingredients: "Sugar, cocoa butter, whole milk powder, cocoa mass, soy lecithin, vanilla",
      tagIds: [tags["Milk"]],
      imageUrl: "https://placehold.co/300x300?text=Valor",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Callebaut 811 54.5% Dark Chocolate Callets",
      makerId: makers["Callebaut"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 54.5,
      description: "Professional-grade chocolate chips used by pastry chefs for baking and chocolate work.",
      ingredients: "Cocoa mass, sugar, cocoa butter, soy lecithin, natural vanilla",
      tagIds: [tags["Dark"], tags["Semisweet"]],
      imageUrl: "https://placehold.co/300x300?text=Callebaut",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Perugina Baci",
      makerId: makers["Perugina"],
      type: "Dark",
      origin: "Italy",
      cacaoPercentage: 51,
      description: "Iconic Italian 'kisses' with a whole hazelnut topped with chocolate-hazelnut filling and wrapped in dark chocolate.",
      ingredients: "Dark chocolate, hazelnuts, sugar, cocoa butter, whole milk powder, natural flavors, lecithin",
      tagIds: [tags["Dark"], tags["Hazelnut"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=Baci",
      averageRating: 0,
      reviewCount: 0
    },
    
    // Popular American Brands
    {
      name: "Hershey's Milk Chocolate with Almonds",
      makerId: makers["Hershey's"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 11,
      description: "Classic Hershey's milk chocolate bar with whole roasted almonds throughout.",
      ingredients: "Milk chocolate, almonds, cocoa butter, milk, soy lecithin, vanillin",
      tagIds: [tags["Milk"], tags["Almond"]],
      imageUrl: "https://placehold.co/300x300?text=HersheyAlmonds",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Dove Dark Chocolate Promises",
      makerId: makers["Dove"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 55,
      description: "Individually wrapped dark chocolate squares with messages printed inside each wrapper.",
      ingredients: "Dark chocolate, cocoa butter, sugar, soy lecithin, vanilla extract",
      tagIds: [tags["Dark"]],
      imageUrl: "https://placehold.co/300x300?text=DoveDark",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Hershey's Kisses",
      makerId: makers["Hershey's"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 11,
      description: "Iconic teardrop-shaped milk chocolate pieces individually wrapped in foil. An American classic.",
      ingredients: "Milk chocolate, sugar, milk, cocoa butter, chocolate, soy lecithin, vanillin",
      tagIds: [tags["Milk"]],
      imageUrl: "https://placehold.co/300x300?text=Kisses",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "M&M's Peanut",
      makerId: makers["Mars"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 23,
      description: "Peanuts covered in milk chocolate and a candy shell. One of America's favorite candies.",
      ingredients: "Milk chocolate, peanuts, sugar, corn starch, corn syrup, artificial colors, dextrin, carnuba wax",
      tagIds: [tags["Milk"], tags["Peanut"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=MandMPeanut",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "M&M's Milk Chocolate",
      makerId: makers["Mars"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 23,
      description: "Small rounds of milk chocolate in a colorful candy shell. One of the world's most recognizable candies.",
      ingredients: "Milk chocolate, sugar, corn starch, corn syrup, artificial colors, dextrin, carnuba wax",
      tagIds: [tags["Milk"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=MandM",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Hershey's Gold",
      makerId: makers["Hershey's"],
      type: "White",
      origin: "United States",
      cacaoPercentage: 0,
      description: "Caramelized creme bar with peanuts and pretzels. Not technically chocolate (no cocoa), but marketed as part of the Hershey's line.",
      ingredients: "Sugar, vegetable oil, skim milk, milk, whey, pretzels, peanuts, soy lecithin, salt, TBHQ",
      tagIds: [tags["White"], tags["Caramel"], tags["Peanut"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=HersheyGold",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ghirardelli Milk Chocolate Sea Salt Caramel",
      makerId: makers["Ghirardelli"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 32,
      description: "Milk chocolate squares with a flowing sea salt caramel filling.",
      ingredients: "Milk chocolate, sugar, corn syrup, milk, cream, butter, sea salt, soy lecithin",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Filled"], tags["Sea Salt"]],
      imageUrl: "https://placehold.co/300x300?text=GhirardelliSaltSquare",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Almond Joy",
      makerId: makers["Hershey's"],
      type: "Milk",
      origin: "United States",
      cacaoPercentage: 21,
      description: "Coconut filling topped with whole almonds and covered in milk chocolate.",
      ingredients: "Corn syrup, milk chocolate, coconut, almonds, sugar, dairy, soy lecithin, salt",
      tagIds: [tags["Milk"], tags["Coconut"], tags["Almond"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=AlmondJoy",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Mounds",
      makerId: makers["Hershey's"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 40,
      description: "Coconut filling covered in dark chocolate. Sister product to Almond Joy, but without nuts.",
      ingredients: "Corn syrup, semi-sweet chocolate, coconut, sugar, dairy, soy lecithin, salt",
      tagIds: [tags["Dark"], tags["Coconut"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=Mounds",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Ghirardelli Intense Dark 86% Cacao",
      makerId: makers["Ghirardelli"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 86,
      description: "Very dark chocolate with minimal sweetness, intense cocoa flavor and slight fruity notes.",
      ingredients: "Unsweetened chocolate, cocoa butter, sugar, soy lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Bittersweet"]],
      imageUrl: "https://placehold.co/300x300?text=Ghirardelli86",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Milka Alpine Milk Chocolate with Oreo",
      makerId: makers["Milka"],
      type: "Milk",
      origin: "Germany",
      cacaoPercentage: 30,
      description: "Creamy European milk chocolate with crushed Oreo cookie pieces throughout.",
      ingredients: "Milk chocolate, sugar, cookies (wheat flour, sugar, vegetable fat, cocoa), cocoa butter, whey powder, hazelnuts",
      tagIds: [tags["Milk"], tags["Creamy"], tags["Crunchy"]],
      imageUrl: "https://placehold.co/300x300?text=MilkaOreo",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Scharffen Berger 82% Extra Dark",
      makerId: makers["Scharffen Berger"],
      type: "Dark",
      origin: "Blend (South America)",
      cacaoPercentage: 82,
      description: "Very dark chocolate with an intense cocoa flavor and complex fruity undertones.",
      ingredients: "Cacao beans, sugar, cocoa butter, vanilla beans, soy lecithin",
      tagIds: [tags["Dark"], tags["Bittersweet"]],
      imageUrl: "https://placehold.co/300x300?text=Scharffen82",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Whittaker's Dark Ghana",
      makerId: makers["Whittaker's"],
      type: "Dark",
      origin: "Ghana",
      cacaoPercentage: 72,
      description: "New Zealand's popular dark chocolate made with Ghanaian beans, with a clean, intense flavor.",
      ingredients: "Cocoa beans, sugar, cocoa butter, soy lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Single Origin"]],
      imageUrl: "https://placehold.co/300x300?text=Whittakers",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Schogetten Dark Chocolate",
      makerId: makers["Schogetten"],
      type: "Dark",
      origin: "Germany",
      cacaoPercentage: 50,
      description: "German chocolate in a unique snap-apart tablet format. Each piece is individually molded.",
      ingredients: "Sugar, cocoa mass, cocoa butter, butterfat, soy lecithin, natural flavors",
      tagIds: [tags["Dark"]],
      imageUrl: "https://placehold.co/300x300?text=Schogetten",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Moonstruck Sea Salt Almond Bark",
      makerId: makers["Moonstruck"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 68,
      description: "Artisan chocolate bark with roasted almonds, toffee bits and sea salt.",
      ingredients: "Dark chocolate, almonds, butter toffee (sugar, butter), sea salt, cocoa butter",
      tagIds: [tags["Dark"], tags["Almond"], tags["Toffee"], tags["Sea Salt"]],
      imageUrl: "https://placehold.co/300x300?text=Moonstruck",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Chocolatier Blue Caramels",
      makerId: makers["Chocolatier Blue"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 64,
      description: "Artisanal painted chocolate bonbons with various caramel flavors, known for beautiful jewel-like appearance.",
      ingredients: "Valrhona dark chocolate, butter, cream, sugar, various natural flavors, glucose",
      tagIds: [tags["Dark"], tags["Caramel"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=ChocBlue",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Bissinger's Gummy Pandas",
      makerId: makers["Bissinger's"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 60,
      description: "Gourmet dark chocolate-covered fruit gummy candies in the shape of pandas.",
      ingredients: "Dark chocolate, organic tapioca syrup, organic cane sugar, gelatin, fruit juice, citric acid, natural flavors",
      tagIds: [tags["Dark"], tags["Fruity"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=ChocPandas",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Cordial Cherry Cordials",
      makerId: makers["Cordial"],
      type: "Dark",
      origin: "United States",
      cacaoPercentage: 55,
      description: "Classic American confection of maraschino cherries in a liquid center surrounded by dark chocolate.",
      ingredients: "Dark chocolate, cherries, corn syrup, sugar, invertase enzyme, citric acid, natural flavor",
      tagIds: [tags["Dark"], tags["Cherry"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=CherryCordials",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Alter Eco Dark Blackout Organic Chocolate",
      makerId: makers["Alter Eco"],
      type: "Dark",
      origin: "Ecuador",
      cacaoPercentage: 85,
      description: "Intensely dark chocolate with minimal sugar and pronounced cocoa flavor. Organic and fair trade certified.",
      ingredients: "Cocoa beans, cocoa butter, raw cane sugar, vanilla beans",
      tagIds: [tags["Dark"], tags["Organic"], tags["Fair Trade"], tags["Single Origin"]],
      imageUrl: "https://placehold.co/300x300?text=AlterEco",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Taza Stone Ground 80% Dark",
      makerId: makers["Taza"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 80,
      description: "Very dark stone-ground chocolate with a rustic texture and pure, intense flavor.",
      ingredients: "Organic cacao beans, organic cane sugar",
      tagIds: [tags["Dark"], tags["Organic"], tags["Bean to Bar"]],
      imageUrl: "https://placehold.co/300x300?text=Taza80",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Gourmet Boutique Vegan Dark",
      makerId: makers["Gourmet Boutique"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 75,
      description: "Dairy-free dark chocolate specifically formulated for vegans and those with dairy allergies.",
      ingredients: "Cocoa liquor, cocoa butter, cane sugar, vanilla extract",
      tagIds: [tags["Dark"], tags["Vegan"], tags["Organic"]],
      imageUrl: "https://placehold.co/300x300?text=VeganDark",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Tony's Chocolonely Milk Chocolate Caramel Sea Salt",
      makerId: makers["Tony's Chocolonely"],
      type: "Milk",
      origin: "West Africa",
      cacaoPercentage: 32,
      description: "Milk chocolate with caramel and sea salt in an irregularly divided bar, promoting slave-free chocolate.",
      ingredients: "Sugar, dried whole milk, cocoa butter, cocoa mass, caramel pieces, sea salt, soy lecithin, vanilla",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Sea Salt"], tags["Fair Trade"]],
      imageUrl: "https://placehold.co/300x300?text=TonysSalt",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Dagoba Organic Lavender Blueberry",
      makerId: makers["Dagoba"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 59,
      description: "Organic dark chocolate infused with lavender and blueberry essences for a floral berry flavor.",
      ingredients: "Organic chocolate, organic cane sugar, organic cocoa butter, organic blueberries, organic lavender, organic vanilla bean",
      tagIds: [tags["Dark"], tags["Organic"], tags["Berry"], tags["Floral"]],
      imageUrl: "https://placehold.co/300x300?text=Dagoba",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Whittaker's Almond Gold",
      makerId: makers["Whittaker's"],
      type: "Milk",
      origin: "New Zealand",
      cacaoPercentage: 33,
      description: "New Zealand favorite featuring milk chocolate with whole roasted almonds.",
      ingredients: "Milk chocolate, almonds, cocoa solids, milk solids, emulsifiers, flavor",
      tagIds: [tags["Milk"], tags["Almond"]],
      imageUrl: "https://placehold.co/300x300?text=WhittakersAlmond",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Cadbury Milk Chocolate Caramello",
      makerId: makers["Cadbury"],
      type: "Milk",
      origin: "United Kingdom",
      cacaoPercentage: 26,
      description: "Milk chocolate bar with flowing caramel filling in segments.",
      ingredients: "Milk chocolate, sugar, corn syrup, milk, cocoa butter, natural and artificial flavor, soy lecithin",
      tagIds: [tags["Milk"], tags["Caramel"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=Caramello",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Trader Joe's Dark Chocolate Lovers Bar",
      makerId: makers["Trader Joe's"],
      type: "Dark",
      origin: "Blend",
      cacaoPercentage: 85,
      description: "Very dark chocolate bar for serious dark chocolate enthusiasts, with minimal sugar.",
      ingredients: "Cocoa mass, sugar, cocoa butter, soy lecithin, vanilla",
      tagIds: [tags["Dark"], tags["Bittersweet"]],
      imageUrl: "https://placehold.co/300x300?text=TJLovers",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Perugina Baci Dark",
      makerId: makers["Perugina"],
      type: "Dark",
      origin: "Italy",
      cacaoPercentage: 70,
      description: "A darker version of the classic Italian chocolate 'kisses' with hazelnut filling and whole hazelnut topping.",
      ingredients: "Dark chocolate, hazelnuts, cocoa butter, sugar, cocoa powder, natural flavors, soy lecithin",
      tagIds: [tags["Dark"], tags["Hazelnut"], tags["Filled"]],
      imageUrl: "https://placehold.co/300x300?text=BaciDark",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Kit Kat Matcha Green Tea",
      makerId: makers["Kit Kat"],
      type: "White",
      origin: "Japan",
      cacaoPercentage: 0,
      description: "Japanese version of Kit Kat with matcha green tea flavored white chocolate coating. Popular as a souvenir from Japan.",
      ingredients: "White chocolate with matcha powder, wheat flour, sugar, vegetable oil, lactose, cocoa butter, milk powder, green tea powder",
      tagIds: [tags["White"], tags["Crunchy"], tags["Limited Edition"]],
      imageUrl: "https://placehold.co/300x300?text=KitKatMatcha",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Chocolove XOXOX Ruby Chocolate",
      makerId: makers["Chocolove"],
      type: "Ruby",
      origin: "Blend",
      cacaoPercentage: 47,
      description: "One of the first widely available ruby chocolate bars in the US market, with a natural pink color and berry notes.",
      ingredients: "Ruby cocoa beans, sugar, cocoa butter, whole milk powder, soy lecithin, citric acid, natural vanilla",
      tagIds: [tags["Ruby"], tags["Berry"]],
      imageUrl: "https://placehold.co/300x300?text=ChocoloveRuby",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Callebaut Ruby RB1 Chocolate",
      makerId: makers["Callebaut"],
      type: "Ruby",
      origin: "Blend",
      cacaoPercentage: 47.3,
      description: "Professional-grade ruby chocolate with naturally occurring pink color and berry notes. Used by pastry chefs.",
      ingredients: "Ruby cocoa beans, sugar, whole milk powder, cocoa butter, soy lecithin, citric acid, natural vanilla",
      tagIds: [tags["Ruby"], tags["Berry"]],
      imageUrl: "https://placehold.co/300x300?text=CallebautRuby",
      averageRating: 0,
      reviewCount: 0
    },
    {
      name: "Valrhona Ivoire White Chocolate",
      makerId: makers["Valrhona"],
      type: "White",
      origin: "France",
      cacaoPercentage: 0,
      description: "Professional-grade white chocolate with a clean, pure flavor and subtle vanilla notes. Popular with pastry chefs.",
      ingredients: "Cocoa butter, sugar, whole milk powder, soy lecithin, natural vanilla extract",
      tagIds: [tags["White"], tags["Vanilla"]],
      imageUrl: "https://placehold.co/300x300?text=ValrhonaIvoire",
      averageRating: 0,
      reviewCount: 0
    }
  ];
  
  // Add each chocolate to Firestore
  const chocolatesCollection = collection(db, 'chocolates');
  for (const chocolate of moreCommercialChocolates) {
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
  
  console.log('Finished adding 100 more commercial chocolates');
};

export default addMoreCommercialChocolates;