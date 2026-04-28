'use client';
import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Search, Loader2, Building2, Trash2, AlertTriangle, X, MapPin, 
  Layers, Navigation, Wind, Leaf, History, Eye, Map as MapIcon, 
  MessageSquare, Camera, Droplets, Zap, Flame, Terminal, ShieldAlert,
  BarChart3, Globe, Activity, Bot, Send, LogOut, CloudRain, Sun, 
  Settings2, Download, Database, Train, Megaphone, Hammer, TrendingUp, Heart,
  Target
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { useRouter } from 'next/navigation';

// --- ANIMATION VARIANTS ---
const panelVariants = {
  hidden: { opacity: 0, x: -30, filter: 'blur(10px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};
const HYDRANTS = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.5946, 12.9716] }, properties: { name: 'Cubbon Park Hydrant' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.5960, 12.9730] }, properties: { name: 'Vidhana Soudha Hydrant' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [77.5920, 12.9700] }, properties: { name: 'MG Road Hydrant' } }
  ]
};

const MOCK_AQI = {
  type: 'FeatureCollection',
  features: Array.from({ length: 30 }, () => ({
    type: 'Feature',
    properties: { aqi: Math.random() * 200 },
    geometry: { type: 'Point', coordinates: [77.57 + Math.random() * 0.05, 12.95 + Math.random() * 0.05] }
  }))
};

const AGENT_COUNT = 400;
const BENGALURU_BOUNDS = { minLng: 77.57, maxLng: 77.62, minLat: 12.95, maxLat: 13.00 };

const generateAgents = () => {
  return Array.from({ length: AGENT_COUNT }, (_, i) => ({
    id: i,
    home: [
      BENGALURU_BOUNDS.minLng + Math.random() * (BENGALURU_BOUNDS.maxLng - BENGALURU_BOUNDS.minLng),
      BENGALURU_BOUNDS.minLat + Math.random() * (BENGALURU_BOUNDS.maxLat - BENGALURU_BOUNDS.minLat)
    ],
    work: [
      BENGALURU_BOUNDS.minLng + Math.random() * (BENGALURU_BOUNDS.maxLng - BENGALURU_BOUNDS.minLng),
      BENGALURU_BOUNDS.minLat + Math.random() * (BENGALURU_BOUNDS.maxLat - BENGALURU_BOUNDS.minLat)
    ],
    pos: [0, 0],
    path: [],
    speed: 0.0008 + Math.random() * 0.0015,
    state: Math.random() > 0.5 ? 'commuting' : 'working',
    progress: Math.random(),
    color: [37, 99, 235, 200]
  }));
};

