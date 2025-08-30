#!/usr/bin/env node

/**
 * Generate a secure JWT secret for the rental management system
 * This script creates a cryptographically secure random string
 * suitable for JWT token signing
 */

const crypto = require('crypto');

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateBase64Secret(length = 64) {
  return crypto.randomBytes(length).toString('base64');
}

function generateUUIDSecret() {
  return crypto.randomUUID() + '-' + crypto.randomUUID();
}

console.log('🔐 JWT Secret Generator for Rental Management System');
console.log('================================================\n');

console.log('Option 1 - Hex Secret (Recommended):');
const hexSecret = generateSecureSecret();
console.log(hexSecret);
console.log(`Length: ${hexSecret.length} characters\n`);

console.log('Option 2 - Base64 Secret:');
const base64Secret = generateBase64Secret();
console.log(base64Secret);
console.log(`Length: ${base64Secret.length} characters\n`);

console.log('Option 3 - UUID-based Secret:');
const uuidSecret = generateUUIDSecret();
console.log(uuidSecret);
console.log(`Length: ${uuidSecret.length} characters\n`);

console.log('📋 Usage Instructions:');
console.log('1. Copy one of the secrets above');
console.log('2. Run: wrangler secret put JWT_SECRET');
console.log('3. Paste the secret when prompted');
console.log('4. Keep this secret secure and never commit it to version control\n');

console.log('🔒 Security Notes:');
console.log('- Use the hex secret (Option 1) for maximum compatibility');
console.log('- Store the secret securely in Cloudflare Workers secrets');
console.log('- Never expose this secret in client-side code');
console.log('- Rotate the secret periodically for enhanced security');

// Write to file for convenience (should be deleted after use)
const fs = require('fs');
const secretData = {
  generated: new Date().toISOString(),
  hex: hexSecret,
  base64: base64Secret,
  uuid: uuidSecret,
  note: 'Delete this file after copying the secret to Cloudflare Workers'
};

fs.writeFileSync('.jwt-secret.json', JSON.stringify(secretData, null, 2));
console.log('\n📄 Secret also saved to .jwt-secret.json (delete after use)');