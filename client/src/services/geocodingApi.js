import axios from 'axios';

/**
 * Open-Meteo Geocoding API endpoint.
 * Provides fast, open, worldwide city geocoding with verified geographic coordinates.
 * No API key required; CORS enabled for client-side search.
 */
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Searches worldwide locations by name to retrieve real latitude and longitude coordinates.
 * 
 * @param {string} query - City or location name entered by the user
 * @param {number} count - Maximum number of search suggestions (default 6)
 * @returns {Promise<Array<{id: string|number, name: string, cityName: string, country: string, admin1: string, latitude: number, longitude: number, elevation: number|null}>>}
 */
export async function searchWorldwideLocations(query, count = 6) {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) {
    return [];
  }

  try {
    const response = await axios.get(GEOCODING_BASE_URL, {
      params: {
        name: trimmed,
        count,
        language: 'en',
        format: 'json',
      },
      timeout: 10000, // 10-second timeout
    });

    const results = response.data?.results || [];

    return results.map((item) => {
      const parts = [item.name];
      if (item.admin1 && item.admin1 !== item.name) {
        parts.push(item.admin1);
      }
      if (item.country) {
        parts.push(item.country);
      }

      return {
        id: `geo-${item.id}`,
        name: parts.join(', '),
        cityName: item.name,
        country: item.country || '',
        admin1: item.admin1 || '',
        latitude: Number(item.latitude.toFixed(4)),
        longitude: Number(item.longitude.toFixed(4)),
        elevation: item.elevation !== undefined ? Math.round(item.elevation) : null,
        region: item.country ? `${item.country}${item.admin1 ? ` (${item.admin1})` : ''}` : 'Worldwide',
        isWorldwideResult: true,
      };
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error('Worldwide location search timed out. Please check your internet connection.', { cause: err });
    }
    if (err.response) {
      throw new Error(`Geocoding service error (${err.response.status}). Could not search locations.`, { cause: err });
    }
    throw new Error('Network error during location search. Please verify network connectivity.', { cause: err });
  }
}
