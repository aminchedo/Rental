# Testing Guide
## Cloudflare Rental Management System

This guide provides comprehensive testing procedures to verify that your migrated Rental Management System works correctly on Cloudflare infrastructure.

## 🧪 Testing Overview

### Testing Phases
1. **Unit Testing** - Individual component functionality
2. **Integration Testing** - API and database interactions
3. **End-to-End Testing** - Complete user workflows
4. **Performance Testing** - Load and stress testing
5. **Security Testing** - Authentication and authorization

## 🔧 Pre-Testing Setup

### 1. Verify Deployment
```bash
# Check Worker deployment status
wrangler deployments list

# Verify database schema
wrangler d1 execute rental-management-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Test basic connectivity
curl https://rental-management-api.your-subdomain.workers.dev/api/health
```

### 2. Environment Verification
```bash
# Check secrets are set
wrangler secret list

# Verify KV namespace
wrangler kv:namespace list

# Test database connection
wrangler d1 execute rental-management-db --command="SELECT COUNT(*) as user_count FROM users;"
```

## 🔍 Unit Testing

### API Endpoint Testing

#### Health Check
```bash
# Test health endpoint
curl -X GET https://rental-management-api.your-subdomain.workers.dev/api/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

#### Authentication Tests
```bash
# Test admin login
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Expected response:
# {"success":true,"token":"eyJ...","user":{"id":1,"username":"admin","role":"admin"}}

# Test invalid login
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "wrongpassword"
  }'

