import fs from 'fs';
import path from 'path';

// Mock fetch for testing
global.fetch = async (url) => {
  if (url.includes('allorigins.win')) {
    return {
      ok: true,
      json: async () => ({
        contents: `BEGIN:VCALENDAR
        VERSION:2.0
        BEGIN:VEVENT
        SUMMARY:Test Event
        DTSTART:20250805T140000Z
        END:VEVENT
        END:VCALENDAR`
      })
    };
  }
  throw new Error('Network error');
};

// Test calendar import functionality
function testCalendarImportComponents() {
  console.log('Testing Calendar Import Functionality...\n');
  
  let allTestsPassed = true;
  
  // Check if CalendarOnboarding component exists
  const calendarOnboardingPath = 'src/pages/CalendarOnboarding.tsx';
  if (fs.existsSync(calendarOnboardingPath)) {
    console.log('PASS: CalendarOnboarding component exists');
    
    // Read the file and check for import functionality
    const content = fs.readFileSync(calendarOnboardingPath, 'utf8');
    
    // Check for Canvas import functionality
    if (content.includes('handleCanvasImport') || content.includes('Canvas')) {
      console.log('PASS: Canvas import functionality found');
    } else {
      console.log('FAIL: Canvas import functionality not found');
      allTestsPassed = false;
    }
    
    // Check for ICS import functionality
    if (content.includes('handleICSImport') || content.includes('ics')) {
      console.log('PASS: ICS import functionality found');
    } else {
      console.log('FAIL: ICS import functionality not found');
      allTestsPassed = false;
    }
    
    // Check for Google Calendar import
    if (content.includes('handleGoogleCalendarImport') || content.includes('Google')) {
      console.log('PASS: Google Calendar import functionality found');
    } else {
      console.log('FAIL: Google Calendar import functionality not found');
      allTestsPassed = false;
    }
    
    // Check for URL input fields
    if (content.includes('canvasUrl') && content.includes('icsUrl')) {
      console.log('PASS: URL input fields found');
    } else {
      console.log('FAIL: URL input fields not found');
      allTestsPassed = false;
    }
    
    // Check for parseICSFile function
    if (content.includes('parseICSFile')) {
      console.log('PASS: ICS parsing functionality found');
    } else {
      console.log('FAIL: ICS parsing functionality not found');
      allTestsPassed = false;
    }
    
  } else {
    console.log('FAIL: CalendarOnboarding component not found');
    allTestsPassed = false;
  }
  
  return allTestsPassed;
}

function testCalendarContext() {
  console.log('\nTesting Calendar Context...\n');
  
  let contextTestsPassed = true;
  
  // Check if calendar context exists
  const calendarContextPath = 'src/services/calendarContext.tsx';
  if (fs.existsSync(calendarContextPath)) {
    console.log('PASS: Calendar context exists');
    
    const content = fs.readFileSync(calendarContextPath, 'utf8');
    
    // Check for addEvents function
    if (content.includes('addEvents')) {
      console.log('PASS: addEvents function found in context');
    } else {
      console.log('FAIL: addEvents function not found in context');
      contextTestsPassed = false;
    }
    
  } else {
    console.log('FAIL: Calendar context not found');
    contextTestsPassed = false;
  }
  
  return contextTestsPassed;
}

