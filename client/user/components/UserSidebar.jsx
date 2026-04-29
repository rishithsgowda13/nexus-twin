import React from 'react';
import { Terminal, Leaf, ShieldAlert, History, Globe } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const UserSidebar = ({ 
  handleFetchSentiment, 
  isSentimentLoading, 
  aqiEnabled, 
  setAqiEnabled, 
  greenEnabled, 
  setGreenEnabled,
  floodLevel,
  setFloodLevel,
  isRainy,
  setIsRainy,
  timelineYear,
  setTimelineYear
}) => {
  return (
    <div className="side-panel">
      <div className="scanline" />
      <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
        <Globe size={24} color="var(--accent)" />
        <div className="header-text">
          <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>CITIZEN NEXUS</h2>
          <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>PUBLIC_CORE_v4.0</span>
        </div>
      </div>

      <div className="widget content-widget" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div className="scroll-area" style={{ flex: 1, padding: '1rem' }}>
          
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

          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Leaf size={14} /> ENVIRONMENTAL TELEMETRY
            </span>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <div className="toggle-row"><span>AIR_QUALITY_INDEX (AQI)</span><button className={`toggle-sm ${aqiEnabled ? 'on' : ''}`} onClick={() => setAqiEnabled(!aqiEnabled)} /></div>
              <div className="toggle-row" style={{ marginTop: '1rem' }}><span>VEGETATION_DENSITY (NDVI)</span><button className={`toggle-sm ${greenEnabled ? 'on' : ''}`} onClick={() => setGreenEnabled(!greenEnabled)} /></div>
            </div>
          </div>

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

          <div className="panel-section" style={{ marginBottom: '2rem' }}>
            <span className="section-label" style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={14} /> BENGALURU LEGACY_TRACK
            </span>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245,158,11,0.02)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)' }}>
              <label className="section-label" style={{ fontSize: '0.6rem', color: 'var(--warning)' }}>CHRONOLOGICAL_YEAR: {timelineYear}</label>
              <input type="range" min="1920" max="2024" step="10" value={timelineYear} onChange={e => setTimelineYear(Number(e.target.value))} className="flood-slider" style={{ background: 'rgba(245,158,11,0.2)' }} />
            </div>
          </div>

          <div className="panel-section">
            <span className="section-label" style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={14} /> REPORT AN ISSUE
            </span>
            <div style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(37,99,235,0.02)', borderRadius: '12px', border: '1px solid var(--accent-glass)' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>DEPARTMENT</label>
                <select id="complaint-dept" className="chat-mini" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}>
                  <option value="Road">Road / Potholes</option>
                  <option value="Electrical">Electrical / BESCOM</option>
                  <option value="Water Pipeline">Water Pipeline / BWSSB</option>
                  <option value="Corporation">Corporation / BBMP</option>
                  <option value="Waste">Waste Management</option>
                </select>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>DESCRIPTION</label>
                <textarea id="complaint-desc" className="chat-mini" placeholder="Describe the issue..." style={{ width: '100%', minHeight: '60px', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.7rem', resize: 'none' }} />
              </div>
              <button className="action-btn" onClick={() => {
                const type = document.getElementById('complaint-dept').value;
                const desc = document.getElementById('complaint-desc').value;
                if (!desc) return alert('Please provide a description');
                window.dispatchEvent(new CustomEvent('file-complaint', { detail: { type, description: desc } }));
                document.getElementById('complaint-desc').value = '';
              }} style={{ background: 'var(--accent)', marginTop: '0.5rem' }}>SUBMIT COMPLAINT</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSidebar;
