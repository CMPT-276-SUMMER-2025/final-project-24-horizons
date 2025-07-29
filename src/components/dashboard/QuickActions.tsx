import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellPlus, CalendarPlus, BookOpenText, Check } from 'lucide-react';

function QuickActions() {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Actions when clicked
  const handleAddEvent = () => {
    navigate('/calendar');
  };

  const handleSetReminder = () => {
    navigate('/settings');
  };

  const handleStudySession = () => {
    navigate('/study?tab=flashcards');
  };

  return (
    <>
      <div className="widget-header">
        <Check size={25} strokeWidth={3} /> Quick Actions
      </div>
      <div className="widget-content" style={{ gap: '35px', justifyContent: 'center' }}>
        <button 
          className="quick-action-btn btn-base" 
          onClick={handleAddEvent}
          onMouseEnter={() => setHoveredButton('add-event')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CalendarPlus size={20} /> Add Event
          </span>
          {hoveredButton === 'add-event' && (
            <div className="quick-action-btn-shimmer" />
          )}
        </button>
        <button 
          className="quick-action-btn btn-base" 
          onClick={handleSetReminder}
          onMouseEnter={() => setHoveredButton('set-reminder')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <BellPlus size={20} /> Set Reminder
          </span>
          {hoveredButton === 'set-reminder' && (
            <div className="quick-action-btn-shimmer" />
          )}
        </button>
        <button 
          className="quick-action-btn btn-base" 
          onClick={handleStudySession}
          onMouseEnter={() => setHoveredButton('study-session')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <BookOpenText size={20} /> View Flash Cards
          </span>
          {hoveredButton === 'study-session' && (
            <div className="quick-action-btn-shimmer" />
          )}
        </button>
      </div>
    </>
  );
}

export default QuickActions;