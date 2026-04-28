# 🏙️ Bengaluru Nexus: 3D Digital Twin Command Center v4.2

![Banner](./assets/banner.png)

## 📡 PROJECT OVERVIEW
**Bengaluru Nexus** is a state-of-the-art, high-fidelity urban simulation and management platform. Designed as a "God Mode" interface for the Silicon Valley of India, it synthesizes real-world geospatial data, 3D architectural footprints, and critical utility infrastructure into an immersive, browser-based integrated command center.

Built for urban planners, emergency responders, and policy makers, the platform leverages advanced GIS technologies and Agent-Based Modeling (ABM) to provide deep insights into infrastructure resilience, environmental health, and citizen sentiment.

---

## 🛠️ Technical Architecture

The platform is built on a high-performance geospatial stack designed for real-time 3D urban simulation.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Core Rendering** | **MapLibre GL JS** | Open-source, WebGL-based engine for hardware-accelerated 3D extrusions and spatial repaints. |
| **Base Layers** | **Google Maps Raster** | Direct XYZ raster tile integration for photorealistic satellite and street-level imagery. |
| **Spatial Data** | **GeoJSON** | Industry-standard format for city infrastructure (buildings, utilities, hydrants). |
| **Frontend** | **Next.js + Vite** | React-driven lifecycle management for instant canvas updates and state synchronization. |
| **Backend** | **Node.js + Express** | High-concurrency API for logging spatial interactions and predictive failure analysis. |
| **AI Engine** | **Ollama (Gemma 4)** | Local LLM integration for policy auditing and strategic directives. |

---

## 🚀 Advanced Command Features (v4.2)

### **1. 📊 STRATEGY**
- **Impact Score**: Real-time normalization of economic, social, and environmental metrics.
- **AI "Suggest Best Plan"**: Local LLM-powered (Gemma 4) tactical directives based on live city telemetry.
- **Time Travel Horizon**: Visualize city evolution from 2020 (Historical) to 2030 (Predicted).

### **2. 🤖 DIRECTIVES**
- **Nexus AI Advisor**: Professional-grade urban policy auditing and fiscal reporting using `gemma4:e4b`.
- **Strategic Broadcast**: City-wide deployment of governance directives and emergency alerts.

### **3. 🏗️ BUILDER**
- **Architectural Construction Hub**: High-fidelity asset placement (Buildings, Transport, Energy).
- **Conflict Resolver**: Real-time spatial overlap detection between new developments and existing infrastructure.

### **4. 🚨 CRISIS**
- **3D Flood Simulator**: Interactive monsoon inundation modeling with building-level risk markers.
- **EMS Deployment**: Real-time emergency routing and fire hydrant mapping.

### **5. 🌐 SOCIAL**
- **Citizen Sentiment Pulse**: Real-time social telemetry analysis to visualize public mood.
- **Smart Risk Zones**: Autonomous AI-detection of high-stress utility and congestion points.

---

## ⚡ ADMINISTRATIVE "GOD MODE"
*   **Global Grid Lock**: Instant Traffic Paralysis simulation for emergency drill testing.
*   **Atmospheric Control**: Real-time Rainfall and Smog density toggles that affect agent behavior.
*   **Chain Reaction Visualizer**: Pulsing ripple effects showing the spatial impact of new urban developments.

---

## ⚙️ INSTALLATION & RUNNING

### Prerequisites
*   Node.js (v18+)
*   Ollama (with `gemma4:e4b` model downloaded)

### 1. Project Initialization
```bash
# Install all dependencies (Client & Server)
npm run install:all
```

### 2. Launch Development Environment
```bash
# Start both Server (3001) and Client (9000)
npm run dev
```
*   **🏙️ Admin Nexus**: [http://localhost:9000/admin](http://localhost:9000/admin)
*   **📡 Analysis Service**: [http://localhost:3001/api](http://localhost:3001/api)

---

## 👤 AUTHOR
**Bharath Kumara**
*   *Digital Twin Architect & Geospatial Engineer*

---

> *"The future of urban governance is not in papers, but in pixels."* - **BENGALURU NEXUS CMD v4.2**
