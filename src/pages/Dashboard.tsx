import './dashboard.css';
import TodaysSchedule from '../components/dashboard/TodaysSchedule';
import QuickActions from '../components/dashboard/QuickActions';
import Upcoming from '../components/dashboard/Upcoming';
import Goals from '../components/dashboard/Goals';
import PersonalNotes from '../components/dashboard/PersonalNotes';
import AISuggestions from '../components/dashboard/AISuggestions';
import Navbar from '../components/NavBar';

/**
 * Main Dashboard component that displays a grid layout of various widgets
 * Each widget provides different functionality for the user's study management
 */
function Dashboard() {
  /**
   * Array of widget components to be rendered in the dashboard grid
   * Each component is pre-instantiated with a unique key for React reconciliation
   * Order in this array determines the display order in the grid
   */
  const widgetComponents = [
    <TodaysSchedule key="schedule" />,  // Shows today's scheduled tasks/events
    <QuickActions key="quick" />,       // Provides quick access to common actions
    <Upcoming key="upcoming" />,        // Displays upcoming deadlines and events
    <Goals key="goals" />,              // Shows user's academic goals and progress
    <PersonalNotes key="notes" />,      // Quick access to personal notes
    <AISuggestions key="ai" />          // AI-powered study suggestions
  ];

  return (
    <>
      {/* Navigation bar appears at the top of every page */}
      <Navbar />
      
      {/* Main dashboard container with grid layout */}
      <div className="dashboard-page">
        <div className="dashboard-grid">
          {/* 
            Iterate over widget components array to render each widget
            Each widget is wrapped in a standardized container with padding
          */}
          {widgetComponents.map((Component, i) => ( 
            <div 
              className="dashboard-widget" 
              key={i} 
              style={{ padding: '16px' }} // Consistent spacing around each widget
            >
              {Component}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;