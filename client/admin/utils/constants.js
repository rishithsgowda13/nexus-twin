import React from 'react';
import { 
  Activity, Bot, Hammer, ShieldAlert, Globe, MessageSquare, 
  Bus, Car, TrainFront, Building, Building2, Trees, Droplets, Zap, School, Hospital, Warehouse, Route 
} from 'lucide-react';

export const ASSET_TEMPLATES = {
  'underground-metro': { group: 'Transport', icon: <TrainFront size={16} />, cost: 50, impacts: { economic: 15, social: 10, environmental: 2 } },
  'bus-stop': { group: 'Transport', icon: <Bus size={16} />, cost: 5, impacts: { economic: 2, social: 8, environmental: 1 } },
  'highway-ramp': { group: 'Transport', icon: <Route size={16} />, cost: 25, impacts: { economic: 12, social: -2, environmental: -5 } },
  'smart-building': { group: 'Buildings', icon: <Building2 size={16} />, cost: 40, impacts: { economic: 20, social: 5, environmental: 10 } },
  'hospital': { group: 'Buildings', icon: <Hospital size={16} />, cost: 60, impacts: { economic: 10, social: 25, environmental: 5 } },
  'school': { group: 'Buildings', icon: <School size={16} />, cost: 35, impacts: { economic: 8, social: 20, environmental: 5 } },
  'industrial-hub': { group: 'Buildings', icon: <Warehouse size={16} />, cost: 80, impacts: { economic: 35, social: 5, environmental: -15 } },
  'solar-farm': { group: 'Energy', icon: <Zap size={16} />, cost: 45, impacts: { economic: 10, social: 5, environmental: 25 } },
  'water-purifier': { group: 'Energy', icon: <Droplets size={16} />, cost: 30, impacts: { economic: 5, social: 15, environmental: 15 } },
  'urban-park': { group: 'Energy', icon: <Trees size={16} />, cost: 20, impacts: { economic: 2, social: 18, environmental: 20 } }
};

export const CATEGORIES = {
  strategy: { label: 'STRATEGY', icon: Activity },
  directives: { label: 'DIRECTIVES', icon: Bot },
  builder: { label: 'BUILDER', icon: Hammer },
  crisis: { label: 'CRISIS', icon: ShieldAlert },
  social: { label: 'SOCIAL', icon: Globe },
  reports: { label: 'REPORTS', icon: MessageSquare }
};
