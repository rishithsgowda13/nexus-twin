# Nexus Twin: Feature Documentation

Welcome to the **Nexus Twin v3.0** documentation! This document explains the complete feature set of the web application, detailing what every button does and how it interacts with the backend API.

## Overview
Nexus Twin features a dual-mode architecture tailored for two distinct personas:
1. **Admin Nexus (Strategic Command)**: Advanced tools for urban planners and city administrators to simulate policies, deploy assets, and monitor critical KPIs.
2. **Citizen Nexus (Public Observatory)**: A public-facing, read-only interface focused on transparency, real-time safety, and community feedback.

---

## 1. Top Panel & Global Controls
- **Search Bar**: Type any address or building name (e.g., "Palace") to fly the 3D map camera directly to that location.
- **X-Ray Utility Vision (Top Right button)**: Toggles the subsurface view of the city. It reveals hidden infrastructure networks like Water Pipes and Electricity Lines mapped beneath the city surface.

---

## 2. Mode Switcher
Located at the top of the side panel, this toggle switches the entire application context:
- **Admin Nexus**: Activates the Strategic Command interface (Zoning, Resilience, Climate, Heritage, Social tabs).
- **Citizen Nexus**: Activates the Public Observatory interface (Observe, Safety, Environment, Timeline, Report tabs).

---

## 3. Admin Nexus: Strategic Command

### A. Zoning Tab (Missions)
- **Agent-Based Simulation (ABM)**: Spawns 20 autonomous agent markers (pink dots) that move around the map in real-time, simulating pedestrian and micro-mobility flow. This triggers an API call to log the action to the Activity Log.
- **Deck.gl TripsLayer (Traffic Flow)**: Simulates dynamic vehicle traffic flows (cyan dots) across the city's road network. Logs to the backend Activity Log.
- **'The Sims' Asset Deployment**: Activates a drag-and-drop mode. When active, clicking anywhere on the map will deploy a new 3D asset (🏢) to that location and securely save the coordinates to the backend (`/api/deploy-asset`).
- **Impact Audit Simulation (Demolish Button)**: Click a 3D building on the map, then click this button to simulate its removal. It queries the backend (`/api/analyze-impact`) to calculate the systemic shock, revealing how many households will lose power/water and estimating the resulting traffic delay.

### B. Resilience Tab (Crisis)
- **Show EMS Hydrants & Routes**: Highlights emergency medical service routes and fire hydrant locations on the 3D map.
- **Storm Inundation Level (Slider)**: Simulates rising floodwaters. As you drag the slider, a blue polygon layer rises on the map to visualize which buildings and streets will be submerged.

### C. Climate Tab (Eco)
- **AQI Heatmap Layer**: Overlays a localized Air Quality Index heatmap, indicating pollution hotspots across the city.
- **Vegetation Health Index**: Analyzes urban greenery density to calculate the City Sustainability Score.
- **Atmospheric Weather Engine**: Activates a realistic, animated CSS rain overlay that dynamically falls over the entire interface to simulate live weather conditions.

### D. Heritage Tab
- **Architectural Timeline Engine (Slider)**: A temporal slider that filters the 3D buildings based on their construction year. Dragging it back to 1920 will hide modern structures, leaving only historical monuments visible.

### E. Social Tab
- **Open AI Policy Advisor**: Opens an interactive modal. This tool queries the backend (`/api/ai-advisor`). The AI analyzes the current dashboard state (e.g., if the flood slider is high, or AQI is on) and returns context-aware urban policy recommendations.
- **Citizen Mood Heatmap**: Toggles aggregated sentiment data from social platforms.
- **Strategic Activity Log**: A real-time terminal feed that tracks all administrative actions (e.g., turning on ABM, deploying assets) by fetching the event history directly from the backend (`/api/logs`).

---

## 4. Citizen Nexus: Public Observatory

### A. Observe Tab
- **Live Traffic Pulse**: A citizen-facing read-only view of the city's current traffic conditions.

### B. Safety Tab
- **Public Safety Flood Simulator**: Allows citizens to simulate storm surges in their own neighborhoods to assess personal risk, mirroring the Admin Resilience tool.

### C. Environment Tab
- **Environment HUD**: Enables citizens to view Air Quality and Vegetation data for their health and awareness.

### D. Timeline Tab
- **Heritage Timeline**: An interactive, educational tool for citizens to explore the city's architectural evolution.

### E. Report Tab
- **File Citizen Report**: Activates crowdsourced reporting. Clicking this button primes the map. The next click on the map will drop an orange warning marker and send an HTTP POST request to the backend (`/api/report-issue`), immediately updating the live feed of pending neighborhood issues for all users.
- **View Public Mood Heatmap**: Displays an anonymized heatmap of community sentiment.

---

## 5. Triple Win Scorecard (Admin Footer)
Located at the bottom of the Admin panel, this scorecard tracks the city's live KPIs:
- **Economic Score**: 88%
- **Social Score**: 92%
- **Environmental Score**: Dynamically updates based on active simulations (e.g., drops to 74% if flood levels are high or AQI is poor).
- **System Health**: Shifts to "Critical" if thresholds are exceeded.
