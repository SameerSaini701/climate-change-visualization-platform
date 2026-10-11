/**
 * AIInsights component displaying either:
 * - "AI-generated" insights from Google Gemini (when GEMINI_API_KEY is configured)
 * - "Calculated from data" factual insights derived directly from NASA observations (when key is absent or fallback triggered)
 */
export default function AIInsights({ insightsData, loading, onRefresh }) {
  if (loading) {
    return (
      <div className="insights-card">
        <div className="insights-header">
          <div className="insights-title-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <h3 className="insights-title">Climate Insights & Interpretation</h3>
          </div>
        </div>
        <div className="insights-loading">
          <span className="mini-spinner" />
          <span>Generating insights from observed climate data...</span>
        </div>
      </div>
    );
  }

  if (!insightsData || !insightsData.insights || insightsData.insights.length === 0) {
    return null;
  }

  const { source, badge, note, disclaimer, insights, isFallback } = insightsData;
  const isAI = source === 'ai';
  // Connection failure warning should ONLY display when the backend request actually failed,
  // timed out, or returned an invalid payload (client-side fallback mode)
  const isConnectionFailure = isFallback === true || source === 'calculated_client';

  return (
    <div className={`insights-card ${isAI ? 'ai-insights-theme' : 'calc-insights-theme'}`}>
      <div className="insights-header">
        <div className="insights-title-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <h3 className="insights-title">Climate Insights & Interpretation</h3>
        </div>

        <div className="insights-header-right">
          <span className={`insights-badge ${isAI ? 'ai-badge' : 'calc-badge'}`}>
            {badge || (isAI ? 'AI-generated' : 'Calculated from data')}
          </span>

          {onRefresh && (
            <button
              type="button"
              className="refresh-insights-btn"
              onClick={onRefresh}
              title="Refresh Insights"
              aria-label="Refresh Insights"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {isConnectionFailure && note && (
        <div className="insights-status-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{note}</span>
        </div>
      )}

      <ul className="insights-list">
        {insights.map((point, idx) => (
          <li key={idx} className="insight-item">
            <span className="insight-bullet">▸</span>
            <span className="insight-text">{point}</span>
          </li>
        ))}
      </ul>

      <div className="insights-footer">
        {disclaimer ? (
          <p className="insights-disclaimer-text">
            <strong>Disclaimer:</strong> {disclaimer}
          </p>
        ) : (
          <p className="insights-disclaimer-text">
            <strong>Source:</strong> Factual summary computed deterministically from NASA POWER observational data.
          </p>
        )}
      </div>
    </div>
  );
}
