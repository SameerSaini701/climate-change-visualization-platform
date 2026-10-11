import axios from 'axios';

const BACKEND_INSIGHTS_URL = 'http://localhost:5000/api/insights';

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
    note: 'Backend server not detected on port 5000. Insights computed locally from NASA POWER observations.',
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
    return response.data;
  } catch (err) {
    // If backend is down or network fails, return client-side calculated fallback
    console.warn('Backend /api/insights unreachable, using client-side fallback:', err.message);
    return getClientLocalFallback(location, period, summary);
  }
}
