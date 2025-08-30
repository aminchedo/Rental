const fs = require('fs');
const path = require('path');

async function cleanupOldFiles() {
  console.log('Cleaning up old Cloudflare-specific files...');
  
  const filesToRemove = [
    'wrangler.toml',
    'src/index.ts',
    'render.yaml',
    'deploy.sh',
    'generate-session-secret.js'
  ];
  
  const dirsToRemove = [
    'server',
    '.wrangler',
    'Rental'
  ];
  
  // Remove old files
  for (const file of filesToRemove) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
    }
  }
  
  // Remove old directories
  for (const dir of dirsToRemove) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed directory: ${dir}`);
    }
  }
  
  console.log('🧹 Cleanup completed!');
}

// Run if called directly
if (require.main === module) {
  cleanupOldFiles();
}

module.exports = { cleanupOldFiles };