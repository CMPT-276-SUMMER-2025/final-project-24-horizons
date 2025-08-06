// Import calendar context hook to access events data
import { useCalendar } from '../../services/calendarContext';
// Import calendar icon from lucide-react
import { CalendarFold } from 'lucide-react';

/**
 * TodaysSchedule component displays a widget showing all events scheduled for today
 * Events are sorted chronologically with "All Day" events appearing first
 */
function TodaysSchedule() {
  // Get events from calendar context
  const { events } = useCalendar();
  // Get current date for comparison
  const today = new Date();
  
  // Filter events for today and sort by time
  const todaysEvents = events
    .filter(event => {
      // Convert event date to Date object for comparison
      const eventDate = new Date(event.date);
      // Compare date strings to check if event is today
      return eventDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => {
      // Sort by time, putting "All Day" events first
      if (a.time === 'All Day' && b.time !== 'All Day') return -1;
      if (a.time !== 'All Day' && b.time === 'All Day') return 1;
      if (a.time === 'All Day' && b.time === 'All Day') return 0;
      
      // Parse time strings for comparison (assuming format like "09:00" or "09:00 AM")
      const parseTime = (timeStr: string) => {
        // Use regex to extract hours, minutes, and AM/PM from time string
        const match = timeStr.match(/(\d{1,2}):(\d{2})(\s*(AM|PM))?/i);
        if (!match) return 0;
        
        // Extract numeric values from regex match
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[4]?.toUpperCase();
        
        // Convert to 24-hour format for proper comparison
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        // Return total minutes since midnight for easy comparison
        return hours * 60 + minutes;
      };
      
      // Compare parsed time values to sort chronologically
      return parseTime(a.time) - parseTime(b.time);
    });

  return (
    <div>
      {/* Widget header with calendar icon and title */}
      <div className="widget-header">
        <CalendarFold size={25} /> Today's Schedule
      </div>
      {/* Widget content area displaying today's events */}
      <div className="widget-content" style={{ gap: '8px' }}>
        {todaysEvents.length === 0 ? (
          // Show message when no events are scheduled for today
          <div className="widget-row" style={{ color: '#999', fontStyle: 'italic' }}>
            No events scheduled for today
          </div>
        ) : (
          // Display each event with time, title, and optional location
          todaysEvents.map((event) => (
            <div className="widget-row" key={event.id}>
              {/* Event time in bold */}
              <span style={{ fontWeight: 'bold' }}>{event.time}</span>: {event.title}
              {/* Optional location with styling */}
              {event.location && <span style={{ color: '#888', fontSize: '0.9em' }}> • {event.location}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodaysSchedule;