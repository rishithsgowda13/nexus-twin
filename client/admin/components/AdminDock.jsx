import React from 'react';
import { Eye, Layers, LogOut, Target } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

const AdminDock = ({ 
  activeCategory, 
  setActiveCategory, 
  isXrayEnabled, 
  setIsXrayEnabled, 
  currentStyle, 
  setCurrentStyle, 
  handleLogout,
  setIsSidebarCollapsed,
  isSplitScreen,
  setIsSplitScreen,
  activeSmartZones,
  setActiveSmartZones
}) => {
  return (
    <div className="bottom-dock">
      <div className="dock-section">
        {Object.entries(CATEGORIES).map(([id, cat]) => (
          <button 
            key={id} 
            className={`dock-btn ${activeCategory === id ? 'active' : ''}`} 
            onClick={() => {
              setActiveCategory(activeCategory === id ? null : id);
              setIsSidebarCollapsed(false);
            }}
          >
            <cat.icon size={18} />
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
      <div className="dock-section">
        <button className={`dock-btn ${isXrayEnabled ? 'active' : ''}`} onClick={() => setIsXrayEnabled(!isXrayEnabled)}>
          <Eye size={18} /><span>X-RAY</span>
        </button>
        <button className="dock-btn" onClick={() => {
            const styles = ['satellite', 'hybrid', 'streets'];
            const nextIndex = (styles.indexOf(currentStyle) + 1) % styles.length;
            setCurrentStyle(styles[nextIndex]);
          }}>
          <Layers size={18} /><span>{currentStyle.toUpperCase()}</span>
        </button>
        <button className="dock-btn danger" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={18} /><span>EXIT</span>
        </button>
        <button className={`dock-btn ${isSplitScreen ? 'active' : ''}`} onClick={() => setIsSplitScreen(!isSplitScreen)}>
          <Layers size={18} /><span>SPLIT VIEW</span>
        </button>
        <button className={`dock-btn ${activeSmartZones ? 'active' : ''}`} onClick={() => setActiveSmartZones(!activeSmartZones)}>
          <Target size={18} /><span>SMART ZONES</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDock;
