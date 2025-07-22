import { useNavigate } from 'react-router-dom';

function QuickActions() {
  const navigate = useNavigate();

  // Actions when clicked
  const handleAddEvent = () => {
    // Navigate to calendar page for adding events
    navigate('/calendar');
  };

  const handleSetReminder = () => {
    // Navigate to settings page for reminder configuration
    navigate('/settings');
  };

  const handleStudySession = () => {
    // For now, navigate to calendar - you can create a dedicated study session page later
    navigate('/calendar');
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