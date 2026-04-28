'use client';
import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, Building2, Trash2, AlertTriangle, X, MapPin, 
  Layers, Navigation, Wind, Leaf, History, Eye, Map as MapIcon, 
  MessageSquare, Camera, Droplets, Zap, Flame, Terminal, ShieldAlert,
  BarChart3, Globe, Activity, Bot, Send, LogOut
} from 'lucide-react';
import axios from 'axios';
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

// --- STATIC DATA ---
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

// --- ABM CONFIG ---
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
    color: [0, 242, 255, 200]
  }));
};

export default function AdminDashboard() {
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('missions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDemolishMode, setIsDemolishMode] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [demolishedId, setDemolishedId] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Vision Features State
  const [floodLevel, setFloodLevel] = useState(0);
  const [timelineYear, setTimelineYear] = useState(2024);
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [showHydrants, setShowHydrants] = useState(false);
  
  // Simulation State
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);

  // Sims Mode State
  const [placedAssets, setPlacedAssets] = useState([]);
  const [scorecard, setScorecard] = useState({ economic: 65, social: 70, environmental: 55 });

  // God Mode State
  const [showGodMode, setShowGodMode] = useState(false);
  const [isGridLocked, setIsGridLocked] = useState(false);
  const [isRainy, setIsRainy] = useState(false);
  const [smogLevel, setSmogLevel] = useState(0.1);

  const ASSET_TEMPLATES = {
    'Skyscraper': { height: 60, color: '#3c4043', impacts: { economic: 15, social: 5, environmental: -10 }, icon: <Building2 size={24}/> },
    'Urban Park': { height: 2, color: '#00ff9d', impacts: { economic: -5, social: 15, environmental: 25 }, icon: <Leaf size={24}/> },
    'Medical Center': { height: 25, color: '#00f2ff', impacts: { economic: 10, social: 25, environmental: -2 }, icon: <Activity size={24}/> },
    'Solar Plant': { height: 5, color: '#ffcc00', impacts: { economic: 12, social: 2, environmental: 35 }, icon: <Zap size={24}/> }
  };

  // Advanced Analytics State
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [stormIntensity, setStormIntensity] = useState(5);
  const [predictiveData, setPredictiveData] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 15,
    pitch: 55,
    bearing: 0
  });

  useEffect(() => {
    setIsCollapsed(window.innerWidth < 768);
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'google-satellite': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'], tileSize: 256 },
          'google-roads': { type: 'raster', tiles: ['https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'], tileSize: 256 },
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
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite' },
          {
            id: 'infra-layer',
            type: 'line',
            source: 'infrastructure',
            paint: {
              'line-width': ['match', ['get', 'type'], 'flyover', 5, 'metro', 4, 2],
              'line-color': ['match', ['get', 'type'], 'flyover', '#ffb100', 'metro', '#00ff9d', '#607d8b'],
              'line-opacity': 0.8
            }
          },
          {
            id: 'utility-pipes',
            type: 'line',
            source: 'utilities',
            paint: {
              'line-width': 4,
              'line-color': ['match', ['get', 'type'], 'WaterPipe', '#00bcd4', 'ElectricityLine', '#ffeb3b', 'GasLine', '#ff5722', '#ffffff'],
              'line-opacity': 0 
            }
          },
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'buildings',
            paint: {
              'fill-extrusion-color': '#2a2d35',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.8
            }
          },
          {
            id: 'aqi-heat',
            type: 'heatmap',
            source: 'aqi-source',
            layout: { 'visibility': 'none' },
            paint: {
              'heatmap-weight': ['get', 'aqi'],
              'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,255,157,0)', 0.5, 'yellow', 1, 'red']
            }
          },
          {
            id: 'hydrant-layer',
            type: 'circle',
            source: 'hydrants',
            layout: { 'visibility': 'none' },
            paint: { 'circle-radius': 8, 'circle-color': '#ff9800', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }
          },
          {
            id: 'emergency-route',
            type: 'line',
            source: 'emergency-path',
            layout: { 'visibility': 'none' },
            paint: { 'line-color': '#00ff9d', 'line-width': 6, 'line-dasharray': [2, 1] }
          },
          {
            id: 'blast-radius',
            type: 'circle',
            source: 'blast-circle',
            paint: { 'circle-radius': 100, 'circle-color': '#ff3b3b', 'circle-opacity': 0.2, 'circle-stroke-width': 2, 'circle-stroke-color': '#ff3b3b' }
          },
          {
            id: 'sims-buildings',
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
      center: [77.5946, 12.9716],
      zoom: 15,
      pitch: 55,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
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

    return () => map.current?.remove();
  }, []);

  // Simulation Engine
  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => prev.map(a => {
        let { home, work, progress, speed, state, path } = a;
        let effectiveSpeed = speed;
        if (demolishedId && selectedBuilding) {
          const dist = Math.sqrt(
            Math.pow(a.pos[0] - selectedBuilding.lngLat.lng, 2) + 
            Math.pow(a.pos[1] - selectedBuilding.lngLat.lat, 2)
          );
          if (dist < 0.002) effectiveSpeed *= 0.3;
        }

        if (isGridLocked) effectiveSpeed = 0;
        if (isRainy) effectiveSpeed *= 0.6;

        progress += effectiveSpeed;
        if (progress >= 1) { 
          progress = 0; 
          state = state === 'commuting' ? 'working' : 'commuting'; 
          path = []; 
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
  }, [demolishedId, selectedBuilding, isGridLocked, isRainy]);

  const agentLayer = new ScatterplotLayer({
    id: 'agent-layer',
    data: agents,
    getPosition: d => d.pos,
    getFillColor: d => [0, 242, 255],
    getRadius: 10,
    opacity: 1,
    updateTriggers: { getPosition: [time] }
  });

  const tripsLayer = new TripsLayer({
    id: 'trips-layer',
    data: agents,
    getPath: d => d.path.map(p => p.pos),
    getTimestamps: d => d.path.map(p => p.time),
    getColor: [0, 242, 255],
    opacity: 0.8,
    widthMinPixels: 3,
    rounded: true,
    trailLength: 15,
    currentTime: Date.now() / 1000,
    fadeTrail: true
  });

  const failureLayer = predictiveData ? new ScatterplotLayer({
    id: 'failure-layer',
    data: predictiveData.points,
    getPosition: d => d.coordinates,
    getFillColor: [255, 61, 113, 200],
    getRadius: d => 40 + d.riskLevel * 60,
    stroked: true,
    lineWidthMinPixels: 2,
    getLineColor: [255, 255, 255]
  }) : null;

  const sentimentLayer = sentimentEnabled && sentimentData ? new HeatmapLayer({
    id: 'sentiment-heatmap',
    data: sentimentData.points,
    getPosition: d => d.coordinates,
    getWeight: d => Math.abs(d.sentiment) * d.intensity,
    colorRange: [[255, 61, 113], [255, 204, 0], [0, 255, 157]],
    threshold: 0.05,
    radiusPixels: 70,
    opacity: 0.6
  }) : null;

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const isSat = currentStyle === 'satellite';
    map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('street-tiles', 'visibility', !isSat ? 'visible' : 'none');
    map.current.setPaintProperty(isSat ? 'satellite-tiles' : 'street-tiles', 'raster-opacity', isXrayEnabled ? 0.2 : 1);
    map.current.setPaintProperty('utility-pipes', 'line-opacity', isXrayEnabled ? 1 : 0);
    map.current.setLayoutProperty('aqi-heat', 'visibility', aqiEnabled ? 'visible' : 'none');
    map.current.setLayoutProperty('hydrant-layer', 'visibility', showHydrants ? 'visible' : 'none');
    map.current.setLayoutProperty('emergency-route', 'visibility', isEmergencyActive ? 'visible' : 'none');
    
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
      'case',
      ['==', ['get', 'id'], selectedBuilding?.id], '#00f2ff',
      ['<', ['%', ['get', 'id'], 15], Number(floodLevel)], '#0061ff',
      currentStyle === 'satellite' ? '#2a2d35' : '#e0e0e0'
    ]);
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', [
      'case',
      ['==', ['get', 'id'], demolishedId], 0,
      greenEnabled ? 0.3 : 0.8
    ]);
  }, [isXrayEnabled, currentStyle, mapLoaded, aqiEnabled, selectedBuilding, demolishedId, greenEnabled, floodLevel, showHydrants, isEmergencyActive]);

  useEffect(() => {
    if (!map.current) return;
    const source = map.current.getSource('placed-assets');
    if (source) source.setData({ type: 'FeatureCollection', features: placedAssets.map(a => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [a.lngLat.lng, a.lngLat.lat] }, properties: { ...a } })) });
    const newScore = placedAssets.reduce((acc, a) => ({ economic: acc.economic + a.impacts.economic, social: acc.social + a.impacts.social, environmental: acc.environmental + a.impacts.environmental }), { economic: 65, social: 70, environmental: 55 });
    if (demolishedId) { newScore.economic -= 5; newScore.social -= 10; newScore.environmental -= 2; }
    setScorecard({ economic: Math.min(100, Math.max(0, newScore.economic)), social: Math.min(100, Math.max(0, newScore.social)), environmental: Math.min(100, Math.max(0, newScore.environmental)) });
  }, [placedAssets, demolishedId]);

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) map.current.flyTo({ center: [res.data[0].lon, res.data[0].lat], zoom: 17, duration: 2500, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
  };

  const handleDemolish = () => {
    if (!selectedBuilding) return;
    setDemolishedId(selectedBuilding.id);
    setImpactData({ 
      commuteAgents: Math.floor(Math.random() * 50),
      traffic: `+${Math.floor(Math.random() * 15) + 5} mins`,
      scorePenalty: { economic: -5, social: -10 }
    });
  };

  const handleAskAdvisor = async () => {
    if (!chatQuery.trim() || isChatLoading) return;
    const q = chatQuery; setChatQuery(''); setChatHistory(p => [...p, { role: 'user', content: q }]);
    setIsChatLoading(true);
    try {
      const res = await axios.post('/api/policy-advisor', { query: q });
      setChatHistory(p => [...p, { role: 'assistant', content: res.data.report }]);
    } catch { setChatHistory(p => [...p, { role: 'assistant', content: "⚠️ System Offline: Cognitive Hub connection failure." }]); }
    setIsChatLoading(false);
  };

  const handlePredictFailures = async () => {
    setIsPredicting(true);
    try {
      const res = await axios.post('/api/predict-failures', { stormIntensity });
      setPredictiveData(res.data);
      if (res.data.points.length) map.current.flyTo({ center: res.data.points[0].coordinates, zoom: 15, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsPredicting(false);
  };

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };

  return (
    <div className="app-root" onDrop={(e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('assetType');
      if (!ASSET_TEMPLATES[type]) return;
      const rect = mapContainer.current.getBoundingClientRect();
      const lngLat = map.current.unproject([e.clientX - rect.left, e.clientY - rect.top]);
      setPlacedAssets(prev => [...prev, { id: Date.now(), type, lngLat, ...ASSET_TEMPLATES[type] }]);
    }} onDragOver={(e) => e.preventDefault()}>
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="preloader">
            <div className="preloader-content">
              <div className="loader-ring" />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 700, color: 'var(--accent)' }}>ADMIN COMMAND CORE</h3>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>BENGALURU NEXUS v4.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={mapContainer} className="map-viewport" />
      <div className="deck-overlay">
        <DeckGL viewState={viewState} layers={[agentLayer, tripsLayer, failureLayer, sentimentLayer].filter(Boolean)} />
      </div>

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="search-container">
        <div className="search-box glass-panel">
          <Search size={22} color="var(--accent)" />
          <input className="search-field" placeholder="Search Bengaluru Nexus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          {isSearching && <Loader2 className="spin" size={20} color="var(--accent)" />}
        </div>
      </motion.div>

      <motion.div 
        variants={panelVariants} 
        initial="hidden" 
        animate={mapLoaded ? "visible" : "hidden"} 
        className={`side-panel glass-panel ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="mobile-toggle" onClick={() => setIsCollapsed(!isCollapsed)} />
        <div className="panel-header" onClick={() => { setSelectedBuilding(null); if(window.innerWidth < 768) setIsCollapsed(true); }}>
          <ShieldAlert size={36} className="icon-main" />
          <div className="header-text">
            <h2>ADMIN NEXUS</h2>
            <span>COMMAND INTERFACE</span>
          </div>
        </div>

        <div className="scorecard glass-panel" style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.3)' }}>
          <span className="section-label" style={{ fontSize: '0.65rem' }}>CITY PERFORMANCE INDEX</span>
          {Object.entries(scorecard).map(([k, v]) => (
            <div key={k} className="score-item" style={{ marginBottom: '1rem' }}>
              <div className="score-label" style={{ fontSize: '0.7rem' }}>
                <span>{k.toUpperCase()}</span>
                <span style={{ color: v > 70 ? 'var(--success)' : v > 40 ? 'var(--warning)' : 'var(--danger)' }}>{v}%</span>
              </div>
              <div className="score-bar" style={{ height: '6px' }}>
                <div className={`fill ${k === 'environmental' ? 'green' : k === 'social' ? 'blue' : 'yellow'}`} style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="panel-tabs">
          {[
            { id: 'missions', icon: Zap, label: 'Impact' },
            { id: 'energy', icon: Activity, label: 'Predict' },
            { id: 'advisor', icon: Bot, label: 'Advisor' },
            { id: 'sims', icon: Navigation, label: 'Sims' },
            { id: 'crisis', icon: ShieldAlert, label: 'Crisis' }
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={22} /><span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="scroll-area">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="panel-section">
              {activeTab === 'missions' && (
                <>
                  <button className={`neo-btn ${isDemolishMode ? 'active' : ''}`} onClick={() => { setIsDemolishMode(!isDemolishMode); if (isDemolishMode) { setDemolishedId(null); setSelectedBuilding(null); setImpactData(null); } }} style={{ width: '100%', height: '60px', borderRadius: '20px', color: isDemolishMode ? '#fff' : 'var(--danger)', background: isDemolishMode ? 'var(--danger)' : 'rgba(255,61,113,0.1)' }}>
                    <Activity size={24} /><span>{isDemolishMode ? 'RESET SIMULATION' : 'SIMULATE IMPACT'}</span>
                  </button>
                  {selectedBuilding && (
                    <div className="building-detail glass-panel">
                      <div className="detail-row"><MapPin size={24} color="var(--danger)" /><strong>{selectedBuilding.name}</strong></div>
                      <div className="stat-item"><small>ELEVATION</small><span>{selectedBuilding.height}M</span></div>
                      <div className="action-grid" style={{ marginTop: '1.5rem' }}>
                        <button className="neo-btn" onClick={() => window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedBuilding.lngLat.lat},${selectedBuilding.lngLat.lng}`, '_blank')} style={{ background: 'rgba(255,255,255,0.05)' }}><Camera size={16}/> VIEW</button>
                        {isDemolishMode && <button className="neo-btn" onClick={handleDemolish} style={{ background: 'var(--danger)', color: '#fff' }}>AUDIT</button>}
                      </div>
                    </div>
                  )}
                  {impactData && (
                    <div className="impact-report">
                      <span className="section-label">AUDIT RESULTS</span>
                      <div className="report-item">Affected Nodes: <strong>{impactData.commuteAgents}</strong></div>
                      <div className="report-item yellow" style={{ marginTop: '0.5rem' }}>Traffic Delay: <strong>{impactData.traffic}</strong></div>
                      <div className="penalty-box" style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,61,113,0.1)', borderRadius: '12px', border: '1px solid rgba(255,61,113,0.2)' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--danger)', fontWeight: 800 }}>GLOBAL INDEX IMPACT</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}><span>Economic</span><span style={{ color: 'var(--danger)' }}>{impactData.scorePenalty.economic}%</span></div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'energy' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <label className="section-label">STORM INTENSITY: {stormIntensity}</label>
                  <input type="range" min="1" max="10" value={stormIntensity} onChange={e => setStormIntensity(Number(e.target.value))} className="flood-slider" />
                  <button className="neo-btn" onClick={handlePredictFailures} disabled={isPredicting} style={{ width: '100%', height: '55px', background: 'var(--accent)', color: 'var(--bg-deep)', marginTop: '1.5rem' }}>
                    {isPredicting ? <Loader2 className="spin" size={24} /> : <BarChart3 size={24} />}<span>RUN PROJECTION</span>
                  </button>
                </div>
              )}

              {activeTab === 'advisor' && (
                <div className="chat-container">
                  <div className="chat-history scroll-area">
                    {chatHistory.map((m, i) => <div key={i} className={`chat-bubble ${m.role}`}>{m.content}</div>)}
                    {isChatLoading && <div className="chat-bubble assistant">... processing policy vectors ...</div>}
                  </div>
                  <div className="chat-input-wrap">
                    <input className="chat-field" placeholder="Ask Nexus Advisor..." value={chatQuery} onChange={e => setChatQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAdvisor()} />
                    <button className="send-btn neo-btn" onClick={handleAskAdvisor} style={{ background: 'var(--accent)', color: 'var(--bg-deep)' }}><Send size={20} /></button>
                  </div>
                </div>
              )}

              {activeTab === 'sims' && (
                <div className="sims-panel">
                  <div className="scorecard glass-panel">
                    <span className="section-label">ASSET DEPLOYMENT UNIT</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drag and drop infrastructure assets onto the map.</p>
                  </div>
                  <div className="asset-grid">
                    {Object.entries(ASSET_TEMPLATES).map(([n, t]) => (
                      <div key={n} className="asset-card neo-btn" draggable onDragStart={e => e.dataTransfer.setData('assetType', n)}>
                        <div className="icon-main">{t.icon}</div>
                        <span className="asset-name">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'crisis' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <label className="section-label">FLOOD MODEL: {floodLevel}M</label>
                  <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" />
                  <div className="action-grid" style={{ marginTop: '1.5rem' }}>
                    <button className={`neo-btn ${showHydrants ? 'active' : ''}`} onClick={() => setShowHydrants(!showHydrants)}>HYDRANTS</button>
                    <button className={`neo-btn ${isEmergencyActive ? 'active' : ''}`} onClick={() => setIsEmergencyActive(!isEmergencyActive)}>EMS HUB</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="panel-footer">ADMIN BENGALURU NEXUS | v4.0.2</div>
      </motion.div>

      <div className="view-actions">
        <button className={`view-btn neo-btn ${showGodMode ? 'active' : ''}`} onClick={() => setShowGodMode(!showGodMode)}>
          <Settings2 size={24} /><span>COMMAND OVERRIDE</span>
        </button>
        <button className={`view-btn neo-btn ${isXrayEnabled ? 'active' : ''}`} onClick={() => setIsXrayEnabled(!isXrayEnabled)}>
          <Eye size={24} /><span>X-RAY VISION</span>
        </button>
        <button className={`view-btn neo-btn ${currentStyle === 'satellite' ? 'active' : ''}`} onClick={() => setCurrentStyle(currentStyle === 'satellite' ? 'streets' : 'satellite')}>
          <Layers size={24} /><span>TOGGLE MAP STYLE</span>
        </button>
        <button className="view-btn neo-btn danger" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={24} /><span>TERMINATE SESSION</span>
        </button>
      </div>

      <AnimatePresence>
        {showGodMode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="god-mode-panel glass-panel"
          >
            <div className="overlay-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="pulse-dot warning" />
                <h3 style={{ fontSize: '0.9rem', letterSpacing: '4px', fontWeight: 900 }}>COMMAND_OVERRIDE_V4</h3>
              </div>
              <button className="logout-btn" onClick={() => setShowGodMode(false)}><X size={20}/></button>
            </div>

            <div className="override-content">
              <div className="control-group">
                <div className="control-label">
                  <Activity size={18} />
                  <span>GRID PARALYSIS</span>
                </div>
                <button 
                  className={`toggle-sm ${isGridLocked ? 'on' : ''}`} 
                  onClick={() => setIsGridLocked(!isGridLocked)} 
                />
              </div>

              <div className="control-group">
                <div className="control-label">
                  <CloudRain size={18} />
                  <span>ATMOSPHERIC RAIN</span>
                </div>
                <button 
                  className={`toggle-sm ${isRainy ? 'on' : ''}`} 
                  onClick={() => setIsRainy(!isRainy)} 
                />
              </div>

              <div className="control-group slider">
                <div className="control-label">
                  <Wind size={18} />
                  <span>SMOG DENSITY: {(smogLevel * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={smogLevel} 
                  onChange={e => setSmogLevel(Number(e.target.value))} 
                  className="flood-slider"
                />
              </div>
            </div>

            <div className="panel-footer" style={{ border: 'none', padding: 0, marginTop: '2rem' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--warning)', fontWeight: 800 }}>
                WARNING: OVERRIDE BYPASSES STANDARD URBAN PROTOCOLS
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
