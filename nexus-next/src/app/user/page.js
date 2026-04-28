'use client';
import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, MapPin, Layers, Navigation, Wind, Leaf, 
  History, Globe, Activity, LogOut, Droplets, Heart
} from 'lucide-react';
import axios from 'axios';
import { DeckGL } from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { useRouter } from 'next/navigation';

// --- ANIMATION VARIANTS ---
const panelVariants = {
  hidden: { opacity: 0, x: -30, filter: 'blur(10px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// --- MOCK DATA ---
const MOCK_AQI = {
  type: 'FeatureCollection',
  features: Array.from({ length: 30 }, () => ({
    type: 'Feature',
    properties: { aqi: Math.random() * 200 },
    geometry: { type: 'Point', coordinates: [77.57 + Math.random() * 0.05, 12.95 + Math.random() * 0.05] }
  }))
};

// --- ABM CONFIG ---
const AGENT_COUNT = 300;
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
    speed: 0.0005 + Math.random() * 0.001,
    state: Math.random() > 0.5 ? 'commuting' : 'working',
    progress: Math.random()
  }));
};

export default function UserDashboard() {
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('observe');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [currentStyle, setCurrentStyle] = useState('streets');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Public Visual State
  const [floodLevel, setFloodLevel] = useState(0);
  const [timelineYear, setTimelineYear] = useState(2024);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  
  // Traffic Simulation
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);

  const [viewState, setViewState] = useState({
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 15,
    pitch: 45,
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
          'aqi-source': { type: 'geojson', data: MOCK_AQI }
        },
        layers: [
          { id: 'street-tiles', type: 'raster', source: 'google-roads' },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'none' } },
          {
            id: 'infra-layer',
            type: 'line',
            source: 'infrastructure',
            paint: {
              'line-width': ['match', ['get', 'type'], 'flyover', 4, 'metro', 3, 1.5],
              'line-color': ['match', ['get', 'type'], 'flyover', '#ff9800', 'metro', '#4caf50', '#90a4ae'],
              'line-opacity': 0.6
            }
          },
          {
            id: '3d-buildings',
            type: 'fill-extrusion',
            source: 'buildings',
            paint: {
              'fill-extrusion-color': '#e0e0e0',
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
              'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,255,157,0)', 0.5, 'rgba(255,255,0,0.5)', 1, 'rgba(255,0,0,0.5)']
            }
          }
        ]
      },
      center: [77.5946, 12.9716],
      zoom: 15,
      pitch: 45,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      map.current.on('click', '3d-buildings', (e) => {
        const f = e.features[0];
        setSelectedBuilding({
          name: f.properties.name || 'City Structure',
          height: f.properties.height || 15,
          lngLat: e.lngLat
        });
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

  // Animation Loop for Traffic
  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => prev.map(a => {
        let { home, work, progress, speed, state, path } = a;
        progress += speed;
        if (progress >= 1) { 
          progress = 0; 
          state = state === 'commuting' ? 'working' : 'commuting'; 
          path = []; 
        }
        const start = state === 'commuting' ? home : work;
        const end = state === 'commuting' ? work : home;
        const pos = [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress];
        const newPath = [...path, { pos, time: Date.now() / 1000 }].slice(-15);
        return { ...a, pos, progress, state, path: newPath };
      }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, []);

  const tripsLayer = new TripsLayer({
    id: 'public-traffic',
    data: agents,
    getPath: d => d.path.map(p => p.pos),
    getTimestamps: d => d.path.map(p => p.time),
    getColor: [0, 242, 255],
    opacity: 0.6,
    widthMinPixels: 2,
    trailLength: 10,
    currentTime: Date.now() / 1000
  });

  const sentimentLayer = sentimentEnabled && sentimentData ? new HeatmapLayer({
    id: 'public-sentiment',
    data: sentimentData.points,
    getPosition: d => d.coordinates,
    getWeight: d => Math.abs(d.sentiment),
    colorRange: [[255, 61, 113], [255, 204, 0], [0, 255, 157]],
    radiusPixels: 60,
    opacity: 0.4
  }) : null;

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const isSat = currentStyle === 'satellite';
    map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('street-tiles', 'visibility', !isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('aqi-heat', 'visibility', aqiEnabled ? 'visible' : 'none');
    
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
      'case',
      ['<', ['%', ['get', 'id'], 20], Number(floodLevel)], '#0061ff',
      '#e0e0e0'
    ]);
  }, [currentStyle, mapLoaded, aqiEnabled, floodLevel]);

  useEffect(() => {
    if (sentimentEnabled && !sentimentData) {
      axios.post('/api/sentiment').then(res => setSentimentData(res.data));
    }
  }, [sentimentEnabled]);

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) map.current.flyTo({ center: [res.data[0].lon, res.data[0].lat], zoom: 17, duration: 2500 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
  };

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };

  return (
    <div className="app-root">
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="preloader">
            <div className="preloader-content">
              <div className="loader-ring" />
              <h3 style={{ letterSpacing: '4px', fontWeight: 700, color: 'var(--accent)' }}>BENGALURU OBSERVATORY</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={mapContainer} className="map-viewport" />
      <div className="deck-overlay">
        <DeckGL viewState={viewState} layers={[tripsLayer, sentimentLayer].filter(Boolean)} />
      </div>

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="search-container">
        <div className="search-box glass-panel">
          <Search size={22} color="var(--accent)" />
          <input className="search-field" placeholder="Explore Bengaluru..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
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
          <Globe size={36} className="icon-main" />
          <div className="header-text">
            <h2>CITIZEN SHELL</h2>
            <span>PUBLIC ACCESS PORTAL</span>
          </div>
        </div>

        <div className="panel-tabs">
          {[
            { id: 'observe', icon: Wind, label: 'Eco' },
            { id: 'safety', icon: Droplets, label: 'Safety' },
            { id: 'social', icon: Heart, label: 'Social' },
            { id: 'heritage', icon: History, label: 'Legacy' }
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={22} /><span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="scroll-area">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="panel-section">
              {activeTab === 'observe' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <span className="section-label">ENVIRONMENTAL SENSORS</span>
                  <div className="action-grid" style={{ marginTop: '1.25rem' }}>
                    <button className={`neo-btn ${aqiEnabled ? 'active' : ''}`} onClick={() => setAqiEnabled(!aqiEnabled)}>AQI HEATMAP</button>
                    <button className="neo-btn" style={{ opacity: 0.5 }}>CO2 VECTORS</button>
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <div className="stat-item"><small>CITY AVG AQI</small><span>112 (MODERATE)</span></div>
                    <div className="stat-item"><small>VEGETATION INDEX</small><span>0.64 NDWI</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <label className="section-label">FLOOD INUNDATION: {floodLevel}M</label>
                  <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Simulating water level impact on low-lying urban sectors.</p>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <span className="section-label">PUBLIC MOOD TELEMETRY</span>
                  <div className="action-grid" style={{ marginTop: '1.25rem' }}>
                    <button className={`neo-btn ${sentimentEnabled ? 'active' : ''}`} onClick={() => setSentimentEnabled(!sentimentEnabled)}>SENTIMENT GRID</button>
                    <button className="neo-btn" onClick={() => alert("Issue logging system initialized.")}>LOG ISSUE</button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Ingesting real-time social streams to monitor ward-level satisfaction.</p>
                </div>
              )}

              {activeTab === 'heritage' && (
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '25px' }}>
                  <label className="section-label">TEMPORAL VIEW: {timelineYear}</label>
                  <input type="range" min="1980" max="2024" value={timelineYear} onChange={e => setTimelineYear(Number(e.target.value))} className="flood-slider" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>Observe the architectural evolution of Bengaluru through history.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="panel-footer">PUBLIC NEXUS DIGITAL TWIN | v4.0.2</div>
      </motion.div>

      <div className="view-actions">
        <button className={`view-btn neo-btn ${currentStyle === 'satellite' ? 'active' : ''}`} onClick={() => setCurrentStyle(currentStyle === 'satellite' ? 'streets' : 'satellite')}>
          <Layers size={24} /><span>MAP STYLE</span>
        </button>
        <button className="view-btn neo-btn danger" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={24} /><span>LOGOUT</span>
        </button>
      </div>
    </div>
  );
}
