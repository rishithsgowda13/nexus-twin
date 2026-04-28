'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldAlert, User, Globe, Terminal } from 'lucide-react';

const PortalPage = () => {
  const router = useRouter();

  React.useEffect(() => {
    localStorage.removeItem('auth_token');
  }, []);

  return (
    <div className="portal-root">
      <div className="portal-content">
        <div className="portal-header">
          <div style={{ margin: '0 auto', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
            <Globe size={60} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '1.5rem', color: '#fff' }}>NEXUS</h1>
          <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>BENGALURU DIGITAL TWIN</p>
        </div>

        <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '4rem' }}>
          <div className="portal-card glass-panel" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => router.push('/login/user')}>
            <User size={48} color="var(--accent)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0' }}>CITIZEN HUB</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Observe urban telemetry and report local issues.</p>
          </div>

          <div className="portal-card glass-panel" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => router.push('/login/admin')}>
            <ShieldAlert size={48} color="var(--danger)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0' }}>ADMIN NEXUS</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Strategic command interface for urban planners.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalPage;
