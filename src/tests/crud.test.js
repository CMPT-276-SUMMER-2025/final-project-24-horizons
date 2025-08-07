import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runCrudTests() {
  console.log('🚀 Starting CRUD Operations Unit Tests for StudySync\n');
  console.log('Testing Notes and Flashcards API functionality...\n');
  
  let totalTestSuites = 0;
  let passedTestSuites = 0;
  
  try {
    // Run Notes tests
    console.log('=' .repeat(60));
    console.log('RUNNING NOTES TESTS');
    console.log('=' .repeat(60));
    
    const notesResult = await execAsync('node src/tests/notes.test.js');
    console.log(notesResult.stdout);
    if (notesResult.stderr) {
      console.error('Notes test stderr:', notesResult.stderr);
    }
    passedTestSuites++;
    totalTestSuites++;
    
  } catch (error) {
    console.log('❌ Notes tests failed');
    console.error(error.stdout || error.message);
    totalTestSuites++;
  }
  
  try {
    // Run Flashcards tests
    console.log('\n' + '=' .repeat(60));
    console.log('RUNNING FLASHCARDS TESTS');
    console.log('=' .repeat(60));
    
    const flashcardsResult = await execAsync('node src/tests/flashcards.test.js');
    console.log(flashcardsResult.stdout);
    if (flashcardsResult.stderr) {
      console.error('Flashcards test stderr:', flashcardsResult.stderr);
    }
    passedTestSuites++;
    totalTestSuites++;
    
  } catch (error) {
    console.log('❌ Flashcards tests failed');
    console.error(error.stdout || error.message);
    totalTestSuites++;
  }
  
  // Final results
  console.log('\n' + '=' .repeat(60));
  console.log('FINAL CRUD TEST RESULTS');
  console.log('=' .repeat(60));
  console.log(`📊 Test Suites: ${passedTestSuites}/${totalTestSuites} passed`);
  
  if (passedTestSuites === totalTestSuites) {
    console.log('✨ All CRUD tests passed! Notes and Flashcards APIs are working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some CRUD tests failed. Please check the APIs.');
    process.exit(1);
  }
}

// Additional validation tests
function testCrudApiStructure() {
  console.log('Testing CRUD API Structure...\n');
  
  let allTestsPassed = true;
  
  // Check if both API files exist
  const requiredFiles = [
    'src/services/notesApi.tsx',
    'src/services/flashcardsApi.tsx'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allTestsPassed = false;
    }
  });
  
  // Check if test files exist
  const testFiles = [
    'src/tests/notes.test.js',
    'src/tests/flashcards.test.js'
  ];
  
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allTestsPassed = false;
    }
  });
  
  return allTestsPassed;
}

// Run structure tests first, then CRUD tests
if (testCrudApiStructure()) {
  console.log('✅ All required files present, proceeding with CRUD tests...\n');
  runCrudTests();
} else {
  console.log('❌ Required files missing. Cannot run CRUD tests.');
  process.exit(1);
}
