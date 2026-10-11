import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

/**
 * Custom tooltip to display clear temperature measurements with units.
 */
function CustomTemperatureTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="tooltip-date">{label}</p>
        <div className="tooltip-items">
          {payload.map((entry) => (
            <div
              key={entry.dataKey}
              className="tooltip-item"
              style={{ color: entry.color }}
            >
              <span className="tooltip-legend-dot" style={{ backgroundColor: entry.color }} />
              <span className="tooltip-name">{entry.name}:</span>
              <span className="tooltip-value">
                {entry.value !== null && entry.value !== undefined ? `${entry.value} °C` : 'N/A (Missing)'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * TemperatureChart displays historical temperatures over time using Recharts LineChart.
 * Supports both Monthly Observations and Annual Summaries.
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of climate records (monthly or annual)
 * @param {string} props.locationName - Name or coordinates of the selected location
 * @param {string} props.viewMode - 'monthly' or 'annual'
 */
export default function TemperatureChart({ data, locationName = 'Selected Location', viewMode = 'monthly' }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-card empty-chart">
        <h3>Historical Temperature Analysis</h3>
        <p>No valid temperature observations available for the selected filter range.</p>
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
            {isAnnual ? 'Annual Mean Temperatures' : 'Historical Monthly Temperatures'} ({locationName})
          </h3>
          <p className="chart-subtitle">
            {isAnnual
              ? 'Annual aggregated mean (T2M), maximum recorded month (T2M_MAX), and minimum recorded month (T2M_MIN) in °C'
              : 'Observed 2-meter air temperature: Mean (T2M), Maximum (T2M_MAX), and Minimum (T2M_MIN) in °C'}
          </p>
        </div>
        <div className="chart-badge">
          {isAnnual ? 'Annual Summaries' : 'Monthly Observations'}
        </div>
      </div>

      <div className="chart-container" style={{ width: '100%', height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              unit="°C"
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{
                value: 'Temperature (°C)',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#475569', fontSize: 13, fontWeight: 500 },
              }}
            />
            <Tooltip content={<CustomTemperatureTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="t2mMax"
              name={isAnnual ? 'Max Month (T2M_MAX)' : 'Max Temp (T2M_MAX)'}
              stroke="#ef4444"
              strokeWidth={2}
              dot={isAnnual}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="t2m"
              name={isAnnual ? 'Annual Mean (T2M)' : 'Mean Temp (T2M)'}
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={isAnnual}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="t2mMin"
              name={isAnnual ? 'Min Month (T2M_MIN)' : 'Min Temp (T2M_MIN)'}
              stroke="#3b82f6"
              strokeWidth={1.8}
              strokeDasharray="4 2"
              dot={isAnnual}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-footer">
        <span>Unit: Degrees Celsius (°C)</span>
        <span>Resolution: {isAnnual ? 'Annual Summary (1 value/yr)' : 'Monthly Temporal (12 values/yr)'}</span>
      </div>
    </div>
  );
}
