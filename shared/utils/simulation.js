// Common Agent Simulation Logic
export const updateAgents = (agents, options = {}) => {
  const { 
    isRainy = false, 
    isGridLocked = false, 
    placedAssets = [],
    demolishedId = null,
    selectedBuilding = null
  } = options;

  return agents.map(a => {
    let { home, work, progress, speed, state, path = [] } = a;
    
    let effectiveSpeed = speed;
    
    // Impact calculations
    if (placedAssets.length > 0) {
      placedAssets.forEach(asset => {
        const dist = Math.sqrt(
          Math.pow(a.pos[0] - asset.lngLat.lng, 2) + 
          Math.pow(a.pos[1] - asset.lngLat.lat, 2)
        );
        if (dist < 0.001 && asset.group === 'Transport') {
          effectiveSpeed *= 1.4;
        }
      });
    }

    if (demolishedId && selectedBuilding) {
      const dist = Math.sqrt(
        Math.pow(a.pos[0] - selectedBuilding.lngLat.lng, 2) + 
        Math.pow(a.pos[1] - selectedBuilding.lngLat.lat, 2)
      );
      if (dist < 0.002) effectiveSpeed *= 0.3;
    }

    if (isRainy) effectiveSpeed *= 0.6;
    if (isGridLocked) effectiveSpeed = 0;

    progress += effectiveSpeed;
    if (progress >= 1) { 
      progress = 0; 
      state = state === 'commuting' ? 'working' : 'commuting'; 
      path = []; 
    }
    
    const start = state === 'commuting' ? home : work;
    const end = state === 'commuting' ? work : home;
    const pos = [start[0] + (end[0] - start[0]) * progress, start[1] + (end[1] - start[1]) * progress];
    
    const newPath = [...path, { pos, time: Date.now() / 1000 }].slice(-25);

    return { ...a, pos, progress, state, path: newPath };
  });
};
