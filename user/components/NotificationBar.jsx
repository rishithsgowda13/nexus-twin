import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const NotificationBar = ({ showNotifBar, latestNotif, setShowNotifBar }) => {
  return (
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
            <button onClick={() => setShowNotifBar(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={14} /></button>
          </div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{latestNotif.policy}</h4>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px' }}>
            <div><strong style={{ color: 'var(--accent)' }}>COST:</strong><br/>{latestNotif.price}</div>
            <div><strong style={{ color: 'var(--accent)' }}>ZONE:</strong><br/>{latestNotif.location}</div>
            <div><strong style={{ color: 'var(--accent)' }}>TIME:</strong><br/>{latestNotif.duration}</div>
            <div><strong style={{ color: 'var(--accent)' }}>ROI:</strong><br/>{latestNotif.prediction}</div>
          </div>
          <p style={{ fontSize: '0.7rem', marginTop: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>"{latestNotif.purpose}"</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBar;
