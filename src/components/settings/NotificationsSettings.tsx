/**
 * NotificationsSettings component that provides user controls for notification preferences
 * Features:
 * - Push notification toggle
 * - Email notification toggle  
 * - Smart timing controls
 * - Do Not Disturb settings
 * Part of the main Settings page configuration
 */
function NotificationsSettings() {
  return (
    <section className="settings-section">
      {/* Section header for notifications settings */}
      <h2>Smart Notifications</h2>
      
      <div className="settings-group">
        {/* Push notifications toggle - enabled by default */}
        <div className="setting-item">
          <label>Push Notifications</label>
          {/* Controls browser/system push notifications */}
          <input type="checkbox" defaultChecked />
        </div>
        
        {/* Email notifications toggle - disabled by default */}
        <div className="setting-item">
          <label>Email Notifications</label>
          {/* Controls email alerts for study reminders and deadlines */}
          <input type="checkbox" />
        </div>
        
        {/* Smart timing feature toggle - enabled by default */}
        <div className="setting-item">
          <label>Smart Timing</label>
          {/* Enables AI-powered optimal timing for notifications */}
          <input type="checkbox" defaultChecked />
        </div>
        
        {/* Do Not Disturb mode configuration */}
        <div className="setting-item">
          <label>Do Not Disturb</label>
          {/* Dropdown to select when notifications should be silenced */}
          <select>
            <option>During study time</option>  {/* Only silence during active study sessions */}
            <option>All day</option>            {/* Silence all notifications throughout the day */}
          </select>
        </div>
      </div>
    </section>
  );
}

export default NotificationsSettings;
