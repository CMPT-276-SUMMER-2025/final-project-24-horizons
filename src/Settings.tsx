import './Settings.css'; // We’ll create this file next

function Settings() {
  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-grid">
        {/* Notification Settings */}
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

        {/* User Settings */}
        <section className="settings-section">
          <h2>User Settings</h2>
          <div className="settings-group">
            <div className="setting-item">
              <label>Username</label>
              <input type="text" value="myusername" />
            </div>
            <div className="setting-item">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" />
            </div>
            <div className="setting-item">
              <label>Default Study Session</label>
              <select>
                <option>25 min</option>
                <option>45 min</option>
                <option>60 min</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Timezone</label>
              <select>
                <option>PST</option>
                <option>EST</option>
                <option>GMT</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Theme</label>
              <select>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </section>

        {/* Reminder */}
        <section className="settings-section reminder-panel">
          <h2>Reminder</h2>
          <div className="reminder-box">
            <p className="reminder-title">Time to study!</p>
            <p>Ready for your 25-minute session?</p>
            <div className="reminder-buttons">
              <button>Start</button>
              <button>Snooze</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
