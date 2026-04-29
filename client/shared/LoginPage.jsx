'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Lock, Loader2, ArrowRight, Zap, Shield, Fingerprint, Mail } from 'lucide-react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

const LoginPage = () => {
  const { role } = useParams();
  const router = useRouter();
  const [username, setUsername] = useState('admin@nexus.gov');
  const [password, setPassword] = useState('secure_password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`/api/login`, { username, password });
      if (res.data.success) {
        localStorage.setItem('auth_token', res.data.token);
        localStorage.setItem('user_role', res.data.user.role);
        localStorage.setItem('user_name', res.data.user.name);
        router.push('/');
      }
    } catch (err) {
      setError('Authorization failed. Check credentials.');
    }
    setIsLoading(false);
  };

  const isAdmin = role === 'admin' || !role;

  return (
    <div className="login-root">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="login-card-modern"
      >
        <div className="login-left">
          <div className="login-brand">
            {isAdmin ? <ShieldAlert size={20} /> : <User size={20} />}
            NEXUS TWIN
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <h1>{isAdmin ? 'SYSTEM SYNC' : 'CITIZEN ACCESS'}</h1>
            <p>Establish node presence in the NEXUS layers.</p>
            
            <div className="login-features">
              <div className="feature-item">
                <div className="feature-icon"><Zap size={16} /></div>
                <div className="feature-text">INSTANT VALIDATION</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Shield size={16} /></div>
                <div className="feature-text">MILITARY GRADE</div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Fingerprint size={16} /></div>
                <div className="feature-text">BIOMETRIC NODES</div>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-right-header">
            <div className="sub-top">{isAdmin ? 'INNOVATORS AND VISIONARIES' : 'PUBLIC AND COMMUNITY'}</div>
            <h2>WELCOME</h2>
            <div className="sub-bottom">IDENTIFICATION PARAMETERS SYNC</div>
          </div>

          <form onSubmit={handleLogin} className="login-form-modern">
            <div className="input-group">
              <label>NODE CREDENTIALS</label>
              <div className="input-wrapper">
                <Mail size={16} />
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="name@nexus.gov" 
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>SECURITY PROTOCOL KEY</label>
              <div className="input-wrapper">
                <Lock size={16} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••••••" 
                  required 
                />
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" className="btn-modern" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin" size={18} /> : (
                <>ESTABLISH LINK <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="login-footer">
            REGISTRATION IS STRICTLY RESTRICTED TO AUTHORIZED NODES ONLY.
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
