'use client';
import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Search, Loader2, MapPin, Layers, History, Eye, Map as MapIcon, 
  MessageSquare, Camera, Terminal, Globe, Send, LogOut, Leaf, ShieldAlert, X
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
const AGENT_COUNT = 200;
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
    progress: Math.random()
  }));
};

const UserDashboard = () => {
  const router = useRouter();
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const [activeTab, setActiveTab] = useState('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('streets');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isStyleReady, setIsStyleReady] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [glContext, setGlContext] = useState(null);

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
  const [timelineYear, setTimelineYear] = useState(2024);
  const [aqiEnabled, setAqiEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [isRainy, setIsRainy] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [showReportingHint, setShowReportingHint] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifBar, setShowNotifBar] = useState(false);
  const [latestNotif, setLatestNotif] = useState(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/notifications');
        if (res.data.length > 0) {
          const newest = res.data[0];
          if (!latestNotif || newest.id !== latestNotif.id) {
            setLatestNotif(newest);
            setNotifications(res.data);
            setShowNotifBar(true);
          }
        }
      } catch (err) { console.error("Notif fetch failed", err); }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, [latestNotif]);

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
          'utilities': { type: 'geojson', data: '/data/bengaluru_utilities.json' }
        },
        layers: [
          { id: 'background', type: 'background', paint: { 'background-color': '#0a0b10' } },
          { id: 'hybrid-tiles', type: 'raster', source: 'google-hybrid', layout: { visibility: 'visible' } },
          { id: 'satellite-tiles', type: 'raster', source: 'google-satellite', layout: { visibility: 'none' } },
          { id: 'street-tiles', type: 'raster', source: 'google-roads', layout: { visibility: 'none' } },
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
          }
        ]
      },
      center: [77.5912, 12.9797],
      zoom: 14,
      pitch: 45,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      setIsStyleReady(true);
    });

    map.current.on('styledata', () => {
      setIsStyleReady(true);
    });
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => prev.map(a => {
        let { home, work, progress, speed, state, path = [] } = a;
        progress += speed;
        if (progress >= 1) { progress = 0; state = state === 'commuting' ? 'working' : 'commuting'; path = []; }
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
  }, []);

  const agentLayer = new ScatterplotLayer({
    id: 'agent-layer',
    data: agents,
    getPosition: d => d.pos,
    getFillColor: [255, 204, 0],
    getRadius: 10,
    updateTriggers: { getPosition: [time] }
  });

  const tripsLayer = new TripsLayer({
    id: 'trips-layer',
    data: agents,
    getPath: d => d.path.map(p => p.pos),
    getTimestamps: d => d.path.map(p => p.time),
    getColor: [255, 204, 0],
    trailLength: 12,
    currentTime: Date.now() / 1000
  });

  const sentimentLayer = sentimentEnabled && sentimentData ? new HeatmapLayer({
    id: 'sentiment-heatmap',
    data: sentimentData.points,
    getPosition: d => d.coordinates,
    radiusPixels: 70,
    opacity: 0.6
  }) : null;

  // Sync Map Features
  useEffect(() => {
    if (!map.current || !mapLoaded || !isStyleReady) return;
    
    const isSat = currentStyle === 'satellite';
    const isHybrid = currentStyle === 'hybrid';
    const isStreets = currentStyle === 'streets';
    
    const safeSetLayout = (id, key, val) => {
      try {
        if (map.current.getLayer(id)) map.current.setLayoutProperty(id, key, val);
      } catch (e) { console.warn("Layout delayed", e); }
    };
    
    const safeSetPaint = (id, key, val) => {
      try {
        if (map.current.getLayer(id)) map.current.setPaintProperty(id, key, val);
      } catch (e) { console.warn("Paint delayed", e); }
    };

    safeSetLayout('satellite-tiles', 'visibility', isSat ? 'visible' : 'none');
    safeSetLayout('hybrid-tiles', 'visibility', isHybrid ? 'visible' : 'none');
    safeSetLayout('street-tiles', 'visibility', isStreets ? 'visible' : 'none');
    
    const targetLayer = isSat ? 'satellite-tiles' : (isHybrid ? 'hybrid-tiles' : 'street-tiles');
    safeSetPaint(targetLayer, 'raster-opacity', isXrayEnabled ? 0.15 : 1);
    safeSetPaint('utility-pipes', 'line-opacity', isXrayEnabled ? 1 : 0);
    safeSetPaint('3d-buildings', 'fill-extrusion-opacity', isXrayEnabled ? 0.2 : 0.8);
    
    safeSetPaint('3d-buildings', 'fill-extrusion-color', [
      'case',
      ['==', ['get', 'id'], selectedBuilding?.id || ''], '#2563eb',
      ['<', ['%', ['get', 'id'], 15], Number(floodLevel)], '#0061ff',
      isXrayEnabled ? '#e2e8f0' : (isSat || isHybrid ? '#2a2d35' : '#f1f5f9')
    ]);
  }, [isXrayEnabled, currentStyle, mapLoaded, isStyleReady, selectedBuilding, isGridLocked, floodLevel]);

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) map.current.flyTo({ center: [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)], zoom: 17, duration: 2500, pitch: 60 });
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

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };

  return (
    <div className="app-root">
      {/* REAL-TIME POLICY NOTIFICATION */}
      <AnimatePresence>
        {showNotifBar && latestNotif && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: 300, opacity: 0 }}
            className="widget"
            style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', width: '320px', zIndex: 1000, borderLeft: '4px solid var(--accent)', padding: '1rem', background: 'rgba(255,255,255,0.95)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 900, letterSpacing: '1.5px' }}>NEW POLICY BROADCAST</span>
              <button onClick={() => setShowNotifBar(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>{latestNotif.policy}</h4>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
              <div><strong style={{ color: 'var(--accent)' }}>COST:</strong><br/>{latestNotif.price}</div>
              <div><strong style={{ color: 'var(--accent)' }}>ZONE:</strong><br/>{latestNotif.location}</div>
              <div><strong style={{ color: 'var(--accent)' }}>TIME:</strong><br/>{latestNotif.duration}</div>
              <div><strong style={{ color: 'var(--accent)' }}>ROI:</strong><br/>{latestNotif.prediction}</div>
            </div>
            <p style={{ fontSize: '0.7rem', marginTop: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: '1.4' }}>"{latestNotif.purpose}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATMOSPHERIC ENGINE */}
      <div className={`atm-overlay atm-smog`} />
      <div className={`atm-overlay atm-rain`} style={{ display: isRainy ? 'block' : 'none' }} />
      <AnimatePresence>
        {!mapLoaded && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="preloader">
            <div className="preloader-content">
              <div className="loader-ring" />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 700, color: 'var(--accent)' }}>CITIZEN PORTAL</h3>
                <p style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>BENGALURU DIGITAL TWIN v4.0</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={mapContainer} className="map-viewport" />
      {graphicsReady && glContext && (
        <div className="deck-overlay">
          <DeckGL 
            viewState={viewState} 
            gl={glContext}
            onWebGLInitialized={onWebGLInitialized}
            layers={[agentLayer, tripsLayer, sentimentLayer].filter(Boolean)} 
          />
        </div>
      )}

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="search-container">
        <div className="search-box">
          <Search size={22} color="var(--accent)" />
          <input className="search-field" placeholder="Search Bengaluru Hub..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} style={{ color: 'var(--text-primary)' }} />
          {isSearching && <Loader2 className="spin" size={20} color="var(--accent)" />}
        </div>
      </motion.div>

      <div className="side-panel">
        <div className="scanline" />
        {/* IDENTITY WIDGET */}
        <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
          <Globe size={24} color="var(--accent)" />
          <div className="header-text">
            <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>CITIZEN NEXUS</h2>
            <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>PUBLIC_CORE_v4.0</span>
          </div>
        </div>

        {/* CITIZEN FEATURES */}
        <div className="widget content-widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div className="scroll-area" style={{ flex: 1, padding: '1rem' }}>
            
            {/* 1. SOCIAL MOOD */}
            <div className="panel-section" style={{ marginBottom: '2rem' }}>
              <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={14} /> COMMUNITY SENTIMENT
              </span>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,242,255,0.02)', borderRadius: '12px', border: '1px solid var(--accent-glass)' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Real-time analysis of city-wide mood and public discourse.</p>
                <button className="action-btn" onClick={handleFetchSentiment} disabled={isSentimentLoading}>
                  {isSentimentLoading ? <Loader2 className="spin" size={16} /> : 'ANALYZE COMMUNITY MOOD'}
                </button>
              </div>
            </div>

            {/* 2. ECO HEALTH */}
            <div className="panel-section" style={{ marginBottom: '2rem' }}>
              <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Leaf size={14} /> ENVIRONMENTAL TELEMETRY
              </span>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <div className="toggle-row"><span>AIR_QUALITY_INDEX (AQI)</span><button className={`toggle-sm ${aqiEnabled ? 'on' : ''}`} onClick={() => setAqiEnabled(!aqiEnabled)} /></div>
                <div className="toggle-row" style={{ marginTop: '1rem' }}><span>VEGETATION_DENSITY (NDVI)</span><button className={`toggle-sm ${greenEnabled ? 'on' : ''}`} onClick={() => setGreenEnabled(!greenEnabled)} /></div>
              </div>
            </div>

            {/* 3. PUBLIC SAFETY */}
            <div className="panel-section" style={{ marginBottom: '2rem' }}>
              <span className="section-label" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={14} /> PUBLIC SAFETY MODEL
              </span>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.1)' }}>
                <label className="section-label" style={{ fontSize: '0.6rem', color: 'var(--danger)' }}>FLOOD_RISK_THRESHOLD: {floodLevel}M</label>
                <input type="range" min="0" max="15" value={floodLevel} onChange={e => setFloodLevel(Number(e.target.value))} className="flood-slider" style={{ background: 'rgba(239,68,68,0.2)' }} />
                <div className="toggle-row" style={{ marginTop: '1rem' }}><span>PRECIPITATION_SIM</span><button className={`toggle-sm ${isRainy ? 'on' : ''}`} onClick={() => setIsRainy(!isRainy)} /></div>
              </div>
            </div>

            {/* 4. HERITAGE TIMELINE */}
            <div className="panel-section">
              <span className="section-label" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={14} /> BENGALURU LEGACY_TRACK
              </span>
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245,158,11,0.02)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)' }}>
                <label className="section-label" style={{ fontSize: '0.6rem', color: 'var(--warning)' }}>CHRONOLOGICAL_YEAR: {timelineYear}</label>
                <input type="range" min="1920" max="2024" step="10" value={timelineYear} onChange={e => setTimelineYear(Number(e.target.value))} className="flood-slider" style={{ background: 'rgba(245,158,11,0.2)' }} />
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="bottom-dock">
        <div className="dock-section">
          {[
            { id: 'social', icon: Globe, label: 'Mood' },
            { id: 'eco', icon: Leaf, label: 'Eco' },
            { id: 'crisis', icon: ShieldAlert, label: 'Public Safety' },
            { id: 'heritage', icon: History, label: 'Legacy' }
          ].map(t => (
            <button key={t.id} className={`dock-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <t.icon size={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
        
        <div className="dock-section">
          <button className="dock-btn" onClick={() => {
              const styles = ['satellite', 'hybrid', 'streets'];
              const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
              setCurrentStyle(styles[nextIndex]);
            }}>
            <Layers size={18} /><span>{currentStyle.toUpperCase()}</span>
          </button>
          <button className="dock-btn" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <LogOut size={18} /><span>LOGOUT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
