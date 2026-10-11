import axios from 'axios';

/**
 * NASA POWER API Base URL for Monthly and Annual Meteorology Data
 */
const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/monthly/point';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Validates whether a value is a genuine observation or a NASA missing-data marker.
 * NASA POWER uses -999.0 as a fill value for missing observations.
 * 
 * @param {number|any} value - The raw reading from the API
 * @param {number} fillValue - The designated fill value from NASA headers (defaults to -999)
 * @returns {boolean} True if the value is a valid numeric observation
 */
export function isValidObservation(value, fillValue = -999.0) {
  if (value === null || value === undefined || typeof value !== 'number') return false;
  if (Number.isNaN(value) || !Number.isFinite(value)) return false;
  // Check against fill value (with floating point tolerance)
  if (Math.abs(value - fillValue) < 0.01) return false;
  // Extra safeguard for any sentinel values in the -900 to -1000 range
  if (value <= -900) return false;
  return true;
}

/**
 * In-memory client cache to store retrieved climate series by coordinate and year range.
 * Prevents redundant network requests when switching between previously visited cities.
 */
const climateDataCache = new Map();

function buildCacheKey(lat, lon, startYear, endYear) {
  return `${lat.toFixed(4)}_${lon.toFixed(4)}_${startYear}_${endYear}`;
}

/**
 * Fetches real historical monthly climate data from the NASA POWER API.
 * 
 * @param {Object} options
 * @param {number} options.latitude - Latitude between -90 and 90
 * @param {number} options.longitude - Longitude between -180 and 180
 * @param {number} options.startYear - Start year (e.g. 2014)
 * @param {number} options.endYear - End year (e.g. 2023)
 * @returns {Promise<{monthlyData: Array, annualData: Array, metadata: Object}>}
 */
export async function fetchClimateData({ latitude, longitude, startYear = 2014, endYear = 2023 }) {
  // Validate coordinates
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    throw new Error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
  }
  if (startYear > endYear) {
    throw new Error(`Start year (${startYear}) cannot be greater than end year (${endYear}).`);
  }

  // Check cache first to avoid redundant API hits
  const cacheKey = buildCacheKey(latitude, longitude, startYear, endYear);
  if (climateDataCache.has(cacheKey)) {
    return climateDataCache.get(cacheKey);
  }

  const params = {
    parameters: 'T2M,T2M_MAX,T2M_MIN,PRECTOTCORR',
    community: 'RE', // Renewable Energy community provides solar & meteorological data
    longitude: longitude.toFixed(4),
    latitude: latitude.toFixed(4),
    start: startYear.toString(),
    end: endYear.toString(),
    format: 'JSON',
  };

  try {
    const response = await axios.get(NASA_POWER_BASE_URL, {
      params,
      timeout: 20000, // 20-second timeout
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = response.data;
    if (!data || !data.properties || !data.properties.parameter) {
      throw new Error('Unexpected response format from NASA POWER API. No parameter data found.');
    }

    const { T2M, T2M_MAX, T2M_MIN, PRECTOTCORR } = data.properties.parameter;
    const fillValue = data.header?.fill_value ?? -999.0;

    // Collect all unique time keys (e.g. "201401", "201402", ..., "201413")
    const allKeys = Object.keys(T2M || {}).sort();

    if (allKeys.length === 0) {
      throw new Error('NASA POWER API returned an empty dataset for the requested location and timeframe.');
    }

    const monthlyData = [];
    const annualData = [];

    allKeys.forEach((key) => {
      if (key.length !== 6) return; // Expecting YYYYMM format

      const year = parseInt(key.substring(0, 4), 10);
      const monthNumber = parseInt(key.substring(4, 6), 10);

      // Raw values
      const rawT2m = T2M?.[key];
      const rawT2mMax = T2M_MAX?.[key];
      const rawT2mMin = T2M_MIN?.[key];
      const rawPrecip = PRECTOTCORR?.[key];

      // Filter invalid or -999 fill values
      const t2m = isValidObservation(rawT2m, fillValue) ? Number(rawT2m.toFixed(2)) : null;
      const t2mMax = isValidObservation(rawT2mMax, fillValue) ? Number(rawT2mMax.toFixed(2)) : null;
      const t2mMin = isValidObservation(rawT2mMin, fillValue) ? Number(rawT2mMin.toFixed(2)) : null;
      const precip = isValidObservation(rawPrecip, fillValue) ? Number(rawPrecip.toFixed(2)) : null;

      // NASA POWER convention: Month 13 represents the ANNUAL average for that year
      if (monthNumber === 13) {
        annualData.push({
          year,
          t2m,
          t2mMax,
          t2mMin,
          precip,
        });
      } else if (monthNumber >= 1 && monthNumber <= 12) {
        // Genuine calendar month (01 to 12)
        const monthIndex = monthNumber - 1;
        const monthLabel = MONTH_NAMES[monthIndex];
        const displayDate = `${monthLabel} ${year}`;
        const isoDate = `${year}-${String(monthNumber).padStart(2, '0')}`;

        monthlyData.push({
          dateKey: key,
          isoDate,
          displayDate,
          year,
          month: monthNumber,
          monthLabel,
          t2m,
          t2mMax,
          t2mMin,
          precip,
        });
      }
    });

    const result = {
      monthlyData,
      annualData,
      metadata: {
        latitude,
        longitude,
        startYear,
        endYear,
        elevation: data.geometry?.coordinates?.[2] ?? null,
        fillValue,
        source: data.header?.sources?.join(', ') || 'NASA POWER / MERRA-2',
        title: data.header?.title || 'NASA POWER Monthly Meteorology',
        parameterUnits: {
          t2m: '°C',
          t2mMax: '°C',
          t2mMin: '°C',
          precip: 'mm/day',
        },
      },
    };

    climateDataCache.set(cacheKey, result);
    return result;
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error('Connection to NASA POWER API timed out after 20 seconds. Please check your internet connection and try again.', { cause: err });
    }
    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.messages?.[0] || err.response.statusText;
      throw new Error(`NASA POWER API error (${status}): ${detail || 'Request could not be processed.'}`, { cause: err });
    }
    if (err.request) {
      throw new Error('Network error: Unable to reach NASA POWER servers. Please verify network connectivity.', { cause: err });
    }
    throw err;
  }
}
