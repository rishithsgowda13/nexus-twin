const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Mock data for utilities (Electricity, Water, Gas)
// Usually this would come from PostGIS
const utilities = {
  electricityLines: [
    // Mock GeoJSON-like structure
  ],
  waterPipes: [],
  gasLines: []
};

// Impact Analysis Endpoint
app.post('/api/analyze-impact', (req, res) => {
  const { demolishedBuilding } = req.body;
  
  if (!demolishedBuilding) {
    return res.status(400).json({ error: 'No building data provided' });
  }

  // Simplified Spatial Intersection Simulation
  // In a real app, use PostGIS: ST_Intersects(building_geom, utility_geom)
  const impactedUtilities = [];
  
  // Heuristic: Some buildings are connected to all 3
  const householdImpact = Math.floor(Math.random() * 200) + 50;
  const trafficDelay = Math.floor(Math.random() * 15) + 3;

  const results = {
    utilitiesCut: ['Electricity', 'Water', 'Gas'].filter(() => Math.random() > 0.3),
    impactedHouseholds: householdImpact,
    trafficDelayMinutes: trafficDelay,
    suggestedReroute: "Reroute via Outer Ring Road, Mysuru"
  };

  res.json(results);
});

// AI Advisor Endpoint
app.post('/api/ai-advisor', (req, res) => {
  const { floodLevel, aqiEnabled } = req.body;
  let response = "Based on current urban metrics, systems are nominal. Routine maintenance recommended.";
  
  if (floodLevel > 5) {
    response = "CRITICAL: Flood level exceeds safe limits. Immediate activation of EMS routes and citizen evacuation in Zone B is required.";
  } else if (aqiEnabled) {
    response = "AQI sensors indicate elevated pollution. I recommend deploying temporary air purification towers and restricting heavy vehicle movement.";
  }
  
  res.json({ message: response });
});

// Deploy Asset Endpoint
app.post('/api/deploy-asset', (req, res) => {
  const { lngLat, type } = req.body;
  res.json({ success: true, message: `Successfully deployed ${type} at [${lngLat.lng.toFixed(4)}, ${lngLat.lat.toFixed(4)}]` });
});

// Report Issue Endpoint
app.post('/api/report-issue', (req, res) => {
  const { lngLat } = req.body;
  const newReport = {
    id: Date.now(),
    lngLat,
    status: 'Pending',
    message: 'Citizen report logged.'
  };
  res.json(newReport);
});

// Activity Log Endpoint
let logs = [
  { id: 1, type: 'warning', msg: '[ALERT] High traffic detected at Ring Road' },
  { id: 2, type: 'info', msg: '[INFO] EMS Unit 4 deployed to Palace' }
];
app.post('/api/log-activity', (req, res) => {
  const { msg, type } = req.body;
  logs.unshift({ id: Date.now(), msg, type: type || 'info' });
  if(logs.length > 15) logs.pop();
  res.json({ logs });
});
app.get('/api/logs', (req, res) => {
  res.json({ logs });
});

const distPath = path.join(__dirname, '../client/dist');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Digital Twin Integrated Command listening at http://localhost:${port}`);
});
