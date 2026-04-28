# 🏙️ Bengaluru Nexus: 3D Digital Twin Command Center v5.0

![Banner](./assets/banner.png)

## 📡 PROJECT OVERVIEW
**Bengaluru Nexus** is a professional-grade urban simulation and spatial governance platform. Designed as a high-fidelity "Cyber-SOC" interface for Bengaluru, it synthesizes real-world geospatial data, 3D architectural footprints, and critical utility infrastructure into a unified digital twin.

Built for urban planners and policy makers, the platform leverages **Supabase + PostGIS** for managed spatial storage and **Next.js 16.2.4** for high-performance city-wide visualization.

---

## 🏗️ System Architecture
The project follows a **Domain-Driven Modular** structure, separating the platform into specialized portals while maintaining a unified core.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Core Rendering** | **MapLibre + Deck.gl** | WebGL-accelerated 3D urban rendering and spatial layers. |
| **Database** | **Supabase / PostGIS** | Managed cloud storage for city assets and geospatial analysis. |
| **Frontend** | **Next.js 16 (Turbopack)** | High-performance dashboard lifecycle and routing. |
| **Simulation** | **Custom ABM Engine** | Agent-Based Modeling for real-time traffic and citizen behavior. |
| **AI Advisor** | **Ollama (Gemma 4)** | Professional urban policy auditing and strategic reporting. |

> [!NOTE]
> For a deep dive into the internal data flow and directory structure, see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md).

---

---

## 🚀 Advanced Command Features (v5.0)

### **1. 🏗️ ARCHITECTURAL BUILDER**
- **Adaptive Command Hub**: High-fidelity asset placement (Metros, Highways, Skyscrapers, Medical Centers).
- **Intelligent Sidebar**: State-aware UI that expands for selection and auto-collapses for focus.
- **Impact Visualizer**: Real-time conflict detection with existing utility infrastructure.

### **2. 🤖 STRATEGIC DIRECTIVES**
- **Nexus AI Advisor**: Professional urban policy auditing using `gemma4:e4b`.
- **Global Broadcast**: Real-time deployment of city-wide governance alerts and incident reports.

### **3. 🚨 CRISIS & SIMULATION**
- **3D Flood Modeling**: Dynamic monsoon inundation tracking with real-time risk scoring.
- **Agent Physics**: Real-time traffic and pedestrian modeling using a custom ABM engine.

### **4. 👥 CITIZEN ENGAGEMENT**
- **Public Request Pulse**: Live tracking of citizen grievances (potholes, accidents) on the unified map.
- **Sentiment Heatmaps**: WebGL-accelerated visualization of community feedback across Bengaluru wards.

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
