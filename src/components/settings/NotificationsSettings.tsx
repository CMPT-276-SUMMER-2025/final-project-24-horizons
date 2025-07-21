function NotificationsSettings() {
  return (
    <section className="settings-section">
      <h2>Smart Notifications</h2>
      <div className="settings-group">
        <div className="setting-item">
          <label>Push Notifications</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div className="setting-item">
          <label>Email Notifications</label>
          <input type="checkbox" />
        </div>
        <div className="setting-item">
          <label>Smart Timing</label>
          <input type="checkbox" defaultChecked />
        </div>
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
