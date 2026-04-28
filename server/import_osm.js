const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log("Enabling PostGIS extension on Supabase...");
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');

    console.log("Creating tables...");
    await client.query(`
      DROP TABLE IF EXISTS buildings;
      CREATE TABLE buildings (
        id SERIAL PRIMARY KEY,
        osm_id TEXT,
        name TEXT,
        height FLOAT,
        type TEXT,
        geom GEOMETRY(Geometry, 4326)
      );
      CREATE INDEX buildings_geom_idx ON buildings USING GIST(geom);

      DROP TABLE IF EXISTS utilities;
      CREATE TABLE utilities (
        id SERIAL PRIMARY KEY,
        name TEXT,
        type TEXT,
        diameter TEXT,
        source TEXT,
        geom GEOMETRY(Geometry, 4326)
      );
      CREATE INDEX utilities_geom_idx ON utilities USING GIST(geom);
    `);

    const dataDir = path.join(__dirname, '../data');
    const files = fs.readdirSync(dataDir);

    // Find the latest building and utility files
    const buildingFile = files.find(f => f.endsWith('_buildings.json'));
    const utilityFile = files.find(f => f.endsWith('_utilities.json'));

    if (buildingFile) {
      console.log(`Importing buildings from ${buildingFile}...`);
      const buildingsData = JSON.parse(fs.readFileSync(path.join(dataDir, buildingFile), 'utf8'));
      for (const feature of buildingsData.features) {
        const { properties, geometry } = feature;
        await client.query(
          'INSERT INTO buildings (osm_id, name, height, type, geom) VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))',
          [properties.id, properties.name || null, properties.height || null, properties.type || 'building', JSON.stringify(geometry)]
        );
      }
      console.log(`Imported ${buildingsData.features.length} buildings.`);
    }

    if (utilityFile) {
      console.log(`Importing utilities from ${utilityFile}...`);
      const utilitiesData = JSON.parse(fs.readFileSync(path.join(dataDir, utilityFile), 'utf8'));
      for (const feature of utilitiesData.features) {
        const { properties, geometry } = feature;
        await client.query(
          'INSERT INTO utilities (name, type, diameter, source, geom) VALUES ($1, $2, $3, $4, ST_GeomFromGeoJSON($5))',
          [properties.name || null, properties.type || null, properties.diameter || null, properties.source || null, JSON.stringify(geometry)]
        );
      }
      console.log(`Imported ${utilitiesData.features.length} utilities.`);
    }

    console.log("Supabase/PostGIS Import Complete!");
  } catch (err) {
    console.error("Error during import:", err);
  } finally {
    client.release();
    process.exit();
  }
}

setupDatabase();
