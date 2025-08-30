const axios = require('axios');

async function verifyDeployment() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  console.log(`🔍 Verifying deployment at: ${baseURL}`);
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Login endpoint
    console.log('2. Testing login endpoint...');
    const loginResponse = await axios.post(`${baseURL}/api/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;
      
      // Test 3: Protected endpoint (contracts)
      console.log('3. Testing protected endpoint...');
      const contractsResponse = await axios.get(`${baseURL}/api/contracts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Protected endpoint accessible');
      
      // Test 4: Charts endpoint
      console.log('4. Testing charts endpoint...');
      const chartsResponse = await axios.get(`${baseURL}/api/charts/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Charts endpoint working');
      
      // Test 5: Notification settings
      console.log('5. Testing notification settings...');
      const settingsResponse = await axios.get(`${baseURL}/api/settings/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Notification settings accessible');
      
    } else {
      console.error('❌ Admin login failed:', loginResponse.data);
      return false;
    }
    
    console.log('🎉 All tests passed! Deployment is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Deployment verification failed:', error.response?.data || error.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  verifyDeployment().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { verifyDeployment };