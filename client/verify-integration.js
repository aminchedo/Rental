#!/usr/bin/env node

/**
 * Cloudflare Integration Verification Script
 * Tests the complete integration between React frontend and Cloudflare backend
 */

import https from 'https';

const API_BASE_URL = 'https://rental-management-api.amin-chinisaz-edu.workers.dev';

// ANSI colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.on('error', reject);
    req.end();
  });
}

async function testHealthEndpoint() {
  log('\n🏥 Testing Health Endpoint...', colors.blue);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/health`);
    
    if (response.statusCode === 200) {
      log('✅ Health endpoint is working', colors.green);
      log(`   Status: ${response.data.status}`, colors.reset);
      log(`   Timestamp: ${response.data.timestamp}`, colors.reset);
      return true;
    } else {
      log(`❌ Health endpoint failed with status: ${response.statusCode}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Health endpoint error: ${error.message}`, colors.red);
    return false;
  }
}

async function testAdminLogin() {
  log('\n🔐 Testing Admin Login...', colors.blue);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        username: 'admin',
        password: 'admin'
      }
    });

    if (response.statusCode === 200 && response.data.success) {
      log('✅ Admin login successful', colors.green);
      log(`   Token received: ${response.data.token ? 'Yes' : 'No'}`, colors.reset);
      log(`   User role: ${response.data.user?.role || 'N/A'}`, colors.reset);
      return response.data.token;
    } else {
      log(`❌ Admin login failed`, colors.red);
      log(`   Status: ${response.statusCode}`, colors.reset);
      log(`   Message: ${response.data.message}`, colors.reset);
      return null;
    }
  } catch (error) {
    log(`❌ Admin login error: ${error.message}`, colors.red);
    return null;
  }
}

async function testContractsEndpoint(token) {
  log('\n📋 Testing Contracts Endpoint...', colors.blue);
  
  if (!token) {
    log('⚠️  Skipping contracts test (no auth token)', colors.yellow);
    return false;
  }

  try {
    const response = await makeRequest(`${API_BASE_URL}/api/contracts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200) {
      log('✅ Contracts endpoint accessible', colors.green);
      const contracts = response.data.contracts || [];
      log(`   Contracts found: ${contracts.length}`, colors.reset);
      return true;
    } else {
      log(`❌ Contracts endpoint failed with status: ${response.statusCode}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Contracts endpoint error: ${error.message}`, colors.red);
    return false;
  }
}

async function testChartsEndpoints(token) {
  log('\n📊 Testing Charts Endpoints...', colors.blue);
  
  if (!token) {
    log('⚠️  Skipping charts test (no auth token)', colors.yellow);
    return false;
  }

  try {
    const [incomeResponse, statusResponse] = await Promise.all([
      makeRequest(`${API_BASE_URL}/api/charts/income`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }),
      makeRequest(`${API_BASE_URL}/api/charts/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    let success = true;

    if (incomeResponse.statusCode === 200) {
      log('✅ Income chart endpoint working', colors.green);
    } else {
      log(`❌ Income chart endpoint failed: ${incomeResponse.statusCode}`, colors.red);
      success = false;
    }

    if (statusResponse.statusCode === 200) {
      log('✅ Status chart endpoint working', colors.green);
    } else {
      log(`❌ Status chart endpoint failed: ${statusResponse.statusCode}`, colors.red);
      success = false;
    }

    return success;
  } catch (error) {
    log(`❌ Charts endpoints error: ${error.message}`, colors.red);
    return false;
  }
}

async function testCORSHeaders() {
  log('\n🌐 Testing CORS Configuration...', colors.blue);
  
  try {
    const response = await makeRequest(`${API_BASE_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://rental-management-frontend.pages.dev',
        'Access-Control-Request-Method': 'GET'
      }
    });

    const corsHeaders = response.headers['access-control-allow-origin'] || 
                       response.headers['access-control-allow-credentials'];

    if (corsHeaders) {
      log('✅ CORS headers present', colors.green);
      return true;
    } else {
      log('⚠️  CORS headers may need configuration', colors.yellow);
      return false;
    }
  } catch (error) {
    log(`❌ CORS test error: ${error.message}`, colors.red);
    return false;
  }
}

async function runIntegrationTests() {
  log(`${colors.bold}🚀 Cloudflare Integration Verification${colors.reset}`);
  log(`${colors.bold}Testing API: ${API_BASE_URL}${colors.reset}`);

  const results = {
    health: await testHealthEndpoint(),
    cors: await testCORSHeaders(),
    adminLogin: null,
    contracts: false,
    charts: false
  };

  // Test admin login and get token
  const token = await testAdminLogin();
  results.adminLogin = !!token;

  // Test authenticated endpoints
  if (token) {
    results.contracts = await testContractsEndpoint(token);
    results.charts = await testChartsEndpoints(token);
  }

  // Summary
  log('\n📋 Integration Test Summary:', colors.bold);
  log(`   Health Endpoint: ${results.health ? '✅' : '❌'}`, results.health ? colors.green : colors.red);
  log(`   CORS Configuration: ${results.cors ? '✅' : '⚠️'}`, results.cors ? colors.green : colors.yellow);
  log(`   Admin Authentication: ${results.adminLogin ? '✅' : '❌'}`, results.adminLogin ? colors.green : colors.red);
  log(`   Contracts API: ${results.contracts ? '✅' : '❌'}`, results.contracts ? colors.green : colors.red);
  log(`   Charts API: ${results.charts ? '✅' : '❌'}`, results.charts ? colors.green : colors.red);

  const successCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  log(`\n🎯 Overall Result: ${successCount}/${totalTests} tests passed`, colors.bold);

  if (successCount === totalTests) {
    log('\n🎉 All integration tests passed! The system is ready for production.', colors.green);
  } else if (successCount >= totalTests - 1) {
    log('\n⚠️  Most tests passed. Minor configuration may be needed.', colors.yellow);
  } else {
    log('\n❌ Some critical tests failed. Please check the backend configuration.', colors.red);
  }

  log('\n📚 Next Steps:', colors.blue);
  log('   1. Deploy frontend: npm run deploy', colors.reset);
  log('   2. Test in browser: https://rental-management-frontend.pages.dev', colors.reset);
  log('   3. Verify admin login with admin/admin', colors.reset);
  log('   4. Test contract creation and management', colors.reset);
}

// Run the tests
runIntegrationTests().catch(console.error);