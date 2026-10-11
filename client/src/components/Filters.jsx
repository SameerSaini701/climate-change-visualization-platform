/**
 * Filters component allowing selection of:
 * - Year Range (Start Year & End Year)
 * - Metric view (All Metrics, Temperature Only, Precipitation Only)
 * - Temporal Granularity (Monthly Observations vs Annual Summaries)
 */
export default function Filters({
  availableYears = [],
  selectedStartYear,
  selectedEndYear,
  onYearRangeChange,
  selectedMetric,
  onMetricChange,
  viewMode,
  onViewModeChange,
  disabled = false,
}) {
  const handleStartYearChange = (e) => {
    const newStart = parseInt(e.target.value, 10);
    if (newStart <= selectedEndYear) {
      onYearRangeChange(newStart, selectedEndYear);
    }
  };

  const handleEndYearChange = (e) => {
    const newEnd = parseInt(e.target.value, 10);
    if (newEnd >= selectedStartYear) {
      onYearRangeChange(selectedStartYear, newEnd);
    }
  };

  return (
    <div className="filters-card">
      <div className="filters-grid">
        {/* Year Range Filter */}
        <div className="filter-item">
          <label className="filter-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Historical Year Range
          </label>
          <div className="year-range-inputs">
            <div className="year-select-wrapper">
              <span className="year-select-prefix">From:</span>
              <select
                value={selectedStartYear}
                onChange={handleStartYearChange}
                disabled={disabled}
                className="filter-select"
                aria-label="Start year"
              >
                {availableYears.map((year) => (
                  <option key={`start-${year}`} value={year} disabled={year > selectedEndYear}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <span className="year-range-separator">to</span>

            <div className="year-select-wrapper">
              <span className="year-select-prefix">To:</span>
              <select
                value={selectedEndYear}
                onChange={handleEndYearChange}
                disabled={disabled}
                className="filter-select"
                aria-label="End year"
              >
                {availableYears.map((year) => (
                  <option key={`end-${year}`} value={year} disabled={year < selectedStartYear}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="filter-item">
          <label className="filter-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Visible Metric
          </label>
          <div className="segmented-control" role="group" aria-label="Metric Selector">
            <button
              type="button"
              className={`segmented-button ${selectedMetric === 'all' ? 'active' : ''}`}
              onClick={() => onMetricChange('all')}
              disabled={disabled}
            >
              All Metrics
            </button>
            <button
              type="button"
              className={`segmented-button ${selectedMetric === 'temperature' ? 'active' : ''}`}
              onClick={() => onMetricChange('temperature')}
              disabled={disabled}
            >
              Temperature
            </button>
            <button
              type="button"
              className={`segmented-button ${selectedMetric === 'precipitation' ? 'active' : ''}`}
              onClick={() => onMetricChange('precipitation')}
              disabled={disabled}
            >
              Precipitation
            </button>
          </div>
        </div>

        {/* Temporal Granularity: Monthly Observations vs Annual Summaries */}
        <div className="filter-item">
          <label className="filter-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Data Resolution
          </label>
          <div className="segmented-control" role="group" aria-label="Temporal Resolution Selector">
            <button
              type="button"
              className={`segmented-button ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => onViewModeChange('monthly')}
              disabled={disabled}
              title="Individual monthly records (12 points per year)"
            >
              Monthly Observations
            </button>
            <button
              type="button"
              className={`segmented-button ${viewMode === 'annual' ? 'active' : ''}`}
              onClick={() => onViewModeChange('annual')}
              disabled={disabled}
              title="Annual summary aggregates (1 point per year)"
            >
              Annual Summaries
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
