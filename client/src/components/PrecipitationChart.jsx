import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

/**
 * Custom tooltip to display clear precipitation measurements with units.
 */
function CustomPrecipitationTooltip({ active, payload, label, isAnnual }) {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <div className="chart-tooltip">
        <p className="tooltip-date">{label}</p>
        <div className="tooltip-item" style={{ color: '#059669' }}>
          <span className="tooltip-legend-dot" style={{ backgroundColor: '#059669' }} />
          <span className="tooltip-name">Precipitation:</span>
          <span className="tooltip-value">
            {entry.value !== null && entry.value !== undefined ? `${entry.value} mm/day` : 'N/A (Missing)'}
          </span>
        </div>
        <p className="tooltip-subtext">
          {isAnnual
            ? 'Average daily precipitation rate across the entire year'
            : 'Average daily precipitation depth over this month'}
        </p>
      </div>
    );
  }
  return null;
}

/**
 * PrecipitationChart displays historical precipitation in mm/day
 * using Recharts BarChart. Supports Monthly Observations and Annual Summaries.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of climate records
 * @param {string} props.locationName - Name or coordinates of the selected location
 * @param {string} props.viewMode - 'monthly' or 'annual'
 */
export default function PrecipitationChart({ data, locationName = 'Selected Location', viewMode = 'monthly' }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card empty-chart">
        <h3>Historical Precipitation Analysis</h3>
        <p>No valid precipitation observations available for the selected filter range.</p>
      </div>
    );
  }

  const isAnnual = viewMode === 'annual';
  const tickInterval = isAnnual ? 0 : Math.max(1, Math.floor(data.length / 10));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">
            {isAnnual ? 'Annual Average Precipitation' : 'Historical Monthly Precipitation'} ({locationName})
          </h3>
          <p className="chart-subtitle">
            {isAnnual
              ? 'Annual mean daily precipitation rate (PRECTOTCORR) measured in millimeters per day (mm/day)'
              : 'Observed daily-average precipitation depth (PRECTOTCORR) measured in millimeters per day (mm/day)'}
          </p>
        </div>
        <div className="chart-badge hydro-badge">
          {isAnnual ? 'Annual Hydrological Mean' : 'Monthly Hydrological Record'}
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
            <XAxis
              dataKey="displayDate"
              interval={tickInterval}
              tick={{ fontSize: 12, fill: '#64748b' }}
              angle={isAnnual ? 0 : -25}
              textAnchor={isAnnual ? 'middle' : 'end'}
              height={50}
            />
            <YAxis
              unit=" mm/d"
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{
                value: 'Precipitation (mm/day)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#475569', fontSize: 13, fontWeight: 500 },
              }}
            />
            <Tooltip content={<CustomPrecipitationTooltip isAnnual={isAnnual} />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: '12px' }}
            />
            <Bar
              dataKey="precip"
              name={isAnnual ? 'Annual Mean Precip (mm/day)' : 'Precipitation (PRECTOTCORR)'}
              fill="#059669"
              radius={[3, 3, 0, 0]}
              maxBarSize={isAnnual ? 32 : 16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer">
        <span>Unit: Millimeters per day (mm/day)</span>
        <span>Resolution: {isAnnual ? 'Annual Daily Average' : 'Monthly Temporal Rate'}</span>
      </div>
    </div>
  );
}
