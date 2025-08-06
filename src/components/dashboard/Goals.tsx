// Import custom hooks for goals and authentication management
import { useGoals } from '../../services/goalsContext';
import { useAuth } from '../../services/authContext';
// Import icons from lucide-react icon library
import { Goal, Loader2 } from 'lucide-react';

/**
 * Goals Component
 * 
 * Displays user goals in a dashboard widget format.
 * Handles authentication states and loading states gracefully.
 * Shows different messages based on user authentication status and data availability.
 */
function Goals() {
  // Extract goals data, loading state, and errors from goals context
  const { goals, isLoading, error } = useGoals();
  // Extract user authentication data and loading state from auth context
  const { user, loading: authLoading } = useAuth();

  // Show loading state while authentication is being verified
  if (authLoading) {
    return (
      <>
        {/* Widget header with goal icon and loading spinner */}
        <div className="widget-header">
          <Goal size={25} /> Goals
          <Loader2 size={16} className="animate-spin" style={{ marginLeft: 'auto' }} />
        </div>
        {/* Loading message in widget content area */}
        <div className="widget-content" style={{ gap: '8px' }}>
          <div className="widget-row" style={{ color: '#888', fontStyle: 'italic' }}>
            Loading...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Widget header with goal icon and conditional loading spinner */}
      <div className="widget-header">
        <Goal size={25} /> Goals
        {/* Show loading spinner only when goals are being fetched */}
        {isLoading && <Loader2 size={16} className="animate-spin" style={{ marginLeft: 'auto' }} />}
      </div>
      
      {/* Widget content container */}
      <div className="widget-content" style={{ gap: '8px' }}>
        {/* Display error messages (excluding "not logged in" errors when user is not authenticated) */}
        {error && !error.includes('Not logged in') && (
          <div className="widget-row" style={{ color: '#ff6b6b', fontStyle: 'italic', fontSize: '0.9em' }}>
            ⚠️ {error}
          </div>
        )}
        
        {/* Show login prompt when user is not authenticated */}
        {!user && (
          <div className="widget-row" style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
            🔒 Log in to sync your goals
          </div>
        )}
        
        {/* Conditionally render goals list or empty state message */}
        {goals.length === 0 && !isLoading ? (
          // Show empty state when no goals exist and not loading
          <div className="widget-row" style={{ color: '#888', fontStyle: 'italic' }}>
            No goals set yet
          </div>
        ) : (
          // Render each goal as a list item with bullet point
          goals.map((goal, index) => (
            <div className="widget-row" key={index}>
              • {goal}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Goals;