# Expected response:
# {"success":false,"message":"نام کاربری یا رمز عبور اشتباه است"}
```

#### Contract Management Tests
```bash
# Get JWT token first
TOKEN=$(curl -s -X POST https://rental-management-api.your-subdomain.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')

# Test getting contracts
curl -X GET https://rental-management-api.your-subdomain.workers.dev/api/contracts \
  -H "Authorization: Bearer $TOKEN"

# Test creating a contract
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/contracts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "علی احمدی",
    "tenantEmail": "ali@example.com",
    "tenantNationalId": "1234567890",
    "landlordName": "محمد رضایی",
    "landlordEmail": "mohammad@example.com",
    "landlordNationalId": "0987654321",
    "propertyAddress": "تهران، خیابان ولیعصر، پلاک ۱۲۳",
    "rentAmount": "5000000",
    "deposit": "10000000",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

#### Chart Data Tests
```bash
# Test income chart data
curl -X GET https://rental-management-api.your-subdomain.workers.dev/api/charts/income \
  -H "Authorization: Bearer $TOKEN"

# Test status chart data
curl -X GET https://rental-management-api.your-subdomain.workers.dev/api/charts/status \
  -H "Authorization: Bearer $TOKEN"
```

### Database Testing

#### Data Integrity Tests
```bash
# Verify default admin user exists
wrangler d1 execute rental-management-db --command="SELECT username, role FROM users WHERE username='admin';"

# Check table structures
wrangler d1 execute rental-management-db --command="PRAGMA table_info(contracts);"

# Test foreign key constraints
wrangler d1 execute rental-management-db --command="PRAGMA foreign_key_check;"
```

#### Performance Tests
```bash
# Test query performance
wrangler d1 execute rental-management-db --command="EXPLAIN QUERY PLAN SELECT * FROM contracts WHERE status = 'active';"

# Test index usage
wrangler d1 execute rental-management-db --command="ANALYZE;"
```

## 🔗 Integration Testing

### Frontend-Backend Integration

#### Authentication Flow
1. **Open Frontend:** Navigate to your Pages URL
2. **Login Test:** Use admin credentials (admin/admin123)
3. **Token Storage:** Check localStorage for authToken
4. **API Calls:** Verify API calls include Authorization header
5. **Logout Test:** Confirm tokens are cleared on logout

#### Contract Management Flow
1. **Create Contract:** Fill out contract form
2. **Verify Database:** Check contract appears in D1
3. **Email Notification:** Confirm access code email sent
4. **Tenant Login:** Use contract number and access code
5. **Contract Signing:** Test digital signature functionality

### Notification Service Integration

#### Email Service Test
```bash
# Test email notification
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service": "email"}'
```

#### Telegram Service Test
```bash
# Test Telegram notification
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"service": "telegram"}'
```

## 🎯 End-to-End Testing

### Complete User Workflows

#### Admin Workflow
1. **Login as Admin**
   - Navigate to login page
   - Enter admin credentials
   - Verify dashboard loads

2. **Create New Contract**
   - Click "قرارداد جدید"
   - Fill all required fields
   - Submit and verify success message
   - Check contract appears in list

3. **Manage Contracts**
   - View contract details
   - Edit contract information
   - Delete test contract
   - Filter and search contracts

4. **View Analytics**
   - Check income chart displays
   - Verify status pie chart
   - Test date range filters

5. **Configure Settings**
   - Update notification preferences
   - Test notification services
   - Save configuration changes

#### Tenant Workflow
1. **Tenant Login**
   - Use contract number and access code
   - Verify contract details display
   - Check access restrictions

2. **Contract Signing**
   - Review contract terms
   - Upload national ID image
   - Add digital signature
   - Submit and verify confirmation

3. **Contract Status**
   - View signed contract
   - Check status updates
   - Verify landlord notification

### Mobile Responsiveness Testing
1. **Test on Different Devices**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

2. **RTL Layout Testing**
   - Verify Persian text alignment
   - Check form layouts
   - Test navigation menus

## ⚡ Performance Testing

### Load Testing with Artillery

#### Install Artillery
```bash
npm install -g artillery
```

#### Create Test Configuration
```yaml
# artillery-test.yml
config:
  target: 'https://rental-management-api.your-subdomain.workers.dev'
  phases:
    - duration: 60
      arrivalRate: 10
  variables:
    token: 'your-jwt-token-here'

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/health"
      - post:
          url: "/api/login"
          json:
            username: "admin"
            password: "admin123"
      - get:
          url: "/api/contracts"
          headers:
            Authorization: "Bearer {{ token }}"
```

#### Run Load Test
```bash
artillery run artillery-test.yml
```

### Performance Benchmarks

#### Response Time Targets
- **Health Check:** < 50ms
- **Authentication:** < 200ms
- **Contract Operations:** < 500ms
- **Chart Data:** < 1000ms

#### Concurrent User Targets
- **Light Load:** 100 concurrent users
- **Medium Load:** 500 concurrent users
- **Heavy Load:** 1000+ concurrent users

## 🔒 Security Testing

### Authentication Security

#### JWT Token Testing
```bash
# Test with invalid token
curl -X GET https://rental-management-api.your-subdomain.workers.dev/api/contracts \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized

# Test with expired token
curl -X GET https://rental-management-api.your-subdomain.workers.dev/api/contracts \
  -H "Authorization: Bearer expired-token"

# Expected: 401 Unauthorized
```

#### Authorization Testing
```bash
# Test tenant accessing admin endpoints
TENANT_TOKEN="tenant-jwt-token"
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/contracts \
  -H "Authorization: Bearer $TENANT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantName":"Test"}'

# Expected: 403 Forbidden
```

### CORS Testing
```bash
# Test CORS preflight
curl -X OPTIONS https://rental-management-api.your-subdomain.workers.dev/api/contracts \
  -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: GET"

# Verify CORS headers in response
```

### Input Validation Testing
```bash
# Test SQL injection attempts
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin'; DROP TABLE users; --",
    "password": "password"
  }'

# Expected: Proper error handling, no SQL execution

# Test XSS attempts
curl -X POST https://rental-management-api.your-subdomain.workers.dev/api/contracts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "<script>alert(\"xss\")</script>",
    "tenantEmail": "test@example.com"
  }'

# Expected: Input sanitization, no script execution
```

## 📊 Monitoring and Logging

### Cloudflare Analytics
1. **Access Analytics Dashboard**
   - Go to Cloudflare Dashboard
   - Select your Worker
   - View Analytics tab

2. **Key Metrics to Monitor**
   - Request count and rate
   - Error rate and types
   - Response time percentiles
   - CPU time usage
   - Memory usage

### Custom Logging
```bash
# View live logs
wrangler tail

# Filter logs by level
wrangler tail --format=pretty | grep ERROR
```

## 🐛 Debugging Common Issues

### Database Connection Issues
```bash
# Check database exists
wrangler d1 list | grep rental-management-db

# Test database connection
wrangler d1 execute rental-management-db --command="SELECT 1;"

# Verify wrangler.toml database ID
grep database_id wrangler.toml
```

### Authentication Issues
```bash
# Verify JWT secret is set
wrangler secret list | grep JWT_SECRET

# Test token generation
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({userId: 1}, 'your-secret');
console.log(token);
"
```

### CORS Issues
```bash
# Check CORS configuration in code
grep -n "cors" src/index.ts

# Test from browser console
fetch('https://your-worker.workers.dev/api/health')
  .then(r => r.json())
  .then(console.log)
```

## ✅ Testing Checklist

### Pre-Deployment Testing
- [ ] All secrets configured
- [ ] Database schema applied
- [ ] Worker deploys successfully
- [ ] Frontend builds without errors

### Functional Testing
- [ ] Admin login works
- [ ] Tenant login works
- [ ] Contract creation works
- [ ] Contract signing works
- [ ] Email notifications work
- [ ] Charts display correctly
- [ ] Settings save properly

### Performance Testing
- [ ] Response times meet targets
- [ ] Load testing passes
- [ ] Memory usage acceptable
- [ ] No memory leaks detected

### Security Testing
- [ ] Authentication required for protected routes
- [ ] Authorization enforced correctly
- [ ] CORS configured properly
- [ ] Input validation working
- [ ] XSS protection active
- [ ] SQL injection prevented

### Compatibility Testing
- [ ] Works in Chrome/Firefox/Safari/Edge
- [ ] Mobile responsive design
- [ ] RTL text displays correctly
- [ ] Persian fonts load properly

### Production Readiness
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring alerts set up
- [ ] Backup strategy implemented
- [ ] Documentation updated

## 📋 Test Results Template

```markdown
# Test Results - [Date]

## Environment
- Worker URL: https://rental-management-api.your-subdomain.workers.dev
- Frontend URL: https://rental-management-frontend.pages.dev
- Database: rental-management-db

## Test Summary
- Total Tests: X
- Passed: X
- Failed: X
- Skipped: X

## Performance Results
- Average Response Time: Xms
- 95th Percentile: Xms
- Error Rate: X%
- Concurrent Users Tested: X

## Issues Found
1. [Issue Description]
   - Severity: High/Medium/Low
   - Status: Open/Fixed
   - Notes: [Additional details]

## Recommendations
- [Performance optimizations]
- [Security improvements]
- [Feature enhancements]
```

## 🎯 Success Criteria

Your migration is successful when:

✅ All API endpoints respond correctly  
✅ Authentication and authorization work  
✅ Database operations complete successfully  
✅ Frontend loads and functions properly  
✅ Notifications send correctly  
✅ Performance meets or exceeds targets  
✅ Security tests pass  
✅ Mobile responsiveness works  
✅ Persian RTL support functions  
✅ All user workflows complete successfully  

Congratulations! Your Rental Management System is now successfully running on Cloudflare's edge infrastructure.