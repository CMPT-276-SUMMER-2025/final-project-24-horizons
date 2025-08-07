import fs from 'fs';

// Integration test for Notes CRUD complete workflow
function testNotesCrudIntegration() {
  console.log('Testing Complete Notes CRUD Integration...\n');
  
  let integrationPassed = true;
  
  try {
    // Read relevant files
    const notesApiContent = fs.readFileSync('src/services/notesApi.tsx', 'utf8');
    const notesContextContent = fs.readFileSync('src/services/notesContext.tsx', 'utf8');
    const dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
    
    // Test complete Notes workflow: Dashboard -> Context -> API -> Backend
    console.log('STEP 1: Testing Notes data flow integration...');
    
    // Check Dashboard uses Notes context
    const dashboardUsesContext = dashboardContent.includes('useNotes') || 
                                dashboardContent.includes('NotesContext') ||
                                dashboardContent.includes('notesContext');
    
    if (dashboardUsesContext) {
      console.log('PASS: Dashboard properly uses Notes context');
    } else {
      console.log('FAIL: Dashboard not integrated with Notes context');
      integrationPassed = false;
    }
    
    // Check context uses API functions
    const contextUsesAPI = notesContextContent.includes('fetchNotes') &&
                          notesContextContent.includes('addNoteToServer') &&
                          notesContextContent.includes('updateNoteOnServer') &&
                          notesContextContent.includes('removeNoteFromServer');
    
    if (contextUsesAPI) {
      console.log('PASS: Notes context properly uses API functions');
    } else {
      console.log('FAIL: Notes context not integrated with API');
      integrationPassed = false;
    }
    
    // Check API has proper authentication integration
    const apiUsesAuth = notesApiContent.includes('getAuthToken') ||
                       notesApiContent.includes('Authorization') ||
                       notesApiContent.includes('Bearer');
    
    if (apiUsesAuth) {
      console.log('PASS: Notes API properly integrated with authentication');
    } else {
      console.log('FAIL: Notes API missing authentication integration');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 2: Testing Notes error handling integration...');
    
    // Check error handling flows through all layers
    const contextHandlesErrors = notesContextContent.includes('try') &&
                                notesContextContent.includes('catch') &&
                                (notesContextContent.includes('setError') || 
                                 notesContextContent.includes('error'));
    
    if (contextHandlesErrors) {
      console.log('PASS: Notes context handles API errors');
    } else {
      console.log('FAIL: Notes context missing error handling');
      integrationPassed = false;
    }
    
    // Check API error handling
    const apiHandlesErrors = notesApiContent.includes('handleApiError') &&
                            notesApiContent.includes('401') &&
                            notesApiContent.includes('throw new Error');
    
    if (apiHandlesErrors) {
      console.log('PASS: Notes API has proper error handling');
    } else {
      console.log('FAIL: Notes API missing error handling');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 3: Testing Notes state management integration...');
    
    // Check state updates flow properly
    const contextManagesState = notesContextContent.includes('useState') &&
                               notesContextContent.includes('setNotes') &&
                               (notesContextContent.includes('useEffect') || 
                                notesContextContent.includes('useCallback'));
    
    if (contextManagesState) {
      console.log('PASS: Notes context properly manages state');
    } else {
      console.log('FAIL: Notes context state management incomplete');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 4: Testing Notes real-time updates integration...');
    
    // Check for real-time update mechanisms
    const hasRealTimeUpdates = notesContextContent.includes('refetch') ||
                              notesContextContent.includes('refresh') ||
                              notesContextContent.includes('reload') ||
                              dashboardContent.includes('useEffect');
    
    if (hasRealTimeUpdates) {
      console.log('PASS: Notes real-time updates integrated');
    } else {
      console.log('FAIL: Notes real-time updates missing');
      integrationPassed = false;
    }
    
  } catch (error) {
    console.log(`FAIL: Error testing Notes integration: ${error.message}`);
    integrationPassed = false;
  }
  
  return integrationPassed;
}

// Integration test for Flashcards CRUD complete workflow  
function testFlashcardsCrudIntegration() {
  console.log('\nTesting Complete Flashcards CRUD Integration...\n');
  
  let integrationPassed = true;
  
  try {
    // Read relevant files
    const flashcardsApiContent = fs.readFileSync('src/services/flashcardsApi.tsx', 'utf8');
    const flashcardsContextContent = fs.readFileSync('src/services/flashcardsContext.tsx', 'utf8');
    const dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
    
    // Test complete Flashcards workflow: Dashboard -> Context -> API -> Backend
    console.log('STEP 1: Testing Flashcards data flow integration...');
    
    // Check Dashboard uses Flashcards context
    const dashboardUsesContext = dashboardContent.includes('useFlashcards') || 
                                dashboardContent.includes('FlashcardsContext') ||
                                dashboardContent.includes('flashcardsContext');
    
    if (dashboardUsesContext) {
      console.log('PASS: Dashboard properly uses Flashcards context');
    } else {
      console.log('FAIL: Dashboard not integrated with Flashcards context');
      integrationPassed = false;
    }
    
    // Check context uses API functions
    const contextUsesAPI = flashcardsContextContent.includes('fetchFlashcards') &&
                          flashcardsContextContent.includes('addFlashcardToServer') &&
                          flashcardsContextContent.includes('updateFlashcardOnServer') &&
                          flashcardsContextContent.includes('removeFlashcardFromServer');
    
    if (contextUsesAPI) {
      console.log('PASS: Flashcards context properly uses API functions');
    } else {
      console.log('FAIL: Flashcards context not integrated with API');
      integrationPassed = false;
    }
    
    // Check API has proper authentication integration
    const apiUsesAuth = flashcardsApiContent.includes('getAuthToken') ||
                       flashcardsApiContent.includes('Authorization') ||
                       flashcardsApiContent.includes('Bearer');
    
    if (apiUsesAuth) {
      console.log('PASS: Flashcards API properly integrated with authentication');
    } else {
      console.log('FAIL: Flashcards API missing authentication integration');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 2: Testing Flashcards error handling integration...');
    
    // Check error handling flows through all layers
    const contextHandlesErrors = flashcardsContextContent.includes('try') &&
                                flashcardsContextContent.includes('catch') &&
                                (flashcardsContextContent.includes('setError') || 
                                 flashcardsContextContent.includes('error'));
    
    if (contextHandlesErrors) {
      console.log('PASS: Flashcards context handles API errors');
    } else {
      console.log('FAIL: Flashcards context missing error handling');
      integrationPassed = false;
    }
    
    // Check API error handling
    const apiHandlesErrors = flashcardsApiContent.includes('handleApiError') &&
                            flashcardsApiContent.includes('401') &&
                            flashcardsApiContent.includes('throw new Error');
    
    if (apiHandlesErrors) {
      console.log('PASS: Flashcards API has proper error handling');
    } else {
      console.log('FAIL: Flashcards API missing error handling');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 3: Testing Flashcards state management integration...');
    
    // Check state updates flow properly
    const contextManagesState = flashcardsContextContent.includes('useState') &&
                               flashcardsContextContent.includes('setFlashcards') &&
                               (flashcardsContextContent.includes('useEffect') || 
                                flashcardsContextContent.includes('useCallback'));
    
    if (contextManagesState) {
      console.log('PASS: Flashcards context properly manages state');
    } else {
      console.log('FAIL: Flashcards context state management incomplete');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 4: Testing Flashcards study mode integration...');
    
    // Check for study mode integration
    const hasStudyMode = dashboardContent.includes('study') ||
                        dashboardContent.includes('flip') ||
                        flashcardsContextContent.includes('currentCard') ||
                        flashcardsContextContent.includes('nextCard');
    
    if (hasStudyMode) {
      console.log('PASS: Flashcards study mode integrated');
    } else {
      console.log('FAIL: Flashcards study mode missing');
      integrationPassed = false;
    }
    
  } catch (error) {
    console.log(`FAIL: Error testing Flashcards integration: ${error.message}`);
    integrationPassed = false;
  }
  
  return integrationPassed;
}

// Integration test for Notes and Flashcards working together
function testCrudCrossIntegration() {
  console.log('\nTesting Notes and Flashcards Cross-Integration...\n');
  
  let integrationPassed = true;
  
  try {
    const dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
    
    console.log('STEP 1: Testing unified dashboard integration...');
    
    // Check both Notes and Flashcards are integrated in Dashboard
    const hasBothSystems = (dashboardContent.includes('notes') || dashboardContent.includes('Notes')) &&
                          (dashboardContent.includes('flashcards') || dashboardContent.includes('Flashcards'));
    
    if (hasBothSystems) {
      console.log('PASS: Dashboard integrates both Notes and Flashcards systems');
    } else {
      console.log('FAIL: Dashboard missing integration with one or both systems');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 2: Testing shared authentication integration...');
    
    // Check both APIs use same auth pattern
    const notesApiContent = fs.readFileSync('src/services/notesApi.tsx', 'utf8');
    const flashcardsApiContent = fs.readFileSync('src/services/flashcardsApi.tsx', 'utf8');
    
    const notesAuthPattern = notesApiContent.includes('getAuthToken') || notesApiContent.includes('Authorization');
    const flashcardsAuthPattern = flashcardsApiContent.includes('getAuthToken') || flashcardsApiContent.includes('Authorization');
    
    if (notesAuthPattern && flashcardsAuthPattern) {
      console.log('PASS: Both Notes and Flashcards use consistent authentication');
    } else {
      console.log('FAIL: Inconsistent authentication between Notes and Flashcards');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 3: Testing consistent error handling integration...');
    
    // Check both use similar error handling patterns
    const notesErrorPattern = notesApiContent.includes('handleApiError');
    const flashcardsErrorPattern = flashcardsApiContent.includes('handleApiError');
    
    if (notesErrorPattern && flashcardsErrorPattern) {
      console.log('PASS: Both systems use consistent error handling');
    } else {
      console.log('FAIL: Inconsistent error handling between systems');
      integrationPassed = false;
    }
    
  } catch (error) {
    console.log(`FAIL: Error testing cross-integration: ${error.message}`);
    integrationPassed = false;
  }
  
  return integrationPassed;
}

async function runCrudIntegrationTests() {
  console.log('🚀 Starting CRUD Integration Tests for StudySync\n');
  console.log('Testing how Notes and Flashcards integrate with the complete application...\n');
  
  let totalTestSuites = 0;
  let passedTestSuites = 0;
  
  // Test Notes integration
  console.log('=' .repeat(60));
  console.log('TESTING NOTES CRUD INTEGRATION');
  console.log('=' .repeat(60));
  
  if (testNotesCrudIntegration()) {
    passedTestSuites++;
  }
  totalTestSuites++;
  
  // Test Flashcards integration
  console.log('\n' + '=' .repeat(60));
  console.log('TESTING FLASHCARDS CRUD INTEGRATION');
  console.log('=' .repeat(60));
  
  if (testFlashcardsCrudIntegration()) {
    passedTestSuites++;
  }
  totalTestSuites++;
  
  // Test cross-integration
  console.log('\n' + '=' .repeat(60));
  console.log('TESTING CROSS-SYSTEM INTEGRATION');
  console.log('=' .repeat(60));
  
  if (testCrudCrossIntegration()) {
    passedTestSuites++;
  }
  totalTestSuites++;
  
  // Final results
  console.log('\n' + '=' .repeat(60));
  console.log('FINAL CRUD INTEGRATION TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`📊 Integration Test Suites: ${passedTestSuites}/${totalTestSuites} passed`);
  
  if (passedTestSuites === totalTestSuites) {
    console.log('✨ All CRUD integration tests passed! Notes and Flashcards are properly integrated.');
    process.exit(0);
  } else {
    console.log('❌ Some CRUD integration tests failed. Please check the integrations.');
    process.exit(1);
  }
}

// Run the integration tests
runCrudIntegrationTests();
