// Import necessary hooks and contexts
import { useTimer } from '../../services/TimerContext';
import { useAuth } from '../../services/authContext';
import { useEffect, useState } from 'react';

/**
 * UserSettings Component
 * Renders user settings interface including personal info, session preferences, and theme selection
 */
function UserSettings() {
  // Get user data from authentication context
  const { user } = useAuth();
  
  // Get session duration state and setter from timer context
  const { sessionDuration, setSessionDuration } = useTimer();
  
  // Initialize theme state from localStorage, defaulting to 'dark' if not set
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  

  // Effect to apply theme changes to the document and persist to localStorage
  useEffect(() => {
    // Set the data-theme attribute on the root HTML element for CSS theme switching
    document.documentElement.setAttribute('data-theme', theme);
    // Save the selected theme to localStorage for persistence across sessions
    localStorage.setItem('theme', theme);
  }, [theme]); // Re-run when theme state changes

  return (
    <section className="settings-section">
      <h2>User Settings</h2>
      <div className="settings-group">
        {/* User Name Field - Read-only display of current user's name */}
        <div className="setting-item">
          <label>Name</label>
          <input 
            type="text" 
            value={user?.name || ''} // Display user name or empty string if not available
            placeholder="Your name"
            readOnly // Prevents editing - name comes from auth provider
          />
        </div>
        
        {/* User Email Field - Read-only display of current user's email */}
        <div className="setting-item">
          <label>Email</label>
          <input 
            type="email" 
            value={user?.email || ''} // Display user email or empty string if not available
            placeholder="you@example.com"
            readOnly // Prevents editing - email comes from auth provider
          />
        </div>
        
        {/* Study Session Duration Selector */}
        <div className="setting-item">
          <label>Default Study Session</label>
          <select 
            value={sessionDuration} 
            onChange={(e) => setSessionDuration(parseInt(e.target.value))} // Convert string to number and update context
          >
            <option value={25}>25 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>
        </div>
        
        {/* Timezone Selector - Currently static options */}
        <div className="setting-item">
          <label>Timezone</label>
          <select>
            <option>PST</option>
            <option>EST</option>
            <option>GMT</option>
          </select>
        </div>

        {/* Theme Selector - Controls application color scheme */}
        <div className="setting-item">
          <label>Theme</label>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)} // Update theme state when user selects new option
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default UserSettings;