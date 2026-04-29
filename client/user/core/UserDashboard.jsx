'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ScatterplotLayer } from '@deck.gl/layers';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { TripsLayer } from '@deck.gl/geo-layers';

// SHARED
import MapLayout from '../../shared/components/MapLayout';
import { updateAgents } from '../../shared/utils/simulation';
import { generateAgents } from '../../shared/utils/agentGenerator';

// USER SPECIFIC
import UserSidebar from '../components/UserSidebar';
import UserDock from '../components/UserDock';
import NotificationBar from '../components/NotificationBar';

const UserDashboard = () => {
  const router = useRouter();
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [graphicsReady, setGraphicsReady] = useState(false);
  const [glContext, setGlContext] = useState(null);

  const [activeTab, setActiveTab] = useState('social');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('streets');
  const [isXrayEnabled, setIsXrayEnabled] = useState(false);

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
  const [showNotifBar, setShowNotifBar] = useState(false);
  const [latestNotif, setLatestNotif] = useState(null);
  const [publicRequests, setPublicRequests] = useState([]);

  const [viewState, setViewState] = useState({
    longitude: 77.5912, latitude: 12.9797, zoom: 14, pitch: 55, bearing: 0
  });

  const onWebGLInitialized = (gl) => { setGlContext(gl); setGraphicsReady(true); };

  useEffect(() => {
    const controller = new AbortController();
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/api/reports', { signal: controller.signal });
        setPublicRequests(res.data);
      } catch (err) { 
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error("Request fetch failed", err); 
        }
      }
    };
    fetchRequests();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleFileComplaint = async (e) => {
      const { type, description } = e.detail;
      try {
        const res = await axios.post('/api/reports', {
          type, 
          description,
          location: 'Reported by Citizen',
          lngLat: { 
            lng: viewState.longitude + (Math.random() - 0.5) * 0.01, 
            lat: viewState.latitude + (Math.random() - 0.5) * 0.01 
          }
        });
        if (res.data.success) {
          alert('Complaint filed successfully! Reference ID: ' + res.data.report.id);
          setPublicRequests(prev => [res.data.report, ...prev]);
        }
      } catch (err) {
        console.error("Complaint filing failed", err);
        alert('Failed to file complaint. Please check connection.');
      }
    };

    window.addEventListener('file-complaint', handleFileComplaint);
    return () => window.removeEventListener('file-complaint', handleFileComplaint);
  }, [viewState]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('/api/notifications', { signal: controller.signal });
        if (res.data && res.data.length > 0) {
          const newest = res.data[0];
          if (!latestNotif || newest.id !== latestNotif.id) {
            setLatestNotif(newest);
            setShowNotifBar(true);
          }
        }
      } catch (err) { 
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error("Notif fetch failed", err); 
        }
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [latestNotif]);

  useEffect(() => {
    let requestRef;
    const animate = () => {
      setAgents(prev => updateAgents(prev, { isRainy }));
      setTime(t => t + 1);
      requestRef = requestAnimationFrame(animate);
    };
    requestRef = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef);
  }, [isRainy]);

  const layers = [
    new ScatterplotLayer({
      id: 'agent-layer', data: agents, getPosition: d => d.pos, getFillColor: [255, 204, 0], getRadius: 10, updateTriggers: { getPosition: [time] }
    }),
    sentimentEnabled && sentimentData ? new HeatmapLayer({
      id: 'sentiment-heatmap', data: sentimentData.points, getPosition: d => d.coordinates, radiusPixels: 70, opacity: 0.6
    }) : null,
    new ScatterplotLayer({
      id: 'public-requests-layer',
      data: publicRequests,
      getPosition: d => [d.lngLat.lng, d.lngLat.lat],
      getFillColor: [239, 68, 68],
      getRadius: 15,
      pickable: true
    })
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

  const handleLogout = () => { localStorage.clear(); router.push('/portal'); };

  return (
    <div className="app-root">
      <NotificationBar showNotifBar={showNotifBar} latestNotif={latestNotif} setShowNotifBar={setShowNotifBar} />
      
      <MapLayout 
        viewState={viewState} 
        layers={layers} 
        currentStyle={currentStyle} 
        isXrayEnabled={isXrayEnabled}
        onMapLoad={(m) => { mapRef.current = m; setMapLoaded(true); }}
        onWebGLInitialized={onWebGLInitialized}
      />

      <div className="search-container">
        <div className="search-box">
          <input className="search-field" placeholder="Search Bengaluru Hub..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
      </div>

      <UserDock 
        activeTab={activeTab} setActiveTab={setActiveTab}
        currentStyle={currentStyle} setCurrentStyle={setCurrentStyle}
        handleLogout={handleLogout}
      />

      <UserSidebar 
        activeTab={activeTab}
        handleFetchSentiment={() => { setIsSentimentLoading(true); setTimeout(() => { setSentimentEnabled(true); setIsSentimentLoading(false); }, 1000); }} 
        isSentimentLoading={isSentimentLoading}
        aqiEnabled={aqiEnabled} setAqiEnabled={setAqiEnabled}
        greenEnabled={greenEnabled} setGreenEnabled={setGreenEnabled}
        floodLevel={floodLevel} setFloodLevel={setFloodLevel}
        isRainy={isRainy} setIsRainy={setIsRainy}
        timelineYear={timelineYear} setTimelineYear={setTimelineYear}
      />
    </div>
  );
};

export default UserDashboard;
