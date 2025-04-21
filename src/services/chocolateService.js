// Mock chocolate data
const chocolates = [
    {
      id: 1,
      name: 'Dark Origin',
      maker: 'Cacao Elements',
      origin: 'Ecuador',
      cacaoPercentage: 72,
      type: 'Dark',
      averageRating: 4.5,
      ratings: 356,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate',
      flavorProfile: [
        { name: 'Fruity', intensity: 4 },
        { name: 'Nutty', intensity: 2 },
        { name: 'Earthy', intensity: 3 },
        { name: 'Floral', intensity: 4 },
      ],
      description: 'A bold single-origin dark chocolate with fruity notes and a smooth finish. Sourced from small-batch producers in Ecuador, this bar highlights the unique terroir of South American cacao.',
      ingredients: ['Organic cacao beans', 'Organic cane sugar', 'Organic cocoa butter', 'Vanilla beans'],
      nutritionalInfo: {
        servingSize: '30g',
        calories: 170,
        fat: 12,
        sugar: 8,
        protein: 2
      },
      reviews: [
        { id: 1, user: 'ChocolateFan123', rating: 5, date: '2023-11-15', text: 'Amazing depth of flavor!' },
        { id: 2, user: 'CocoaLover', rating: 4, date: '2023-12-02', text: 'Rich and complex, but a bit too bitter for me.' }
      ]
    },
    {
      id: 2,
      name: 'Milk & Hazelnut Bliss',
      maker: 'Sweet Valley',
      origin: 'Switzerland',
      cacaoPercentage: 38,
      type: 'Milk',
      averageRating: 4.2,
      ratings: 289,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate',
      flavorProfile: [
        { name: 'Creamy', intensity: 5 },
        { name: 'Nutty', intensity: 4 },
        { name: 'Sweet', intensity: 4 },
        { name: 'Vanilla', intensity: 3 },
      ],
      description: 'Smooth milk chocolate with premium hazelnuts for a delightful crunch. Each bar is crafted with traditional Swiss techniques for an exceptionally creamy texture.',
      ingredients: ['Milk', 'Sugar', 'Cocoa butter', 'Cocoa mass', 'Hazelnuts (15%)', 'Soy lecithin', 'Natural flavors'],
      nutritionalInfo: {
        servingSize: '30g',
        calories: 190,
        fat: 14,
        sugar: 12,
        protein: 3
      },
      reviews: [
        { id: 3, user: 'SweetTooth', rating: 5, date: '2024-01-10', text: 'Perfect balance of sweet and nutty!' },
        { id: 4, user: 'ChocExplorer', rating: 4, date: '2024-01-22', text: 'Delicious but a bit too sweet for daily eating.' }
      ]
    },
    {
      id: 3,
      name: 'Spiced Orange Bar',
      maker: 'Artisan Delights',
      origin: 'Madagascar',
      cacaoPercentage: 65,
      type: 'Dark',
      averageRating: 4.7,
      ratings: 178,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate',
      flavorProfile: [
        { name: 'Citrus', intensity: 5 },
        { name: 'Spicy', intensity: 3 },
        { name: 'Fruity', intensity: 4 },
        { name: 'Sweet', intensity: 2 },
      ],
      description: 'Madagascan dark chocolate infused with orange peel and a hint of cinnamon. The perfect balance of citrus brightness and warming spices.',
      ingredients: ['Organic cacao beans', 'Organic cane sugar', 'Organic cocoa butter', 'Orange peel', 'Cinnamon', 'Natural orange oil'],
      nutritionalInfo: {
        servingSize: '30g',
        calories: 160,
        fat: 11,
        sugar: 7,
        protein: 2
      },
      reviews: [
        { id: 5, user: 'FlavourHunter', rating: 5, date: '2024-02-18', text: 'The orange and spice combination is perfect!' },
        { id: 6, user: 'CocoaConnoisseur', rating: 5, date: '2024-02-25', text: 'Incredibly balanced flavor profile.' }
      ]
    },
    {
      id: 4,
      name: 'Cherry Blossom White',
      maker: 'Tokyo Treats',
      origin: 'Japan',
      cacaoPercentage: 30,
      type: 'White',
      averageRating: 4.1,
      ratings: 135,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate',
      flavorProfile: [
        { name: 'Floral', intensity: 4 },
        { name: 'Sweet', intensity: 4 },
        { name: 'Creamy', intensity: 5 },
        { name: 'Fruity', intensity: 3 },
      ],
      description: 'A delicate white chocolate with subtle cherry blossom flavor, inspired by Japanese spring traditions. Elegant and unique.',
      ingredients: ['Cocoa butter', 'Milk powder', 'Sugar', 'Vanilla', 'Natural cherry blossom extract'],
      nutritionalInfo: {
        servingSize: '30g',
        calories: 180,
        fat: 12,
        sugar: 14,
        protein: 2
      },
      reviews: [
        { id: 7, user: 'SakuraLover', rating: 5, date: '2024-01-03', text: 'Such a unique and delicate flavor!' },
        { id: 8, user: 'WhiteChocFan', rating: 4, date: '2024-01-15', text: 'Beautiful flavor but quite sweet.' }
      ]
    },
    {
      id: 5,
      name: 'Sea Salt Caramel Crunch',
      maker: 'Coastal Confections',
      origin: 'Belgium',
      cacaoPercentage: 55,
      type: 'Dark Milk',
      averageRating: 4.8,
      ratings: 425,
      imageUrl: 'https://placehold.co/300x300?text=Chocolate',
      flavorProfile: [
        { name: 'Caramel', intensity: 5 },
        { name: 'Salty', intensity: 3 },
        { name: 'Sweet', intensity: 4 },
        { name: 'Buttery', intensity: 4 },
      ],
      description: 'Belgian chocolate with crunchy caramel pieces and a touch of sea salt. The perfect balance of sweet and salty.',
      ingredients: ['Cocoa mass', 'Sugar', 'Cocoa butter', 'Milk powder', 'Caramel pieces (6%)', 'Sea salt', 'Soy lecithin', 'Natural vanilla'],
      nutritionalInfo: {
        servingSize: '30g',
        calories: 175,
        fat: 11,
        sugar: 13,
        protein: 2
      },
      reviews: [
        { id: 9, user: 'SaltySweet', rating: 5, date: '2024-03-10', text: 'The best salted caramel chocolate I\'ve ever had!' },
        { id: 10, user: 'ChocolateAddict', rating: 5, date: '2024-03-18', text: 'Perfect balance of flavors and textures.' }
      ]
    }
  ];
  
  // Service functions
  export const getAllChocolates = () => {
    return Promise.resolve(chocolates);
  };
  
  export const getChocolateById = (id) => {
    const chocolate = chocolates.find(c => c.id === parseInt(id));
    if (!chocolate) {
      return Promise.reject(new Error('Chocolate not found'));
    }
    return Promise.resolve(chocolate);
  };
  
  export const searchChocolates = (query) => {
    const results = chocolates.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.maker.toLowerCase().includes(query.toLowerCase()) ||
      c.origin.toLowerCase().includes(query.toLowerCase()) ||
      c.type.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(results);
  };