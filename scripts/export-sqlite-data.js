const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function exportSQLiteData() {
  try {
    console.log('Exporting data from SQLite database...');
    
    // Check if SQLite database exists
    const dbPath = path.join(__dirname, '..', 'rental.db');
    if (!fs.existsSync(dbPath)) {
      console.log('No SQLite database found at:', dbPath);
      console.log('Please ensure your SQLite database is located at the correct path.');
      return;
    }
    
    const db = new sqlite3.Database(dbPath);
    const outputDir = path.join(__dirname, 'migration-data');
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Helper function to query and export table data
    function exportTable(tableName, filename) {
      return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
          if (err) {
            console.error(`Error querying ${tableName}:`, err);
            resolve([]); // Continue with empty array if table doesn't exist
            return;
          }
          
          const outputPath = path.join(outputDir, filename);
          fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2));
          console.log(`✅ Exported ${rows.length} records from ${tableName} to ${filename}`);
          resolve(rows);
        });
      });
    }
    
    // Export all tables
    await exportTable('users', 'users.json');
    await exportTable('contracts', 'contracts.json');
    await exportTable('notification_settings', 'notification_settings.json');
    await exportTable('expenses', 'expenses.json');
    await exportTable('payments', 'payments.json');
    await exportTable('maintenance_requests', 'maintenance_requests.json');
    
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('✅ SQLite database export completed successfully');
        console.log(`Data exported to: ${outputDir}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Export error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  exportSQLiteData();
}

module.exports = { exportSQLiteData };