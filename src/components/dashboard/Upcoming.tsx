import { useCalendar } from '../../services/calendarContext';
import { Clock9 } from 'lucide-react';

/**
 * Upcoming component displays the next 5 upcoming events from the calendar
 * Filters out events from today and earlier, showing only future events
 */
function Upcoming() {
  const { events } = useCalendar();
  const today = new Date();
  
  // Filter events for future dates (excluding today) and sort by date/time
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      const todayDate = new Date(today);
      
      // Compare dates without time by setting both to start of day
      // This ensures we're comparing date only, not datetime
      eventDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      return eventDate > todayDate; // Only events after today
    })
    .sort((a, b) => {
      // Sort by date first, then by time
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Primary sort: by date
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // Secondary sort: If same date, sort by time
      const parseTime = (timeStr: string) => {
        // All day events should appear first
        if (timeStr === 'All Day') return -1; 
        
        // Parse time string (e.g., "2:30 PM" or "14:30")
        const match = timeStr.match(/(\d{1,2}):(\d{2})(\s*(AM|PM))?/i);
        if (!match) return 0;
        
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[4]?.toUpperCase();
        
        // Convert to 24-hour format for comparison
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        // Return total minutes since midnight for comparison
        return hours * 60 + minutes;
      };
      
      return parseTime(a.time) - parseTime(b.time);
    })
    .slice(0, 5); // Limit to show only next 5 upcoming events

  /**
   * Format date for display with human-readable relative terms
   * @param date - The date to format
   * @returns Formatted date string (e.g., "Tomorrow", "Monday", "Jan 15")
   */
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Show "Tomorrow" for next day
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    // Calculate days difference
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Show weekday name for events within the next week
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    // Show month and day for events further out
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Widget header with clock icon and title */}
      <div className="widget-header">
        <Clock9 size={25} /> Upcoming
      </div>
      
      {/* Widget content area */}
      <div className="widget-content" style={{ gap: '8px' }}>
        {upcomingEvents.length === 0 ? (
          // Empty state when no upcoming events
          <div className="widget-row" style={{ color: '#999', fontStyle: 'italic' }}>
            No upcoming events
          </div>
        ) : (
          // Render list of upcoming events
          upcomingEvents.map((event) => (
            <div className="widget-row" key={event.id}>
              {/* Event date and time in bold */}
              <span style={{ fontWeight: 'bold' }}>
                {formatDate(new Date(event.date))} • {event.time}
              </span>
              : {event.title}
              {/* Optional location display */}
              {event.location && (
                <span style={{ color: '#888', fontSize: '0.9em' }}>
                  {' • '}{event.location}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Upcoming;