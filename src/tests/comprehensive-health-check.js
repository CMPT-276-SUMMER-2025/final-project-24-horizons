import https from 'https';

const BACKEND_URL = 'https://studysync-backend.uttamsharma.com';
const TIMEOUT = 10000;

const ENDPOINTS_TO_TEST = [
  {
    path: '/api/health',
    name: 'Health Check',
    expectedStatus: 200,
    requiresAuth: false
  },
  {
    path: '/api/auth/me',
    name: 'Auth Check (should fail without token)',
    expectedStatus: 401,
    requiresAuth: false
  }
];

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${endpoint.path}`;
    console.log(`🔍 Testing ${endpoint.name}: ${url}`);
    
    const startTime = Date.now();
    
    const req = https.get(url, { timeout: TIMEOUT }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : {};
          
          if (res.statusCode === endpoint.expectedStatus) {
            console.log(`✅ ${endpoint.name} passed (${responseTime}ms)`);
            resolve({
              success: true,
              statusCode: res.statusCode,
              responseTime,
              data: result
            });
          } else {
            console.log(`❌ ${endpoint.name} failed - Expected ${endpoint.expectedStatus}, got ${res.statusCode}`);
            reject(new Error(`Expected status ${endpoint.expectedStatus}, got ${res.statusCode}`));
          }
        } catch (error) {
          if (endpoint.expectedStatus === res.statusCode) {
            // Sometimes we expect non-JSON responses
            console.log(`✅ ${endpoint.name} passed (${responseTime}ms) - Non-JSON response as expected`);
            resolve({
              success: true,
              statusCode: res.statusCode,
              responseTime,
              data: data
            });
          } else {
            console.log(`❌ ${endpoint.name} failed - Invalid response format`);
            reject(new Error(`Invalid response: ${error.message}`));
          }
        }
      });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ ${endpoint.name} timed out`);
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint.name} failed - ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(TIMEOUT);
  });
}

async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive StudySync Backend Tests\n');
  
  let passedTests = 0;
  let totalTests = ENDPOINTS_TO_TEST.length;
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    try {
      await makeRequest(endpoint);
      passedTests++;
    } catch (error) {
      console.log(`💥 Test failed: ${error.message}`);
    }
    console.log(''); // Add spacing between tests
  }
  
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('✨ All tests passed! Backend is healthy.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please check the backend.');
    process.exit(1);
  }
}

// Run the comprehensive tests
runComprehensiveTests();