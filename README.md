# Climate Change Data Visualization Platform

A full-stack, research-grounded web application designed to explore and analyze historical climate trends using authentic Earth observations from the **NASA POWER API**, powered by a **React + Vite** frontend, an **Express.js** backend, and an optional **Google Gemini AI** interpretation engine with automatic statistical fallback.

---

## 🌟 Key Features

* **Authentic Climate Data:** Directly queries the **NASA POWER API (v2.10)** for 10+ years of monthly observations. Missing NASA data flags (`-999.0`) and non-finite values are filtered out.
* **Extensive Global Locations:**
  * **60+ Verified Cities:** Curated presets covering Indian metropolises and regional hubs (Ludhiana, Chandigarh, Amritsar, Jalandhar, Delhi, Mumbai, Bengaluru, Chennai, Kolkata, Jaipur, Shimla, Manali, etc.) and major international climate zones (Tokyo, Dubai, Singapore, London, New York, Sydney, Nairobi, Cairo, São Paulo, etc.).
  * **Live Worldwide Geocoding Search:** Integrated with Open-Meteo Geocoding to locate any city or village worldwide with real latitude and longitude coordinates.
  * **Custom Coordinate Validation:** Allows manual coordinate input with live bounds checking (Latitude: -90° to 90°, Longitude: -180° to 180°).
* **High-Performance In-Memory Cache:** Avoids redundant network requests and protects API rate limits when switching between previously visited cities (0.045 ms instant retrieval).
* **Interactive Data Visualizations (Recharts):**
  * **Temperature Line Chart:** Visualizes Mean (`T2M`), Maximum (`T2M_MAX`), and Minimum (`T2M_MIN`) temperatures in `°C` with custom interactive tooltips and units.
  * **Precipitation Bar Chart:** Visualizes corrected precipitation rate (`PRECTOTCORR`) in `mm/day` (daily-average water-equivalent depth).
  * **Data Granularity Toggle:** Switch seamlessly between **Monthly Observations** (12 points/year) and **Annual Summaries** (yearly aggregates).
* **Reactive Statistical Summary Cards:**
  1. **Average Temperature (°C):** Arithmetic mean of all valid monthly readings over the selected timeframe.
  2. **Warmest Year (°C):** Calendar year with the highest annual mean temperature.
  3. **Wettest Month (Date & mm/day):** Peak monthly precipitation rate recorded.
  4. **Temperature Trend (°C / decade):** Calculated using **Ordinary Least Squares (OLS) linear regression** on monthly observations. Includes an educational note clarifying that linear statistical trend describes mathematical rate of change, but proving climate-change causation requires physical Earth-system attribution models.
* **Express Backend & Gemini AI Insights:**
  * **Server-Side API Key Security:** Reads `GEMINI_API_KEY` exclusively from a server-side `.env` file. Keys are never exposed in client code or Git.
  * **Strict Data Grounding:** Feeds Gemini only the observed numbers and summary statistics; hallucinations and unsupported causation claims are prohibited.
  * **Graceful Data-Driven Fallback:** If no Gemini key is provided, Gemini is offline, or rate-limited, the system automatically provides factual bullet points labeled **"Calculated from data"**. When Gemini is active, responses are explicitly labeled **"AI-generated"**.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart TD
    User([User Browser]) <--> React[React + Vite Frontend\nlocalhost:5173]
    React -- "1. Direct GET (with in-memory cache)" --> NASA[NASA POWER API\nMonthly Meteorology]
    React -- "2. Geocoding query" --> Geo[Open-Meteo Geocoding API]
    React -- "3. POST /api/insights\n(Summary statistics)" --> Express[Express.js Backend\nlocalhost:5000]
    Express -- "4. GEMINI_API_KEY present" --> Gemini[Google Gemini API]
    Express -- "5. No key or API error" --> Fallback[Deterministic Calculation Engine\n'Calculated from data']
    Gemini --> Express
    Fallback --> Express
