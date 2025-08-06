/**
 * NotificationsSettings component
 * Renders notification preferences for the user, including push, email, smart timing,
 * and do not disturb options.
 */
function NotificationsSettings() {
  return (
    <section className="settings-section">
      {/* Section title */}
      <h2>Smart Notifications</h2>
      <div className="settings-group">
        {/* Push Notifications toggle */}
        <div className="setting-item">
          <label>Push Notifications</label>
          <input type="checkbox" defaultChecked />
        </div>
        {/* Email Notifications toggle */}
        <div className="setting-item">
          <label>Email Notifications</label>
          <input type="checkbox" />
        </div>
        {/* Smart Timing toggle */}
        <div className="setting-item">
          <label>Smart Timing</label>
          <input type="checkbox" defaultChecked />
        </div>
        {/* Do Not Disturb dropdown */}
        <div className="setting-item">
          <label>Do Not Disturb</label>
          <select>
            <option>During study time</option>
            <option>All day</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default NotificationsSettings;