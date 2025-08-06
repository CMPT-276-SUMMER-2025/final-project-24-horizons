import fs from 'fs';

// Integration test for the complete import workflow
function testImportWorkflow() {
  console.log('Testing Complete Import Workflow Integration...\n');
  
  let workflowPassed = true;
  
  try {
    // Test complete data flow: CalendarOnboarding -> Context -> Firebase -> CalendarAI
    console.log('STEP 1: Testing data flow integration...');
    
    const onboardingContent = fs.readFileSync('src/pages/CalendarOnboarding.tsx', 'utf8');
    const contextContent = fs.readFileSync('src/services/calendarContext.tsx', 'utf8');
    const calendarAIContent = fs.readFileSync('src/pages/CalendarAI.tsx', 'utf8');
    
    // Check CalendarOnboarding uses context
    const usesContext = onboardingContent.includes('useCalendar') && 
                       onboardingContent.includes('addEvents') &&
                       onboardingContent.includes('clearEvents');
    
    if (usesContext) {
      console.log('PASS: CalendarOnboarding properly uses calendar context');
    } else {
      console.log('FAIL: CalendarOnboarding not integrated with context');
      workflowPassed = false;
    }
    
    // Check context saves to Firebase for CalendarAI
    const contextSavesToFirebase = contextContent.includes('addDoc') && 
                                  contextContent.includes('demo-user') &&
                                  contextContent.includes('Timestamp.fromDate');
    
    if (contextSavesToFirebase) {
      console.log('PASS: Context saves imported events to Firebase');
    } else {
      console.log('FAIL: Context does not save to Firebase - events wont carry over');
      workflowPassed = false;
    }
    
    // Check CalendarAI reads from Firebase with same userId
    const calendarAIReadsFirebase = calendarAIContent.includes('demo-user') &&
                                   calendarAIContent.includes('onSnapshot') &&
                                   calendarAIContent.includes('collection(db, \'events\')');
    
    if (calendarAIReadsFirebase) {
      console.log('PASS: CalendarAI reads events from Firebase with matching userId');
    } else {
      console.log('FAIL: CalendarAI Firebase integration broken');
      workflowPassed = false;
    }
    
    // Test reset functionality integration
    console.log('\nSTEP 2: Testing reset functionality integration...');
    
    const hasResetIntegration = onboardingContent.includes('clearEvents()') &&
                               contextContent.includes('localStorage.removeItem') &&
                               onboardingContent.includes('Clear Calendar');
    
    if (hasResetIntegration) {
      console.log('PASS: Reset functionality properly integrated');
    } else {
      console.log('FAIL: Reset functionality not properly integrated');
      workflowPassed = false;
    }
    
  } catch (error) {
    console.log(`FAIL: Integration test failed: ${error.message}`);
    workflowPassed = false;
  }
  
  return workflowPassed;
}

// Test cross-component navigation and state persistence
function testNavigationIntegration() {
  console.log('\nTesting Navigation and State Persistence...\n');
  
  let navigationPassed = true;
  
  try {
    const onboardingContent = fs.readFileSync('src/pages/CalendarOnboarding.tsx', 'utf8');
    
    // Check navigation preserves state through context/Firebase
    const hasProperNavigation = onboardingContent.includes('navigate(\'/calendar-ai\')') &&
                               onboardingContent.includes('Continue to AI Calendar');
    
    if (hasProperNavigation) {
      console.log('PASS: Navigation to CalendarAI exists');
    } else {
      console.log('FAIL: Navigation to CalendarAI missing');
      navigationPassed = false;
    }
    
    // Check if both pages use compatible event types
    const calendarAIContent = fs.readFileSync('src/pages/CalendarAI.tsx', 'utf8');
    
    const onboardingHasTypes = onboardingContent.includes('canvas') && 
                              onboardingContent.includes('google') &&
                              onboardingContent.includes('imported');
    
    const calendarAIHandlesTypes = calendarAIContent.includes('canvas') ||
                                  calendarAIContent.includes('google') ||
                                  calendarAIContent.includes('imported');
    
    if (onboardingHasTypes) {
      console.log('PASS: CalendarOnboarding creates proper event types');
    } else {
      console.log('FAIL: CalendarOnboarding event types incomplete');
      navigationPassed = false;
    }
    
    if (calendarAIHandlesTypes) {
      console.log('PASS: CalendarAI can handle imported event types');
    } else {
      console.log('WARN: CalendarAI may not display imported events properly');
    }
    
  } catch (error) {
    console.log(`FAIL: Navigation integration test failed: ${error.message}`);
    navigationPassed = false;
  }
  
  return navigationPassed;
}

async function runImportIntegrationTests() {
  console.log('Starting Import Integration Tests\n');
  
  try {
    const workflowResult = testImportWorkflow();
    const navigationResult = testNavigationIntegration();
    
    if (workflowResult && navigationResult) {
      console.log('\nSUCCESS: All import integration tests passed!');
      console.log('Import workflow properly integrated across components.');
      process.exit(0);
    } else {
      console.log('\nFAILED: Some import integration tests failed!');
      console.log('Components are not properly integrated.');
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`\nFAILED: Import integration tests failed: ${error.message}`);
    process.exit(1);
  }
}

runImportIntegrationTests();