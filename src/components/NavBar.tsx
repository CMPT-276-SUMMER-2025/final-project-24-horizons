// Import CSS styles for navbar appearance and layout
import './NavBar.css';
// Import React Router Link component for client-side navigation
import { Link } from 'react-router-dom';
// Import timer context to display active timer in navbar
import { useTimer } from '../services/TimerContext';

/**
 * Navigation link configuration array
 * Defines all main navigation routes in the application
 * Each object contains display name and route path
 */
const navLinks = [
  { name: 'Dashboard', to: '/dashboard' },  // Main dashboard page
  { name: 'Calendar', to: '/calendar' },    // Calendar view page
  { name: 'Study', to: '/study' },          // Study tools page
  { name: 'Settings', to: '/settings' },    // User settings page
];

/**
 * Navbar component that provides application-wide navigation
 * Features:
 * - Application logo/branding
 * - Timer display when active (from timer context)
 * - Navigation links to main pages
 * - Responsive design for different screen sizes
 */
function Navbar() {
  // Extract timer state and control functions from context
  const { isRunning, timeLeft, stopTimer } = useTimer();

  /**
   * Formats seconds into MM:SS display format
   * @param seconds - Total seconds to format
   * @returns Formatted time string in MM:SS format with zero padding
   */
  const formatTime = (seconds: number) => {
    // Calculate minutes and pad with leading zero if needed
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    // Calculate remaining seconds and pad with leading zero if needed
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Application logo/brand name */}
        <div className="navbar-logo">StudySync</div>

        {/* Timer display - only shown when timer is running */}
        {isRunning && (
          <div className="navbar-timer">
            {/* Current time remaining formatted as MM:SS */}
            <span className="timer-display">{formatTime(timeLeft)}</span>
            {/* Stop button to end the current timer session */}
            <button className="stop-button" onClick={stopTimer}>Stop</button>
          </div>
        )}

        {/* Navigation links section */}
        <div className="navbar-links">
          {/* 
            Map over navigation links array to create Link components
            Each link uses React Router for client-side navigation
          */}
          {navLinks.map(link => (
            <Link key={link.name} to={link.to}>{link.name}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;