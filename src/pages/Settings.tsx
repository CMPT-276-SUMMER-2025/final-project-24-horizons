import '../Settings.css';
import NotificationsSettings from '../components/settings/NotificationsSettings';
import UserSettings from '../components/settings/UserSettings';
import ReminderCard from '../components/settings/ReminderCard';


function Settings() {
  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>
      <div className="settings-grid">
        <NotificationsSettings />
        <UserSettings />
        <ReminderCard />
      </div>
    </div>
  );
}

export default Settings;
