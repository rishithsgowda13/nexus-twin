# 🏗️ Bengaluru Nexus: System Architecture v5.0

## 🌌 High-Level Overview
Bengaluru Nexus is a domain-driven, monorepo-style application designed for high-concurrency urban simulation and spatial governance. The architecture is split into three primary layers: **Command Core (Backend)**, **Synthesis Portal (Frontend)**, and **Nexus Storage (Supabase/PostGIS)**.

---

## 📂 Directory Structure (Domain-Driven)
The project utilizes a root-level modular structure to ensure domain isolation while maintaining shared logic.

```text
root/
├── admin/          # Admin Domain (Strategic Command, Builder Mode)
├── user/           # User Domain (Citizen Portal, Incident Reporting)
├── shared/         # Shared Infrastructure (Map Engine, Simulation Physics)
├── client/         # Next.js Application Root (Routing & Build config)
├── server/         # Express API Service (Spatial Analytics & AI)
└── data/           # Geospatial Datasets (GeoJSON/OSM)
```

---

## 📡 The Tech Stack

### 1. **Data Layer (Nexus Storage)**
- **Supabase**: Managed PostgreSQL hosting with **PostGIS** extension.
- **PostGIS**: Provides advanced spatial query capabilities (`ST_Intersects`, `ST_DWithin`) for infrastructure impact analysis.
- **Supabase Client**: Used for real-time data synchronization and citizen report persistence.

### 2. **Logic Layer (Command Core)**
- **Node.js / Express**: High-speed API handles complex spatial computations and AI bridge.
- **Ollama (Gemma 4)**: Local LLM integration for strategic policy auditing and automated city directives.
- **pg (PostgreSQL client)**: Direct SQL connection for optimized PostGIS operations.

### 3. **Presentation Layer (Synthesis Portal)**
- **Next.js 16.2.4 (Turbopack)**: High-performance React framework for state management and routing.
- **MapLibre GL & Deck.gl**: WebGL-accelerated rendering engine for hardware-accelerated 3D urban extrusions.
- **Framer Motion**: Smooth glassmorphic UI transitions and sidebar micro-animations.

---

## 🔄 Data & Signal Flow

### **Spatial Impact Analysis**
1. **User Action**: Admin drags a "Smart Skyscraper" into the city.
2. **Signal**: Frontend sends the building's GeoJSON geometry to `/api/analyze-impact`.
3. **Computation**: Backend executes a PostGIS `ST_Intersects` query against the `utilities` table in Supabase.
4. **Response**: System returns a report of utility pipes/lines that will be affected by the construction.
5. **Visualization**: UI highlights the conflict zones in 3D red pulses.

### **Citizen Report Lifecycle**
1. **Reporting**: Citizen reports a pothole via the User Portal.
2. **Persistence**: Data is saved to the Supabase `reports` table.
3. **Visibility**: Admin receives a real-time notification; the pothole appears as a red marker on both portals' maps.
4. **Resolution**: Admin deploys a repair directive; the report status updates across all clients.

---

## 🛠️ Build Strategy
- **Modular Visibility**: Admin, User, and Shared folders are kept at the project root for developer visibility but are consumed by Next.js via the `experimental.externalDir` configuration.
- **Shared-First Architecture**: All map rendering and agent physics are centralized in `shared/`, ensuring the Admin and User dashboards see the exact same city state.

---
**BENGALURU NEXUS CMD v5.0** | *Urban Governance Reimagined.*
