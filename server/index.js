const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Mock Auth Database
const USERS = {
  '1': { password: '1', role: 'admin', name: 'Master Admin' },
  admin: { password: 'admin123', role: 'admin', name: 'Command Admin' },
  user: { password: 'user123', role: 'user', name: 'Citizen Observer' }
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];

  if (user && user.password === password) {
    res.json({ 
      success: true, 
      token: `mock-jwt-${user.role}`, 
      user: { name: user.name, role: user.role } 
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Mock data for utilities (Electricity, Water, Gas)
// Usually this would come from PostGIS
const utilities = {
  electricityLines: [
    // Mock GeoJSON-like structure
  ],
  waterPipes: [],
  gasLines: []
};

// Impact Analysis Endpoint using PostGIS
app.post('/api/analyze-impact', async (req, res) => {
  const { demolishedBuilding } = req.body;
  
  if (!demolishedBuilding) {
    return res.status(400).json({ error: 'No building data provided' });
  }

  const results = {
    utilitiesCut: ['Power Grid Alpha', 'Water Main 4B'],
    impactedHouseholds: Math.floor(Math.random() * 200) + 50,
    trafficDelayMinutes: Math.floor(Math.random() * 15) + 5,
    suggestedReroute: "Reroute via nearest arterial road detected in PostGIS fallback"
  };

  try {
    if (db && db.query) {
      const buildingGeom = JSON.stringify(demolishedBuilding.geometry || demolishedBuilding);
      const intersectsQuery = `SELECT type, name FROM utilities WHERE ST_Intersects(geom, ST_GeomFromGeoJSON($1))`;
      const intersectsResult = await db.query(intersectsQuery, [buildingGeom]);
      if (intersectsResult.rows.length) results.utilitiesCut = intersectsResult.rows.map(r => `${r.type} (${r.name || 'Unnamed'})`);
      
      const householdsQuery = `SELECT COUNT(*) as count FROM buildings WHERE ST_DWithin(geom, ST_GeomFromGeoJSON($1), 0.001)`;
      const householdsResult = await db.query(householdsQuery, [buildingGeom]);
      results.impactedHouseholds = parseInt(householdsResult.rows[0].count);
    }
  } catch (err) {
    console.warn("Database unavailable, using simulated spatial metrics.");
  }

  res.json(results);
});

// New Complex Spatial Query Endpoint
app.get('/api/proximity-search', async (req, res) => {
  const { lng, lat, radius = 500 } = req.query;
  
  if (!lng || !lat) {
    return res.status(400).json({ error: 'Coordinates required' });
  }

  try {
    const point = `POINT(${lng} ${lat})`;
    const radiusInDegrees = radius / 111000; // Rough conversion for degrees

    const query = `
      SELECT name, height, type, ST_AsGeoJSON(geom) as geometry
      FROM buildings 
      WHERE ST_DWithin(geom, ST_GeomFromText($1, 4326), $2)
      LIMIT 100
    `;
    
    const result = await db.query(query, [point, radiusInDegrees]);
    res.json({
      count: result.rowCount,
      features: result.rows.map(r => ({
        type: 'Feature',
        properties: { name: r.name, height: r.height, type: r.type },
        geometry: JSON.parse(r.geometry)
      }))
    });
  } catch (err) {
    console.error("Proximity Search Error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// PORT REDIRECT: Ensure users go to the Next.js unified portal (9000) instead of the raw API port (3001)
app.get('/', (req, res) => {
  res.send(`
    <div style="background: #050505; color: #ffcc00; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center;">
      <h1 style="letter-spacing: 5px;">BENGALURU NEXUS COMMAND</h1>
      <p style="color: #fff; margin: 20px 0;">The Command Core is running on Port 3001 (API), but the UI is unified on Port 9000.</p>
      <a href="http://localhost:9000" style="background: #ffcc00; color: #000; padding: 15px 30px; border-radius: 5px; text-decoration: none; font-weight: 800; letter-spacing: 2px;">INITIALIZE HUB PORTAL (PORT 9000)</a>
    </div>
  `);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.redirect('http://localhost:9000' + req.path);
});

// Policy Advisor (P.I.S.E. GPT) Endpoint with OLLAMA Integration
app.post('/api/policy-advisor', async (req, res) => {
  const { query } = req.body;
  console.log(`[POLICY ADVISOR] Received query: "${query}"`);
  
  if (!query) return res.status(400).json({ error: 'No query provided' });

  try {
    // Attempt to call local Ollama API
    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt: `You are the "Bengaluru Nexus Policy Advisor", a high-fidelity AI specialized in urban planning, fiscal analysis, and social engineering for the city of Bengaluru. 
        
        User Query: "${query}"
        
        Provide a professional command-center report including:
        1. PROJECT OVERVIEW
        2. FISCAL METRICS (Projected costs in Crores)
        3. SOCIAL IMPACT (Sentiment and public safety)
        4. STRATEGIC VERDICT (Proceed/Risk)
        
        Keep the tone tactical and data-driven. Use Markdown formatting.`,
        stream: false
      })
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      console.log(`[POLICY ADVISOR] Ollama response received successfully.`);
      return res.json({ report: data.response });
    } else {
      console.warn(`[POLICY ADVISOR] Ollama returned status: ${ollamaResponse.status}`);
    }
  } catch (err) {
    console.warn(`[POLICY ADVISOR] Ollama connection failed: ${err.message}. Falling back to simulation.`);
  }

  // Simulation logic for LLM Analysis (Fallback)
  const q = query.toLowerCase();
  let analysis = "";

  if (q.includes('flyover') || q.includes('bridge')) {
    analysis = `
### 🏗️ PROJECT: URBAN FLYOVER INITIATIVE (FALLBACK)
**Location Identified**: JLB Road / Major Arterial Intersection

#### 💰 FISCAL METRICS
- **Projected Cost**: ₹145 Crores (Phase 1)
- **Economic ROI**: 12.4% (Projected via reduced transit latency)
- **Maintenance Load**: High (Structural monitoring required every 24 months)

#### 👥 SOCIAL IMPACT
- **Commuter Sentiment**: 🟢 Highly Positive (Reduced peak hour congestion by 34%)
- **Local Business Impact**: 🔴 Negative (Reduction in street-level footfall for small retailers)
- **Aesthetic Score**: 🟡 Neutral (Heritage skyline obstruction potential near Palace District)

#### ⚠️ RISK ASSESSMENT
- **Black Swan Risk**: Utility displacement during construction could trigger city-wide grid instability for 48 hours.
- **Recommendation**: Proceed with **Phase 1 Sub-surface cabling** before structural piling.
    `;
  } else {
    analysis = `
### 🧠 GENERAL POLICY ANALYSIS (FALLBACK)
**Query**: "${query}"

#### 📊 INITIAL HEURISTICS
- **Complexity Level**: Moderate
- **Status**: Ollama Engine [gemma:2b] Offline.

#### 🔍 ADVISORY NOTE
The SYNTH-GOV engine requires the local Ollama service to be active for high-fidelity analysis. Please ensure "ollama run gemma:2b" is available.
    `;
  }

  setTimeout(() => {
    res.json({ report: analysis });
  }, 1000);
});

// AI Suggest Engine (Advanced Urban Directives)
app.post('/api/ai-suggest', async (req, res) => {
  const { priority, assets } = req.body;
  
  try {
    const ollamaResponse = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        prompt: `You are the "Bengaluru Nexus Strategic AI". 
        Current Priority: ${priority.toUpperCase()}
        Current City Assets: ${JSON.stringify(assets)}
        
        Provide ONE short, highly tactical urban planning suggestion (max 20 words) to optimize the city according to the priority.
        Format: Return only the text of the suggestion.`,
        stream: false
      })
    });

    if (ollamaResponse.ok) {
      const data = await ollamaResponse.json();
      return res.json({ suggestion: data.response });
    }
  } catch (err) {
    console.warn("Ollama suggest fallback.");
  }

  const fallbacks = ["Optimize traffic flow at MG Road junction.", "Increase solar density in residential zones.", "Deploy emergency units to high-risk flood areas."];
  res.json({ suggestion: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
});

// Predictive Failure Analysis Endpoint
app.post('/api/predict-failures', (req, res) => {
  const { stormIntensity } = req.body;
  
  if (stormIntensity === undefined) return res.status(400).json({ error: 'No storm intensity provided' });

  // Simulation: Predict failure points based on intensity
  // Higher intensity = more failures, concentrated in "high-elevation" or "vulnerable" areas
  const failurePoints = [];
  const numPoints = Math.floor(stormIntensity * 5) + 5;

  for (let i = 0; i < numPoints; i++) {
    // Generate points around Vidhana Soudha, Bengaluru area with slight bias
    failurePoints.push({
      id: i,
      coordinates: [
        77.58 + Math.random() * 0.03,
        12.96 + Math.random() * 0.03
      ],
      riskLevel: Math.random() * stormIntensity / 10,
      reason: Math.random() > 0.5 ? 'Structural Stress' : 'Electrical Surge'
    });
  }

  const analysis = {
    points: failurePoints,
    summary: {
      totalPredictedOutages: failurePoints.length,
      estimatedRestorationTime: `${Math.floor(stormIntensity * 2)} hours`,
      criticalZone: "Central Business District"
    }
  };

  res.json(analysis);
});

// Sentiment Analysis (X/News Data) Endpoint
app.post('/api/sentiment', (req, res) => {
  const sentimentPoints = [];
  const numPoints = 100;
  for (let i = 0; i < numPoints; i++) {
    const sentiment = Math.random() * 2 - 1;
    sentimentPoints.push({
      id: i,
      coordinates: [77.62 + Math.random() * 0.06, 12.98 + Math.random() * 0.05],
      sentiment: sentiment,
      intensity: Math.random()
    });
  }
  res.json({ points: sentimentPoints });
});

// Public Reports / Complaints System
let reports = [
  { id: 1, type: 'Road', status: 'Pending', location: 'MG Road', description: 'Large pothole near junction', lngLat: { lng: 77.60, lat: 12.97 } },
  { id: 2, type: 'Water Pipeline', status: 'In Progress', location: 'Indiranagar', description: 'Pipe leakage on 12th Main', lngLat: { lng: 77.64, lat: 12.98 } }
];

app.get('/api/reports', async (req, res) => {
  try {
    if (db && db.query) {
      const result = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
      if (result.rows.length > 0) return res.json(result.rows);
    }
  } catch (err) {
    console.warn("DB reports fetch failed, using memory.");
  }
  res.json(reports);
});

app.post('/api/reports', async (req, res) => {
  const { type, location, description, lngLat } = req.body;
  const newReport = {
    id: Date.now(),
    type,
    status: 'Pending',
    location: location || 'Detected Location',
    description,
    lngLat: lngLat || { lng: 77.59 + Math.random() * 0.05, lat: 12.97 + Math.random() * 0.05 },
    created_at: new Date().toISOString()
  };

  try {
    if (db && db.query) {
      await db.query(
        'INSERT INTO reports (type, location_name, description, lngLat, geom) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326))',
        [type, newReport.location, description, JSON.stringify(newReport.lngLat), newReport.lngLat.lng, newReport.lngLat.lat]
      );
    }
  } catch (err) {
    console.warn("DB report save failed, using memory.");
  }

  reports.unshift(newReport);
  res.json({ success: true, report: newReport });
});

// Real-time Notification System
let notifications = [
  {
    id: 1,
    policy: "Monsoon Resilience Phase 1",
    price: "₹85 Crores",
    location: "NMIT Sector / North Bengaluru",
    purpose: "Stormwater drainage overhaul to prevent campus-wide inundation.",
    prediction: "85% reduction in flood risk for the 2024 monsoon season.",
    duration: "6 Months",
    timestamp: new Date().toISOString()
  }
];

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications', (req, res) => {
  const { policy, price, location, purpose, prediction, duration } = req.body;
  if (!policy || !price || !location) {
    return res.status(400).json({ error: 'Policy, Price, and Location are required' });
  }

  const newNotification = {
    id: Date.now(),
    policy,
    price,
    location,
    purpose,
    prediction,
    duration,
    timestamp: new Date().toISOString()
  };
  
  notifications.unshift(newNotification);
  if (notifications.length > 20) notifications = notifications.slice(0, 20);
  
  res.json({ success: true, notification: newNotification });
});

app.listen(port, () => {
  console.log(`\n🚀 COMMAND CORE ONLINE`);
  console.log(`🔗 API SERVER: http://localhost:${port}`);
  console.log(`🖥️  UNIFIED UI: http://localhost:9000 (USE THIS LINK)\n`);
});
