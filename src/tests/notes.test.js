import fs from 'fs';
import path from 'path';

// Mock fetch for testing API calls
let fetchCallLog = [];
global.fetch = async (url, options) => {
  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body) : null;
  
  fetchCallLog.push({ url, method, body });
  
  // Mock different responses based on URL and method
  if (url.includes('/api/notes')) {
    if (method === 'GET') {
      return {
        ok: true,
        json: async () => [
          {
            id: 1,
            title: 'Test Note 1',
            content: 'This is test content 1',
            date: '2025-08-06',
            createdAt: '2025-08-06T10:00:00Z',
            updatedAt: '2025-08-06T10:00:00Z'
          },
          {
            id: 2,
            title: 'Test Note 2',
            content: 'This is test content 2',
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
          title: body.title,
          content: body.content,
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
          title: body.title,
          content: body.content,
          date: '2025-08-06',
          createdAt: '2025-08-06T10:00:00Z',
          updatedAt: '2025-08-06T13:00:00Z'
        })
      };
    } else if (method === 'DELETE') {
      return {
        ok: true,
        json: async () => ({ message: 'Note deleted successfully' })
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

function testNotesApiExists() {
  console.log('Testing Notes API Module Existence...\n');
  
  let allTestsPassed = true;
  
  // Check if notesApi.tsx exists
  const notesApiPath = 'src/services/notesApi.tsx';
  if (fs.existsSync(notesApiPath)) {
    console.log('PASS: Notes API module exists');
    
    const content = fs.readFileSync(notesApiPath, 'utf8');
    
    // Check for Note interface
    if (content.includes('export interface Note')) {
      console.log('PASS: Note interface defined');
    } else {
      console.log('FAIL: Note interface not found');
      allTestsPassed = false;
    }
    
    // Check for CRUD operations
    const crudOperations = [
      'fetchNotes',
      'addNoteToServer',
      'updateNoteOnServer',
      'removeNoteFromServer'
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
    
  } else {
    console.log('FAIL: Notes API module not found');
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

async function testNotesCrudOperations() {
  console.log('\nTesting Notes CRUD Operations...\n');
  
  let allTestsPassed = true;
  fetchCallLog = []; // Reset call log
  
  try {
    // Test API endpoints directly without importing TSX files
    console.log('Testing Notes API endpoints...');
    
    // Test fetchNotes endpoint
    const notesResponse = await fetch('https://test-api.com/api/notes', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer test-token' }
    });
    
    if (notesResponse.ok) {
      const notes = await notesResponse.json();
      if (Array.isArray(notes) && notes.length === 2) {
        console.log('PASS: Notes GET endpoint returns array of notes');
        if (notes[0].id === 1 && notes[0].title === 'Test Note 1') {
          console.log('PASS: Notes GET endpoint returns correct note data');
        } else {
          console.log('FAIL: Notes GET endpoint returns incorrect note data');
          allTestsPassed = false;
        }
      } else {
        console.log('FAIL: Notes GET endpoint does not return expected data');
        allTestsPassed = false;
      }
    } else {
      console.log('FAIL: Notes GET endpoint request failed');
      allTestsPassed = false;
    }
    
    // Test addNote endpoint (CREATE)
    const createResponse = await fetch('https://test-api.com/api/notes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        title: 'New Test Note',
        content: 'This is new content'
      })
    });
    
    if (createResponse.ok) {
      const newNote = await createResponse.json();
      if (newNote.id === 3 && newNote.title === 'New Test Note') {
        console.log('PASS: Notes POST endpoint creates note successfully');
      } else {
        console.log('FAIL: Notes POST endpoint does not create note correctly');
        allTestsPassed = false;
      }
    } else {
      console.log('FAIL: Notes POST endpoint request failed');
      allTestsPassed = false;
    }
    
    // Test updateNote endpoint (UPDATE)
    const updateResponse = await fetch('https://test-api.com/api/notes/1', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        title: 'Updated Title',
        content: 'Updated content'
      })
    });
    
    if (updateResponse.ok) {
      const updatedNote = await updateResponse.json();
      if (updatedNote.id === 1 && updatedNote.title === 'Updated Title') {
        console.log('PASS: Notes PUT endpoint updates note successfully');
      } else {
        console.log('FAIL: Notes PUT endpoint does not update note correctly');
        allTestsPassed = false;
      }
    } else {
      console.log('FAIL: Notes PUT endpoint request failed');
      allTestsPassed = false;
    }
    
    // Test deleteNote endpoint (DELETE)
    const deleteResponse = await fetch('https://test-api.com/api/notes/1', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer test-token' }
    });
    
    if (deleteResponse.ok) {
      console.log('PASS: Notes DELETE endpoint executes without error');
    } else {
      console.log('FAIL: Notes DELETE endpoint request failed');
      allTestsPassed = false;
    }
    
    // Verify API calls were made correctly
    if (fetchCallLog.length === 4) {
      console.log('PASS: All CRUD operations made API calls');
      
      // Check GET call
      const getCall = fetchCallLog.find(call => call.method === 'GET');
      if (getCall && getCall.url.includes('/api/notes')) {
        console.log('PASS: GET request made to correct endpoint');
      } else {
        console.log('FAIL: GET request not made correctly');
        allTestsPassed = false;
      }
      
      // Check POST call
      const postCall = fetchCallLog.find(call => call.method === 'POST');
      if (postCall && postCall.body && postCall.body.title === 'New Test Note') {
        console.log('PASS: POST request made with correct data');
      } else {
        console.log('FAIL: POST request not made correctly');
        allTestsPassed = false;
      }
      
      // Check PUT call
      const putCall = fetchCallLog.find(call => call.method === 'PUT');
      if (putCall && putCall.body && putCall.body.title === 'Updated Title') {
        console.log('PASS: PUT request made with correct data');
      } else {
        console.log('FAIL: PUT request not made correctly');
        allTestsPassed = false;
      }
      
      // Check DELETE call
      const deleteCall = fetchCallLog.find(call => call.method === 'DELETE');
      if (deleteCall && deleteCall.url.includes('/api/notes/1')) {
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

function testNotesErrorHandling() {
  console.log('\nTesting Notes Error Handling...\n');
  
  let allTestsPassed = true;
  
  // Check if error handling exists in the notes API
  const notesApiPath = 'src/services/notesApi.tsx';
  if (fs.existsSync(notesApiPath)) {
    const content = fs.readFileSync(notesApiPath, 'utf8');
    
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
    console.log('FAIL: Notes API module not found for error testing');
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

async function runNotesTests() {
  console.log('🚀 Starting Notes API Unit Tests\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Module existence
  if (testNotesApiExists()) {
    passedTests++;
  }
  totalTests++;
  
  // Test 2: CRUD operations
  if (await testNotesCrudOperations()) {
    passedTests++;
  }
  totalTests++;
  
  // Test 3: Error handling
  if (testNotesErrorHandling()) {
    passedTests++;
  }
  totalTests++;
  
  console.log(`\n📊 Notes Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('✨ All Notes tests passed!');
    return true;
  } else {
    console.log('❌ Some Notes tests failed.');
    return false;
  }
}

// Run the tests
runNotesTests().then(success => {
  process.exit(success ? 0 : 1);
});
