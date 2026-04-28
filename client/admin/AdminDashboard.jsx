'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';

// SHARED
import MapLayout from '../shared/components/MapLayout';
import { updateAgents } from '../shared/utils/simulation';
import { generateAgents } from '../shared/utils/agentGenerator';

// ADMIN SPECIFIC
import AdminSidebar from './components/AdminSidebar';
import AdminDock from './components/AdminDock';
import PublicRequestDossier from './components/PublicRequestDossier';
import ScenarioBattle from './components/ScenarioBattle';
import { ASSET_TEMPLATES } from './utils/constants';

const AdminDashboard = () => {
  const router = useRouter();
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [glContext, setGlContext] = useState(null);

  // States
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [activeSmartZones, setActiveSmartZones] = useState(false);

  const [agents, setAgents] = useState(generateAgents());
  const [time, setTime] = useState(0);
  const [isRainy, setIsRainy] = useState(false);
  const [floodLevel, setFloodLevel] = useState(0);
  const [timeHorizon, setTimeHorizon] = useState('present');
  const [activePriority, setActivePriority] = useState('balanced');
  const [globalConfidence, setGlobalConfidence] = useState(82);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [advisorLog, setAdvisorLog] = useState([{ role: 'ai', content: 'SYSTEM_READY. Awaiting directives.' }]);
  const [advisorQuery, setAdvisorQuery] = useState('');
  const [policyForm, setPolicyForm] = useState({ policy: '', purpose: '', location: 'MG Road', price: '₹45Cr', duration: '12 Months' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [assetToPlace, setAssetToPlace] = useState(null);
  const [placedAssets, setPlacedAssets] = useState([]);
  const [publicRequests, setPublicRequests] = useState([
    { id: 1, type: 'Pothole', location: 'MG Road', severity: 'High', status: 'Pending', lngLat: { lng: 77.60, lat: 12.97 } },
    { id: 2, type: 'Traffic Light Failure', location: 'Indiranagar', severity: 'Medium', status: 'Pending', lngLat: { lng: 77.64, lat: 12.98 } }
  ]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [battleMode, setBattleMode] = useState(false);
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [sentimentEnabled, setSentimentEnabled] = useState(false);
  const [sentimentData, setSentimentData] = useState(null);

  const [viewState, setViewState] = useState({
    longitude: 77.5912, latitude: 12.9797, zoom: 14, pitch: 55, bearing: 0
  });

  const onWebGLInitialized = (gl) => { setGlContext(gl); setGraphicsReady(true); };

  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => updateAgents(prev, { isRainy, placedAssets }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [isRainy, placedAssets]);

  const layers = [
    new ScatterplotLayer({
      id: 'agent-layer', data: agents, getPosition: d => d.pos, getFillColor: [255, 204, 0], getRadius: 10, updateTriggers: { getPosition: [time] }
    }),
    new TripsLayer({
      id: 'trips-layer', data: agents, getPath: d => d.path.map(p => p.pos), getTimestamps: d => d.path.map(p => p.time), getColor: [255, 204, 0], trailLength: 15, currentTime: Date.now() / 1000
    }),
    sentimentEnabled && sentimentData ? new HeatmapLayer({
      id: 'sentiment-heatmap', data: sentimentData.points, getPosition: d => d.coordinates, radiusPixels: 70, opacity: 0.6
    }) : null
  ].filter(Boolean);

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery},Bengaluru,India&format=json&limit=1`);
      if (res.data[0]) mapRef.current.flyTo({ center: [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)], zoom: 17, duration: 2500, pitch: 60 });
    } catch (err) { console.error(err); }
    setIsSearching(false);
  };

  const handleAiSuggest = () => {
    setAiSuggestion({ text: "CONSULTING NEXUS_OS...", action: "ANALYZING" });
    setTimeout(() => setAiSuggestion({ text: "Bypass mode active. Shift infrastructure East.", action: "RE-ROUTE" }), 1500);
  };

  const handleAskAdvisor = () => {
    if (!advisorQuery.trim()) return;
    const q = advisorQuery; setAdvisorQuery('');
    setAdvisorLog(p => [...p, { role: 'user', content: q }]);
    setTimeout(() => setAdvisorLog(p => [...p, { role: 'ai', content: "Strategic assessment complete. Location: "+policyForm.location+". Recommendation: Deploy transit hub." }]), 1000);
  };

  const handleBroadcastPolicy = () => {
    setIsBroadcasting(true);
    setTimeout(() => { setIsBroadcasting(false); alert("POLICY DEPLOYED"); }, 1500);
  };

  const onDragStart = (e, type) => e.dataTransfer.setData('assetType', type);
  const onDrop = (e) => {
    const type = e.dataTransfer.getData('assetType');
    if (!ASSET_TEMPLATES[type]) return;
    const rect = mapRef.current.getContainer().getBoundingClientRect();
    const lngLat = mapRef.current.unproject([e.clientX - rect.left, e.clientY - rect.top]);
    setPlacedAssets(prev => [...prev, { id: Date.now(), type, lngLat, ...ASSET_TEMPLATES[type] }]);
  };

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };

  return (
    <div className="app-root" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <MapLayout 
        viewState={viewState} 
        layers={layers} 
        currentStyle={currentStyle} 
        isXrayEnabled={isXrayEnabled}
        onMapLoad={(m) => { mapRef.current = m; setMapLoaded(true); }}
        onWebGLInitialized={onWebGLInitialized}
      >
        {isSplitScreen && <div className="split-divider" />}
      </MapLayout>

      <div className="search-container">
        <div className="search-box">
          <input className="search-field" placeholder="Search Bengaluru Nexus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
      </div>

      <AdminSidebar 
        activeCategory={activeCategory}
        globalConfidence={globalConfidence}
        handleAiSuggest={handleAiSuggest}
        aiSuggestion={aiSuggestion}
        timeHorizon={timeHorizon}
        setTimeHorizon={setTimeHorizon}
        activePriority={activePriority}
        setActivePriority={setActivePriority}
        advisorLog={advisorLog}
        advisorQuery={advisorQuery}
        setAdvisorQuery={setAdvisorQuery}
        handleAskAdvisor={handleAskAdvisor}
        policyForm={policyForm}
        setPolicyForm={setPolicyForm}
        handleBroadcastPolicy={handleBroadcastPolicy}
        isBroadcasting={isBroadcasting}
        assetToPlace={assetToPlace}
        setAssetToPlace={setAssetToPlace}
        onDragStart={onDragStart}
        floodLevel={floodLevel}
        setFloodLevel={setFloodLevel}
        handleFetchSentiment={() => { setIsSentimentLoading(true); setTimeout(() => { setSentimentEnabled(true); setIsSentimentLoading(false); }, 1000); }}
        isSentimentLoading={isSentimentLoading}
        publicRequests={publicRequests}
        setSelectedRequest={setSelectedRequest}
        mapRef={mapRef}
      />

      <AdminDock 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        isXrayEnabled={isXrayEnabled}
        setIsXrayEnabled={setIsXrayEnabled}
        currentStyle={currentStyle}
        setCurrentStyle={setCurrentStyle}
        handleLogout={handleLogout}
        isSplitScreen={isSplitScreen}
        setIsSplitScreen={setIsSplitScreen}
        activeSmartZones={activeSmartZones}
        setActiveSmartZones={setActiveSmartZones}
      />

      <PublicRequestDossier 
        selectedRequest={selectedRequest} 
        setSelectedRequest={setSelectedRequest} 
        setPublicRequests={setPublicRequests} 
      />

      {battleMode && <ScenarioBattle setBattleMode={setBattleMode} />}
    </div>
  );
};

export default AdminDashboard;
