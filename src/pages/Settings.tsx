import { useState } from 'react';
import '../Settings.css';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import UserSettings from '../components/settings/UserSettings';
import ReminderCard from '../components/settings/ReminderCard';

function Settings() {
  const [showReminder, setShowReminder] = useState(true);

  const handleStart = () => {
    setShowReminder(false); // Hides the ReminderCard
  };

  return (
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
          onClick={() => alert('Logout functionality coming soon!')}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings;
