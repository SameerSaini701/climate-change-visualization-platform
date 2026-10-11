
/**
 * ErrorBanner component for notifying the user when NASA POWER API
 * or network requests fail, offering an immediate Retry button.
 */
export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-icon">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="error-banner-content">
        <h4 className="error-banner-title">Data Retrieval Error</h4>
        <p className="error-banner-message">{message}</p>
        <p className="error-banner-hint">
          NASA POWER service may occasionally rate-limit or experience brief downtime.
          No simulated or fabricated data was substituted.
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="retry-button"
          aria-label="Retry fetching data"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Retry Fetch
        </button>
      )}
    </div>
  );
}
