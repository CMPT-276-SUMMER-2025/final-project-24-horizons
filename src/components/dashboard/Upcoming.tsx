import { useCalendar } from '../../services/calendarContext';
import { Clock9 } from 'lucide-react';

function Upcoming() {
  const { events } = useCalendar();
  const today = new Date();
  
  // Filter events for future dates (excluding today) and sort by date/time
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      const todayDate = new Date(today);
      
      // Compare dates without time by setting both to start of day
      eventDate.setHours(0, 0, 0, 0);
      todayDate.setHours(0, 0, 0, 0);
      
      return eventDate > todayDate; // Only events after today
    })
    .sort((a, b) => {

      // Sort by date first, then by time
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If same date, sort by time
      const parseTime = (timeStr: string) => {
        if (timeStr === 'All Day') return -1; // All day events first
        const match = timeStr.match(/(\d{1,2}):(\d{2})(\s*(AM|PM))?/i);
        if (!match) return 0;
        
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const ampm = match[4]?.toUpperCase();
        
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        return hours * 60 + minutes;
      };
      
      return parseTime(a.time) - parseTime(b.time);
    })
    .slice(0, 5); // Show only next 5 upcoming events

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div className="widget-header">
        <Clock9 size={25} /> Upcoming
      </div>
      <div className="widget-content" style={{ gap: '8px' }}>
        {upcomingEvents.length === 0 ? (
          <div className="widget-row" style={{ color: '#999', fontStyle: 'italic' }}>
            No upcoming events
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <div className="widget-row" key={event.id}>
              <span style={{ fontWeight: 'bold' }}>{formatDate(new Date(event.date))} • {event.time}</span>: {event.title}
              {event.location && <span style={{ color: '#888', fontSize: '0.9em' }}> • {event.location}</span>}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Upcoming;