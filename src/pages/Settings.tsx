import { useState } from 'react';
import '../Settings.css';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import UserSettings from '../components/settings/UserSettings';
import ReminderCard from '../components/settings/ReminderCard';
import Navbar from '../components/NavBar';
import { useAuth } from '../services/authContext';

/**
 * Settings page component that displays user settings, notifications settings,
 * and provides logout functionality
 */
function Settings() {
  // State to control visibility of the reminder card
  const [showReminder, setShowReminder] = useState(true);
  
  // Get logout function from auth context
  const { logout } = useAuth();

  /**
   * Handles the start action from the reminder card
   * Hides the reminder card when user clicks start
   */
  const handleStart = () => {
    setShowReminder(false); // Hides the ReminderCard
  };

  /**
   * Handles user logout
   * Calls the logout function from auth context and handles errors gracefully
   */
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth context
    } catch {
      // Handle error silently - auth context will manage error states
    }
  };

  return (
    <>
      {/* Navigation bar component */}
      <Navbar />
      
      <div className="settings-page">
        {/* Main settings page title */}
        <h1 className="settings-title">Settings</h1>

        {/* Grid container for settings components */}
        <div className="settings-grid">
          {/* Notifications configuration component */}
          <NotificationsSettings />
          
          {/* User profile/account settings component */}
          <UserSettings />
          
          {/* Conditionally rendered reminder card */}
          {showReminder && <ReminderCard onStart={handleStart} />}
        </div>

        {/* Logout button section */}
        <div className="logout-wrapper">
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Settings;
