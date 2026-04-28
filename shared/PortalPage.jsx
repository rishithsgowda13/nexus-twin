'use client';
import React from 'react';
import { Globe, User, ShieldAlert, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PortalPage = () => {
  const router = useRouter();

  return (
    <div className="portal-root" style={{ height: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="portal-content" style={{ textAlign: 'center', maxWidth: '800px', width: '100%', padding: '2rem' }}>
        <div className="portal-header" style={{ marginBottom: '4rem' }}>
          <div style={{ margin: '0 auto 2rem', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--glass-border)' }}>
            <Globe size={60} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '4px', color: '#fff', marginBottom: '0.5rem' }}>NEXUS</h1>
          <p style={{ color: 'var(--accent)', fontWeight: 700, letterSpacing: '2px', fontSize: '0.9rem' }}>BENGALURU DIGITAL TWIN</p>
        </div>

        <div className="portal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div 
            className="portal-card glass-panel" 
            style={{ padding: '3rem', cursor: 'pointer', textAlign: 'center' }}
            onClick={() => router.push('/login/user')}
          >
            <div style={{ margin: '0 auto 1.5rem' }}>
              <User size={48} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>CITIZEN HUB</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>Observe urban telemetry and report local issues in real-time.</p>
          </div>

          <div 
            className="portal-card glass-panel" 
            style={{ padding: '3rem', cursor: 'pointer', textAlign: 'center' }}
            onClick={() => router.push('/login/admin')}
          >
            <div style={{ margin: '0 auto 1.5rem' }}>
              <ShieldAlert size={48} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: '#fff' }}>ADMIN NEXUS</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>Strategic command interface for municipal planning and crisis management.</p>
          </div>
        </div>

        {/* Footer removed per request */}
      </div>
    </div>
  );
};

export default PortalPage;