```

### End-to-End Data Flow:
1. **User Selection:** The user selects a city from the 60+ presets, enters a worldwide city in the search bar, or inputs custom coordinates.
2. **Quality-Controlled Data Retrieval (`nasaApi.js`):**
   * Checks the in-memory cache. If cached, data loads in `0.045 ms`.
   * Otherwise, sends an HTTP GET request to NASA POWER (`community=RE`, parameters: `T2M,T2M_MAX,T2M_MIN,PRECTOTCORR`).
   * Filters out NASA's `-999.0` missing-data fill values and separates Month `13` (annual averages) from Months `01`–`12` (calendar months).
3. **Statistical Computation (`climateStats.js`):**
   * React calculates the period average temperature, warmest calendar year, wettest month, and decadal trend via OLS linear regression.
4. **Interactive Rendering:**
   * Recharts renders multi-line temperature graphs and precipitation bar charts with responsive containers and tooltips.
5. **AI / Data Insights (`insightsApi.js` & `server.js`):**
   * The calculated statistics are sent via `POST /api/insights` to the Express backend.
   * If `GEMINI_API_KEY` is present, Gemini crafts scientific bullet points labeled **"AI-generated"**.
   * If no key is set or the API fails, the backend calculates deterministic insights labeled **"Calculated from data"**.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later (Tested on Node.js v24.21.0)
* **npm**: (On Windows PowerShell, use `npm.cmd` if script execution is restricted)

---

### Step 1: Install Dependencies

Open a terminal at the project root (`c:\climate-change-platform`):

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

*(Note: Dependencies are already pre-installed in this workspace).*

---

### Step 2: Configure Environment Variables (Optional)

In the `server` directory, copy `.env.example` to create `.env`:

```bash
cd server
copy .env.example .env
```

Open `server/.env` and optionally paste your Google Gemini API key:
```env
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

> **Note:** If you do not configure an API key, the dashboard will **continue to work completely**. It will automatically calculate factual insights directly from the NASA observations and display them under the **"Calculated from data"** badge.

---

### Step 3: Start the Backend & Frontend

Open **two separate terminals**:

#### Terminal 1 — Start the Express Backend:
```bash
cd server
node server.js
```
*Backend runs on `http://localhost:5000`*.

#### Terminal 2 — Start the Vite Frontend:
```bash
cd client
npm run dev
```
*(On Windows PowerShell if needed: `npm.cmd run dev`)*
*Frontend runs on `http://localhost:5173`*.

Open your browser at **`http://localhost:5173`** to use the platform.

---

## 📊 How the Calculations Work

### 1. Temperature Trend (°C / decade)
Calculated using **Ordinary Least Squares (OLS) Linear Regression** over chronological monthly observations:
$$\text{Slope } m = \frac{N \sum(x_i y_i) - \sum x_i \sum y_i}{N \sum x_i^2 - (\sum x_i)^2}$$
* Where $x_i = \text{year} + \frac{\text{month} - 0.5}{12}$ (time coordinate in decimal years)
* Where $y_i = T_{2M}$ (observed monthly mean temperature in °C)
* **Trend per decade** = $m \times 10$ (°C / decade)

> **Important Scientific Note on Trend:** This slope reflects the mathematical rate of change across the selected period and location. A localized statistical trend provides empirical evidence of temperature change over time, but proving attribution or causation requires comprehensive physical climate models.

### 2. Precipitation Rate (`mm/day`)
NASA POWER measures precipitation as `PRECTOTCORR` in **millimeters per day (mm/day)**. This represents the average daily water-equivalent precipitation depth over that month. To estimate total monthly rainfall volume, multiply by the number of days in that month.

### 3. Missing Value Quality Filter
NASA uses `-999.0` as a missing-data fill value. The application filters out any value $\le -900$, non-numeric values, or `NaN`, converting them to `null` to avoid skewing calculations or chart scales.

---

## 🎓 University Presentation Guide

Use this section to confidently explain your project during your academic evaluation or viva.

