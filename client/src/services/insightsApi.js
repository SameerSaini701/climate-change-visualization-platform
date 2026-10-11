import axios from 'axios';

/**
 * Backend API Base URL:
 * Resolves to Vite environment variable VITE_API_BASE_URL (configured on Vercel/production)
 * or falls back safely to 'http://localhost:5000' for local development.
 * Automatically trims trailing slashes to prevent malformed double slashes.
 */
const API_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? import.meta.env.VITE_API_BASE_URL
    : 'http://localhost:5000'
).replace(/\/+$/, '');

const BACKEND_INSIGHTS_URL = `${API_BASE_URL}/api/insights`;

/**
 * Client-side fallback if backend server is unreachable.
 */
function getClientLocalFallback(location, period, summary) {
  const insights = [];
  const locName = location?.name || 'Selected location';
  const start = period?.startYear || 2014;
  const end = period?.endYear || 2023;

  if (summary?.averageTemp !== null && summary?.averageTemp !== undefined) {
    insights.push(`Mean Temperature: Over ${start}–${end}, ${locName} recorded a mean temperature of ${summary.averageTemp} °C.`);
  }
  if (summary?.warmestYear) {
    insights.push(`Warmest Year: ${summary.warmestYear.year} was the warmest calendar year with an annual mean of ${summary.warmestYear.averageTemp} °C.`);
  }
  if (summary?.wettestMonth) {
    insights.push(`Peak Precipitation: Peak monthly precipitation occurred in ${summary.wettestMonth.date} at ${summary.wettestMonth.precipitation} mm/day.`);
  }
  if (summary?.temperatureTrend) {
    const trend = summary.temperatureTrend.slopePerDecade;
    const sign = trend > 0 ? '+' : '';
    insights.push(`Decadal Trend: OLS linear regression shows a rate of ${sign}${trend} °C per decade over this period.`);
  }

  return {
    success: true,
    source: 'calculated_client',
    badge: 'Calculated from data',
    isFallback: true,
    note: 'Backend insights service unreachable. Insights computed locally from NASA POWER observations.',
    insights,
  };
}

/**
 * Requests climate insights from Express backend /api/insights.
 * Gracefully falls back to local data-derived insights if the backend is unreachable.
 * 
 * @param {Object} payload 
 * @param {Object} payload.location - { name, latitude, longitude }
 * @param {Object} payload.period - { startYear, endYear }
 * @param {Object} payload.summary - Summary statistics object
 * @returns {Promise<Object>}
 */
export async function fetchClimateInsights({ location, period, summary }) {
  try {
    const response = await axios.post(
      BACKEND_INSIGHTS_URL,
      { location, period, summary },
      {
        timeout: 12000,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    // Validate that the backend returned a successful insights response
    if (
      response.data &&
      response.data.success &&
      Array.isArray(response.data.insights) &&
      response.data.insights.length > 0
    ) {
      return {
        ...response.data,
        isFallback: false,
      };
    }

    throw new Error(response.data?.error || 'Invalid insights payload structure');
  } catch (err) {
    // If backend is down or network fails, return client-side calculated fallback
    console.warn('Backend /api/insights unreachable, using client-side fallback:', err.message);
    return getClientLocalFallback(location, period, summary);
  }
}
