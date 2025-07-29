import { useGoals } from '../../services/goalsContext';
import { useAuth } from '../../services/authContext';
import { Goal, Loader2 } from 'lucide-react';

function Goals() {
  const { goals, isLoading, error } = useGoals();
  const { user, loading: authLoading } = useAuth();

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <>
        <div className="widget-header">
          <Goal size={25} /> Goals
          <Loader2 size={16} className="animate-spin" style={{ marginLeft: 'auto' }} />
        </div>
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
      <div className="widget-header">
        <Goal size={25} /> Goals
        {isLoading && <Loader2 size={16} className="animate-spin" style={{ marginLeft: 'auto' }} />}
      </div>
      <div className="widget-content" style={{ gap: '8px' }}>
        {/* Only show error if it's not the "not logged in" message or if user is actually logged in */}
        {error && !error.includes('Not logged in') && (
          <div className="widget-row" style={{ color: '#ff6b6b', fontStyle: 'italic', fontSize: '0.9em' }}>
            ⚠️ {error}
          </div>
        )}
        {/* Show login message only if user is not authenticated */}
        {!user && (
          <div className="widget-row" style={{ color: '#888', fontStyle: 'italic', fontSize: '0.9em' }}>
            🔒 Log in to sync your goals
          </div>
        )}
        {goals.length === 0 && !isLoading ? (
          <div className="widget-row" style={{ color: '#888', fontStyle: 'italic' }}>
            No goals set yet
          </div>
        ) : (
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