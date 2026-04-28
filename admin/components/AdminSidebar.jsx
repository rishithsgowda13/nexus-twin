import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Activity, Bot, Hammer, Globe, MessageSquare, 
  History, Target, Send, Megaphone, Loader2, Terminal
} from 'lucide-react';
import { ASSET_TEMPLATES } from '../utils/constants';

const AdminSidebar = ({ 
  activeCategory, 
  globalConfidence, 
  handleAiSuggest, 
  aiSuggestion, 
  timeHorizon, 
  setTimeHorizon, 
  activePriority, 
  setActivePriority,
  advisorLog,
  advisorQuery,
  setAdvisorQuery,
  handleAskAdvisor,
  policyForm,
  setPolicyForm,
  handleBroadcastPolicy,
  isBroadcasting,
  assetToPlace,
  setAssetToPlace,
  onDragStart,
  floodLevel,
  setFloodLevel,
  showHydrants,
  setShowHydrants,
  isEmergencyActive,
  setIsEmergencyActive,
  handleFetchSentiment,
  isSentimentLoading,
  publicRequests,
  setSelectedRequest,
  mapRef
}) => {
  return (
    <div className="side-panel">
      <div className="widget" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid var(--glass-border)' }}>
        <ShieldAlert size={24} color="var(--accent)" />
        <div className="header-text">
          <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '1px' }}>ADMIN NEXUS</h2>
          <span style={{ fontSize: '0.5rem', color: 'var(--success)', fontWeight: 900 }}>CMD_ROOT_ACCESS_v4.0</span>
        </div>
      </div>

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
              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Activity size={14} /> DECISION CONFIDENCE METER</span>
                <div className="widget" style={{ padding: '1.5rem', background: 'rgba(37,99,235,0.03)', border: '1px solid var(--accent-glass)', textAlign: 'center', marginTop: '1rem' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: globalConfidence > 70 ? 'var(--success)' : globalConfidence > 40 ? 'var(--warning)' : 'var(--danger)' }}>{globalConfidence}%</div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px', opacity: 0.8 }}>{globalConfidence > 70 ? '🟢 SAFE_STATUS' : globalConfidence > 40 ? '🟡 MODERATE_RISK' : '🔴 CRITICAL_RISK'}</span>
                  <button className="action-btn" onClick={handleAiSuggest} style={{ marginTop: '1.5rem', background: 'var(--accent)', color: '#fff' }}>AI: SUGGEST BEST PLAN</button>
                  {aiSuggestion && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(37,99,235,0.1)', borderRadius: '10px', fontSize: '0.7rem', fontStyle: 'italic', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' }}>" {aiSuggestion.text} "</motion.div>
                  )}
                </div>
              </div>

              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><History size={14} /> TIME TRAVEL HORIZON</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {['past', 'present', 'future'].map(t => (
                    <button key={t} onClick={() => setTimeHorizon(t)} className={`tab-btn ${timeHorizon === t ? 'active' : ''}`} style={{ flex: 1, fontSize: '0.6rem' }}>{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>

              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Target size={14} /> STRATEGIC PRIORITY</span>
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
              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Bot size={14} /> NEXUS AI ADVISOR</span>
                <div className="advisor-chat" style={{ height: '180px', overflowY: 'auto', marginBottom: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', fontSize: '0.7rem' }}>
                  {advisorLog.map((m, i) => (
                    <div key={i} style={{ marginBottom: '0.75rem', padding: '0.5rem', borderRadius: '8px', background: m.role === 'ai' ? 'rgba(37,99,235,0.05)' : 'rgba(0,0,0,0.03)' }}>
                      <strong style={{ color: m.role === 'ai' ? 'var(--accent)' : 'var(--text-secondary)', fontSize: '0.6rem' }}>{m.role === 'ai' ? 'NEXUS_OS' : 'COMMANDER'}:</strong>
                      <p style={{ marginTop: '0.25rem', color: 'var(--text-primary)' }}>{m.content}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="chat-field" value={advisorQuery} onChange={e => setAdvisorQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAdvisor()} placeholder="QUERY SYSTEM..." style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', fontSize: '0.7rem', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }} />
                </div>
              </div>

              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Megaphone size={14} /> STRATEGIC BROADCAST</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem', padding: '1rem', background: 'rgba(0,242,255,0.02)', borderRadius: '12px' }}>
                  <input className="chat-mini" placeholder="POLICY_TITLE" value={policyForm.policy} onChange={e => setPolicyForm({...policyForm, policy: e.target.value})} />
                  <textarea className="chat-mini" placeholder="STRATEGIC_PURPOSE_BRIEF" value={policyForm.purpose} onChange={e => setPolicyForm({...policyForm, purpose: e.target.value})} style={{ minHeight: '60px' }} />
                  <button className="action-btn" onClick={handleBroadcastPolicy} disabled={isBroadcasting} style={{ background: 'var(--success)' }}>
                    {isBroadcasting ? <Loader2 className="spin" size={14} /> : 'DEPLOY CITY_WIDE DIRECTIVE'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeCategory === 'builder' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="panel-section" style={{ marginBottom: '2rem' }}>
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Hammer size={14} /> ARCHITECTURAL BUILDER</span>
                {['Buildings', 'Transport', 'Energy'].map(groupName => (
                  <div key={groupName} style={{ marginTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 900, marginBottom: '0.75rem' }}>{groupName.toUpperCase()}</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      {Object.entries(ASSET_TEMPLATES).filter(([_, a]) => a.group === groupName).map(([name, asset]) => (
                        <div key={name} draggable onDragStart={(e) => onDragStart(e, name)} className={`asset-card widget ${assetToPlace === name ? 'active' : ''}`} onClick={() => setAssetToPlace(name)} style={{ padding: '1rem', textAlign: 'center', cursor: 'grab', border: assetToPlace === name ? '1px solid var(--accent)' : '1px solid var(--glass-border)', background: assetToPlace === name ? 'var(--accent-glass)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease' }}>
                          <div style={{ marginBottom: '0.5rem', color: assetToPlace === name ? 'var(--accent)' : 'var(--text-secondary)' }}>{asset.icon}</div>
                          <span style={{ fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.5px' }}>{name.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeCategory === 'crisis' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><ShieldAlert size={14} /> CRISIS_RESPONSE_HUB</span>
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
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><Globe size={14} /> CITIZEN SENTIMENT PULSE</span>
                <button className="action-btn" onClick={handleFetchSentiment} disabled={isSentimentLoading} style={{ marginTop: '1rem' }}>{isSentimentLoading ? <Loader2 className="spin" size={16} /> : 'ANALYZE REAL-TIME MOOD'}</button>
              </div>
            </motion.div>
          )}

          {activeCategory === 'reports' && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="panel-section">
                <span className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}><MessageSquare size={14} /> PUBLIC_REQUEST_INBOX</span>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {publicRequests.map(req => (
                    <div key={req.id} className="widget" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', cursor: 'pointer' }} onClick={() => { mapRef.current.flyTo({ center: req.lngLat, zoom: 17 }); setSelectedRequest(req); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>{req.type.toUpperCase()}</span>
                        <span style={{ fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px', background: req.status === 'Resolved' ? 'var(--success-glass)' : 'var(--danger-glass)', color: req.status === 'Resolved' ? 'var(--success)' : 'var(--danger)' }}>{req.status}</span>
                      </div>
                      <p style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>📍 {req.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
