/**
 * Climate Statistics Calculation Utility
 * 
 * Provides verified mathematical calculations for historical climate series:
 * 1. Average Temperature (°C)
 * 2. Warmest Year (°C)
 * 3. Wettest Month (date & mm/day)
 * 4. Temperature Trend (°C/decade) via Ordinary Least Squares (OLS) Linear Regression
 */

/**
 * Calculates summary statistics for a filtered set of monthly climate observations.
 * 
 * @param {Array} monthlyData - Array of monthly records { year, month, displayDate, t2m, precip }
 * @param {Array} annualData - Array of annual records (NASA month 13 or yearly aggregates)
 * @returns {Object} Calculated summary metrics
 */
export function calculateClimateSummary(monthlyData = []) {
  if (!monthlyData || monthlyData.length === 0) {
    return {
      averageTemp: null,
      warmestYear: null,
      wettestMonth: null,
      temperatureTrend: null,
      validObservationsCount: 0,
      totalMonths: 0,
    };
  }

  // 1. Average Temperature (°C)
  const validTempObservations = monthlyData.filter(
    (d) => d.t2m !== null && d.t2m !== undefined && Number.isFinite(d.t2m)
  );

  let averageTemp = null;
  if (validTempObservations.length > 0) {
    const sumTemp = validTempObservations.reduce((acc, curr) => acc + curr.t2m, 0);
    averageTemp = Number((sumTemp / validTempObservations.length).toFixed(2));
  }

  // 2. Warmest Year (°C)
  // Group observations by year and calculate the average for each year
  const yearlyTempMap = {};
  validTempObservations.forEach((d) => {
    if (!yearlyTempMap[d.year]) {
      yearlyTempMap[d.year] = { sum: 0, count: 0 };
    }
    yearlyTempMap[d.year].sum += d.t2m;
    yearlyTempMap[d.year].count += 1;
  });

  let warmestYear = null;
  let maxYearlyAvg = -Infinity;

  Object.entries(yearlyTempMap).forEach(([yearStr, stats]) => {
    // Require at least 6 months of valid observations to consider a year representative
    if (stats.count >= 6) {
      const yearAvg = stats.sum / stats.count;
      if (yearAvg > maxYearlyAvg) {
        maxYearlyAvg = yearAvg;
        warmestYear = {
          year: parseInt(yearStr, 10),
          averageTemp: Number(yearAvg.toFixed(2)),
          monthsRecorded: stats.count,
        };
      }
    }
  });

  // 3. Wettest Month (Date & mm/day)
  const validPrecipObservations = monthlyData.filter(
    (d) => d.precip !== null && d.precip !== undefined && Number.isFinite(d.precip)
  );

  let wettestMonth = null;
  if (validPrecipObservations.length > 0) {
    let maxPrecip = -Infinity;
    validPrecipObservations.forEach((d) => {
      if (d.precip > maxPrecip) {
        maxPrecip = d.precip;
        wettestMonth = {
          date: d.displayDate,
          isoDate: d.isoDate,
          year: d.year,
          month: d.month,
          precipitation: Number(d.precip.toFixed(2)),
          unit: 'mm/day',
        };
      }
    });
  }

  // 4. Temperature Trend (°C / decade) using Ordinary Least Squares (OLS) Linear Regression
  // Formula:
  // Slope m = (N * Σ(xy) - Σx * Σy) / (N * Σ(x^2) - (Σx)^2)
  // Where x is time in years: x_i = year + (month - 0.5) / 12
  // And y is mean temperature in °C: y_i = t2m
  // Decadal trend = slope m * 10 (°C / decade)
  let temperatureTrend = null;
  if (validTempObservations.length >= 24) { // Require at least 2 full years of data for trend
    const n = validTempObservations.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    validTempObservations.forEach((d) => {
      // Time coordinate in decimal years (e.g., 2014.0416 for Jan 2014)
      const x = d.year + (d.month - 0.5) / 12;
      const y = d.t2m;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    const denominator = n * sumX2 - sumX * sumX;
    if (Math.abs(denominator) > 1e-9) {
      const slopePerYear = (n * sumXY - sumX * sumY) / denominator;
      const slopePerDecade = slopePerYear * 10;
      
      temperatureTrend = {
        slopePerYear: Number(slopePerYear.toFixed(4)),
        slopePerDecade: Number(slopePerDecade.toFixed(2)),
        direction: slopePerDecade > 0.05 ? 'warming' : slopePerDecade < -0.05 ? 'cooling' : 'stable',
        dataPoints: n,
        method: 'Ordinary Least Squares (OLS) linear regression on monthly observations',
      };
    }
  }

  return {
    averageTemp,
    warmestYear,
    wettestMonth,
    temperatureTrend,
    validObservationsCount: validTempObservations.length,
    totalMonths: monthlyData.length,
  };
}

/**
 * Computes annual summary averages from a monthly dataset.
 * Aggregates monthly observations into year-by-year summary points.
 * 
 * @param {Array} monthlyData 
 * @returns {Array} Array of annual points { year, t2m, t2mMax, t2mMin, precip }
 */
export function computeAnnualSummaries(monthlyData = []) {
  const yearsMap = {};

  monthlyData.forEach((d) => {
    if (!yearsMap[d.year]) {
      yearsMap[d.year] = {
        year: d.year,
        t2mList: [],
        t2mMaxList: [],
        t2mMinList: [],
        precipList: [],
      };
    }

    if (d.t2m !== null && Number.isFinite(d.t2m)) yearsMap[d.year].t2mList.push(d.t2m);
    if (d.t2mMax !== null && Number.isFinite(d.t2mMax)) yearsMap[d.year].t2mMaxList.push(d.t2mMax);
    if (d.t2mMin !== null && Number.isFinite(d.t2mMin)) yearsMap[d.year].t2mMinList.push(d.t2mMin);
    if (d.precip !== null && Number.isFinite(d.precip)) yearsMap[d.year].precipList.push(d.precip);
  });

  return Object.values(yearsMap).map((item) => {
    const avg = (arr) => arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : null;
    const maxVal = (arr) => arr.length ? Number(Math.max(...arr).toFixed(2)) : null;
    const minVal = (arr) => arr.length ? Number(Math.min(...arr).toFixed(2)) : null;

    return {
      year: item.year,
      displayDate: String(item.year),
      t2m: avg(item.t2mList),
      t2mMax: maxVal(item.t2mMaxList),
      t2mMin: minVal(item.t2mMinList),
      precip: avg(item.precipList),
      monthsCount: item.t2mList.length,
    };
  }).sort((a, b) => a.year - b.year);
}
