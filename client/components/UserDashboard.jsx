'use client';
import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, MapPin, Layers, History, Eye, Map as MapIcon, 
  MessageSquare, Camera, Terminal, Globe, Send, LogOut, Leaf, ShieldAlert
} from 'lucide-react';
import axios from 'axios';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { useRouter } from 'next/navigation';

// API endpoints will be proxied via next.config.mjs or served relatively in production

// --- ANIMATION VARIANTS ---
const panelVariants = {
  hidden: { opacity: 0, x: -30, filter: 'blur(10px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// --- STATIC DATA ---
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

const UserDashboard = () => {
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [currentStyle, setCurrentStyle] = useState('streets');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(window.innerWidth < 768);
  }, []);
  
  // Public Visual State
  const [floodLevel, setFloodLevel] = useState(0);
  const [timelineYear, setTimelineYear] = useState(2024);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  
  // Simulation State
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [reports, setReports] = useState([]);
  const [showReportingHint, setShowReportingHint] = useState(false);

  // Advanced Analytics & Atmospheric State
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [smogLevel, setSmogLevel] = useState(0.2);
  const [isRainy, setIsRainy] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGraphicsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const [viewState, setViewState] = useState({
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 15,
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
          'buildings': { type: 'geojson', data: '/data/bengaluru_buildings.json' },
          'infrastructure': { type: 'geojson', data: '/data/bengaluru_infrastructure.json' },
          'aqi-source': { type: 'geojson', data: MOCK_AQI }
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#0f172a' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads' },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'none' } },
          {
            id: 'infra-layer',
            type: 'line',
            source: 'infrastructure',
            paint: {
              'line-width': ['match', ['get', 'type'], 'flyover', 5, 'metro', 4, 2],
              'line-color': ['match', ['get', 'type'], 'flyover', '#ffb100', 'metro', '#00ff9d', '#607d8b'],
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
              'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,255,157,0)', 0.5, 'yellow', 1, 'red']
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
      });

      map.current.on('click', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ['3d-buildings'] });
        if (features.length === 0 && !showReportingHint) {
          setSelectedBuilding(null);
        }
        if (showReportingHint) {
          const newReport = { id: Date.now(), lngLat: e.lngLat, type: 'issue' };
          setReports(prev => [...prev, newReport]);
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

    const failSafe = setTimeout(() => {
      setMapLoaded(true);
    }, 5000);

    map.current.on('error', () => setMapLoaded(true));

    return () => {
      clearTimeout(failSafe);
      map.current?.remove();
    };
  }, []);

  // Simulation Engine
  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => prev.map(a => {
        let { home, work, progress, speed, state, path } = a;
        progress += speed;
        if (progress >= 1) { 
          progress = 0; 
          state = state === 'commuting' ? 'working' : 'commuting'; 
          path = []; // Reset path on cycle
        }
        const start = state === 'commuting' ? home : work;
        const end = state === 'commuting' ? work : home;
        const pos = [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress];
        
        // Maintain a short history for trails (max 25 points)
        const newPath = [...path, { pos, time: Date.now() / 1000 }].slice(-25);

        return { ...a, pos, progress, state, path: newPath };
      }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, []);

  const agentLayer = new ScatterplotLayer({
    id: 'agent-layer',
    data: agents,
    getPosition: d => d.pos,
    getFillColor: d => [255, 204, 0],
    getRadius: 10,
    opacity: 1,
    updateTriggers: { getPosition: [time] }
  });

  const tripsLayer = new TripsLayer({
    id: 'trips-layer',
    data: agents,
    getPath: d => d.path.map(p => p.pos),
    getTimestamps: d => d.path.map(p => p.time),
    getColor: [255, 204, 0],
    opacity: 0.8,
    widthMinPixels: 3,
    rounded: true,
    trailLength: 12,
    currentTime: Date.now() / 1000,
    fadeTrail: true
  });

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

  // Sync Map Features
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const isSat = currentStyle === 'satellite';
    map.current.setLayoutProperty('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('street-tiles', 'visibility', !isSat ? 'visible' : 'none');
    map.current.setLayoutProperty('aqi-heat', 'visibility', aqiEnabled ? 'visible' : 'none');
    
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-color', [
      'case',
      ['==', ['get', 'id'], selectedBuilding?.id], '#00f2ff',
      ['<', ['%', ['get', 'id'], 15], Number(floodLevel)], '#0061ff',
      currentStyle === 'satellite' ? '#2a2d35' : '#e0e0e0'
    ]);
    map.current.setPaintProperty('3d-buildings', 'fill-extrusion-opacity', [
      'case',
      greenEnabled ? 0.3 : 0.8
    ]);
  }, [currentStyle, mapLoaded, aqiEnabled, selectedBuilding, greenEnabled, floodLevel]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const sat = timelineYear < 1960 ? 0 : 1;
    const sep = timelineYear < 1960 ? 0.7 : 0;
    map.current.getCanvas().style.filter = `saturate(${sat}) sepia(${sep})`;
  }, [timelineYear, mapLoaded]);

  // Handlers
  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) map.current.flyTo({ center: [res.data[0].lon, res.data[0].lat], zoom: 17, duration: 2500, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
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

  const handleLogout = () => { 
    localStorage.clear(); 
    router.push('/portal'); 
  };

  return (
    <div className="app-root">
      {/* ATMOSPHERIC ENGINE */}
      <div className={`atm-overlay atm-smog`} />
      <div className={`atm-overlay atm-rain`} style={{ display: isRainy ? 'block' : 'none' }} />
      {!mapLoaded && (
        <div className="preloader">
          <div className="preloader-content">
            <div className="loader-ring" />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 700, color: 'var(--accent)' }}>CITIZEN PORTAL</h3>
              <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>BENGALURU DIGITAL TWIN v4.0</p>
            </div>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="map-viewport" />
      {graphicsReady && (
        <div className="deck-overlay">
          <DeckGL viewState={viewState} layers={[agentLayer, tripsLayer, sentimentLayer].filter(Boolean)} />
        </div>
      )}

      <div className="search-container">
        <div className="search-box glass-panel">
          <Search size={22} color="var(--accent)" />
          <input className="search-field" placeholder="Search Bengaluru Hub..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
          {isSearching && <Loader2 className="spin" size={20} color="var(--accent)" />}
        </div>
      </div>

      <div className={`side-panel glass-panel ${mapLoaded ? '' : 'hidden'} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="mobile-toggle" onClick={() => setIsCollapsed(!isCollapsed)} />
        <div className="panel-header" onClick={() => { setSelectedBuilding(null); if(window.innerWidth < 768) setIsCollapsed(true); }}>
          <div className="header-icon-wrap">
            <Globe size={42} className="icon-main" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="header-text">
            <h2 style={{ fontSize: '1.4rem', letterSpacing: '2px' }}>CITIZEN NEXUS</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="status-dot online" />
              <span style={{ fontSize: '0.6rem', color: 'var(--success)', fontWeight: 900 }}>PUBLIC_ACCESS_CORE</span>
            </div>
          </div>
        </div>

        <div className="panel-tabs" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { id: 'social', icon: Globe, label: 'Mood' },
            { id: 'eco', icon: Leaf, label: 'Eco' },
            { id: 'crisis', icon: ShieldAlert, label: 'Public Safety' },
            { id: 'heritage', icon: History, label: 'Legacy' }
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={22} /><span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="scroll-area">
          <div key={activeTab} className="panel-section">
            {activeTab === 'social' && (
              <div className="social-panel">
                <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Visualizing real-time citizen sentiment across Bengaluru wards. Data ingested from public social channels.
                  </p>
                </div>
                <button className="action-btn" onClick={handleFetchSentiment} disabled={isSentimentLoading} style={{ width: '100%', height: '55px', marginBottom: '1.5rem', background: 'var(--accent)' }}>
                  {isSentimentLoading ? <Loader2 className="spin" size={24} /> : <Globe size={24} />}<span>EXPLORE SENTIMENT</span>
                </button>
                <button className="action-btn" onClick={() => setShowReportingHint(true)} style={{ width: '100%', height: '55px' }}>
                  <MessageSquare size={24} /><span>REPORT LOCAL ISSUE</span>
                </button>
                {showReportingHint && <div style={{ marginTop: '1rem', color: 'var(--accent)', fontWeight: 700 }}>TAP MAP TO PIN ISSUE</div>}
              </div>
            )}

            {activeTab === 'eco' && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <span className="section-label">CITY ENVIRONMENTAL HEALTH</span>
                <div className="toggle-row"><span>AIR QUALITY INDEX</span><button className={`toggle-sm ${aqiEnabled ? 'on' : ''}`} onClick={() => setAqiEnabled(!aqiEnabled)} /></div>
                <div className="toggle-row"><span>VEGETATION DENSITY</span><button className={`toggle-sm ${greenEnabled ? 'on' : ''}`} onClick={() => setGreenEnabled(!greenEnabled)} /></div>
              </div>
            )}

            {activeTab === 'crisis' && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <label className="section-label">FLOOD INUNDATION MODEL: {floodLevel}M</label>
                <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" />
                
                <div className="toggle-row" style={{ marginTop: '1.5rem' }}>
                  <span>SIMULATE PRECIPITATION</span>
                  <button className={`toggle-sm ${isRainy ? 'on' : ''}`} onClick={() => setIsRainy(!isRainy)} />
                </div>
              </div>
            )}

            {activeTab === 'heritage' && (
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <label className="section-label">BENGALURU TIMELINE: {timelineYear}</label>
                <input type="range" min="1920" max="2024" step="10" value={timelineYear} onChange={e => setTimelineYear(Number(e.target.value))} className="flood-slider" />
              </div>
            )}
          </div>
        </div>

        <div className="panel-footer">PUBLIC NEXUS DIGITAL TWIN | v4.0.2</div>
      </div>

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
};

export default UserDashboard;
