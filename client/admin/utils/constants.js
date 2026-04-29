import React from 'react';
import { 
  Activity, Bot, Hammer, ShieldAlert, Globe, MessageSquare, 
  Bus, Car, TrainFront, Building, Building2, Trees, Droplets, Zap, School, Hospital, Warehouse, Route 
} from 'lucide-react';

export const ASSET_TEMPLATES = {
  'underground-metro': { group: 'Transport', icon: <TrainFront size={16} />, cost: 120, impacts: { economic: 35, social: 25, environmental: 15 } },
  'bus-terminal': { group: 'Transport', icon: <Bus size={16} />, cost: 15, impacts: { economic: 10, social: 15, environmental: 5 } },
  'highway-junction': { group: 'Transport', icon: <Route size={16} />, cost: 85, impacts: { economic: 45, social: -5, environmental: -10 } },
  'flyover-extension': { group: 'Transport', icon: <Activity size={16} />, cost: 40, impacts: { economic: 20, social: 2, environmental: -5 } },
  'smart-skyscrapper': { group: 'Buildings', icon: <Building2 size={16} />, cost: 200, impacts: { economic: 80, social: 10, environmental: 5 } },
  'medical-center': { group: 'Buildings', icon: <Hospital size={16} />, cost: 95, impacts: { economic: 15, social: 45, environmental: 10 } },
  'education-campus': { group: 'Buildings', icon: <School size={16} />, cost: 75, impacts: { economic: 25, social: 40, environmental: 15 } },
  'logistics-park': { group: 'Buildings', icon: <Warehouse size={16} />, cost: 150, impacts: { economic: 60, social: 5, environmental: -20 } },
  'solar-grid': { group: 'Energy', icon: <Zap size={16} />, cost: 55, impacts: { economic: 20, social: 5, environmental: 65 } },
  'filtration-plant': { group: 'Energy', icon: <Droplets size={16} />, cost: 45, impacts: { economic: 10, social: 25, environmental: 35 } },
  'bio-reserve': { group: 'Energy', icon: <Trees size={16} />, cost: 30, impacts: { economic: 5, social: 30, environmental: 80 } }
};

export const CATEGORIES = {
  strategy: { label: 'STRATEGY', icon: Activity },
  directives: { label: 'DIRECTIVES', icon: Bot },
  builder: { label: 'BUILDER', icon: Hammer },
  crisis: { label: 'CRISIS', icon: ShieldAlert },
  social: { label: 'SOCIAL', icon: Globe },
  reports: { label: 'REPORTS', icon: MessageSquare }
};