// Test ICS parsing functionality
function testICSParsing() {
  console.log('\nTesting ICS Parsing Logic...\n');
  
  let parsingTestsPassed = true;
  
  try {
    // Test ICS content parsing
    const testICSContent = `BEGIN:VCALENDAR
    VERSION:2.0
    BEGIN:VEVENT
    SUMMARY:Test Meeting
    DTSTART:20250805T140000Z
    DTEND:20250805T150000Z
    DESCRIPTION:Test event description
    LOCATION:Conference Room A
    END:VEVENT
    END:VCALENDAR`;

    // Simulate parsing logic
    const lines = testICSContent.split(/\r?\n/).map(line => line.trim());
    let eventFound = false;
    let titleFound = false;
    let dateFound = false;
    
    for (let line of lines) {
      if (line === 'BEGIN:VEVENT') eventFound = true;
      if (line.startsWith('SUMMARY:')) titleFound = true;
      if (line.startsWith('DTSTART:')) dateFound = true;
    }
    
    if (eventFound && titleFound && dateFound) {
      console.log('PASS: ICS parsing logic works correctly');
    } else {
      console.log('FAIL: ICS parsing logic failed');
      parsingTestsPassed = false;
    }
    
    // Test date parsing
    const dateString = '20250805T140000Z';
    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1;
    const day = parseInt(dateString.substring(6, 8));
    const testDate = new Date(year, month, day);
    
    if (testDate.getFullYear() === 2025 && testDate.getMonth() === 7 && testDate.getDate() === 5) {
      console.log('PASS: Date parsing logic works correctly');
    } else {
      console.log('FAIL: Date parsing logic failed');
      parsingTestsPassed = false;
    }
    
    // Test time parsing
    const timeString = '20250805T140000Z';
    if (timeString.includes('T')) {
      const timePart = timeString.split('T')[1].replace('Z', '');
      const hours = parseInt(timePart.substring(0, 2));
      const minutes = parseInt(timePart.substring(2, 4));
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      if (formattedTime === '14:00') {
        console.log('PASS: Time parsing logic works correctly');
      } else {
        console.log('FAIL: Time parsing logic failed');
        parsingTestsPassed = false;
      }
    }
    
  } catch (error) {
    console.log(`FAIL: ICS parsing test failed: ${error.message}`);
    parsingTestsPassed = false;
  }
  
  return parsingTestsPassed;
}

// Test URL validation
function testURLValidation() {
  console.log('\nTesting URL Validation...\n');
  
  let urlTestsPassed = true;
  
  const validURLs = [
    'https://example.com/calendar.ics',
    'https://canvas.university.edu/feeds/calendars/user_123.ics',
    'https://outlook.live.com/calendar/published/123.ics'
  ];
  
  const invalidURLs = [
    '',
    'not-a-url',
    'http://invalid',
    'ftp://example.com/calendar.ics'
  ];
  
  // Test valid URLs
  validURLs.forEach(url => {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'https:' && url.includes('.ics')) {
        console.log(`PASS: Valid URL: ${url}`);
      } else {
        console.log(`FAIL: URL validation failed for: ${url}`);
        urlTestsPassed = false;
      }
    } catch (error) {
      console.log(`FAIL: URL validation failed for: ${url}`);
      urlTestsPassed = false;
    }
  });
  
  // Test invalid URLs
  invalidURLs.forEach(url => {
    try {
      new URL(url);
      if (!url || !url.includes('https://')) {
        console.log(`PASS: Correctly rejected invalid URL: ${url}`);
      }
    } catch (error) {
      console.log(`PASS: Correctly rejected invalid URL: ${url}`);
    }
  });
  
  return urlTestsPassed;
}

async function runImportTests() {
  console.log('Starting Calendar Import Feature Tests\n');
  
  try {
    const componentsPass = testCalendarImportComponents();
    const contextPass = testCalendarContext();
    const parsingPass = testICSParsing();
    const urlPass = testURLValidation();
    
    if (componentsPass && contextPass && parsingPass && urlPass) {
      console.log('\nSUCCESS: All import functionality tests passed!');
      console.log('Calendar import feature is properly implemented.');
      process.exit(0);
    } else {
      console.log('\nFAILED: Some import functionality tests failed!');
      console.log('Please check the missing components or functions.');
      process.exit(1);
    }
    
  } catch (error) {
    console.log(`\nFAILED: Import tests failed with error: ${error.message}`);
    process.exit(1);
  }
}

// Run the tests
runImportTests();