# 🏛️ Supabase / PostGIS Schema Setup

Run the following SQL commands in your **Supabase SQL Editor** to initialize the Bengaluru Nexus Digital Twin database.

## 1. Enable PostGIS Extension
This enables all spatial functions (`ST_Intersects`, `ST_DWithin`, etc.).

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

## 2. Infrastructure Tables

### 🏢 Buildings
Stores the 3D footprint and metadata for city buildings.

```sql
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  osm_id TEXT,
  name TEXT,
  height FLOAT DEFAULT 15.0,
  type TEXT DEFAULT 'building',
  geom GEOMETRY(Geometry, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for fast lookups
CREATE INDEX IF NOT EXISTS buildings_geom_idx ON buildings USING GIST(geom);
```

### ⚡ Utilities
Stores underground infrastructure like power lines, water pipes, and gas mains.

```sql
CREATE TABLE IF NOT EXISTS utilities (
  id SERIAL PRIMARY KEY,
  name TEXT,
  type TEXT, -- 'electricity', 'water', 'gas'
  diameter TEXT,
  source TEXT,
  geom GEOMETRY(Geometry, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS utilities_geom_idx ON utilities USING GIST(geom);
```

## 3. Citizen & Governance Tables

### 🚩 Public Reports
Stores citizen grievances and infrastructure issues.

```sql
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- 'Pothole', 'Traffic', 'Accident', etc.
  status TEXT DEFAULT 'Pending', -- 'Pending', 'Resolved', 'In Progress'
  location_name TEXT,
  lngLat JSONB NOT NULL, -- { "lng": 77.x, "lat": 12.x }
  geom GEOMETRY(Point, 4326), -- Redundant spatial column for PostGIS queries
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reports_geom_idx ON reports USING GIST(geom);
```

### 📢 Strategic Directives (Notifications)
Stores city-wide policies and broadcast alerts.

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  policy_title TEXT NOT NULL,
  price TEXT,
  location TEXT,
  purpose TEXT,
  prediction TEXT,
  duration TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. Useful Helper Functions (Optional)

### 🛰️ Proximity Search RPC
You can call this directly from the frontend via `supabase.rpc('get_buildings_near', { lng: x, lat: y, radius_meters: 500 })`.

```sql
CREATE OR REPLACE FUNCTION get_buildings_near(lng FLOAT, lat FLOAT, radius_meters FLOAT)
RETURNS TABLE (
  id INT,
  name TEXT,
  type TEXT,
  height FLOAT,
  geometry JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id, 
    b.name, 
    b.type, 
    b.height, 
    ST_AsGeoJSON(b.geom)::JSON as geometry
  FROM buildings b
  WHERE ST_DWithin(b.geom, ST_SetSRID(ST_MakePoint(lng, lat), 4326), radius_meters / 111320.0)
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;
```

---
**Note**: After running these, make sure to update your `.env` with the `DATABASE_URL` provided by Supabase in the **Database Settings** tab.
