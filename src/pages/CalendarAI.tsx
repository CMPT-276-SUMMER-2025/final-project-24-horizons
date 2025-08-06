import { useState, useEffect } from 'react';
import './CalendarAI.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, where, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Navbar from '../components/NavBar'

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  location: string;
  type: string;
  category: string;
}

const CalendarAI = () => {
  const [aiInput, setAiInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const userId = 'demo-user';
  const [isProcessing, setIsProcessing] = useState(false);
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI calendar assistant. I can help you add, delete, move, and manage your events. Try saying something like 'add meeting tomorrow at 2pm'"
    }
  ]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const [pendingEvent, setPendingEvent] = useState<Omit<Event, 'id'> | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflicts, setConflicts] = useState<Event[]>([]);

  const checkConflicts = (newDate: Date, newTime: string, duration: number = 60): Event[] => {
    const newEventStart = new Date(newDate);
    const [hours, minutes] = newTime.split(':').map(Number);
    newEventStart.setHours(hours, minutes, 0, 0);


    const newEventEnd = new Date(newEventStart);
    newEventEnd.setMinutes(newEventEnd.getMinutes() + duration);

    const conflicts = events.filter(event => {
      if (event.date.toDateString() !== newDate.toDateString()) {
        return false;
      }

      const existingStart = new Date(event.date);
      const [existingHours, existingMinutes] = event.time.split(':').map(Number);
      existingStart.setHours(existingHours, existingMinutes, 0, 0);

      const existingEnd = new Date(existingStart);
      existingEnd.setMinutes(existingEnd.getMinutes() + 60);
      return (newEventStart < existingEnd && newEventEnd > existingStart);
    });

    return conflicts;
  };

  const processAIRequest = async (userInput: string) => {
    if (!userInput.trim()) return;

    setIsProcessing(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key not found');
      }
      const userMessage = { id: Date.now(), type: 'user' as const, content: userInput };
      setChatMessages(prev => [...prev, userMessage]);


      await executeCalendarAction(userInput);


      const eventsContext = events.map(e =>
        `${e.title} on ${e.date.toLocaleDateString()} at ${e.time}`
      ).join(', ');

      const prompt = `You are a calendar assistant that can add, modify, and analyze calendar events. 
      Current events: ${eventsContext}. 
      User request: "${userInput}".
      Context: Today is ${new Date().toDateString()}

      If the user wants to add an event, respond confirming what you've added.
      If the user wants to schedule study/prep sessions, confirm the sessions you've created.
      Otherwise, help analyze their schedule. Be concise and helpful.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      const aiMessage = { id: Date.now() + 1, type: 'ai' as const, content: response };
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (error: unknown) {
        
        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        const aiErrorMessage = {
          id: Date.now() + 1,
          type: 'ai' as const,
          content: `Error: ${errorMessage}`
        };
        setChatMessages(prev => [...prev, aiErrorMessage]);
      }

    setIsProcessing(false);
    setAiInput('');
  };

  const addEvent = async (newEvent: Omit<Event, 'id'>) => {
    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        date: Timestamp.fromDate(newEvent.date),
        userId,
        createdAt: Timestamp.now()
      });
    } catch {
      // Handle error silently
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch {
      // Handle error silently
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      // Create a separate object for Firebase update with proper typing
      const updateData: any = { ...updates };
      
      // Convert Date to Timestamp only for Firebase storage
      if (updates.date) {
        updateData.date = Timestamp.fromDate(updates.date);
      }

      await updateDoc(eventRef, updateData);

    } catch {
      // Handle error silently
    }
  };


  const findAvailableSlots = (date: Date) => {
    const dayEvents = events.filter(e =>
      e.date.toDateString() === date.toDateString()
    );


    const workingHours = [9, 10, 11, 13, 14, 15, 16, 17];
    const availableSlots = workingHours.filter(hour => {
      return !dayEvents.some(event => {
        const eventHour = parseInt(event.time.split(':')[0]);
        return eventHour === hour;
      });
    });

    return availableSlots.map(hour => `${hour.toString().padStart(2, '0')}:00`);
  };

  useEffect(() => {
    const q = query(collection(db, 'events'), where('userId', '==', userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          date: data.date.toDate(),
          time: data.time,
          description: data.description,
          location: data.location,
          type: data.type,
          category: data.category
        };
      }) as Event[];

      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, [userId]);

  const executeCalendarAction = async (userInput: string): Promise<boolean> => {
    const input = userInput.toLowerCase();

    // Check for any calendar action keywords
    const actionKeywords = ['add', 'block', 'schedule', 'book', 'create', 'delete', 'remove', 'move', 'change', 'update', 'reschedule', 'cancel'];
    const hasAction = actionKeywords.some(keyword => input.includes(keyword));

    if (!hasAction) {
      return false;
    }

    try {
      const parsePrompt = `
    Parse this calendar request and extract the details. Respond ONLY with a JSON object in one of these formats:

    For adding events:
    {
      "action": "add_event",
      "title": "event title",
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "description": "any additional details",
      "category": "exam|meeting|study|event"
    }

    For deleting events:
    {
      "action": "delete_events",
      "date": "YYYY-MM-DD",
      "title_filter": "specific event title (optional)",
      "delete_all": true/false
    }

    For moving/rescheduling events:
    {
      "action": "move_event",
      "original_title": "event to move",
      "original_date": "YYYY-MM-DD (optional)",
      "new_date": "YYYY-MM-DD",
      "new_time": "HH:MM (optional)"
    }

    For updating event details:
    {
      "action": "update_event",
      "title_filter": "event to update",
      "original_date": "YYYY-MM-DD (optional)",
      "new_title": "new title (optional)",
      "new_date": "YYYY-MM-DD (optional)",
      "new_time": "HH:MM (optional)"
    }
    
    User request: "${userInput}"
    Current date: ${new Date().toISOString().split('T')[0]}
    
    If you cannot parse the request, respond with: {"action": "none"}
    `;

      const result = await model.generateContent(parsePrompt);
      const response = result.response.text().trim();
      let parsedData;
      try {
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
        parsedData = JSON.parse(cleanJson);
      } catch {
        // Handle error silently
        return false;
      }
      if (parsedData.action === 'none') {
        return false;
      }


      switch (parsedData.action) {
        case 'add_event': {
          const newEventData = {
            title: parsedData.title || 'New Event',
            date: parsedData.date ? (() => {
              const [year, month, day] = parsedData.date.split('-').map(Number);
              return new Date(year, month - 1, day);
            })() : new Date(),
            time: parsedData.time || '14:00',
            description: parsedData.description || 'Added by AI Assistant',
            location: '',
            type: 'ai-generated',
            category: parsedData.category || 'event'
          };

          const detectedConflicts = checkConflicts(newEventData.date, newEventData.time);

          if (detectedConflicts.length > 0) {

            setPendingEvent(newEventData);
            setConflicts(detectedConflicts);
            setShowConflictDialog(true);

            const conflictMessage = {
              id: Date.now() + 2,
              type: 'ai' as const,
              content: `⚠️ Scheduling conflict detected! You already have "${detectedConflicts[0].title}" at ${detectedConflicts[0].time} on this date. Would you like to proceed anyway or choose a different time?`
            };
            setChatMessages(prev => [...prev, conflictMessage]);

            return true;
          } else {

            addEvent(newEventData);
            return true;
          }
        }

        case 'delete_events': {
          const deleteDate = parsedData.date ? (() => {
            const [year, month, day] = parsedData.date.split('-').map(Number);
            return new Date(year, month - 1, day);
          })() : null;

          let eventsToDelete = events;


          if (deleteDate) {
            eventsToDelete = events.filter(event =>
              event.date.toDateString() === deleteDate.toDateString()
            );
          }


          if (parsedData.title_filter) {
            eventsToDelete = eventsToDelete.filter(event =>
              event.title.toLowerCase().includes(parsedData.title_filter.toLowerCase())
            );
          }


          for (const event of eventsToDelete) {
            await deleteEvent(event.id);
          }
          return true;
        }

        case 'move_event':
        case 'update_event': {
          const eventToUpdate = events.find(event => {
            const titleMatch = parsedData.original_title ?
              event.title.toLowerCase().includes(parsedData.original_title.toLowerCase()) :
              parsedData.title_filter ?
                event.title.toLowerCase().includes(parsedData.title_filter.toLowerCase()) :
                true;

             const dateMatch = parsedData.original_date ? (() => {
              const [year, month, day] = parsedData.original_date.split('-').map(Number);
              const targetDate = new Date(year, month - 1, day);
              return event.date.toDateString() === targetDate.toDateString();
              })() : true;

            return titleMatch && dateMatch;
          });


          if (eventToUpdate) {
            const updates: Partial<Event> = {};


            if (parsedData.new_title) {
              updates.title = parsedData.new_title;
            }


            if (parsedData.new_date) {
              const [year, month, day] = parsedData.new_date.split('-').map(Number);
              updates.date = new Date(year, month - 1, day);
            }


            if (parsedData.new_time) {
              updates.time = parsedData.new_time;
            }
            await updateEvent(eventToUpdate.id, updates);
            return true;
          }
          
          return false;
        }

        default:
          return false;
      }

    } catch {
      // Handle error silently
      return false;
    }
  };

  const handleConflictConfirm = async () => {
    if (pendingEvent) {
      await addEvent(pendingEvent);
      const confirmMessage = {
        id: Date.now(),
        type: 'ai' as const,
        content: `✅ Event "${pendingEvent.title}" added despite the conflict.`
      };
      setChatMessages(prev => [...prev, confirmMessage]);
    }
    setShowConflictDialog(false);
    setPendingEvent(null);
    setConflicts([]);
  };

  const handleConflictCancel = () => {
    const cancelMessage = {
      id: Date.now(),
      type: 'ai' as const,
      content: `❌ Event creation cancelled. Try a different time!`
    };
    setChatMessages(prev => [...prev, cancelMessage]);

    setShowConflictDialog(false);
    setPendingEvent(null);
    setConflicts([]);
  };

  const handleConflictReschedule = async () => {
    if (pendingEvent) {
      // Find next available slot
      const availableSlots = findAvailableSlots(pendingEvent.date);
      if (availableSlots.length > 0) {
        const rescheduledEvent = { ...pendingEvent, time: availableSlots[0] };
        await addEvent(rescheduledEvent);

        const rescheduleMessage = {
          id: Date.now(),
          type: 'ai' as const,
          content: `🔄 Event rescheduled to ${availableSlots[0]} to avoid conflicts.`
        };
        setChatMessages(prev => [...prev, rescheduleMessage]);
      } else {
        const noSlotMessage = {
          id: Date.now(),
          type: 'ai' as const,
          content: `❌ No available slots found on this date. Try a different day.`
        };
        setChatMessages(prev => [...prev, noSlotMessage]);
      }
    }
    setShowConflictDialog(false);
    setPendingEvent(null);
    setConflicts([]);
  };

  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
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
    days.push(
      <div key="header" className="calendar-ai-month-header">
        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
      </div>
    );


    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayLabels.forEach((label, i) => {
      days.push(
        <div key={`label-${i}`} className="calendar-ai-day-label">
          {label}
        </div>
      );
    });


    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-ai-empty-day" />
      );
    }


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
    if (!aiInput.trim() || isProcessing) return;
    processAIRequest(aiInput);
  };

  return (
    <>
      <Navbar />
      <div className="calendar-ai-root">
        <div className="calendar-ai-container">
          
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
                    disabled={isProcessing}
                    className="calendar-ai-send-btn"
                  >
                    {isProcessing ? '...' : '➤'}
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

          {showConflictDialog && (
            <div className="calendar-ai-conflict-dialog">
              <div className="calendar-ai-conflict-content">
                <h3>⚠️ Scheduling Conflict</h3>
                <p>The following conflicts were detected:</p>
                <ul>
                  {conflicts.map(conflict => (
                    <li key={conflict.id}>
                      {conflict.title} at {conflict.time}
                    </li>
                  ))}
                </ul>
                <div className="calendar-ai-conflict-buttons">
                  <button onClick={handleConflictConfirm} className="calendar-ai-btn-confirm">
                    Add Anyway
                  </button>
                  <button onClick={handleConflictReschedule} className="calendar-ai-btn-reschedule">
                    Auto-Reschedule
                  </button>
                  <button onClick={handleConflictCancel} className="calendar-ai-btn-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CalendarAI;