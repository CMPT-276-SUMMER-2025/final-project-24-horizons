import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellPlus, CalendarPlus, BookOpenText, Check } from 'lucide-react';

/**
 * QuickActions component provides quick access buttons to common actions
 * Includes navigation to calendar, settings, and study sections
 */
function QuickActions() {
  // Hook for programmatic navigation
  const navigate = useNavigate();
  // State to track which button is currently being hovered for shimmer effect
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  /**
   * Navigation handler for adding calendar events
   * Redirects user to the calendar page
   */
  const handleAddEvent = () => {
    navigate('/calendar');
  };

  /**
   * Navigation handler for setting reminders
   * Redirects user to the settings page
   */
  const handleSetReminder = () => {
    navigate('/settings');
  };

  /**
   * Navigation handler for starting a study session
   * Redirects user to study page with flashcards tab active
   */
  const handleStudySession = () => {
    navigate('/study?tab=flashcards');
  };

  return (
    <>
      {/* Widget header with icon and title */}
      <div className="widget-header">
        <Check size={25} strokeWidth={3} /> Quick Actions
      </div>
      
      {/* Widget content containing action buttons */}
      <div className="widget-content" style={{ gap: '35px', justifyContent: 'center' }}>
        {/* Add Event button with hover effects */}
        <button 
          className="quick-action-btn btn-base" 
          onClick={handleAddEvent}
          onMouseEnter={() => setHoveredButton('add-event')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          {/* Button content with icon and text */}
          <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CalendarPlus size={20} /> Add Event
          </span>
          {/* Conditional shimmer effect on hover */}
          {hoveredButton === 'add-event' && (
            <div className="quick-action-btn-shimmer" />
          )}
        </button>
        
        {/* Set Reminder button with hover effects */}
        <button 
          className="quick-action-btn btn-base" 
          onClick={handleSetReminder}
          onMouseEnter={() => setHoveredButton('set-reminder')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          {/* Button content with icon and text */}
          <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <BellPlus size={20} /> Set Reminder
          </span>
          {/* Conditional shimmer effect on hover */}
          {hoveredButton === 'set-reminder' && (
            <div className="quick-action-btn-shimmer" />
          )}
        </button>
        
        {/* View Flash Cards button with hover effects */}
        <button 
          className="quick-action-btn btn-base" 
          onClick={handleStudySession}
          onMouseEnter={() => setHoveredButton('study-session')}
          onMouseLeave={() => setHoveredButton(null)}
        >
          {/* Button content with icon and text */}
          <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <BookOpenText size={20} /> View Flash Cards
          </span>
          {/* Conditional shimmer effect on hover */}
          {hoveredButton === 'study-session' && (
            <div className="quick-action-btn-shimmer" />
          )}
        </button>
      </div>
    </>
  );
}

export default QuickActions;