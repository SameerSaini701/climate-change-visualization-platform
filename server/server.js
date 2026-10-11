import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '100kb' }));

// Rate Limiter: max 60 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again in a minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

/**
 * Validates if an API key is genuinely configured (not a default placeholder).
 */
function isGeminiKeyConfigured() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.length > 10 && trimmed !== 'your_gemini_api_key_here';
}

/**
 * Deterministic calculation engine.
 * Generates verified, factual bullet points strictly derived from the numbers
 * without requiring any external AI services or API keys.
 * 
 * @param {Object} location 
 * @param {Object} period 
 * @param {Object} summary 
 * @returns {Array<string>}
 */
function generateCalculatedInsights(location, period, summary) {
  const insights = [];
  const locName = location.name || 'Selected location';
  const startYear = period?.startYear || 2014;
  const endYear = period?.endYear || 2023;
  const span = endYear - startYear + 1;

  // 1. Baseline Thermal Insight
  if (summary.averageTemp !== null && summary.averageTemp !== undefined) {
    insights.push(
      `Mean Temperature: Over the ${span}-year period (${startYear}–${endYear}), ${locName} recorded a mean 2-meter air temperature of ${summary.averageTemp} °C across ${summary.validObservationsCount || 'all'} valid monthly observations.`
    );
  }

  // 2. Warmest Calendar Year
  if (summary.warmestYear) {
    const diff = summary.averageTemp !== null 
      ? (summary.warmestYear.averageTemp - summary.averageTemp).toFixed(2)
      : null;
    insights.push(
      `Warmest Period: ${summary.warmestYear.year} was the warmest calendar year on record with an annual mean of ${summary.warmestYear.averageTemp} °C${diff ? ` (+${diff} °C above the period baseline)` : ''}.`
    );
  }

  // 3. Peak Hydrological Rate
  if (summary.wettestMonth) {
    insights.push(
      `Hydrological Maximum: The peak monthly precipitation rate occurred in ${summary.wettestMonth.date} at ${summary.wettestMonth.precipitation} mm/day (representing the daily average water-equivalent depth across that month).`
    );
  }

  // 4. Rate of Change & Decadal Trend
  if (summary.temperatureTrend) {
    const trend = summary.temperatureTrend.slopePerDecade;
    const sign = trend > 0 ? '+' : '';
    const dir = summary.temperatureTrend.direction;
    insights.push(
      `Decadal Rate of Change: Ordinary Least Squares (OLS) linear regression indicates a ${dir} rate of ${sign}${trend} °C per decade over this observation window. Note that a statistical trend measures mathematical rate of change for this local record; physical attribution of climate change requires comprehensive Earth-system modeling.`
    );
  }

  return insights;
}

/**
 * Health check endpoints.
 * Supports /api/health as well as /health and root / for convenience.
 */
app.get(['/api/health', '/api/health/'], (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    geminiConfigured: isGeminiKeyConfigured(),
  });
});

app.get(['/health', '/health/'], (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    geminiConfigured: isGeminiKeyConfigured(),
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Climate Change Data Visualization Platform API is running.',
    endpoints: {
      health: '/api/health',
      insights: '/api/insights',
    },
    geminiConfigured: isGeminiKeyConfigured(),
  });
});

/**
 * POST /api/insights
 * Generates climate insights for the active dashboard selection.
 * Uses Gemini when configured, with seamless, honest fallback to calculated insights.
 */