const AdminDashboard = () => {
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const assetToPlaceRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('impact');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDemolishMode, setIsDemolishMode] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [demolishedId, setDemolishedId] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [currentStyle, setCurrentStyle] = useState('streets');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [glContext, setGlContext] = useState(null);
  const [isStyleReady, setIsStyleReady] = useState(false);

  const onWebGLInitialized = (gl) => {
    setGlContext(gl);
    setGraphicsReady(true);
  };

  useEffect(() => {
    setIsCollapsed(window.innerWidth < 768);
    const timer = setTimeout(() => setGraphicsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const [floodLevel, setFloodLevel] = useState(0);
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [showHydrants, setShowHydrants] = useState(false);
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [placedAssets, setPlacedAssets] = useState([]);
  const [assetToPlace, setAssetToPlace] = useState(null);
  useEffect(() => { assetToPlaceRef.current = assetToPlace; }, [assetToPlace]);
  const [scorecard, setScorecard] = useState({ economic: 65, social: 70, environmental: 55 });
  const [isRainy, setIsRainy] = useState(false);
  const [smogLevel, setSmogLevel] = useState(0.1);
  const [isGridLocked, setIsGridLocked] = useState(false);
  const [showReportingHint, setShowReportingHint] = useState(false);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [policyForm, setPolicyForm] = useState({ policy: '', price: '', location: '', purpose: '', prediction: '', duration: '' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [advisorLog, setAdvisorLog] = useState([]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [stormIntensity, setStormIntensity] = useState(5);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictiveData, setPredictiveData] = useState(null);
  
  // --- NEW ADVANCED FEATURES STATES ---
  const [timeHorizon, setTimeHorizon] = useState('present'); // past, present, future
  const [globalConfidence, setGlobalConfidence] = useState(82);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [activePriority, setActivePriority] = useState('balanced'); // balanced, safety, economy, green
  const [conflictReport, setConflictReport] = useState(null);
  const [battleMode, setBattleMode] = useState(false);
  const [explanationData, setExplanationData] = useState(null);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const [activeSmartZones, setActiveSmartZones] = useState(true);
  const [publicRequests, setPublicRequests] = useState([
    { id: 1, type: 'Pothole', location: 'MG Road Junction', status: 'Pending', severity: 'High', lngLat: [77.5912, 12.9797] },
    { id: 2, type: 'Water Leak', location: 'Indiranagar 8th Main', status: 'Resolved', severity: 'Low', lngLat: [77.6412, 12.9780] },
    { id: 3, type: 'Streetlight Out', location: 'Cubbon Park Entrance', status: 'Pending', severity: 'Medium', lngLat: [77.5946, 12.9716] }
  ]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const ASSET_TEMPLATES = {
    // --- BUILDINGS ---
    'Residential': { group: 'Buildings', height: 15, color: '#94a3b8', impacts: { economic: 10, social: 15, environmental: -5 }, icon: <Building2 size={24}/> },
    'Commercial': { group: 'Buildings', height: 35, color: '#64748b', impacts: { economic: 25, social: 8, environmental: -12 }, icon: <Building2 size={24}/> },
    'Hospital': { group: 'Buildings', height: 20, color: '#ef4444', impacts: { economic: 5, social: 30, environmental: 0 }, icon: <Heart size={24}/> },
    'Skyscraper': { group: 'Buildings', height: 80, color: '#1e293b', impacts: { economic: 45, social: 10, environmental: -20 }, icon: <Activity size={24}/> },
    
    // --- TRANSPORT ---
    'Highway': { group: 'Transport', height: 1, color: '#334155', impacts: { economic: 30, social: -5, environmental: -15 }, icon: <Navigation size={24}/> },
    'Flyover': { group: 'Transport', height: 12, color: '#fbbf24', impacts: { economic: 20, social: 10, environmental: -8 }, icon: <Zap size={24}/> },
    'Metro Station': { group: 'Transport', height: 18, color: '#06b6d4', impacts: { economic: 35, social: 25, environmental: 8 }, icon: <Train size={24}/> },
    'Metro Line (UG)': { group: 'Transport', height: -10, color: '#0891b2', impacts: { economic: 40, social: 20, environmental: 12 }, icon: <Train size={24}/> },
    'Bus Stop': { group: 'Transport', height: 3, color: '#10b981', impacts: { economic: 8, social: 15, environmental: 5 }, icon: <Navigation size={24}/> },
    'Road Exp.': { group: 'Transport', height: 1, color: '#475569', impacts: { economic: 12, social: 5, environmental: -12 }, icon: <Zap size={24}/> },

    // --- ENVIRONMENT & ENERGY ---
    'Urban Park': { group: 'Energy', height: 2, color: '#22c55e', impacts: { economic: -5, social: 25, environmental: 40 }, icon: <Leaf size={24}/> },
    'Solar Hub': { group: 'Energy', height: 5, color: '#f59e0b', impacts: { economic: 15, social: 2, environmental: 50 }, icon: <Zap size={24}/> }
  };

  const [viewState, setViewState] = useState({
    longitude: 77.5912,
    latitude: 12.9797,
    zoom: 14,
    pitch: 55,
    bearing: 0
  });

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'google-satellite': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'], tileSize: 256 },
          'google-roads': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'], tileSize: 256 },
          'google-hybrid': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'], tileSize: 256 },
          'buildings': { type: 'geojson', data: '/data/bengaluru_buildings.json' },
          'infrastructure': { type: 'geojson', data: '/data/bengaluru_infrastructure.json' },
          'utilities': { type: 'geojson', data: '/data/bengaluru_utilities.json' },
          'aqi-source': { type: 'geojson', data: MOCK_AQI },
          'hydrants': { type: 'geojson', data: HYDRANTS },
          'blast-circle': { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          'emergency-path': { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
          'placed-assets': { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#0a0b10' } },
          { id: 'hybrid-tiles', type: 'raster', source: 'google-hybrid', layout: { visibility: 'visible' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'none' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
          {
            id: 'infra-layer',
            type: 'line',
            source: 'infrastructure',
            paint: {
              'line-width': ['match', ['get', 'type'], 'flyover', 5, 'metro', 4, 2],
              'line-color': ['match', ['get', 'type'], 'flyover', '#ffa600', 'metro', '#00ffcc', '#607d8b'],
              'line-opacity': 0.8
            }
          },
          {
            id: 'utility-pipes',
            type: 'line',
            source: 'utilities',
            paint: {
              'line-width': 4,
              'line-color': ['match', ['get', 'type'], 
                'WaterPipe', '#00bcd4', 
                'ElectricityLine', '#ffeb3b', 
                'GasLine', '#ff9800', 
                'SewagePipe', '#8d6e63',
                '#ffffff'],
              'line-opacity': 0 
            }
          },
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'buildings',
            paint: {
              'fill-extrusion-color': '#f1f3f4',
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 15],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.9
            }
          },
          {
            id: 'placed-assets-layer',
            type: 'fill-extrusion',
            source: 'placed-assets',
            paint: {
              'fill-extrusion-color': ['get', 'color'],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.9
            }
          }
        ]
      },
      center: [77.5912, 12.9797],
      zoom: 14,
      pitch: 45, // Optimized for 3D city view
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      setIsStyleReady(true);

      map.current.on('click', '3d-buildings', (e) => {
        const f = e.features[0];
        setSelectedBuilding({
          id: f.properties.id,
          name: f.properties.name || 'Structural Unit',
          height: f.properties.height || 15,
          lngLat: e.lngLat
        });
        setDemolishedId(null);
        const source = map.current.getSource('blast-circle');
        if (source) source.setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] } });
      });

      map.current.on('click', (e) => {
        // If an asset is selected in Builder mode, place it
        const currentAsset = assetToPlaceRef.current;
        if (currentAsset && ASSET_TEMPLATES[currentAsset]) {
          setPlacedAssets(prev => [...prev, { 
            id: Date.now(), 
            type: currentAsset, 
            lngLat: e.lngLat, 
            ...ASSET_TEMPLATES[currentAsset] 
          }]);
          setAssetToPlace(null); // Clear selection after placement
          return;
        }

        const features = map.current.queryRenderedFeatures(e.point, { layers: ['3d-buildings'] });
        if (features.length === 0 && !showReportingHint) {
          setSelectedBuilding(null);
          setImpactData(null);
        }
        if (showReportingHint) {
          const newReport = { id: Date.now(), lngLat: e.lngLat, type: 'issue' };
          setReports(prev => [...prev, { ...newReport }]);
          setShowReportingHint(false);
          new maplibregl.Marker({ color: '#ffcc00' }).setLngLat(e.lngLat).addTo(map.current);
        }
      });

      map.current.on('move', () => {
        const { lng, lat } = map.current.getCenter();
        setViewState({
          longitude: lng, latitude: lat,
          zoom: map.current.getZoom(),
          pitch: map.current.getPitch(),
          bearing: map.current.getBearing()
        });
      });
    });

    map.current.on('styledata', () => {
      setIsStyleReady(true);
    });

    const failSafe = setTimeout(() => {
      setMapLoaded(true);
    }, 5000);

    map.current.on('error', () => setMapLoaded(true));

    return () => {
      clearTimeout(failSafe);
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => prev.map(a => {
        let { home, work, progress, speed, state, path } = a;
        
        // Rerouting logic if near demolish site
        let effectiveSpeed = speed;
        
        // INTERVENTION IMPACT: Flyovers & Metro Stations increase speed
        placedAssets.forEach(asset => {
          const dist = Math.sqrt(
            Math.pow(pos[0] - asset.lngLat.lng, 2) + 
            Math.pow(pos[1] - asset.lngLat.lat, 2)
          );
          if (dist < 0.001) {
            if (asset.group === 'Transport') effectiveSpeed *= 1.4; // Speed boost near transit hubs
          }
        });

        if (demolishedId && selectedBuilding) {
          const dist = Math.sqrt(
            Math.pow(a.pos[0] - selectedBuilding.lngLat.lng, 2) + 
            Math.pow(a.pos[1] - selectedBuilding.lngLat.lat, 2)
          );
          if (dist < 0.002) effectiveSpeed *= 0.3; // Traffic jam effect
        }

        // Atmospheric impact on speed
        if (isRainy) effectiveSpeed *= 0.6;
        if (isGridLocked) effectiveSpeed = 0; // Total paralysis

        progress += effectiveSpeed;
        if (progress >= 1) { 
          progress = 0; 
          state = state === 'commuting' ? 'working' : 'commuting'; 
          path = []; // Reset path on cycle
        }
        
        const start = state === 'commuting' ? home : work;
        const end = state === 'commuting' ? work : home;
        const pos = [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress];
        
        const newPath = [...path, { pos, time: Date.now() / 1000 }].slice(-25);

        return { ...a, pos, progress, state, path: newPath };
      }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [demolishedId, selectedBuilding, isRainy, isGridLocked]);

  const agentLayer = new ScatterplotLayer({
    id: 'agent-layer',
    data: agents,
    getPosition: d => d.pos,
    getFillColor: [255, 204, 0],
    getRadius: rippleActive ? 100 : 10,
    updateTriggers: { getPosition: [time], getRadius: [rippleActive] },
    transitions: { getRadius: 600 }
  });

  // FEATURE 4: CHAIN REACTION VISUALIZER (Ripple)
  const rippleLayer = rippleActive ? new ScatterplotLayer({
    id: 'ripple-layer',
    data: agents.slice(0, 50),
    getPosition: d => d.pos,
    getRadius: 500,
    getFillColor: [239, 68, 68, 100],
    stroked: true,
    lineWidthMinPixels: 2,
    getLineColor: [239, 68, 68, 255],
    opacity: 0.4
  }) : null;

  const tripsLayer = new TripsLayer({
    id: 'trips-layer',
    data: agents,
    getPath: d => d.path.map(p => p.pos),
    getTimestamps: d => d.path.map(p => p.time),
    getColor: [255, 204, 0],
    trailLength: 15,
    currentTime: Date.now() / 1000
  });

  const failureLayer = predictiveData ? new ScatterplotLayer({
    id: 'failure-layer',
    data: predictiveData.points,
    getPosition: d => d.coordinates,
    getFillColor: [255, 61, 113, 200],
    getRadius: 100
  }) : null;

  const sentimentLayer = sentimentEnabled && sentimentData ? new HeatmapLayer({
    id: 'sentiment-heatmap',
    data: sentimentData.points,
    getPosition: d => d.coordinates,
    radiusPixels: 70,
    opacity: 0.6
  }) : null;

  // FEATURE 6: SMART ZONE HIGHLIGHTING (Auto Risk Detection)
  const smartZoneLayer = activeSmartZones ? new ScatterplotLayer({
    id: 'smart-zones',
    data: [
      { pos: [77.5912, 12.9797], type: 'critical', msg: 'High congestion risk due to narrow junction.' },
      { pos: [77.5946, 12.9716], type: 'moderate', msg: 'Moderate stress on aging power grid.' }
    ],
    getPosition: d => d.pos,
    getFillColor: d => d.type === 'critical' ? [239, 68, 68, 150] : [245, 158, 11, 150],
    getRadius: 150,
    pickable: true,
    onClick: info => setExplanationData(info.object)
  }) : null;

  useEffect(() => {
    if (!map.current || !mapLoaded || !isStyleReady) return;
    const isSat = currentStyle === 'satellite';
    const isHybrid = currentStyle === 'hybrid';
    const isStreets = currentStyle === 'streets';
    
    map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('hybrid-tiles', 'visibility', isHybrid ? 'visible' : 'none');
    map.current.setLayoutProperty('street-tiles', 'visibility', isStreets ? 'visible' : 'none');
    
    const targetLayer = isSat ? 'satellite-tiles' : (isHybrid ? 'hybrid-tiles' : 'street-tiles');
    map.current.setPaintProperty(targetLayer, 'raster-opacity', isXrayEnabled ? 0.15 : 1);
    map.current.setPaintProperty('utility-pipes', 'line-opacity', isXrayEnabled ? 1 : 0);
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', isXrayEnabled ? 0.2 : 0.8);
    
    // Time Travel & Priority Filtering
    let buildingColor = '#f1f5f9';
    if (timeHorizon === 'past') buildingColor = '#d2b48c'; // Sepia
    if (timeHorizon === 'future') buildingColor = '#00f2ff'; // Neon

    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
      'case',
      ['==', ['get', 'id'], selectedBuilding?.id], '#2563eb',
      ['<', ['%', ['get', 'id'], 15], Number(floodLevel)], '#0061ff',
      isXrayEnabled ? '#e2e8f0' : (isGridLocked ? '#cbd5e1' : buildingColor)
    ]);

    // Apply Split Screen Class to container
    const container = mapContainer.current;
    if (isSplitScreen) {
      container.classList.add('split-view');
    } else {
      container.classList.remove('split-view');
    }
  }, [isXrayEnabled, currentStyle, mapLoaded, isStyleReady, selectedBuilding, isGridLocked, floodLevel, timeHorizon, isSplitScreen]);

  useEffect(() => {
    if (!map.current || !mapLoaded || !isStyleReady) return;
    const source = map.current.getSource('placed-assets');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: placedAssets.map(a => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [a.lngLat.lng, a.lngLat.lat]
          },
          properties: { ...a }
        }))
      });
    }

    // FEATURE 4: TRIGGER RIPPLE ON ASSET PLACEMENT
    if (placedAssets.length > 0) {
      setRippleActive(true);
      setTimeout(() => setRippleActive(false), 2000);
    }

    const newScore = placedAssets.reduce((acc, a) => ({
      economic: acc.economic + a.impacts.economic,
      social: acc.social + a.impacts.social,
      environmental: acc.environmental + a.impacts.environmental
    }), { economic: 65, social: 70, environmental: 55 });

    if (demolishedId) {
      newScore.economic -= 5;
      newScore.social -= 10;
      newScore.environmental -= 2;
    }

    setScorecard({
      economic: Math.min(100, Math.max(0, newScore.economic)),
      social: Math.min(100, Math.max(0, newScore.social)),
      environmental: Math.min(100, Math.max(0, newScore.environmental))
    });

    // FEATURE 1: GLOBAL DECISION CONFIDENCE (Normalized Score)
    const avg = (newScore.economic + newScore.social + newScore.environmental) / 3;
    setGlobalConfidence(Math.floor(avg));
  }, [placedAssets, demolishedId, mapLoaded]);

  // FEATURE 2: AI "WHAT SHOULD I DO?" ENGINE (Ollama Integrated)
  const handleAiSuggest = async () => {
    setAiSuggestion({ text: "CONSULTING NEXUS_OS...", action: "ANALYZING" });
    try {
      const res = await axios.post('/api/ai-suggest', { 
        priority: activePriority,
        assets: placedAssets 
      });
      setAiSuggestion({ text: res.data.suggestion, action: "OPTIMIZE" });
    } catch (err) {
      setAiSuggestion({ text: "Bypass mode active. Shift infrastructure East.", action: "RE-ROUTE" });
    }
  };

  // FEATURE 5: CONFLICT RESOLVER ENGINE (Spatial Awareness)
  const handleConflictSim = () => {
    // Detect overlaps in placed assets
    let conflict = null;
    for (let i = 0; i < placedAssets.length; i++) {
      for (let j = i + 1; j < placedAssets.length; j++) {
        const dist = Math.sqrt(
          Math.pow(placedAssets[i].lngLat.lng - placedAssets[j].lngLat.lng, 2) + 
          Math.pow(placedAssets[i].lngLat.lat - placedAssets[j].lngLat.lat, 2)
        );
        if (dist < 0.0005) {
          conflict = {
            status: "SPATIAL CONFLICT DETECTED",
            details: `Structural overlap between ${placedAssets[i].type} and ${placedAssets[j].type}.`,
            resolution: "RE-POSITION: Offset by 20m to comply with zoning laws."
          };
          break;
        }
      }
    }

    if (!conflict) {
      setConflictReport({
        status: "NO CONFLICTS DETECTED",
        details: "Infrastructure synchronization optimal across all departments.",
        resolution: "PROCEED with construction phase."
      });
    } else {
      setConflictReport(conflict);
    }
  };

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) map.current.flyTo({ center: [res.data[0].lon, res.data[0].lat], zoom: 17, duration: 2500, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
  };

  const handlePredictFailures = async () => {
    setIsPredicting(true);
    try {
      const res = await axios.post(`/api/predict-failures`, { stormIntensity });
      setPredictiveData(res.data);
    } catch (err) { console.error(err); }
    setIsPredicting(false);
  };

  const handleFetchSentiment = async () => {
    if (sentimentEnabled) return setSentimentEnabled(false);
    setIsSentimentLoading(true);
    try {
      const res = await axios.post(`/api/sentiment`);
      setSentimentData(res.data); setSentimentEnabled(true);
    } catch (err) { console.error(err); }
    setIsSentimentLoading(false);
  };

  const handleAskAdvisor = async () => {
    if (!advisorQuery.trim() || isAdvisorLoading) return;
    const q = advisorQuery; setAdvisorQuery(''); setAdvisorLog(p => [...p, { role: 'user', content: q }]);
    setIsAdvisorLoading(true);
    try {
      const res = await axios.post(`/api/policy-advisor`, { query: q });
      setAdvisorLog(p => [...p, { role: 'assistant', content: res.data.report }]);
    } catch { setAdvisorLog(p => [...p, { role: 'assistant', content: "⚠️ Policy server connection failure." }]); }
    setIsAdvisorLoading(false);
  };

  const handleDemolish = () => {
    if (!selectedBuilding) return;
    setDemolishedId(selectedBuilding.id);
    setImpactData({ 
      households: Math.floor(Math.random() * 150) + 20, 
      traffic: `+${Math.floor(Math.random() * 15) + 5} mins`, 
      utilitiesCut: ['Power Grid', 'Water Main'], 
      commuteAgents: Math.floor(Math.random() * 50),
      scorePenalty: { economic: -5, social: -10, environmental: -2 }
    });
  };

  const handleBroadcastPolicy = async () => {
    if (!policyForm.policy || !policyForm.price || !policyForm.location) return;
    setIsBroadcasting(true);
    try {
      await axios.post('http://localhost:3001/api/notifications', policyForm);
      setPolicyForm({ policy: '', price: '', location: '', purpose: '', prediction: '', duration: '' });
      alert("POLICY BROADCAST SUCCESSFUL");
    } catch (err) {
      console.error(err);
      alert("BROADCAST FAILURE");
    }
    setIsBroadcasting(false);
  };

  const openStreetView = () => selectedBuilding && window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedBuilding.lngLat.lat},${selectedBuilding.lngLat.lng}`, '_blank');
  
  const onDragStart = (e, type) => e.dataTransfer.setData('assetType', type);
  const onDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('assetType');
    if (!ASSET_TEMPLATES[type]) return;
    const rect = mapContainer.current.getBoundingClientRect();
    const lngLat = map.current.unproject([e.clientX - rect.left, e.clientY - rect.top]);
    setPlacedAssets(prev => [...prev, { id: Date.now(), type, lngLat, ...ASSET_TEMPLATES[type] }]);
  };

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };



  const [activeCategory, setActiveCategory] = useState(null);

  // Groupings
  const CATEGORIES = {
    strategy: { label: 'STRATEGY', icon: Activity },
    directives: { label: 'DIRECTIVES', icon: Bot },
    builder: { label: 'BUILDER', icon: Hammer },
    crisis: { label: 'CRISIS', icon: ShieldAlert },
    social: { label: 'SOCIAL', icon: Globe },
    reports: { label: 'REPORTS', icon: MessageSquare }
  };

  return (
    <div className="app-root" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <div ref={mapContainer} className="map-viewport">
        {isSplitScreen && (
          <>
            <div className="split-divider" />
            <div className="split-overlay" />
          </>
        )}
      </div>
      {graphicsReady && glContext && (
        <div className="deck-overlay">
          <DeckGL 
            viewState={viewState} 
            gl={glContext}
            onWebGLInitialized={onWebGLInitialized}
            layers={[agentLayer, tripsLayer, failureLayer, sentimentLayer, rippleLayer, smartZoneLayer].filter(Boolean)} 
          />
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="search-container">
        <div className="search-box">
          <Search size={18} color="var(--accent)" />
          <input className="search-field" placeholder="Search Bengaluru Nexus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          {isSearching && <Loader2 className="spin" size={16} color="var(--accent)" />}
        </div>
      </div>

      <div className="side-panel">
        {/* IDENTITY WIDGET */}
        <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
          <ShieldAlert size={24} color="var(--accent)" />
          <div className="header-text">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>ADMIN NEXUS</h2>
            <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>CMD_ROOT_ACCESS_v4.0</span>
          </div>
        </div>

        {/* FULL FEATURE STACK (Dynamic based on Category) */}
        <div className="widget content-widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', borderLeft: '1px solid var(--accent-glass)' }}>
          <div className="scroll-area" style={{ flex: 1, padding: '1rem' }}>
            
            {!activeCategory && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, textAlign: 'center' }}>
                <Terminal size={40} color="var(--accent)" style={{ marginBottom: '1rem' }} />
                <span className="section-label">SYSTEM_READY</span>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>SELECT CATEGORY FROM COMMAND DOCK</p>
              </div>
            )}

            {activeCategory === 'strategy' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {/* 1. IMPACT SCORE (Decision Confidence) */}
                <div className="panel-section" style={{ marginBottom: '2rem' }}>
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <Activity size={14} /> DECISION CONFIDENCE METER
                  </span>
                  <div className="widget" style={{ padding: '1.5rem', background: 'rgba(37,99,235,0.03)', border: '1px solid var(--accent-glass)', textAlign: 'center', marginTop: '1rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: globalConfidence > 70 ? 'var(--success)' : globalConfidence > 40 ? 'var(--warning)' : 'var(--danger)' }}>
                      {globalConfidence}%
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px', opacity: 0.8 }}>
                      {globalConfidence > 70 ? '🟢 SAFE_STATUS' : globalConfidence > 40 ? '🟡 MODERATE_RISK' : '🔴 CRITICAL_RISK'}
                    </span>
                    
                    {/* FEATURE 2: AI SUGGEST BUTTON */}
                    <button className="action-btn" onClick={handleAiSuggest} style={{ marginTop: '1.5rem', background: 'var(--accent)', color: '#fff' }}>
                      AI: SUGGEST BEST PLAN
                    </button>
                    {aiSuggestion && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(37,99,235,0.1)', borderRadius: '10px', fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' }}>
                        " {aiSuggestion.text} "
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* FEATURE 3: TIME TRAVEL MODE */}
                <div className="panel-section" style={{ marginBottom: '2rem' }}>
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <History size={14} /> TIME TRAVEL HORIZON
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    {['past', 'present', 'future'].map(t => (
                      <button key={t} onClick={() => setTimeHorizon(t)} className={`tab-btn ${timeHorizon === t ? 'active' : ''}`} style={{ flex: 1, fontSize: '0.6rem' }}>
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                    {timeHorizon === 'past' ? 'Viewing city status pre-construction (2020).' : timeHorizon === 'present' ? 'Viewing real-time city telemetry (2024).' : 'Viewing AI-predicted failure zones (2030).'}
                  </p>
                </div>

                {/* FEATURE 9: PRIORITY-BASED DECISION */}
                <div className="panel-section">
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <Target size={14} /> STRATEGIC PRIORITY
                  </span>
                  <select value={activePriority} onChange={e => setActivePriority(e.target.value)} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.7rem' }}>
                    <option value="balanced">BALANCED (CITY STABILITY)</option>
                    <option value="safety">MINIMIZE ACCIDENTS (EMS FOCUS)</option>
                    <option value="economy">MAXIMIZE GROWTH (TRAFFIC PRIORITY)</option>
                    <option value="green">NET ZERO (EMISSIONS FOCUS)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {activeCategory === 'directives' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {/* 3. AI ADVISOR */}
                <div className="panel-section" style={{ marginBottom: '2rem' }}>
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <Bot size={14} /> NEXUS AI ADVISOR (GEMMA-4)
                  </span>
                  <div className="advisor-chat" style={{ height: '220px', overflowY: 'auto', marginBottom: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}>
                    {advisorLog.length === 0 && <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Standing by for strategic queries...</p>}
                    {advisorLog.map((m, i) => (
                      <div key={i} style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '10px', background: m.role === 'assistant' ? 'rgba(37,99,235,0.05)' : 'rgba(0,0,0,0.03)', border: m.role === 'assistant' ? '1px solid var(--accent-glass)' : '1px solid var(--glass-border)' }}>
                        <strong style={{ color: m.role === 'assistant' ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.6rem', display: 'block', marginBottom: '0.25rem' }}>{m.role === 'assistant' ? 'NEXUS_OS' : 'COMMANDER'}:</strong>
                        <p style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{m.content}</p>
                      </div>
                    ))}
                    {isAdvisorLoading && <div className="loading-indicator" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.6rem', color: 'var(--accent)' }}><Loader2 size={12} className="spin" /> ANALYZING GEOSPATIAL IMPACT...</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="chat-field" value={advisorQuery} onChange={e => setAdvisorQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAdvisor()} placeholder="QUERY SYSTEM..." style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                    <button className="action-btn" onClick={handleAskAdvisor} style={{ width: '45px', padding: 0, height: '40px' }}><Send size={16} /></button>
                  </div>
                </div>

                {/* 6. GLOBAL BROADCAST */}
                <div className="panel-section">
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <Megaphone size={14} /> STRATEGIC DIRECTIVE
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', padding: '1.25rem', background: 'rgba(37,99,235,0.02)', borderRadius: '12px', border: '1px solid var(--accent-glass)' }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>DIRECTIVE_TITLE</label>
                      <input className="chat-mini" placeholder="e.g. MONSOON_ALERT_V4" value={policyForm.policy} onChange={e => setPolicyForm({...policyForm, policy: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>URBAN_IMPACT_RATIONALE</label>
                      <textarea className="chat-mini" placeholder="State the purpose of this broadcast..." value={policyForm.purpose} onChange={e => setPolicyForm({...policyForm, purpose: e.target.value})} style={{ width: '100%', minHeight: '80px', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.7rem', resize: 'none' }} />
                    </div>
                    <button className="action-btn" onClick={handleBroadcastPolicy} disabled={isBroadcasting} style={{ background: 'var(--accent)', marginTop: '0.5rem' }}>
                      {isBroadcasting ? <Loader2 className="spin" size={14} /> : 'DEPLOY CITY_WIDE DIRECTIVE'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeCategory === 'builder' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="panel-section" style={{ marginBottom: '2rem' }}>
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <Hammer size={14} /> ARCHITECTURAL BUILDER
                  </span>
                  
                  {['Buildings', 'Transport', 'Energy'].map(groupName => (
                    <div key={groupName} style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 900, marginBottom: '0.75rem' }}>{groupName.toUpperCase()}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {Object.entries(ASSET_TEMPLATES).filter(([_, a]) => a.group === groupName).map(([name, asset]) => (
                          <div 
                            key={name} 
                            draggable 
                            onDragStart={(e) => onDragStart(e, name)}
                            className={`asset-card widget ${assetToPlace === name ? 'active' : ''}`} 
                            onClick={() => setAssetToPlace(name)} 
                            style={{ 
                              padding: '1rem', 
                              textAlign: 'center', 
                              cursor: 'grab', 
                              border: assetToPlace === name ? '1px solid var(--accent)' : '1px solid var(--glass-border)', 
                              background: assetToPlace === name ? 'var(--accent-glass)' : 'rgba(255,255,255,0.02)',
                              transition: 'all 0.2s ease'
                            }}>
                            <div style={{ marginBottom: '0.5rem', color: assetToPlace === name ? 'var(--accent)' : 'var(--text-secondary)' }}>{asset.icon}</div>
                            <span style={{ fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.5px' }}>{name.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(37,99,235,0.05)', borderRadius: '12px', border: '1px dashed var(--accent-glass)', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700 }}>TIP: DRAG ASSETS DIRECTLY ONTO MAP</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeCategory === 'crisis' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="panel-section">
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <ShieldAlert size={14} /> CRISIS_RESPONSE_HUB
                  </span>
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <label className="section-label" style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>SIMULATED_FLOOD_DEPTH: {floodLevel}M</label>
                    <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" style={{ background: 'rgba(239,68,68,0.2)' }} />
                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button className={`tab-btn ${showHydrants ? 'active' : ''}`} onClick={() => setShowHydrants(!showHydrants)} style={{ fontSize: '0.6rem' }}>HYDRANTS</button>
                      <button className={`tab-btn ${isEmergencyActive ? 'active' : ''}`} onClick={() => setIsEmergencyActive(!isEmergencyActive)} style={{ fontSize: '0.6rem' }}>EMS_UNIT</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeCategory === 'social' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="panel-section">
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <Heart size={14} /> CITIZEN SENTIMENT PULSE
                  </span>
                  <div className="widget" style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(239,68,68,0.02)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
                    <Globe size={40} color="var(--accent)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>GLOBAL_SOCIAL_METRICS</h3>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Analyze real-time social chatter and community feedback across all Bengaluru wards.</p>
                    <button className="action-btn" onClick={handleFetchSentiment} disabled={isSentimentLoading}>
                      {isSentimentLoading ? <Loader2 className="spin" size={16} /> : 'INITIALIZE HEATMAP ANALYSIS'}
                    </button>
                  </div>
                  
                  {sentimentEnabled && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16,185,129,0.05)', borderRadius: '12px', border: '1px solid var(--success-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--success)' }}>HEATMAP_ACTIVE</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>82% POSITIVE</span>
                      </div>
                      <div className="score-bar" style={{ height: '4px', background: 'rgba(0,0,0,0.05)', marginTop: '0.5rem' }}>
                        <div style={{ width: '82%', height: '100%', background: 'var(--success)', borderRadius: '2px' }} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeCategory === 'reports' && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="panel-section">
                  <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <MessageSquare size={14} /> PUBLIC_REQUEST_INBOX
                  </span>
                  <p style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>Management of incoming citizen grievances and infrastructure requests.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {publicRequests.map(req => (
                      <div 
                        key={req.id} 
                        className="report-card widget" 
                        style={{ padding: '1rem', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--glass-border)', cursor: 'pointer', transition: '0.2s' }} 
                        onClick={() => {
                          map.current.flyTo({ center: req.lngLat, zoom: 17, pitch: 60 });
                          setSelectedRequest(req);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.type.toUpperCase()}</span>
                          <span style={{ 
                            fontSize: '0.5rem', 
                            padding: '3px 8px', 
                            borderRadius: '20px', 
                            background: req.status === 'Resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                            color: req.status === 'Resolved' ? 'var(--success)' : 'var(--danger)',
                            fontWeight: 900
                          }}>{req.status.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                          <MapPin size={10} color="var(--text-secondary)" />
                          <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{req.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* COMPACT DOCK (Hierarchical) */}
      <div className="bottom-dock">
        <div className="dock-section">
          {Object.entries(CATEGORIES).map(([id, cat]) => (
            <button 
              key={id} 
              className={`dock-btn ${activeCategory === id ? 'active' : ''}`} 
              onClick={() => { 
                if (activeCategory === id) {
                  setActiveCategory(null);
                } else {
                  setActiveCategory(id);
                }
              }}
            >
              <cat.icon size={18} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
        <div className="dock-section">
          <button className={`dock-btn ${isXrayEnabled ? 'active' : ''}`} onClick={() => setIsXrayEnabled(!isXrayEnabled)}>
            <Eye size={18} /><span>X-RAY</span>
          </button>
          <button className="dock-btn" onClick={() => {
              const styles = ['satellite', 'hybrid', 'streets'];
              const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
              setCurrentStyle(styles[nextIndex]);
            }}>
            <Layers size={18} /><span>{currentStyle.toUpperCase()}</span>
          </button>
          <button className="dock-btn danger" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={18} /><span>EXIT</span>
          </button>
          <button className={`dock-btn ${isSplitScreen ? 'active' : ''}`} onClick={() => setIsSplitScreen(!isSplitScreen)}>
            <Layers size={18} /><span>SPLIT VIEW</span>
          </button>
          <button className={`dock-btn ${activeSmartZones ? 'active' : ''}`} onClick={() => setActiveSmartZones(!activeSmartZones)}>
            <Target size={18} /><span>SMART ZONES</span>
          </button>
        </div>
      </div>

      {/* FEATURE 8: EXPLAINABLE AI INFO PANEL */}
      <AnimatePresence>
        {explanationData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="widget" style={{ position: 'fixed', bottom: '6rem', left: '50%', transform: 'translateX(-50%)', width: '400px', zIndex: 2000, background: 'rgba(255,255,255,0.95)', border: '1px solid var(--accent-glass)', padding: '1.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="section-label" style={{ color: 'var(--accent)', margin: 0 }}>WHY THIS HAPPENED? (AI_EXPLAINER)</span>
              <button onClick={() => setExplanationData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>
              <strong>OBSERVATION:</strong> {explanationData.msg}
            </p>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(37,99,235,0.05)', borderRadius: '8px', fontSize: '0.7rem' }}>
              <strong style={{ color: 'var(--accent)' }}>ROOT CAUSE:</strong> Junction overload detected due to 35% increase in traffic inflow. Current infrastructure width is insufficient for this density.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PUBLIC REQUEST DOSSIER (Center Popup) */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="preloader"
            style={{ zIndex: 4000, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}
          >
            <div className="widget" style={{ width: '450px', padding: '2rem', border: '1px solid var(--accent)', background: '#fff', boxShadow: '0 20px 60px rgba(37,99,235,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '2px' }}>{selectedRequest.type.toUpperCase()}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <MapPin size={14} color="var(--text-secondary)" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{selectedRequest.location}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>SEVERITY_LVL</span>
                  <p style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.2rem', color: selectedRequest.severity === 'High' ? 'var(--danger)' : 'var(--warning)' }}>{selectedRequest.severity.toUpperCase()}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CURRENT_STATUS</span>
                  <p style={{ fontSize: '0.8rem', fontWeight: 900, marginTop: '0.2rem' }}>{selectedRequest.status.toUpperCase()}</p>
                </div>
              </div>

              <div style={{ fontSize: '0.7rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '2rem', padding: '1rem', borderLeft: '3px solid var(--accent)', background: 'rgba(37,99,235,0.02)' }}>
                <strong>ADMINISTRATIVE NOTE:</strong> Citizen reported issue via Nexus Mobile portal. Proximity analysis suggests localized utility stress. Immediate dispatch recommended if severity is HIGH.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  className="action-btn" 
                  onClick={() => {
                    setPublicRequests(prev => prev.map(r => r.id === selectedRequest.id ? {...r, status: 'Resolved'} : r));
                    setSelectedRequest(null);
                  }}
                  style={{ background: 'var(--accent)', color: '#fff', height: '45px' }}
                >
                  RESOLVE ISSUE
                </button>
                <button 
                  className="action-btn danger" 
                  onClick={() => setSelectedRequest(null)}
                  style={{ height: '45px' }}
                >
                  DISMISS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEATURE 10: SCENARIO BATTLE OVERLAY */}
      {battleMode && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="preloader" style={{ zIndex: 3000, background: 'rgba(255,255,255,0.9)' }}>
          <div className="widget" style={{ width: '600px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>SCENARIO BATTLE: OPTION A vs OPTION B</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>OPTION A (FLYOVER)</h4>
                <div style={{ fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span>🚗 Congestion: -20%</span>
                  <span>💰 Cost: ₹45Cr</span>
                  <span>🌱 Green Score: 🟡</span>
                </div>
              </div>
              <div style={{ padding: '1rem', border: '2px solid var(--accent)', borderRadius: '12px', background: 'var(--accent-glass)' }}>
                <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>OPTION B (METRO LINK)</h4>
                <div style={{ fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span>🚗 Congestion: -35%</span>
                  <span>💰 Cost: ₹120Cr</span>
                  <span>🌱 Green Score: 🟢 WINNER</span>
                </div>
              </div>
            </div>
            <button className="action-btn" onClick={() => setBattleMode(false)} style={{ marginTop: '2rem' }}>CLOSE COMPARISON</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
