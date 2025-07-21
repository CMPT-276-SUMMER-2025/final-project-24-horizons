function UserSettings() {
  return (
    <section className="settings-section">
      <h2>User Settings</h2>
      <div className="settings-group">
        <div className="setting-item">
          <label>Name</label>
          <input type="text" value="yourname" />
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
  );
}

export default UserSettings;
