import './dashboard.css';
import TodaysSchedule from '../components/dashboard/TodaysSchedule';
import QuickActions from '../components/dashboard/QuickActions';
import Upcoming from '../components/dashboard/Upcoming';
import Goals from '../components/dashboard/Goals';
import PersonalNotes from '../components/dashboard/PersonalNotes';
import AISuggestions from '../components/dashboard/AISuggestions';
import Navbar from '../components/navBar';

function Dashboard() { /* Array of widget components */
  const widgetComponents = [
    <TodaysSchedule key="schedule" />,
    <QuickActions key="quick" />,
    <Upcoming key="upcoming" />,
    <Goals key="goals" />,
    <PersonalNotes key="notes" />,
    <AISuggestions key="ai" />
  ];

  return ( /* Iterating over array to display elements */
    <>
      <Navbar />
      <div className="dashboard-page" style={{ marginTop: '70px' }}>
        <div className="dashboard-grid">
          {widgetComponents.map((Component, i) => ( 
            <div className="dashboard-widget" key={i} style={{ padding: '16px' }}>
              {Component}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;