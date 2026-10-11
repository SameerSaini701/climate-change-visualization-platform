/**
 * Comprehensive catalog of 55+ preset cities with verified latitude/longitude coordinates.
 * Covers Indian metropolises and regional hubs, alongside global climate zones.
 */
export const PRESET_LOCATIONS = [
  // --- India: Northern Region ---
  { id: 'ludhiana', name: 'Ludhiana, India', latitude: 30.9010, longitude: 75.8573, region: 'India - North (Punjab Plains)', category: 'India - North' },
  { id: 'chandigarh', name: 'Chandigarh, India', latitude: 30.7333, longitude: 76.7794, region: 'India - North (Shivalik Foothills)', category: 'India - North' },
  { id: 'amritsar', name: 'Amritsar, India', latitude: 31.6340, longitude: 74.8723, region: 'India - North (Majha Plains)', category: 'India - North' },
  { id: 'jalandhar', name: 'Jalandhar, India', latitude: 31.3260, longitude: 75.5762, region: 'India - North (Doaba Plains)', category: 'India - North' },
  { id: 'delhi', name: 'Delhi, India', latitude: 28.6139, longitude: 77.2090, region: 'India - North (National Capital)', category: 'India - North' },
  { id: 'jaipur', name: 'Jaipur, India', latitude: 26.9124, longitude: 75.7873, region: 'India - North (Semi-Arid Rajasthan)', category: 'India - North' },
  { id: 'shimla', name: 'Shimla, India', latitude: 31.1048, longitude: 77.1734, region: 'India - North (Himalayan Montane)', category: 'India - North' },
  { id: 'manali', name: 'Manali, India', latitude: 32.2432, longitude: 77.1892, region: 'India - North (High Himalayas)', category: 'India - North' },
  { id: 'srinagar', name: 'Srinagar, India', latitude: 34.0837, longitude: 74.7973, region: 'India - North (Kashmir Valley)', category: 'India - North' },
  { id: 'lucknow', name: 'Lucknow, India', latitude: 26.8467, longitude: 80.9462, region: 'India - North (Gangetic Plain)', category: 'India - North' },
  { id: 'dehradun', name: 'Dehradun, India', latitude: 30.3165, longitude: 78.0322, region: 'India - North (Doon Valley)', category: 'India - North' },

  // --- India: Western & Central Region ---
  { id: 'mumbai', name: 'Mumbai, India', latitude: 19.0760, longitude: 72.8777, region: 'India - West (Konkan Coast)', category: 'India - West & Central' },
  { id: 'pune', name: 'Pune, India', latitude: 18.5204, longitude: 73.8567, region: 'India - West (Deccan Plateau)', category: 'India - West & Central' },
  { id: 'ahmedabad', name: 'Ahmedabad, India', latitude: 23.0225, longitude: 72.5714, region: 'India - West (Gujarat Semi-Arid)', category: 'India - West & Central' },
  { id: 'bhopal', name: 'Bhopal, India', latitude: 23.2599, longitude: 77.4126, region: 'India - Central (Malwa Plateau)', category: 'India - West & Central' },
  { id: 'panaji', name: 'Goa (Panaji), India', latitude: 15.4909, longitude: 73.8278, region: 'India - West (Coastal Tropical)', category: 'India - West & Central' },
  { id: 'nagpur', name: 'Nagpur, India', latitude: 21.1458, longitude: 79.0882, region: 'India - Central (Vidarbha Basin)', category: 'India - West & Central' },

  // --- India: Southern Region ---
  { id: 'bengaluru', name: 'Bengaluru, India', latitude: 12.9716, longitude: 77.5946, region: 'India - South (Mysore Plateau)', category: 'India - South' },
  { id: 'chennai', name: 'Chennai, India', latitude: 13.0827, longitude: 80.2707, region: 'India - South (Coromandel Coast)', category: 'India - South' },
  { id: 'hyderabad', name: 'Hyderabad, India', latitude: 17.3850, longitude: 78.4867, region: 'India - South (Telangana Plateau)', category: 'India - South' },
  { id: 'kochi', name: 'Kochi, India', latitude: 9.9312, longitude: 76.2673, region: 'India - South (Malabar Coast)', category: 'India - South' },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram, India', latitude: 8.5241, longitude: 76.9366, region: 'India - South (Tropical Coast)', category: 'India - South' },
  { id: 'visakhapatnam', name: 'Visakhapatnam, India', latitude: 17.6868, longitude: 83.2185, region: 'India - South (Eastern Ghats Coast)', category: 'India - South' },

  // --- India: Eastern & North-Eastern Region ---
  { id: 'kolkata', name: 'Kolkata, India', latitude: 22.5726, longitude: 88.3639, region: 'India - East (Ganges Delta)', category: 'India - East & Northeast' },
  { id: 'patna', name: 'Patna, India', latitude: 25.5941, longitude: 85.1376, region: 'India - East (Bihar Plain)', category: 'India - East & Northeast' },
  { id: 'bhubaneswar', name: 'Bhubaneswar, India', latitude: 20.2961, longitude: 85.8245, region: 'India - East (Odisha Coastal Plain)', category: 'India - East & Northeast' },
  { id: 'guwahati', name: 'Guwahati, India', latitude: 26.1445, longitude: 91.7362, region: 'India - Northeast (Brahmaputra Valley)', category: 'India - East & Northeast' },
  { id: 'shillong', name: 'Shillong, India', latitude: 25.5788, longitude: 91.8933, region: 'India - Northeast (Meghalaya Plateau)', category: 'India - East & Northeast' },

  // --- International: Asia & Middle East ---
  { id: 'tokyo', name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, region: 'East Asia (Humid Subtropical)', category: 'Asia & Middle East' },
  { id: 'dubai', name: 'Dubai, United Arab Emirates', latitude: 25.2048, longitude: 55.2708, region: 'Middle East (Arid Desert)', category: 'Asia & Middle East' },
  { id: 'singapore', name: 'Singapore', latitude: 1.3521, longitude: 103.8198, region: 'Southeast Asia (Equatorial Rainforest)', category: 'Asia & Middle East' },
  { id: 'bangkok', name: 'Bangkok, Thailand', latitude: 13.7563, longitude: 100.5018, region: 'Southeast Asia (Tropical Savanna)', category: 'Asia & Middle East' },
  { id: 'seoul', name: 'Seoul, South Korea', latitude: 37.5665, longitude: 126.9780, region: 'East Asia (Continental)', category: 'Asia & Middle East' },
  { id: 'beijing', name: 'Beijing, China', latitude: 39.9042, longitude: 116.4074, region: 'East Asia (Northern Continental)', category: 'Asia & Middle East' },
  { id: 'riyadh', name: 'Riyadh, Saudi Arabia', latitude: 24.7136, longitude: 46.6753, region: 'Middle East (Desert Plateau)', category: 'Asia & Middle East' },
  { id: 'istanbul', name: 'Istanbul, Turkey', latitude: 41.0082, longitude: 28.9784, region: 'Eurasia (Transcontinental Mediterranean)', category: 'Asia & Middle East' },

  // --- International: Europe ---
  { id: 'london', name: 'London, United Kingdom', latitude: 51.5074, longitude: -0.1278, region: 'Europe (Oceanic Temperate)', category: 'Europe' },
  { id: 'paris', name: 'Paris, France', latitude: 48.8566, longitude: 2.3522, region: 'Western Europe (Oceanic)', category: 'Europe' },
  { id: 'berlin', name: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050, region: 'Central Europe (Moderate Continental)', category: 'Europe' },
  { id: 'rome', name: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964, region: 'Southern Europe (Mediterranean)', category: 'Europe' },
  { id: 'madrid', name: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038, region: 'Southern Europe (Inland Mediterranean)', category: 'Europe' },
  { id: 'amsterdam', name: 'Amsterdam, Netherlands', latitude: 52.3676, longitude: 4.9041, region: 'North-West Europe (Maritime)', category: 'Europe' },
  { id: 'stockholm', name: 'Stockholm, Sweden', latitude: 59.3293, longitude: 18.0686, region: 'Northern Europe (Baltic Subarctic)', category: 'Europe' },
  { id: 'zurich', name: 'Zurich, Switzerland', latitude: 47.3769, longitude: 8.5417, region: 'Central Europe (Alpine Foothills)', category: 'Europe' },

  // --- International: Americas ---
  { id: 'new-york', name: 'New York, United States', latitude: 40.7128, longitude: -74.0060, region: 'North America (Humid Continental)', category: 'Americas' },
  { id: 'los-angeles', name: 'Los Angeles, United States', latitude: 34.0522, longitude: -118.2437, region: 'North America (Mediterranean/Pacific)', category: 'Americas' },
  { id: 'chicago', name: 'Chicago, United States', latitude: 41.8781, longitude: -87.6298, region: 'North America (Great Lakes Continental)', category: 'Americas' },
  { id: 'toronto', name: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832, region: 'North America (Canadian Lakes)', category: 'Americas' },
  { id: 'vancouver', name: 'Vancouver, Canada', latitude: 49.2827, longitude: -123.1207, region: 'North America (Pacific Maritime)', category: 'Americas' },
  { id: 'mexico-city', name: 'Mexico City, Mexico', latitude: 19.4326, longitude: -99.1332, region: 'North America (Highland Subtropical)', category: 'Americas' },
  { id: 'sao-paulo', name: 'São Paulo, Brazil', latitude: -23.5505, longitude: -46.6333, region: 'South America (Highland Tropical)', category: 'Americas' },
  { id: 'buenos-aires', name: 'Buenos Aires, Argentina', latitude: -34.6037, longitude: -58.3816, region: 'South America (Humid Subtropical)', category: 'Americas' },
  { id: 'santiago', name: 'Santiago, Chile', latitude: -33.4489, longitude: -70.6693, region: 'South America (Mediterranean Valley)', category: 'Americas' },

  // --- International: Africa & Oceania ---
  { id: 'nairobi', name: 'Nairobi, Kenya', latitude: -1.2921, longitude: 36.8219, region: 'East Africa (Subtropical Highland)', category: 'Africa & Oceania' },
  { id: 'cairo', name: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357, region: 'North Africa (Arid Desert)', category: 'Africa & Oceania' },
  { id: 'johannesburg', name: 'Johannesburg, South Africa', latitude: -26.2041, longitude: 28.0473, region: 'Southern Africa (Highveld Plateau)', category: 'Africa & Oceania' },
  { id: 'lagos', name: 'Lagos, Nigeria', latitude: 6.5244, longitude: 3.3792, region: 'West Africa (Tropical Wet)', category: 'Africa & Oceania' },
  { id: 'sydney', name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, region: 'Oceania (Temperate Coastal)', category: 'Africa & Oceania' },
  { id: 'melbourne', name: 'Melbourne, Australia', latitude: -37.8136, longitude: 144.9631, region: 'Oceania (Temperate Oceanic)', category: 'Africa & Oceania' },
  { id: 'auckland', name: 'Auckland, New Zealand', latitude: -36.8485, longitude: 174.7633, region: 'Oceania (Maritime Subtropical)', category: 'Africa & Oceania' },
];