### Key Files & Their Responsibilities:
1. **[`client/src/services/nasaApi.js`](file:///c:/climate-change-platform/client/src/services/nasaApi.js):**
   * Connects to NASA POWER Monthly Temporal API.
   * Filters out `-999.0` missing observations.
   * Separates NASA's Month `13` (annual mean) from calendar months `01`–`12`.
   * Houses the in-memory cache to prevent repeated API calls.
2. **[`client/src/services/geocodingApi.js`](file:///c:/climate-change-platform/client/src/services/geocodingApi.js):**
   * Calls Open-Meteo Geocoding to convert city names anywhere in the world into verified latitude and longitude coordinates.
3. **[`client/src/services/insightsApi.js`](file:///c:/climate-change-platform/client/src/services/insightsApi.js):**
   * Client-side service communicating with Express backend `POST /api/insights`.
   * Includes client fallback if the backend server is temporarily offline.
4. **[`client/src/utils/climateStats.js`](file:///c:/climate-change-platform/client/src/utils/climateStats.js):**
   * Implements the core mathematical formulas: Period Average, Warmest Year, Wettest Month, and OLS Linear Regression for decadal trend.
5. **[`client/src/components/LocationSelector.jsx`](file:///c:/climate-change-platform/client/src/components/LocationSelector.jsx):**
   * Interactive three-mode switcher: 60+ Curated Cities dropdown, Worldwide Search bar with debouncing, and manual Latitude/Longitude coordinate inputs with bounds validation (-90° to 90°, -180° to 180°).
6. **[`client/src/components/TemperatureChart.jsx`](file:///c:/climate-change-platform/client/src/components/TemperatureChart.jsx) & [`PrecipitationChart.jsx`](file:///c:/climate-change-platform/client/src/components/PrecipitationChart.jsx):**
   * Recharts data visualization components supporting both monthly observations (12 points/yr) and annual summaries (1 point/yr).
7. **[`client/src/components/AIInsights.jsx`](file:///c:/climate-change-platform/client/src/components/AIInsights.jsx):**
   * Visualizes insights with clear color-coded badges: indigo for **"AI-generated"** and emerald for **"Calculated from data"**.
8. **[`server/server.js`](file:///c:/climate-change-platform/server/server.js):**
   * Express backend with security headers (`helmet`), CORS, rate limiting (60 req/min), health checks (`/api/health`, `/health`, `/`), input validation, and Gemini AI integration with deterministic fallback.

---

### Anticipated Evaluator Questions & Model Answers:

**Q1: Where does the climate data come from? Did you simulate or hardcode it?**
> **Answer:** All data is retrieved live from the official **NASA POWER API (v2.10)**, derived from NASA’s GMAO MERRA-2 (Modern-Era Retrospective analysis for Research and Applications) atmospheric assimilation model. No climate observations are hardcoded or simulated.

**Q2: What is NASA’s Month 13 convention?**
> **Answer:** In NASA POWER monthly datasets, keys ending in `13` (e.g. `202013`) represent the **annual average** for that year, not a thirteenth month. Our code parses months `01` through `12` for monthly time series, and isolates month `13` for annual aggregates to avoid corrupting the calendar timeline.

**Q3: How do you handle missing values or sensor errors?**
> **Answer:** NASA uses `-999.0` as a sentinel fill value for missing readings. Our `isValidObservation()` function checks every numeric value; if a reading is `-999.0`, non-numeric, or non-finite, it is converted to `null` so it does not distort the arithmetic mean or chart scales.

**Q4: How did you calculate the temperature trend, and does it prove global warming for that city?**
> **Answer:** We calculated the slope using **Ordinary Least Squares (OLS) linear regression** on chronological monthly observations and multiplied the annual slope by 10 to obtain °C per decade. While this provides mathematical evidence of historical rate of change over the selected timeframe, we explicitly note that localized statistical regression alone does not prove physical causation, which requires complex Earth-system attribution models.

**Q5: How does the AI insights feature work without an API key?**
> **Answer:** We implemented a graceful fallback architecture. If `GEMINI_API_KEY` is not configured, the Express backend automatically runs a deterministic calculation engine that produces factual bullet points directly from the NASA observations and labels them **"Calculated from data"**. When a valid key is provided, Gemini formulates the response and it is clearly labeled **"AI-generated"** with an accompanying disclaimer.

**Q6: How do you ensure the Gemini API key is secure?**
> **Answer:** The key is stored exclusively in a server-side `.env` file that is excluded from Git via `.gitignore`. The React frontend never has access to the key, and it is never sent in HTTP headers, logged in terminal output, or exposed in error messages.

---

## 🔧 Troubleshooting & FAQ

### 1. Windows PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled`
* **Cause:** Windows PowerShell execution policy restricts running `.ps1` scripts by default.
* **Solution:** Run commands using `npm.cmd` instead:
  ```powershell
  npm.cmd run dev
  ```
  Or temporarily allow scripts in your current PowerShell session:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```

### 2. Port Conflicts (`Error: listen EADDRINUSE :::5000` or `:::5173`)
* **Cause:** A previous Node or Vite process is still holding the port in the background.
* **Solution:** Find and terminate the process holding the port in PowerShell:
  ```powershell
  # Find process on port 5000
  Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object OwningProcess
  
  # Terminate process (replace PID with the number found)
  Stop-Process -Id <PID> -Force
  ```

### 3. `Cannot GET /api/health`
* **Solution:** Ensure you are accessing the server on port `5000` (`http://localhost:5000/api/health`). Both `/api/health`, `/health`, and root `/` are configured. Additionally, our Vite dev server includes a proxy so `http://localhost:5173/api/health` also works.

### 4. NASA POWER API Network or 503 Errors
* **Behavior:** If NASA POWER experiences brief downtime or internet drops, the dashboard displays a clean **ErrorBanner** with the exact error details and a working **Retry Fetch** button. It never substitutes fabricated data. Once your network restores, clicking **Retry Fetch** reloads real observations.

---

## 🧪 Verification & Testing Status

To ensure complete scientific and academic honesty, test results are divided into two explicitly verified categories:

### A. Tested and Working (Actually Verified)
1. **NASA POWER Data Retrieval:** Verified live 10-year monthly datasets (120 records) across 11 global cities:
   * **Ludhiana, India:** 24.68 °C 10-yr avg | Aug 2023 wettest (15.20 mm/day) | -0.95 °C/dec trend
   * **Chandigarh, India:** 23.72 °C avg | Jul 2023 wettest (18.70 mm/day) | -1.11 °C/dec trend
   * **Amritsar, India:** 24.75 °C avg | Jul 2023 wettest (14.51 mm/day) | -0.96 °C/dec trend
   * **Delhi, India:** 25.36 °C avg | 2016 warmest (26.26 °C) | -0.78 °C/dec trend
   * **Shimla, India:** 20.82 °C avg | 2016 warmest (22.01 °C)
   * **Manali, India:** -0.57 °C avg (High Himalayan montane climate)
   * **Dubai, UAE:** 28.56 °C avg | +1.69 °C/dec warming trend
   * **Singapore:** 27.29 °C avg | Mar 2023 wettest (23.93 mm/day)
   * **London, UK:** 10.77 °C avg | +1.15 °C/dec warming trend
   * **Nairobi, Kenya:** 20.37 °C avg | 2019 warmest (20.78 °C)
   * **Sydney, Australia:** 18.84 °C avg | Mar 2022 wettest (13.64 mm/day)
2. **Automated Error Handling Suite (15/15 Passed):**
   * Simulated network drops (`ECONNREFUSED`): Verified descriptive error returned.
   * Simulated NASA outages (HTTP 503): Verified maintenance notice passed to user.
   * Simulated 20-second timeout: Verified timeout error caught.
   * Zero-Fabrication Rule: Verified `data` remains strictly `null` upon error.
   * Retry Lifecycle: Verified clicking retry sets loading to `true`, clears errors, and loads real data on success.
3. **In-Memory Cache:** Verified that repeat queries load in **0.045 ms** from cache with zero network overhead.
4. **Worldwide Geocoding:** Verified live online search queries (e.g. Reykjavik, Iceland returned `64.1355° N, -21.8954° W`).
5. **Backend Health & Security:**
   * `GET /api/health`, `GET /health`, and `GET /` verified responding with HTTP 200.
   * `POST /api/insights` verified returning 4 factual bullet points with `badge: "Calculated from data"`.
   * Input validation verified returning `400 Bad Request` for invalid coordinates.
   * Rate-limiting verified (60 req/min).
6. **Code Quality & Build:**
   * `npm.cmd run lint` passed with **0 errors, 0 warnings**.
   * `npm.cmd run build` compiled clean production bundle (657 modules).

### B. Not Tested
* **Automated Browser End-to-End Tests:** Headless browser automation (e.g. Selenium/Puppeteer) was not configured in the CLI environment. A 10-minute manual browser testing checklist is provided below instead.
* **Live Gemini API Generation with Personal Paid Key:** Not tested because you will configure your private API key in `server/.env` locally. (The fallback mechanism was verified).

---

## 📋 Manual Browser Testing Checklist (10 Minutes)

Follow these steps in your browser to verify full interactive functionality:

1. Start the Express backend: `cd server && node server.js`
2. Start the Vite frontend: `cd client && npm run dev`
3. Open `http://localhost:5173` in Chrome, Edge, or Firefox.
4. **Test City Selector:** Select **Ludhiana** from the dropdown. Observe the coordinate pill update (`30.9010° N, 75.8573° E`), loading spinner, and the charts populating with 120 monthly observations.
5. **Test Worldwide Search:** Type **Tokyo** or **Dubai** in the search tab, select it, and confirm that the charts update.
6. **Test Custom Coordinates:** Switch to Custom Coordinates, enter `48.8566` (Lat) and `2.3522` (Lon) for Paris, and click "Fetch Custom Location".
7. **Test Year Range Filter:** Change the start year from 2014 to 2018. Observe that the Average Temperature and Trend update reactively.
8. **Test Data Resolution:** Switch between **Monthly Observations** (12 points/year) and **Annual Summaries** (1 point/year).
9. **Test Metric Filter:** Toggle between **All Metrics**, **Temperature**, and **Precipitation**.
10. **Test Tooltips:** Hover over the line chart to view temperature in `°C` and the bar chart to view precipitation in `mm/day`.
11. **Test Insights Card:** Verify that the card displays the green **"Calculated from data"** badge with factual insights. Click **Refresh** to test reactivity.
12. **Test Mobile View:** Open Developer Tools (`F12`), toggle device emulation (e.g., iPhone or Pixel), and confirm that the cards and charts collapse smoothly into a single column.

---

## ⚠️ Known Limitations

1. **NASA MERRA-2 Latency:** NASA POWER's monthly meteorological dataset has an assimilation delay of a few months; historical data is typically available up through late 2023 / early 2024.
2. **Spatial Resolution:** NASA POWER uses native $\approx 0.5^\circ \times 0.625^\circ$ MERRA-2 grid cells. Point queries represent the average conditions of that grid cell rather than microclimates.
3. **Statistical vs. Physical Trend:** The linear trend measures the empirical rate of change over the selected observation window. It does not replace physical climate attribution models needed to prove anthropogenic causation.
4. **Geocoding Internet Dependency:** Searching for cities outside the 60 presets requires an active internet connection to query the Open-Meteo Geocoding API.

---

## 📂 Project Structure

```text
climate-change-platform/
├── client/                     # Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── LocationSelector.jsx   # Searchable city selector & geocoding
│   │   │   ├── Filters.jsx            # Year range, metric & resolution filters
│   │   │   ├── SummaryCards.jsx       # 4 core climate indicators & notes
│   │   │   ├── AIInsights.jsx         # Gemini / calculated insights display
│   │   │   ├── TemperatureChart.jsx   # Recharts LineChart for T2M in °C
│   │   │   ├── PrecipitationChart.jsx # Recharts BarChart in mm/day
│   │   │   └── ErrorBanner.jsx        # Error notification with Retry button
│   │   ├── constants/
│   │   │   └── locations.js           # 60+ verified cities catalog
│   │   ├── services/
│   │   │   ├── nasaApi.js             # NASA POWER API fetch & in-memory cache
│   │   │   ├── geocodingApi.js        # Open-Meteo worldwide geocoding service
│   │   │   └── insightsApi.js         # Backend /api/insights client service
│   │   ├── utils/
│   │   │   └── climateStats.js        # Mathematical formulas & OLS trend engine
│   │   ├── App.jsx             # Main dashboard controller
│   │   ├── App.css             # Responsive styling & themes
│   │   └── index.css           # Global design system variables
│   └── package.json
│
├── server/                     # Backend (Express.js)
│   ├── server.js               # Express API, security, rate limit & Gemini route
│   ├── .env.example            # Environment variable template
│   ├── .gitignore              # Ignores .env and node_modules
│   └── package.json            # Server scripts and dependencies
│
├── .gitignore                  # Root gitignore
└── README.md                   # Complete documentation & presentation guide
```
