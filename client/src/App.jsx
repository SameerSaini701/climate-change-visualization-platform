import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchClimateData } from './services/nasaApi';
import { calculateClimateSummary, computeAnnualSummaries } from './utils/climateStats';
import { fetchClimateInsights } from './services/insightsApi';
import LocationSelector from './components/LocationSelector';
import { PRESET_LOCATIONS } from './constants/locations';
import Filters from './components/Filters';
import SummaryCards from './components/SummaryCards';
import AIInsights from './components/AIInsights';
import TemperatureChart from './components/TemperatureChart';
import PrecipitationChart from './components/PrecipitationChart';
import ErrorBanner from './components/ErrorBanner';
import './App.css';

export default function App() {
  const [dataState, setDataState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  // Selected Location (Defaults to London, UK)
  const [currentLocation, setCurrentLocation] = useState({
    name: PRESET_LOCATIONS[0].name,
    latitude: PRESET_LOCATIONS[0].latitude,
    longitude: PRESET_LOCATIONS[0].longitude,
  });

  // Filter States
  const [selectedStartYear, setSelectedStartYear] = useState(2014);
  const [selectedEndYear, setSelectedEndYear] = useState(2023);
  const [selectedMetric, setSelectedMetric] = useState('all'); // 'all' | 'temperature' | 'precipitation'
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'annual'

  // Trigger re-fetch for retry or location change
  const [fetchIndex, setFetchIndex] = useState(0);

  // Insights State
  const [insightsState, setInsightsState] = useState({
    loading: false,
    data: null,
  });
  const [insightsRefreshIndex, setInsightsRefreshIndex] = useState(0);

  const handleRetry = () => {
    setDataState({ loading: true, error: null, data: null });
    setFetchIndex((prev) => prev + 1);
  };

  const handleSelectLocation = (newLoc) => {
    setCurrentLocation(newLoc);
    setDataState({ loading: true, error: null, data: null });
    setFetchIndex((prev) => prev + 1);
  };

  const handleYearRangeChange = (start, end) => {
    setSelectedStartYear(start);
    setSelectedEndYear(end);
  };

  const handleRefreshInsights = useCallback(() => {
    setInsightsRefreshIndex((prev) => prev + 1);
  }, []);

  // Fetch NASA POWER climate observations
  useEffect(() => {
    let isCancelled = false;

    // Fetch baseline 10 years (2014 to 2023)
    fetchClimateData({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      startYear: 2014,
      endYear: 2023,
    })
      .then((result) => {
        if (!isCancelled) {
          setDataState({
            loading: false,
            error: null,
            data: result,
          });
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setDataState({
            loading: false,
            error: err.message || 'Failed to fetch data from NASA POWER API.',
            data: null,
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentLocation.latitude, currentLocation.longitude, fetchIndex]);

  const { loading, error, data } = dataState;

  // Available historical years derived from dataset
  const availableYears = useMemo(() => {
    if (!data?.monthlyData) return [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023];
    const yearsSet = new Set(data.monthlyData.map((d) => d.year));
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [data]);

  // Filtered monthly records based on selected year range
  const filteredMonthlyData = useMemo(() => {
    if (!data?.monthlyData) return [];
    return data.monthlyData.filter(
      (d) => d.year >= selectedStartYear && d.year <= selectedEndYear
    );
  }, [data, selectedStartYear, selectedEndYear]);

  // Filtered annual records
  const filteredAnnualData = useMemo(() => {
    if (!filteredMonthlyData.length) return [];
    return computeAnnualSummaries(filteredMonthlyData);
  }, [filteredMonthlyData]);

  // Reactive summary indicators calculated from filtered observations
  const climateSummary = useMemo(() => {
    return calculateClimateSummary(filteredMonthlyData);
  }, [filteredMonthlyData]);

  // Fetch Insights from Express backend (Gemini AI or calculated data fallback)
  useEffect(() => {
    if (!climateSummary || climateSummary.averageTemp === null) {
      return;
    }

    let isCancelled = false;

    fetchClimateInsights({
      location: currentLocation,
      period: { startYear: selectedStartYear, endYear: selectedEndYear },
      summary: climateSummary,
    })
      .then((insightsResult) => {
        if (!isCancelled) {
          setInsightsState({
            loading: false,
            data: insightsResult,
          });
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Could not load insights:', err);
          setInsightsState({
            loading: false,
            data: null,
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentLocation, selectedStartYear, selectedEndYear, climateSummary, insightsRefreshIndex]);

  // Dataset to pass to charts depending on viewMode
  const chartData = viewMode === 'annual' ? filteredAnnualData : filteredMonthlyData;
  const observationPeriodLabel = `${selectedStartYear} – ${selectedEndYear}`;

  return (
    <div className="app-layout">
      {/* Platform Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-section">
            <div className="brand-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">Climate Change Data Visualization Platform</h1>
              <p className="brand-tagline">Real-world Earth observation data powered by NASA POWER</p>
            </div>
          </div>

          <div className="data-source-badge">
            <span className="live-dot" />
            <span>NASA POWER API v2.10 (Live Connection)</span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="main-content">
        {/* Searchable Location Selector */}
        <LocationSelector
          currentLocation={currentLocation}
          onSelectLocation={handleSelectLocation}
          disabled={loading}
        />

        {/* Interactive Filters: Year Range, Metric, Data Resolution */}
        <Filters
          availableYears={availableYears}
          selectedStartYear={selectedStartYear}
          selectedEndYear={selectedEndYear}
          onYearRangeChange={handleYearRangeChange}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          disabled={loading || !data}
        />

        {/* Error notification banner with working retry button */}
        {error && (
          <ErrorBanner message={error} onRetry={handleRetry} />
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-card">
            <div className="spinner" />
            <h3 className="loading-title">Retrieving genuine observations from NASA POWER...</h3>
            <p className="loading-desc">
              Fetching 10 years of monthly meteorological data for {currentLocation.name} ({currentLocation.latitude.toFixed(2)}°, {currentLocation.longitude.toFixed(2)}°) directly from NASA Langley Research Center.
            </p>
          </div>
        )}

        {/* Populated Dashboard Content */}
        {!loading && data && (
          <>
            {/* 4 Core Summary Indicator Cards */}
            <SummaryCards
              summary={climateSummary}
              observationPeriod={observationPeriodLabel}
            />

            {/* AI Insights & Interpretation Card */}
            <AIInsights
              insightsData={insightsState.data}
              loading={insightsState.loading}
              onRefresh={handleRefreshInsights}
            />

            {/* Visualizations Grid */}
            <div className="charts-grid">
              {(selectedMetric === 'all' || selectedMetric === 'temperature') && (
                <TemperatureChart
                  data={chartData}
                  locationName={currentLocation.name}
                  viewMode={viewMode}
                />
              )}

              {(selectedMetric === 'all' || selectedMetric === 'precipitation') && (
                <PrecipitationChart
                  data={chartData}
                  locationName={currentLocation.name}
                  viewMode={viewMode}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Grounded Attribution Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>
            Data provided by{' '}
            <a
              href="https://power.larc.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              NASA Prediction Of Worldwide Energy Resources (POWER) Project
            </a>
            . Sourced from NASA/GMAO MERRA-2 assimilation model.
          </p>
          <p>
            Parameters: T2M (Mean Temp, °C) • T2M_MAX (Max Temp, °C) • T2M_MIN (Min Temp, °C) • PRECTOTCORR (Precipitation, mm/day).
          </p>
        </div>
      </footer>
    </div>
  );
}
