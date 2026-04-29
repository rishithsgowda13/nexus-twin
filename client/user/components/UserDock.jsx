import React from 'react';
import { Globe, Leaf, ShieldAlert, History, Layers, LogOut, MessageSquare } from 'lucide-react';

const UserDock = ({ activeTab, setActiveTab, currentStyle, setCurrentStyle, handleLogout }) => {
  const tabs = [
    { id: 'social', icon: Globe, label: 'Mood' },
    { id: 'eco', icon: Leaf, label: 'Eco' },
    { id: 'crisis', icon: ShieldAlert, label: 'Safety' },
    { id: 'heritage', icon: History, label: 'Legacy' },
    { id: 'complaints', icon: MessageSquare, label: 'Report' }
  ];

  return (
    <div className="bottom-dock">
      <div className="dock-section">
        {tabs.map(t => (
          <button key={t.id} className={`dock-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <t.icon size={18} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      
      <div className="dock-section">
        <button className="dock-btn" onClick={() => {
            const styles = ['satellite', 'hybrid', 'streets'];
            const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
            setCurrentStyle(styles[nextIndex]);
          }}>
          <Layers size={18} /><span>{currentStyle.toUpperCase()}</span>
        </button>
        <button className="dock-btn" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={18} /><span>LOGOUT</span>
        </button>
      </div>
    </div>
  );
};

export default UserDock;
