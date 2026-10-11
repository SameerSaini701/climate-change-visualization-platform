/**
 * SummaryCards component displaying the 4 core climate indicators:
 * 1. Average Temperature (°C)
 * 2. Warmest Year (°C)
 * 3. Wettest Month (Date & mm/day)
 * 4. Temperature Trend (°C / decade)
 */
export default function SummaryCards({ summary, observationPeriod }) {
  if (!summary) return null;

  const { averageTemp, warmestYear, wettestMonth, temperatureTrend, validObservationsCount } = summary;

  const trendValue = temperatureTrend?.slopePerDecade;
  const isWarming = trendValue !== undefined && trendValue > 0.05;
  const isCooling = trendValue !== undefined && trendValue < -0.05;

  return (
    <section className="summary-cards-section" aria-label="Climate Summary Indicators">
      <div className="summary-cards-grid">
        {/* Card 1: Average Temperature */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Average Temperature</span>
            <div className="metric-icon-box temp-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-value-row">
              <span className="metric-main-value">
                {averageTemp !== null ? averageTemp : '—'}
              </span>
              <span className="metric-unit">°C</span>
            </div>
            <p className="metric-description">
              Mean 2-meter air temperature over {observationPeriod || 'the selected period'} ({validObservationsCount} valid monthly observations).
            </p>
          </div>
          <div className="metric-card-footer">
            <span className="metric-tag">NASA T2M Mean</span>
          </div>
        </div>

        {/* Card 2: Warmest Year */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Warmest Year</span>
            <div className="metric-icon-box warm-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-value-row">
              <span className="metric-main-value">
                {warmestYear ? warmestYear.year : '—'}
              </span>
              {warmestYear && (
                <span className="metric-sub-value">
                  ({warmestYear.averageTemp} °C avg)
                </span>
              )}
            </div>
            <p className="metric-description">
              Highest annual mean temperature recorded among calendar years with full observations.
            </p>
          </div>
          <div className="metric-card-footer">
            <span className="metric-tag">Highest Annual Average</span>
          </div>
        </div>

        {/* Card 3: Wettest Month */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Wettest Month</span>
            <div className="metric-icon-box rain-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
                <line x1="8" y1="19" x2="8" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="16" y1="19" x2="16" y2="21" />
              </svg>
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-value-row">
              <span className="metric-main-value">
                {wettestMonth ? wettestMonth.date : '—'}
              </span>
              {wettestMonth && (
                <span className="metric-sub-value">
                  ({wettestMonth.precipitation} mm/day)
                </span>
              )}
            </div>
            <p className="metric-description">
              Peak monthly precipitation rate (PRECTOTCORR). Expressed as average daily water-equivalent depth across that month.
            </p>
          </div>
          <div className="metric-card-footer">
            <span className="metric-tag hydro-tag">Daily Rate: mm/day</span>
          </div>
        </div>

        {/* Card 4: Temperature Trend */}
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Temperature Trend</span>
            <div className={`metric-icon-box ${isWarming ? 'warm-icon' : isCooling ? 'cool-icon' : 'trend-icon'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </div>
          </div>
          <div className="metric-card-body">
            <div className="metric-value-row">
              <span className={`metric-main-value ${isWarming ? 'trend-warming' : isCooling ? 'trend-cooling' : ''}`}>
                {trendValue !== undefined ? `${trendValue > 0 ? '+' : ''}${trendValue}` : '—'}
              </span>
              <span className="metric-unit">°C / decade</span>
            </div>
            <p className="metric-description">
              Calculated via Ordinary Least Squares (OLS) linear regression on monthly mean temperature observations.
            </p>
          </div>
          <div className="metric-card-footer trend-footer">
            <span className={`trend-badge ${isWarming ? 'badge-warming' : isCooling ? 'badge-cooling' : 'badge-neutral'}`}>
              {isWarming ? '▲ Warming Trend' : isCooling ? '▼ Cooling Trend' : '● Stable / Minor Change'}
            </span>
          </div>
        </div>
      </div>

      <div className="trend-disclaimer">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          <strong>Scientific Note on Trend:</strong> This slope describes the mathematical rate of change across the selected period and location. A localized statistical trend provides empirical evidence of temperature change over time, but proving attribution or causation requires comprehensive physical climate models.
        </span>
      </div>
    </section>
  );
}
