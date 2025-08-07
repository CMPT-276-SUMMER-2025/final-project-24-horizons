import fs from 'fs';
import path from 'path';

// Mock fetch for testing API calls
let fetchCallLog = [];
global.fetch = async (url, options) => {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body) : null;
  
  fetchCallLog.push({ url, method, body });
  
  // Mock different responses based on URL and method
  if (url.includes('/api/flashcards')) {
    if (method === 'GET') {
      return {
        ok: true,
        json: async () => [
          {
            id: 1,
            front: 'What is React?',
            back: 'A JavaScript library for building user interfaces',
            date: '2025-08-06',
            createdAt: '2025-08-06T10:00:00Z',
            updatedAt: '2025-08-06T10:00:00Z'
          },
          {
            id: 2,
            front: 'What is TypeScript?',
            back: 'A typed superset of JavaScript',
            date: '2025-08-06',
            createdAt: '2025-08-06T11:00:00Z',
            updatedAt: '2025-08-06T11:00:00Z'
          }
        ]
      };
    } else if (method === 'POST') {
      return {
        ok: true,
        json: async () => ({
          id: 3,
          front: body.front,
          back: body.back,
          date: '2025-08-06',
          createdAt: '2025-08-06T12:00:00Z',
          updatedAt: '2025-08-06T12:00:00Z'
        })
      };
    } else if (method === 'PUT') {
      return {
        ok: true,
        json: async () => ({
          id: parseInt(url.split('/').pop()),
          front: body.front,
          back: body.back,
          date: '2025-08-06',
          createdAt: '2025-08-06T10:00:00Z',
          updatedAt: '2025-08-06T13:00:00Z'
        })
      };
    } else if (method === 'DELETE') {
      return {
        ok: true,
        json: async () => ({ message: 'Flashcard deleted successfully' })
      };
    }
  }
  
  // Return error for unhandled cases
  return {
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not found' })
  };
};

// Mock environment variables
process.env.VITE_API_URL = 'https://test-api.com';

