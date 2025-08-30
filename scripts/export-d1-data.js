#!/usr/bin/env node

/**
 * Export script for migrating data from Cloudflare D1 to PostgreSQL
 * Run this script to export your existing data before migration
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Starting D1 data export...');

const tables = ['users', 'contracts', 'notification_settings', 'expenses', 'payments', 'maintenance_requests'];
const exportDir = './data-export';

// Create export directory
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

// Export each table
tables.forEach(table => {
  try {
    console.log(`📊 Exporting ${table}...`);
    
    // Export as JSON for easier handling
    const command = `wrangler d1 execute rental-management-db --command="SELECT * FROM ${table};" --json > ${exportDir}/${table}.json`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ ${table} exported successfully`);
  } catch (error) {
    console.error(`❌ Error exporting ${table}:`, error.message);
  }
});

console.log('📝 Generating PostgreSQL import script...');

// Generate import script
let importScript = `-- PostgreSQL Import Script
-- Generated from Cloudflare D1 export
-- Run this after running postgres-migration.sql

`;

tables.forEach(table => {
  const filePath = `${exportDir}/${table}.json`;
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (data.length > 0) {
        importScript += `\n-- Import ${table}\n`;
        
        data.forEach(row => {
          const columns = Object.keys(row).join(', ');
          const values = Object.values(row).map(val => 
            val === null ? 'NULL' : `'${String(val).replace(/'/g, "''")}'`
          ).join(', ');
          
          if (table === 'users') {
            importScript += `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT (username) DO NOTHING;\n`;
          } else if (table === 'contracts') {
            importScript += `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`;
          } else if (table === 'notification_settings') {
            importScript += `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT (id) DO NOTHING;\n`;
          } else {
            importScript += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
          }
        });
      }
    } catch (error) {
      console.error(`❌ Error processing ${table}:`, error.message);
    }
  }
});

// Write import script
fs.writeFileSync(`${exportDir}/postgres-import.sql`, importScript);

console.log('✅ Export complete!');
console.log(`📁 Files created in ${exportDir}/`);
console.log('📋 Next steps:');
console.log('1. Review the exported data files');
console.log('2. Run postgres-migration.sql on your PostgreSQL database');
console.log('3. Run postgres-import.sql to import your existing data');
console.log('4. Deploy to Vercel');