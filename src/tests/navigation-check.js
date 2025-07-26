import fs from 'fs';
import path from 'path';

// Check if navigation routes have corresponding page files
const NAVIGATION_ROUTES = [
  { path: '/dashboard', file: 'src/pages/Dashboard.tsx' },
  { path: '/calendar', file: 'src/pages/CalendarOnboarding.tsx' },
  { path: '/settings', file: 'src/pages/Settings.tsx' }
];

function checkNavigationRoutes() {
  console.log('🧭 Checking Navigation Routes...\n');
  
  let allRoutesExist = true;
  
  NAVIGATION_ROUTES.forEach(route => {
    if (fs.existsSync(route.file)) {
      console.log(`✅ ${route.path} → ${route.file}`);
    } else {
      console.log(`❌ ${route.path} → ${route.file} (File not found)`);
      allRoutesExist = false;
    }
  });
  
  // Check if NavBar component exists and contains the routes
  const navBarPath = 'src/components/NavBar.tsx';
  if (fs.existsSync(navBarPath)) {
    const navBarContent = fs.readFileSync(navBarPath, 'utf8');
    
    console.log('\n🔍 Checking NavBar component...');
    NAVIGATION_ROUTES.forEach(route => {
      if (navBarContent.includes(route.path)) {
        console.log(`✅ Route ${route.path} found in NavBar`);
      } else {
        console.log(`⚠️  Route ${route.path} not found in NavBar`);
      }
    });
  }
  
  if (allRoutesExist) {
    console.log('\n✨ All navigation routes have corresponding files!');
    process.exit(0);
  } else {
    console.log('\n💥 Some navigation routes are missing files!');
    process.exit(1);
  }
}

checkNavigationRoutes();