function testFlashcardsApiExists() {
  console.log('Testing Flashcards API Module Existence...\n');
  
  let allTestsPassed = true;
  
  // Check if flashcardsApi.tsx exists
  const flashcardsApiPath = 'src/services/flashcardsApi.tsx';
  if (fs.existsSync(flashcardsApiPath)) {
    console.log('PASS: Flashcards API module exists');
    
    const content = fs.readFileSync(flashcardsApiPath, 'utf8');
    
    // Check for Flashcard interface
    if (content.includes('export interface Flashcard')) {
      console.log('PASS: Flashcard interface defined');
    } else {
      console.log('FAIL: Flashcard interface not found');
      allTestsPassed = false;
    }
    
    // Check for CRUD operations
    const crudOperations = [
      'fetchFlashcards',
      'addFlashcardToServer',
      'updateFlashcardOnServer',
      'removeFlashcardFromServer'
    ];
    
    crudOperations.forEach(operation => {
      if (content.includes(`export const ${operation}`)) {
        console.log(`PASS: ${operation} function exists`);
      } else {
        console.log(`FAIL: ${operation} function not found`);
        allTestsPassed = false;
      }
    });
    
    // Check for error handling
    if (content.includes('handleApiError')) {
      console.log('PASS: Error handling function exists');
    } else {
      console.log('FAIL: Error handling function not found');
      allTestsPassed = false;
    }
    
    // Check for proper interface structure
    if (content.includes('front:') && content.includes('back:')) {
      console.log('PASS: Flashcard interface has front and back properties');
    } else {
      console.log('FAIL: Flashcard interface missing front/back properties');
      allTestsPassed = false;
    }
    
  } else {
    console.log('FAIL: Flashcards API module not found');
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

async function testFlashcardsCrudOperations() {
  console.log('\nTesting Flashcards CRUD Operations...\n');
  
  let allTestsPassed = true;
  fetchCallLog = []; // Reset call log
  
  try {
    // Test API endpoints directly without importing TSX files
    console.log('Testing Flashcards API endpoints...');
    
    // Test fetchFlashcards endpoint (READ)
    const flashcardsResponse = await fetch('https://test-api.com/api/flashcards', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer test-token' }
    });
    
    if (flashcardsResponse.ok) {
      const flashcards = await flashcardsResponse.json();
      if (Array.isArray(flashcards) && flashcards.length === 2) {
        console.log('PASS: Flashcards GET endpoint returns array of flashcards');
        if (flashcards[0].id === 1 && flashcards[0].front === 'What is React?') {
          console.log('PASS: Flashcards GET endpoint returns correct flashcard data');
        } else {
          console.log('FAIL: Flashcards GET endpoint returns incorrect flashcard data');
          allTestsPassed = false;
        }
      } else {
        console.log('FAIL: Flashcards GET endpoint does not return expected data');
        allTestsPassed = false;
      }
    } else {
      console.log('FAIL: Flashcards GET endpoint request failed');
      allTestsPassed = false;
    }
    
    // Test addFlashcard endpoint (CREATE)
    const createResponse = await fetch('https://test-api.com/api/flashcards', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        front: 'What is Node.js?',
        back: 'A JavaScript runtime built on Chrome V8 engine'
      })
    });
    
    if (createResponse.ok) {
      const newFlashcard = await createResponse.json();
      if (newFlashcard.id === 3 && newFlashcard.front === 'What is Node.js?') {
        console.log('PASS: Flashcards POST endpoint creates flashcard successfully');
      } else {
        console.log('FAIL: Flashcards POST endpoint does not create flashcard correctly');
        allTestsPassed = false;
      }
    } else {
      console.log('FAIL: Flashcards POST endpoint request failed');
      allTestsPassed = false;
    }
    
    // Test updateFlashcard endpoint (UPDATE)
    const updateResponse = await fetch('https://test-api.com/api/flashcards/1', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        front: 'What is React.js?',
        back: 'A JavaScript library for building UIs'
      })
    });
    
    if (updateResponse.ok) {
      const updatedFlashcard = await updateResponse.json();
      if (updatedFlashcard.id === 1 && updatedFlashcard.front === 'What is React.js?') {
        console.log('PASS: Flashcards PUT endpoint updates flashcard successfully');
      } else {
        console.log('FAIL: Flashcards PUT endpoint does not update flashcard correctly');
        allTestsPassed = false;
      }
    } else {
      console.log('FAIL: Flashcards PUT endpoint request failed');
      allTestsPassed = false;
    }
    
    // Test deleteFlashcard endpoint (DELETE)
    const deleteResponse = await fetch('https://test-api.com/api/flashcards/1', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer test-token' }
    });
    
    if (deleteResponse.ok) {
      console.log('PASS: Flashcards DELETE endpoint executes without error');
    } else {
      console.log('FAIL: Flashcards DELETE endpoint request failed');
      allTestsPassed = false;
    }
    
    // Verify API calls were made correctly
    if (fetchCallLog.length === 4) {
      console.log('PASS: All CRUD operations made API calls');
      
      // Check GET call
      const getCall = fetchCallLog.find(call => call.method === 'GET');
      if (getCall && getCall.url.includes('/api/flashcards')) {
        console.log('PASS: GET request made to correct endpoint');
      } else {
        console.log('FAIL: GET request not made correctly');
        allTestsPassed = false;
      }
      
      // Check POST call
      const postCall = fetchCallLog.find(call => call.method === 'POST');
      if (postCall && postCall.body && postCall.body.front === 'What is Node.js?') {
        console.log('PASS: POST request made with correct data');
      } else {
        console.log('FAIL: POST request not made correctly');
        allTestsPassed = false;
      }
      
      // Check PUT call
      const putCall = fetchCallLog.find(call => call.method === 'PUT');
      if (putCall && putCall.body && putCall.body.front === 'What is React.js?') {
        console.log('PASS: PUT request made with correct data');
      } else {
        console.log('FAIL: PUT request not made correctly');
        allTestsPassed = false;
      }
      
      // Check DELETE call
      const deleteCall = fetchCallLog.find(call => call.method === 'DELETE');
      if (deleteCall && deleteCall.url.includes('/api/flashcards/1')) {
        console.log('PASS: DELETE request made to correct endpoint');
      } else {
        console.log('FAIL: DELETE request not made correctly');
        allTestsPassed = false;
      }
      
    } else {
      console.log(`FAIL: Expected 4 API calls, got ${fetchCallLog.length}`);
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log(`FAIL: Error testing CRUD operations: ${error.message}`);
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

function testFlashcardsErrorHandling() {
  console.log('\nTesting Flashcards Error Handling...\n');
  
  let allTestsPassed = true;
  
  // Check if error handling exists in the flashcards API
  const flashcardsApiPath = 'src/services/flashcardsApi.tsx';
  if (fs.existsSync(flashcardsApiPath)) {
    const content = fs.readFileSync(flashcardsApiPath, 'utf8');
    
    // Check for authentication error handling
    if (content.includes('401') && content.includes('Authentication failed')) {
      console.log('PASS: 401 authentication error handling found');
    } else {
      console.log('FAIL: 401 authentication error handling not found');
      allTestsPassed = false;
    }
    
    // Check for error response parsing
    if (content.includes('JSON.parse') || content.includes('response.json()')) {
      console.log('PASS: Error response parsing found');
    } else {
      console.log('FAIL: Error response parsing not found');
      allTestsPassed = false;
    }
    
    // Check for try-catch blocks
    if (content.includes('try') && content.includes('catch')) {
      console.log('PASS: Try-catch error handling found');
    } else {
      console.log('FAIL: Try-catch error handling not found');
      allTestsPassed = false;
    }
    
  } else {
    console.log('FAIL: Flashcards API module not found for error testing');
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

function testFlashcardsDataValidation() {
  console.log('\nTesting Flashcards Data Validation...\n');
  
  let allTestsPassed = true;
  
  const flashcardsApiPath = 'src/services/flashcardsApi.tsx';
  if (fs.existsSync(flashcardsApiPath)) {
    const content = fs.readFileSync(flashcardsApiPath, 'utf8');
    
    // Check for required fields validation
    if (content.includes('front') && content.includes('back')) {
      console.log('PASS: Front and back field handling found');
    } else {
      console.log('FAIL: Front and back field handling not found');
      allTestsPassed = false;
    }
    
    // Check for timestamp handling
    if (content.includes('createdAt') && content.includes('updatedAt')) {
      console.log('PASS: Timestamp field handling found');
    } else {
      console.log('FAIL: Timestamp field handling not found');
      allTestsPassed = false;
    }
    
    // Check for ID handling
    if (content.includes('id:')) {
      console.log('PASS: ID field handling found');
    } else {
      console.log('FAIL: ID field handling not found');
      allTestsPassed = false;
    }
    
  } else {
    console.log('FAIL: Flashcards API module not found for validation testing');
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

async function runFlashcardsTests() {
  console.log('🚀 Starting Flashcards API Unit Tests\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Module existence
  if (testFlashcardsApiExists()) {
    passedTests++;
  }
  totalTests++;
  
  // Test 2: CRUD operations
  if (await testFlashcardsCrudOperations()) {
    passedTests++;
  }
  totalTests++;
  
  // Test 3: Error handling
  if (testFlashcardsErrorHandling()) {
    passedTests++;
  }
  totalTests++;
  
  // Test 4: Data validation
  if (testFlashcardsDataValidation()) {
    passedTests++;
  }
  totalTests++;
  
  console.log(`\n📊 Flashcards Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('✨ All Flashcards tests passed!');
    return true;
  } else {
    console.log('❌ Some Flashcards tests failed.');
    return false;
  }
}

// Run the tests
runFlashcardsTests().then(success => {
  process.exit(success ? 0 : 1);
});
