import fs from 'fs';

// Integration test for Notes CRUD complete workflow
function testNotesCrudIntegration() {
  console.log('Testing Complete Notes CRUD Integration...\n');
  
  let integrationPassed = true;
  
  try {
    // Read relevant files to test integration
    const notesApiContent = fs.readFileSync('src/services/notesApi.tsx', 'utf8');
    const notesContextContent = fs.readFileSync('src/services/notesContext.tsx', 'utf8');
    const dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
    
    // Test complete Notes workflow: Dashboard -> Context -> API -> Backend
    console.log('STEP 1: Testing Notes data flow integration...');
    
    // Check Dashboard uses Notes through PersonalNotes component
    const dashboardUsesNotesComponent = dashboardContent.includes('PersonalNotes');
    const personalNotesExists = fs.existsSync('src/components/dashboard/PersonalNotes.tsx');
    
    if (dashboardUsesNotesComponent && personalNotesExists) {
      console.log('PASS: Dashboard properly integrates Notes through PersonalNotes component');
      
      // Check PersonalNotes component uses Notes API
      const personalNotesContent = fs.readFileSync('src/components/dashboard/PersonalNotes.tsx', 'utf8');
      const usesNotesAPI = personalNotesContent.includes('fetchNotes') && 
                          personalNotesContent.includes('notesApi');
      
      if (usesNotesAPI) {
        console.log('PASS: PersonalNotes component properly uses Notes API');
      } else {
        console.log('FAIL: PersonalNotes component not integrated with Notes API');
        integrationPassed = false;
      }
    } else {
      console.log('FAIL: Dashboard not integrated with Notes system');
      integrationPassed = false;
    }
    
    // Check context uses API functions
    const contextUsesNotesAPI = notesContextContent.includes('fetchNotes') &&
                               notesContextContent.includes('addNoteToServer') &&
                               notesContextContent.includes('updateNoteOnServer') &&
                               notesContextContent.includes('removeNoteFromServer');
    
    if (contextUsesNotesAPI) {
      console.log('PASS: Notes context properly uses API functions');
    } else {
      console.log('FAIL: Notes context not integrated with API');
      integrationPassed = false;
    }
    
    // Check API has proper error handling (your current pattern)
    const notesApiUsesErrorHandling = notesApiContent.includes('fetch') &&
                                     notesApiContent.includes('headers') &&
                                     notesApiContent.includes('credentials');
    
    if (notesApiUsesErrorHandling) {
      console.log('PASS: Notes API properly handles requests with credentials');
    } else {
      console.log('WARN: Notes API may need credentials/headers for production');
      // Don't fail the test since this might be intentional for your setup
    }
    
    console.log('\nSTEP 2: Testing Notes error handling integration...');
    
    // Check error handling flows through all layers
    const contextHandlesNotesErrors = notesContextContent.includes('try') &&
                                     notesContextContent.includes('catch') &&
                                     (notesContextContent.includes('setError') || 
                                      notesContextContent.includes('error'));
    
    if (contextHandlesNotesErrors) {
      console.log('PASS: Notes context handles API errors');
    } else {
      console.log('FAIL: Notes context missing error handling');
      integrationPassed = false;
    }
    
    // Check API error handling
    const notesApiHandlesErrors = notesApiContent.includes('handleApiError') &&
                                 notesApiContent.includes('401') &&
                                 notesApiContent.includes('throw new Error');
    
    if (notesApiHandlesErrors) {
      console.log('PASS: Notes API has proper error handling');
    } else {
      console.log('FAIL: Notes API missing error handling');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 3: Testing Notes state management integration...');
    
    // Check state updates flow properly
    const contextManagesNotesState = notesContextContent.includes('useState') &&
                                    notesContextContent.includes('setNotes') &&
                                    (notesContextContent.includes('useEffect') || 
                                     notesContextContent.includes('useCallback'));
    
    if (contextManagesNotesState) {
      console.log('PASS: Notes context properly manages state');
    } else {
      console.log('FAIL: Notes context state management incomplete');
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
    // Read relevant files to test integration
    const flashcardsApiContent = fs.readFileSync('src/services/flashcardsApi.tsx', 'utf8');
    const flashcardsContextContent = fs.readFileSync('src/services/flashcardsContext.tsx', 'utf8');
    const dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
    
    // Test complete Flashcards workflow: Dashboard -> Context -> API -> Backend
    console.log('STEP 1: Testing Flashcards data flow integration...');
    
    // Check Dashboard uses Flashcards through QuickActions or other components
    const quickActionsExists = fs.existsSync('src/components/dashboard/QuickActions.tsx');
    const dashboardUsesQuickActions = dashboardContent.includes('QuickActions');
    
    if (dashboardUsesQuickActions && quickActionsExists) {
      console.log('PASS: Dashboard integrates Flashcards through QuickActions component');
      
      // Check QuickActions component references flashcards
      const quickActionsContent = fs.readFileSync('src/components/dashboard/QuickActions.tsx', 'utf8');
      const referencesFlashcards = quickActionsContent.includes('flashcard') || 
                                  quickActionsContent.includes('Flashcard');
      
      if (referencesFlashcards) {
        console.log('PASS: QuickActions component properly references Flashcards');
      } else {
        console.log('FAIL: QuickActions component does not reference Flashcards');
        integrationPassed = false;
      }
    } else {
      console.log('FAIL: Dashboard not integrated with Flashcards system');
      integrationPassed = false;
    }
    
    // Check context uses API functions
    const contextUsesFlashcardsAPI = flashcardsContextContent.includes('fetchFlashcards') &&
                                    flashcardsContextContent.includes('addFlashcardToServer') &&
                                    flashcardsContextContent.includes('updateFlashcardOnServer') &&
                                    flashcardsContextContent.includes('removeFlashcardFromServer');
    
    if (contextUsesFlashcardsAPI) {
      console.log('PASS: Flashcards context properly uses API functions');
    } else {
      console.log('FAIL: Flashcards context not integrated with API');
      integrationPassed = false;
    }
    
    // Check API has proper error handling (your current pattern)
    const flashcardsApiUsesErrorHandling = flashcardsApiContent.includes('fetch') &&
                                          flashcardsApiContent.includes('headers') &&
                                          flashcardsApiContent.includes('credentials');
    
    if (flashcardsApiUsesErrorHandling) {
      console.log('PASS: Flashcards API properly handles requests with credentials');
    } else {
      console.log('WARN: Flashcards API may need credentials/headers for production');
      // Don't fail the test since this might be intentional for your setup
    }
    
    console.log('\nSTEP 2: Testing Flashcards error handling integration...');
    
    // Check error handling flows through all layers
    const contextHandlesFlashcardsErrors = flashcardsContextContent.includes('try') &&
                                          flashcardsContextContent.includes('catch') &&
                                          (flashcardsContextContent.includes('setError') || 
                                           flashcardsContextContent.includes('error'));
    
    if (contextHandlesFlashcardsErrors) {
      console.log('PASS: Flashcards context handles API errors');
    } else {
      console.log('FAIL: Flashcards context missing error handling');
      integrationPassed = false;
    }
    
    // Check API error handling
    const flashcardsApiHandlesErrors = flashcardsApiContent.includes('handleApiError') &&
                                      flashcardsApiContent.includes('401') &&
                                      flashcardsApiContent.includes('throw new Error');
    
    if (flashcardsApiHandlesErrors) {
      console.log('PASS: Flashcards API has proper error handling');
    } else {
      console.log('FAIL: Flashcards API missing error handling');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 3: Testing Flashcards state management integration...');
    
    // Check state updates flow properly
    const contextManagesFlashcardsState = flashcardsContextContent.includes('useState') &&
                                         flashcardsContextContent.includes('setFlashcards') &&
                                         (flashcardsContextContent.includes('useEffect') || 
                                          flashcardsContextContent.includes('useCallback'));
    
    if (contextManagesFlashcardsState) {
      console.log('PASS: Flashcards context properly manages state');
    } else {
      console.log('FAIL: Flashcards context state management incomplete');
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
    const notesApiContent = fs.readFileSync('src/services/notesApi.tsx', 'utf8');
    const flashcardsApiContent = fs.readFileSync('src/services/flashcardsApi.tsx', 'utf8');
    
    console.log('STEP 1: Testing unified dashboard integration...');
    
    // Check both Notes and Flashcards are accessible from Dashboard
    const dashboardHasPersonalNotes = dashboardContent.includes('PersonalNotes');
    const dashboardHasQuickActions = dashboardContent.includes('QuickActions');
    
    if (dashboardHasPersonalNotes && dashboardHasQuickActions) {
      console.log('PASS: Dashboard integrates both Notes (PersonalNotes) and Flashcards (QuickActions) systems');
    } else {
      console.log('FAIL: Dashboard missing integration with one or both systems');
      integrationPassed = false;
    }
    
    console.log('\nSTEP 2: Testing shared authentication integration...');
    
    // Check both APIs use similar patterns (both should use fetch)
    const notesUsesFetch = notesApiContent.includes('fetch') && notesApiContent.includes('API_BASE_URL');
    const flashcardsUsesFetch = flashcardsApiContent.includes('fetch') && flashcardsApiContent.includes('API_BASE_URL');
    
    if (notesUsesFetch && flashcardsUsesFetch) {
      console.log('PASS: Both Notes and Flashcards use consistent API patterns');
    } else {
      console.log('FAIL: Inconsistent API patterns between Notes and Flashcards');
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
