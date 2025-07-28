import https from 'https';

const BACKEND_URL = 'https://studysync-backend.uttamsharma.com';
const HEALTH_ENDPOINT = '/api/health';
const TIMEOUT = 10000; // 10 seconds

function healthCheck() {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${HEALTH_ENDPOINT}`;
    console.log(`🏥 Starting health check for: ${url}`);
    
    const startTime = Date.now();
    
    const req = https.get(url, { timeout: TIMEOUT }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200 && result.status === 'OK') {
            console.log(`✅ Health check passed!`);
            console.log(`📊 Response time: ${responseTime}ms`);
            console.log(`📅 Server timestamp: ${result.timestamp}`);
            console.log(`🔢 Status code: ${res.statusCode}`);
            resolve({
              success: true,
              statusCode: res.statusCode,
              responseTime,
              data: result
            });
          } else {
            console.log(`❌ Health check failed - Unexpected response`);
            console.log(`🔢 Status code: ${res.statusCode}`);
            console.log(`📄 Response: ${data}`);
            reject(new Error(`Health check failed with status ${res.statusCode}`));
          }
        } catch (error) {
          console.log(`❌ Health check failed - Invalid JSON response`);
          console.log(`📄 Raw response: ${data}`);
          reject(new Error(`Invalid JSON response: ${error.message}`));
        }
      });
    });
    
    req.on('timeout', () => {
      console.log(`⏰ Health check timed out after ${TIMEOUT}ms`);
      req.destroy();
      reject(new Error('Health check timeout'));
    });
    
    req.on('error', (error) => {
      console.log(`❌ Health check failed - Network error: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(TIMEOUT);
  });
}

async function runTests() {
  console.log('🚀 Starting StudySync Backend Health Check Tests\n');
  
  try {
    const result = await healthCheck();
    
    console.log('\n✨ All health checks passed!');
    console.log('Backend is healthy and responding correctly.');
    process.exit(0);
    
  } catch (error) {
    console.log('\n💥 Health check failed!');
    console.log(`Error: ${error.message}`);
    
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check if the backend server is running');
    console.log('2. Verify the domain is accessible: https://studysync-backend.uttamsharma.com');
    console.log('3. Check for any network connectivity issues');
    console.log('4. Verify SSL certificate is valid');
    
    process.exit(1);
  }
}

// Run the tests
runTests();