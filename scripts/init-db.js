#!/usr/bin/env node

/**
 * Script to initialize the D1 database schema locally using Miniflare
 */

import { readFileSync } from 'fs';
import { Miniflare } from 'miniflare';

async function main() {
  console.log('Initializing D1 database...');
  
  // Create a new Miniflare instance
  const mf = new Miniflare({
    d1Databases: ['DB:score_database'],
    modules: true,
  });
  
  // Get a reference to the D1 database
  const db = await mf.getD1Database('DB');
  
  // Read the schema SQL
  const schema = readFileSync('./schema.sql', 'utf-8');
  
  // Execute the schema SQL
  try {
    const result = await db.exec(schema);
    console.log('Schema initialized successfully!');
    console.log('Tables created:', result);
  } catch (error) {
    console.error('Error initializing schema:', error);
    process.exit(1);
  }
  
  console.log('Done!');
}

main().catch(err => {
  console.error('Initialization failed:', err);
  process.exit(1);
}); 