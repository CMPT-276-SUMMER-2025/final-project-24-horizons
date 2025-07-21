function ReminderCard() {
  return (
    <section className="settings-section reminder-panel">
      <h2>Reminder</h2>
      <div className="reminder-box">
        <p className="reminder-title">Time to study!</p>
        <p>Ready for your 25‑minute session?</p>
        <div className="reminder-buttons">
          <button>Start</button>
          <button>Snooze</button>
        </div>
      </div>
    </section>
  );
}

export default ReminderCard;
