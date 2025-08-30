#!/usr/bin/env node

/**
 * Session Secret Generator for Production Deployment
 * Run: node generate-session-secret.js
 */

const crypto = require('crypto');

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 Production Environment Variables Generator\n');

console.log('SESSION_SECRET=' + generateSecureSecret(32));
console.log('\n📋 Copy the above SESSION_SECRET value to your Render environment variables');
console.log('⚠️  Keep this secret secure and never commit it to your repository');
console.log('\n🔗 Next steps:');
console.log('1. Copy the SESSION_SECRET value above');
console.log('2. Go to your Render service dashboard');
console.log('3. Add it as an environment variable');
console.log('4. Set up your email configuration (EMAIL_USER, EMAIL_PASS, etc.)');
console.log('5. Deploy your application');

console.log('\n✅ Your application is ready for production deployment!');