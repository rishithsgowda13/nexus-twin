import React from 'react';
import { motion } from 'framer-motion';

const ScenarioBattle = ({ setBattleMode }) => {
  return (
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
  );
};

export default ScenarioBattle;
