import { useState } from 'react';
import '../Settings.css';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import UserSettings from '../components/settings/UserSettings';
import ReminderCard from '../components/settings/ReminderCard';
import Navbar from '../components/NavBar';
import { useAuth } from '../services/authContext';

function Settings() {
  const [showReminder, setShowReminder] = useState(true);
  const { logout } = useAuth();

  const handleStart = () => {
    setShowReminder(false); // Hides the ReminderCard
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="settings-page">
        <h1 className="settings-title">Settings</h1>

        <div className="settings-grid">
          <NotificationsSettings />
          <UserSettings />
          {showReminder && <ReminderCard onStart={handleStart} />}
        </div>

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
