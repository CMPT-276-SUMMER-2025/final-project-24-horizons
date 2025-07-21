function QuickActions() {

  // Actions when clicked
  const handleAddEvent = () => {
    // TODO: Implement add event logic
    console.log("Add Event clicked");
  };

  const handleSetReminder = () => {
    // TODO: Implement set reminder logic
    console.log("Set Reminder clicked");
  };

  const handleStudySession = () => {
    // TODO: Implement study session logic
    console.log("Study Session clicked");
  };

  return (
    <>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '12px' }}>🎉 Quick Actions</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '35px', justifyContent: 'center' }}>
        <button className="quick-action-btn" onClick={handleAddEvent}>⭕️ Add Event</button>
        <button className="quick-action-btn" onClick={handleSetReminder}>✅ Set Reminder</button>
        <button className="quick-action-btn" onClick={handleStudySession}>🤓 Study Session</button>
      </div>
    </>
  );
}

export default QuickActions;