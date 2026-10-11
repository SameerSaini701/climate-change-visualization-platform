import { useState, useMemo, useEffect, useRef } from 'react';
import { PRESET_LOCATIONS } from '../constants/locations';
import { searchWorldwideLocations } from '../services/geocodingApi';

/**
 * Searchable LocationSelector component offering:
 * 1. Fast live search across 56+ curated cities (Indian & International).
 * 2. Worldwide geocoding search for any city/location globally.
 * 3. Categorized regional dropdown for quick selection.
 * 4. Custom Latitude/Longitude manual inputs with coordinate validation.
 */
export default function LocationSelector({ currentLocation, onSelectLocation, disabled = false }) {
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'search' | 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState([]);
  const [searchError, setSearchError] = useState('');

  // Custom coordinate inputs
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [customName, setCustomName] = useState('');
  const [validationError, setValidationError] = useState('');

  // Search input ref
  const searchInputRef = useRef(null);

  // Group preset locations by category for the dropdown
  const categorizedPresets = useMemo(() => {
    const groups = {};
    PRESET_LOCATIONS.forEach((loc) => {
      const cat = loc.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(loc);
    });
    return groups;
  }, []);

  // Filter preset locations locally based on search query
  const filteredPresets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return PRESET_LOCATIONS.slice(0, 10); // Show top 10 presets when empty
    return PRESET_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(query) ||
        loc.region.toLowerCase().includes(query) ||
        (loc.category && loc.category.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Online geocoding search with debounce
  useEffect(() => {
    const query = searchQuery.trim();
    if (activeTab !== 'search' || query.length < 3) {
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      setSearchError('');
      try {
        const results = await searchWorldwideLocations(query, 6);
        if (!isCancelled) {
          setOnlineResults(results);
          setIsSearchingOnline(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setSearchError(err.message || 'Could not reach geocoding service.');
          setIsSearchingOnline(false);
        }
      }
    }, 450); // 450ms debounce

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, activeTab]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 3) {
      setOnlineResults([]);
      setIsSearchingOnline(false);
      setSearchError('');
    }
  };

  // Handle dropdown selection
  const handleDropdownChange = (e) => {
    const val = e.target.value;
    if (val === 'custom_mode') {
      setActiveTab('custom');
      return;
    }
    const preset = PRESET_LOCATIONS.find((loc) => loc.id === val);
    if (preset) {
      setValidationError('');
      onSelectLocation({
        name: preset.name,
        latitude: preset.latitude,
        longitude: preset.longitude,
      });
    }
  };

  // Handle location selection from search results
  const handleSelectFromSearch = (location) => {
    onSelectLocation({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setSearchQuery('');
    setOnlineResults([]);
    setActiveTab('preset');
  };

  // Handle manual custom coordinates submission
  const handleApplyCustom = (e) => {
    e.preventDefault();
    setValidationError('');

    const latNum = parseFloat(customLat);
    const lonNum = parseFloat(customLon);

    if (Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      setValidationError('Latitude must be a valid number between -90.0000 and 90.0000.');
      return;
    }

    if (Number.isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      setValidationError('Longitude must be a valid number between -180.0000 and 180.0000.');
      return;
    }

    const name = customName.trim() || `Custom (${latNum.toFixed(2)}°, ${lonNum.toFixed(2)}°)`;
    onSelectLocation({
      name,
      latitude: latNum,
      longitude: lonNum,
    });
  };

  // Find matching preset ID if current location matches one
  const matchingPreset = PRESET_LOCATIONS.find(
    (loc) =>
      Math.abs(loc.latitude - currentLocation.latitude) < 0.001 &&
      Math.abs(loc.longitude - currentLocation.longitude) < 0.001
  );

  return (
    <div className="location-selector-box">
      {/* Top Header Row */}
      <div className="location-selector-header">
        <div className="selector-title-area">
          <label className="selector-label">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Observation Location
          </label>
          <span className="location-count-badge">56+ Curated Cities & Worldwide Search</span>
        </div>

        <span className="current-coords-pill">
          {currentLocation.latitude >= 0
            ? `${currentLocation.latitude.toFixed(4)}° N`
            : `${Math.abs(currentLocation.latitude).toFixed(4)}° S`},{' '}
          {currentLocation.longitude >= 0
            ? `${currentLocation.longitude.toFixed(4)}° E`
            : `${Math.abs(currentLocation.longitude).toFixed(4)}° W`}
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="location-tabs" role="tablist">
        <button
          type="button"
          className={`location-tab-btn ${activeTab === 'preset' ? 'active' : ''}`}
          onClick={() => setActiveTab('preset')}
          disabled={disabled}
        >
          Browse Curated Cities ({PRESET_LOCATIONS.length})
        </button>
        <button
          type="button"
          className={`location-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('search');
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }}
          disabled={disabled}
        >
          🔍 Search Worldwide City
        </button>
        <button
          type="button"
          className={`location-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
          disabled={disabled}
        >
          Custom Coordinates (Lat/Lon)
        </button>
      </div>

      {/* Tab 1: Curated Regional Dropdown */}
      {activeTab === 'preset' && (
        <div className="preset-selector-row">
          <select
            id="preset-select"
            className="location-dropdown"
            value={matchingPreset ? matchingPreset.id : 'custom_mode'}
            onChange={handleDropdownChange}
            disabled={disabled}
            aria-label="Select a curated city"
          >
            {Object.entries(categorizedPresets).map(([category, cities]) => (
              <optgroup key={category} label={category}>
                {cities.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} — {loc.region}
                  </option>
                ))}
              </optgroup>
            ))}
            <optgroup label="Other">
              <option value="custom_mode">
                {matchingPreset ? 'Enter Custom Coordinates...' : `Custom: ${currentLocation.name}`}
              </option>
            </optgroup>
          </select>
        </div>
      )}

      {/* Tab 2: Searchable City Selector (Local + Worldwide Geocoding) */}
      {activeTab === 'search' && (
        <div className="search-mode-box">
          <div className="search-input-wrapper">
            <svg
              className="search-input-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="city-search-input"
              placeholder="Type city name (e.g. Ludhiana, Dubai, Amritsar, Tokyo, Paris)..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={disabled}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchQuery('');
                  setOnlineResults([]);
                  setIsSearchingOnline(false);
                  setSearchError('');
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Display */}
          <div className="search-results-panel">
            {/* Curated Presets Matching Search */}
            {filteredPresets.length > 0 && (
              <div className="search-group">
                <div className="search-group-header">
                  <span>Curated Database Matches ({filteredPresets.length})</span>
                </div>
                <div className="search-items-list">
                  {filteredPresets.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      className="search-result-item"
                      onClick={() => handleSelectFromSearch(loc)}
                      disabled={disabled}
                    >
                      <div className="result-text">
                        <span className="result-name">{loc.name}</span>
                        <span className="result-region">{loc.region}</span>
                      </div>
                      <span className="result-coords">
                        {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Worldwide Geocoding Results */}
            {isSearchingOnline && (
              <div className="search-status-bar">
                <span className="mini-spinner" />
                <span>Searching worldwide geocoding database for &quot;{searchQuery}&quot;...</span>
              </div>
            )}

            {searchError && (
              <div className="search-error-msg">{searchError}</div>
            )}

            {!isSearchingOnline && onlineResults.length > 0 && (
              <div className="search-group worldwide-group">
                <div className="search-group-header">
                  <span>Worldwide Geocoding Results ({onlineResults.length})</span>
                  <span className="source-tag">Open-Meteo Verified</span>
                </div>
                <div className="search-items-list">
                  {onlineResults.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      className="search-result-item worldwide-item"
                      onClick={() => handleSelectFromSearch(loc)}
                      disabled={disabled}
                    >
                      <div className="result-text">
                        <span className="result-name">{loc.name}</span>
                        <span className="result-region">
                          {loc.region}
                          {loc.elevation !== null && ` • ${loc.elevation}m elevation`}
                        </span>
                      </div>
                      <span className="result-coords">
                        {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.trim().length >= 2 && filteredPresets.length === 0 && onlineResults.length === 0 && !isSearchingOnline && (
              <div className="search-empty-state">
                <p>No matching locations found for &quot;{searchQuery}&quot;.</p>
                <p className="sub-hint">Check spelling or try entering custom coordinates in the tab above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Custom Coordinates Input */}
      {activeTab === 'custom' && (
        <form className="custom-coords-form" onSubmit={handleApplyCustom}>
          <div className="custom-input-group">
            <label htmlFor="custom-lat">Latitude (-90 to 90)</label>
            <input
              id="custom-lat"
              type="number"
              step="any"
              min="-90"
              max="90"
              placeholder="e.g. 30.9010"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              disabled={disabled}
              required
            />
          </div>

          <div className="custom-input-group">
            <label htmlFor="custom-lon">Longitude (-180 to 180)</label>
            <input
              id="custom-lon"
              type="number"
              step="any"
              min="-180"
              max="180"
              placeholder="e.g. 75.8573"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              disabled={disabled}
              required
            />
          </div>

          <div className="custom-input-group name-group">
            <label htmlFor="custom-name">Location Name (Optional)</label>
            <input
              id="custom-name"
              type="text"
              placeholder="e.g. Ludhiana, Punjab"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              disabled={disabled}
            />
          </div>

          <button type="submit" className="apply-coords-btn" disabled={disabled}>
            Fetch Custom Location
          </button>
        </form>
      )}

      {/* Validation Message */}
      {validationError && (
        <div className="validation-error-msg" role="alert">
          {validationError}
        </div>
      )}
    </div>
  );
}
