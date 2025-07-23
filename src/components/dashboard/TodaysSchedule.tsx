import { useCalendar } from '../../services/calendarContext';
import { CalendarFold } from 'lucide-react';

function TodaysSchedule() {
  const { events } = useCalendar();
  const today = new Date();
  
  // Filter events for today and sort by time
  const todaysEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => {
      // Sort by time, putting "All Day" events first
      if (a.time === 'All Day' && b.time !== 'All Day') return -1;
      if (a.time !== 'All Day' && b.time === 'All Day') return 1;
      if (a.time === 'All Day' && b.time === 'All Day') return 0;
      
      // Parse time strings for comparison (assuming format like "09:00" or "09:00 AM")
      const parseTime = (timeStr: string) => {
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
    });

  return (
    <div>
      <div className="widget-header">
        <CalendarFold size={25} /> Today's Schedule
      </div>
      <div className="widget-content" style={{ gap: '8px' }}>
        {todaysEvents.length === 0 ? (
          <div className="widget-row" style={{ color: '#999', fontStyle: 'italic' }}>
            No events scheduled for today
          </div>
        ) : (
          todaysEvents.map((event) => (
            <div className="widget-row" key={event.id}>
              <span style={{ fontWeight: 'bold' }}>{event.time}</span>: {event.title}
              {event.location && <span style={{ color: '#888', fontSize: '0.9em' }}> • {event.location}</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TodaysSchedule