app.post('/api/insights', async (req, res) => {
  const { location, period, summary } = req.body || {};

  // Input Validation
  if (!location || typeof location !== 'object') {
    return res.status(400).json({ success: false, error: 'Missing or invalid location object.' });
  }
  if (typeof location.latitude !== 'number' || location.latitude < -90 || location.latitude > 90) {
    return res.status(400).json({ success: false, error: 'Latitude must be a valid number between -90 and 90.' });
  }
  if (typeof location.longitude !== 'number' || location.longitude < -180 || location.longitude > 180) {
    return res.status(400).json({ success: false, error: 'Longitude must be a valid number between -180 and 180.' });
  }
  if (!period || typeof period.startYear !== 'number' || typeof period.endYear !== 'number') {
    return res.status(400).json({ success: false, error: 'Missing valid period with startYear and endYear.' });
  }
  if (!summary || typeof summary !== 'object') {
    return res.status(400).json({ success: false, error: 'Missing summary statistics object.' });
  }

  // If Gemini API Key is NOT configured, immediately serve calculated insights
  if (!isGeminiKeyConfigured()) {
    const calculatedInsights = generateCalculatedInsights(location, period, summary);
    return res.json({
      success: true,
      source: 'calculated',
      badge: 'Calculated from data',
      note: 'Gemini API key is not configured in .env. Factual insights calculated directly from NASA POWER observations are displayed.',
      insights: calculatedInsights,
    });
  }

  // When Gemini key IS configured, invoke the model with grounded parameters
  try {
    const apiKey = process.env.GEMINI_API_KEY.trim();
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
You are a climate science communication assistant assisting with an academic university project called "Climate Change Data Visualization Platform".

Analyze the following REAL, VERIFIED meteorological data retrieved from the NASA POWER API for this location and timeframe:

Location: ${location.name} (Latitude: ${location.latitude.toFixed(4)}, Longitude: ${location.longitude.toFixed(4)})
Observation Period: ${period.startYear} to ${period.endYear}
Calculated Statistics:
- Mean 2-meter air temperature: ${summary.averageTemp !== null ? `${summary.averageTemp} °C` : 'N/A'}
- Warmest calendar year: ${summary.warmestYear ? `${summary.warmestYear.year} (${summary.warmestYear.averageTemp} °C avg)` : 'N/A'}
- Wettest month: ${summary.wettestMonth ? `${summary.wettestMonth.date} (${summary.wettestMonth.precipitation} mm/day)` : 'N/A'}
- Decadal linear trend: ${summary.temperatureTrend ? `${summary.temperatureTrend.slopePerDecade > 0 ? '+' : ''}${summary.temperatureTrend.slopePerDecade} °C/decade (${summary.temperatureTrend.direction})` : 'N/A'}
- Observation count: ${summary.validObservationsCount || 0} monthly observations

STRICT RULES:
1. Provide 3 to 4 concise, factual bullet points analyzing these exact figures.
2. Do NOT invent or hallucinate any observations or external numbers not provided above.
3. Do NOT claim that statistical correlation alone proves climate change causation. Explicitly remind that long-term physical attribution modeling is required for climate causation.
4. Format each point starting with a dash (-) on its own line.
5. Keep language scientific, objective, and beginner-friendly for a university presentation.
`;

    // 10-second timeout guard
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 10 seconds.')), 10000)
    );

    const generatePromise = model.generateContent(prompt);
    const result = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = result.response.text();

    // Parse bullet points
    const lines = responseText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l))
      .map((l) => l.replace(/^[-*•\d.]+\s*/, '').trim())
      .filter((l) => l.length > 10);

    const insights = lines.length > 0 ? lines : [responseText.trim()];

    return res.json({
      success: true,
      source: 'ai',
      badge: 'AI-generated',
      disclaimer: 'AI-generated interpretation based on NASA POWER observations. Interpretations may be imperfect; verify with primary data.',
      model: modelName,
      insights,
    });
  } catch (err) {
    // Graceful Fallback: Never crash the dashboard if Gemini fails or rate-limits
    // Log error type safely without leaking any potential key in logs
    console.error('Gemini insights service error (falling back to calculated data):', err.name || 'Error', err.message?.split('?')[0]);

    const fallbackInsights = generateCalculatedInsights(location, period, summary);
    return res.json({
      success: true,
      source: 'calculated_fallback',
      badge: 'Calculated from data',
      note: 'AI insights service currently unavailable. Showing factual insights computed directly from NASA POWER observations.',
      insights: fallbackInsights,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Climate Platform Server running on http://localhost:${PORT}`);
  console.log(`Gemini API configured: ${isGeminiKeyConfigured() ? 'Yes (Live)' : 'No (Using calculated data fallback)'}`);
});
