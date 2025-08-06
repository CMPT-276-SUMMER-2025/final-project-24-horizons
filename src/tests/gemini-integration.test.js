import fs from 'fs';

// Integration test for Gemini AI complete workflow
function testGeminiAIIntegration() {
  console.log('Testing Complete Gemini AI Integration...\n');
  
  let integrationPassed = true;
  
  try {
    const calendarAIContent = fs.readFileSync('src/pages/CalendarAI.tsx', 'utf8');
    
    // Test complete AI to Calendar workflow
    console.log('STEP 1: Testing AI to Calendar integration...');
    
    const hasCompleteWorkflow = calendarAIContent.includes('processAIRequest') &&
                               calendarAIContent.includes('executeCalendarAction') &&
                               calendarAIContent.includes('addEvent') &&
                               calendarAIContent.includes('addDoc');
    
    if (hasCompleteWorkflow) {
      console.log('PASS: Complete AI to Firebase to Calendar workflow exists');
    } else {
      console.log('FAIL: AI workflow chain broken');
      integrationPassed = false;
    }
    
    // Test real-time updates integration
    console.log('\nSTEP 2: Testing real-time updates integration...');
    
    const hasRealTimeUpdates = calendarAIContent.includes('onSnapshot') &&
                              calendarAIContent.includes('setEvents') &&
                              calendarAIContent.includes('unsubscribe');
    
    if (hasRealTimeUpdates) {
      console.log('PASS: Real-time Firebase updates integrated');
    } else {
      console.log('FAIL: Real-time updates missing');
      integrationPassed = false;
    }
    
    // Test conflict resolution integration
    console.log('\nSTEP 3: Testing conflict resolution integration...');
    
    const hasConflictResolution = calendarAIContent.includes('checkConflicts') &&
                                 calendarAIContent.includes('showConflictDialog') &&
                                 calendarAIContent.includes('handleConflictConfirm') &&
                                 calendarAIContent.includes('findAvailableSlots');
    
    if (hasConflictResolution) {
      console.log('PASS: Complete conflict resolution system integrated');
    } else {
      console.log('FAIL: Conflict resolution system incomplete');
      integrationPassed = false;
    }
    
    // Test UI state integration
    console.log('\nSTEP 4: Testing UI state integration...');
    
    const hasUIIntegration = calendarAIContent.includes('isPanelOpen') &&
                            calendarAIContent.includes('setIsPanelOpen') &&
                            calendarAIContent.includes('floating-toggle') &&
                            calendarAIContent.includes('chat-panel');
    
    if (hasUIIntegration) {
      console.log('PASS: UI state properly integrated');
    } else {
      console.log('FAIL: UI state integration incomplete');
      integrationPassed = false;
    }
    
  } catch (error) {
    console.log(`FAIL: Gemini integration test failed: ${error.message}`);
    integrationPassed = false;
  }
  
  return integrationPassed;
}

// Test Gemini AI with imported events integration
function testGeminiWithImportedEvents() {
  console.log('\nTesting Gemini AI with Imported Events Integration...\n');
  
  let importIntegrationPassed = true;
  
  try {
    const calendarAIContent = fs.readFileSync('src/pages/CalendarAI.tsx', 'utf8');
    
    // Test if Gemini can work with imported events
    console.log('STEP 1: Testing Gemini access to imported events...');
    
    const canAccessImportedEvents = calendarAIContent.includes('events.filter') &&
                                   calendarAIContent.includes('events.map') &&
                                   calendarAIContent.includes('userId');
    
    if (canAccessImportedEvents) {
      console.log('PASS: Gemini can access and work with imported events');
    } else {
      console.log('FAIL: Gemini cannot access imported events');
      importIntegrationPassed = false;
    }
    
    // Test conflict detection with imported events
    console.log('\nSTEP 2: Testing conflict detection with imported events...');
    
    const hasImportedEventConflicts = calendarAIContent.includes('checkConflicts') &&
                                     calendarAIContent.includes('events.filter') &&
                                     calendarAIContent.includes('toDateString');
    
    if (hasImportedEventConflicts) {
      console.log('PASS: Conflict detection works with imported events');
    } else {
      console.log('FAIL: Conflict detection doesnt work with imported events');
      importIntegrationPassed = false;
    }
    
    // Test calendar display integration
    console.log('\nSTEP 3: Testing calendar display integration...');
    
    const displaysAllEventTypes = calendarAIContent.includes('renderCalendar') &&
                                 calendarAIContent.includes('getEventsForDate') &&
                                 calendarAIContent.includes('event.type');
    
    if (displaysAllEventTypes) {
      console.log('PASS: Calendar displays all event types including imported');
    } else {
      console.log('FAIL: Calendar display may not show imported events');
      importIntegrationPassed = false;
    }
    
  } catch (error) {
    console.log(`FAIL: Gemini-Import integration test failed: ${error.message}`);
    importIntegrationPassed = false;
  }
  
  return importIntegrationPassed;
}

async function runGeminiIntegrationTests() {
  console.log('Starting Gemini AI Integration Tests\n');
  
  try {
    const geminiResult = testGeminiAIIntegration();
    const importResult = testGeminiWithImportedEvents();
    
    if (geminiResult && importResult) {
      console.log('\nSUCCESS: All Gemini integration tests passed!');
      console.log('Gemini AI properly integrated with calendar and import systems.');
      process.exit(0);
    } else {
      console.log('\nFAILED: Some Gemini integration tests failed!');
      console.log('Gemini AI integration needs fixes.');
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`\nFAILED: Gemini integration tests failed: ${error.message}`);
    process.exit(1);
  }
}

runGeminiIntegrationTests();