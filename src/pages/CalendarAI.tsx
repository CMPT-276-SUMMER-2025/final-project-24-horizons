import React, { useState } from 'react';
import './CalendarAI.css';
import Navbar from '../components/NavBar'

// Mock data - replace with your actual imported events
const initialEvents = [
  {
    id: '1',
    title: 'Exam',
    date: new Date(2025, 6, 26), // July 26, 2025
    time: '10:00',
    description: 'Final chemistry exam',
    location: 'Room 101',
    type: 'canvas',
    category: 'exam'
  },
  {
    id: '2',
    title: 'Lecture',
    date: new Date(2025, 6, 24),
    time: '14:00',
    description: 'Calculus II',
    location: 'Hall B',
    type: 'google',
    category: 'class'
  },
  {
    id: '3',
    title: 'Meeting',
    date: new Date(2025, 6, 25),
    time: '09:00',
    description: 'Weekly team sync',
    location: 'Conference Room',
    type: 'imported',
    category: 'meeting'
  }
];

const CalendarAI = () => {
  const [events] = useState(initialEvents);
//   const [selectedDate] = useState(new Date());
  const [aiInput, setAiInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "blahh?"
    },
    {
      id: 2, 
      type: 'ai',
      content: "blah blah"
    },
    {
      id: 3,
      type: 'ai', 
      content: "blah"
    }
  ]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const navigatePrevious = () => {
  const newDate = new Date(selectedDate);
  if (viewMode === 'month') {
    newDate.setMonth(newDate.getMonth() - 1);
  } else {
    newDate.setDate(newDate.getDate() - 7); // Previous week
  }
  setSelectedDate(newDate);
  };

  const navigateNext = () => {
  const newDate = new Date(selectedDate);
  if (viewMode === 'month') {
    newDate.setMonth(newDate.getMonth() + 1);
  } else {
    newDate.setDate(newDate.getDate() + 7); // Next week
  }
  setSelectedDate(newDate);
  };
  

  const formatCurrentPeriod = () => {
  const monthNames = ["January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December"];
  return `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };


  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (day: number) => {
    const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return events.filter(event =>
      event.date.toDateString() === targetDate.toDateString()
    );
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(selectedDate);
    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Month header
    days.push(
      <div key="header" className="calendar-ai-month-header">
        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
      </div>
    );

    // Day labels
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach((label, i) => {
      days.push(
        <div key={`label-${i}`} className="calendar-ai-day-label">
          {label}
        </div>
      );
    });

    // Empty cells for days before month start
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-ai-empty-day" />
      );
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isToday = new Date().toDateString() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();
      
      days.push(
        <div
          key={day}
          className={`calendar-ai-day ${isToday ? 'calendar-ai-day--today' : ''} ${dayEvents.length > 0 ? 'calendar-ai-day--has-events' : ''}`}
        >
          <div className="calendar-ai-day-number">{day}</div>
          {dayEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className={`calendar-ai-event calendar-ai-event--${event.type}`}
              title={`${event.title} - ${event.time}`}
            >
              {event.title}
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="calendar-ai-more-events">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleSendMessage = () => {
    if (!aiInput.trim()) return;
    
    // Add user message (for now just clear input)
    setAiInput('');
    // TODO: Add AI processing logic here
  };

  return (
    <>
    <Navbar />
    <div className="calendar-ai-root">
      <div className="calendar-ai-container">
        {/* Calendar Section */}
        <div className={`calendar-ai-calendar-section ${isPanelOpen ? 'calendar-ai-calendar-section--with-panel' : ''}`}>
          <div className="calendar-ai-calendar-controls">
  <div className="calendar-ai-calendar-nav">
    <button 
      className="calendar-ai-nav-btn" 
      onClick={navigatePrevious}
    >
      Prev
    </button>
    <span className="calendar-ai-current-month">
      {formatCurrentPeriod()}
    </span>
    <button 
      className="calendar-ai-nav-btn" 
      onClick={navigateNext}
    >
      Next
    </button>
  </div>
</div>

          <div className="calendar-ai-calendar-container">
            <div className="calendar-ai-calendar-grid">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        <div className={`calendar-ai-chat-panel ${isPanelOpen ? 'calendar-ai-chat-panel--open' : 'calendar-ai-chat-panel--closed'}`}>
          <div className="calendar-ai-chat-header">
            <h2 className="calendar-ai-chat-title">Gemini</h2>
            <button 
              className="calendar-ai-panel-toggle"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
              {isPanelOpen ? '→' : '←'}
            </button>
          </div>

          {isPanelOpen && (
            <>
              <div className="calendar-ai-chat-messages">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`calendar-ai-message calendar-ai-message--${message.type}`}
                  >
                    {message.content}
                  </div>
                ))}
              </div>

              <div className="calendar-ai-chat-input-container">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask me to arrange your schedule"
                  className="calendar-ai-chat-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="calendar-ai-send-btn"
                >
                  →
                </button>
              </div>
            </>
          )}
        </div>
      {!isPanelOpen && (
        <button 
            className="calendar-ai-floating-toggle"
            onClick={() => setIsPanelOpen(true)}
            title="Open Gemini Assistant"
        >
            <span className="calendar-ai-floating-toggle-icon">🤖</span>
            <span className="calendar-ai-floating-toggle-text">Gemini</span>
        </button>
        )}  
      </div>
    </div>
    </>
  );
};

export default CalendarAI;