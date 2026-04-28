'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Lock, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';

const LoginPage = () => {
  const { role } = useParams();
  const router = useRouter();
  const [username, setUsername] = useState('1');
  const [password, setPassword] = useState('1');
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card glass-panel data-stream"
      >
        <div className="login-header">
          <div className="icon-main data-stream" style={{ margin: '0 auto 1.5rem', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}>
            {isAdmin ? <ShieldAlert size={50} color="var(--danger)" /> : <User size={50} color="var(--accent)" />}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px', background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-main)' }}>{isAdmin ? 'SECURE_SHELL' : 'CITIZEN_GATE'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem', letterSpacing: '3px', fontWeight: 700, fontFamily: 'var(--font-main)' }}>{isAdmin ? 'ADMIN_COMMAND_AUTHORIZATION' : 'PUBLIC_NETWORK_ACCESS'}</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label><User size={14} /> IDENTIFIER</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username..." required />
          </div>

          <div className="input-group">
            <label><Lock size={14} /> ACCESS KEY</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>{error}</p>}

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="spin" size={20} /> : 'INITIALIZE SESSION'}
          </button>
        </form>

        <button className="back-btn" onClick={() => router.push('/portal')}>
          <ArrowLeft size={16} /> RETURN TO PORTAL
        </button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
