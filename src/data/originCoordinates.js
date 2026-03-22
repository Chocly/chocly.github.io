// Cacao-producing countries with [longitude, latitude] coordinates for react-simple-maps
// major: true = top cacao-producing countries shown as ghost markers when unexplored

const originCoordinates = {
  // Central & South America
  'mexico': { coords: [-99, 19], label: 'Mexico', major: true },
  'guatemala': { coords: [-90.5, 14.6], label: 'Guatemala', major: true },
  'honduras': { coords: [-87.2, 14.1], label: 'Honduras' },
  'nicaragua': { coords: [-85.2, 12.9], label: 'Nicaragua' },
  'costa rica': { coords: [-84, 9.9], label: 'Costa Rica' },
  'panama': { coords: [-80, 8.5], label: 'Panama' },
  'colombia': { coords: [-74, 4.6], label: 'Colombia', major: true },
  'venezuela': { coords: [-66.9, 10.5], label: 'Venezuela', major: true },
  'ecuador': { coords: [-78.5, -1.8], label: 'Ecuador', major: true },
  'peru': { coords: [-76, -10], label: 'Peru', major: true },
  'bolivia': { coords: [-65.2, -16.3], label: 'Bolivia' },
  'brazil': { coords: [-51.9, -14.2], label: 'Brazil', major: true },
  'trinidad': { coords: [-61.2, 10.4], label: 'Trinidad' },
  'trinidad and tobago': { coords: [-61.2, 10.4], label: 'Trinidad & Tobago' },
  'dominican republic': { coords: [-70.2, 18.7], label: 'Dominican Republic', major: true },
  'haiti': { coords: [-72.3, 19], label: 'Haiti' },
  'jamaica': { coords: [-77.3, 18.1], label: 'Jamaica' },
  'belize': { coords: [-88.5, 17.2], label: 'Belize' },

  // West Africa
  'ghana': { coords: [-1.0, 7.9], label: 'Ghana', major: true },
  'ivory coast': { coords: [-5.5, 7.5], label: 'Ivory Coast', major: true },
  "cote d'ivoire": { coords: [-5.5, 7.5], label: 'Ivory Coast', major: true },
  'nigeria': { coords: [8.7, 9.1], label: 'Nigeria', major: true },
  'cameroon': { coords: [12.4, 6], label: 'Cameroon', major: true },
  'togo': { coords: [1.2, 8.6], label: 'Togo' },
  'sierra leone': { coords: [-11.8, 8.5], label: 'Sierra Leone' },
  'liberia': { coords: [-9.4, 6.4], label: 'Liberia' },

  // East Africa & Indian Ocean
  'tanzania': { coords: [34.9, -6.4], label: 'Tanzania', major: true },
  'uganda': { coords: [32.3, 1.4], label: 'Uganda' },
  'kenya': { coords: [37.9, -0.02], label: 'Kenya' },
  'madagascar': { coords: [46.9, -18.8], label: 'Madagascar', major: true },
  'congo': { coords: [21.8, -4.0], label: 'Congo' },
  'democratic republic of congo': { coords: [21.8, -4.0], label: 'DR Congo' },
  'sao tome': { coords: [6.6, 0.2], label: 'Sao Tome' },

  // Asia & Pacific
  'india': { coords: [79, 21], label: 'India', major: true },
  'sri lanka': { coords: [80.8, 7.9], label: 'Sri Lanka' },
  'vietnam': { coords: [108.3, 14], label: 'Vietnam', major: true },
  'indonesia': { coords: [113.9, -0.8], label: 'Indonesia', major: true },
  'philippines': { coords: [122, 12.9], label: 'Philippines' },
  'malaysia': { coords: [101.7, 4.2], label: 'Malaysia' },
  'papua new guinea': { coords: [143.9, -6.3], label: 'Papua New Guinea', major: true },
  'fiji': { coords: [178, -17.7], label: 'Fiji' },
  'samoa': { coords: [-172.1, -13.8], label: 'Samoa' },
  'vanuatu': { coords: [166.9, -15.4], label: 'Vanuatu' },
  'solomon islands': { coords: [160.2, -9.6], label: 'Solomon Islands' },
  'hawaii': { coords: [-155.5, 19.9], label: 'Hawaii' },

  // Chocolate-making countries (not cacao-growing, but commonly listed as origin)
  'united states': { coords: [-98.6, 39.8], label: 'United States' },
  'usa': { coords: [-98.6, 39.8], label: 'United States' },
  'us': { coords: [-98.6, 39.8], label: 'United States' },
  'u.s.': { coords: [-98.6, 39.8], label: 'United States' },
  'u.s.a.': { coords: [-98.6, 39.8], label: 'United States' },
  'america': { coords: [-98.6, 39.8], label: 'United States' },
  'california': { coords: [-119.4, 36.8], label: 'United States' },
  'new york': { coords: [-74, 40.7], label: 'United States' },
  'oregon': { coords: [-120.6, 44], label: 'United States' },
  'vermont': { coords: [-72.6, 44], label: 'United States' },
  'france': { coords: [2.2, 46.6], label: 'France' },
  'belgium': { coords: [4.5, 50.5], label: 'Belgium' },
  'switzerland': { coords: [8.2, 46.8], label: 'Switzerland' },
  'italy': { coords: [12.6, 41.9], label: 'Italy' },
  'spain': { coords: [-3.7, 40.4], label: 'Spain' },
  'germany': { coords: [10.5, 51.2], label: 'Germany' },
  'united kingdom': { coords: [-1.2, 52.2], label: 'United Kingdom' },
  'uk': { coords: [-1.2, 52.2], label: 'United Kingdom' },
  'england': { coords: [-1.2, 52.2], label: 'United Kingdom' },
  'scotland': { coords: [-4.2, 56.5], label: 'United Kingdom' },
  'japan': { coords: [138.3, 36.2], label: 'Japan' },
  'australia': { coords: [133.8, -25.3], label: 'Australia' },
  'new zealand': { coords: [174.9, -40.9], label: 'New Zealand' },
  'canada': { coords: [-106.3, 56.1], label: 'Canada' },
  'netherlands': { coords: [5.3, 52.1], label: 'Netherlands' },
  'denmark': { coords: [9.5, 56.3], label: 'Denmark' },
  'sweden': { coords: [18.6, 60.1], label: 'Sweden' },
  'iceland': { coords: [-19.0, 65.0], label: 'Iceland' },
  'israel': { coords: [34.9, 31.0], label: 'Israel' },
  'taiwan': { coords: [121.0, 23.7], label: 'Taiwan' },
  'south korea': { coords: [127.8, 35.9], label: 'South Korea' },
  'korea': { coords: [127.8, 35.9], label: 'South Korea' },
};

export default originCoordinates;

// Get all major cacao-producing countries (for ghost markers)
export function getMajorOrigins() {
  const seen = new Set();
  const results = [];
  for (const coords of Object.values(originCoordinates)) {
    if (coords.major && !seen.has(coords.label)) {
      seen.add(coords.label);
      results.push(coords);
    }
  }
  return results;
}

// Helper: normalize an origin string to find a match
export function findOriginCoords(originStr) {
  if (!originStr) return null;
  const key = originStr.toLowerCase().trim();

  // Direct match
  if (originCoordinates[key]) return originCoordinates[key];

  // Partial match (e.g., "Ghana, West Africa" → "ghana")
  for (const [name, coords] of Object.entries(originCoordinates)) {
    if (key.includes(name) || name.includes(key)) return coords;
  }

  return null;
}
