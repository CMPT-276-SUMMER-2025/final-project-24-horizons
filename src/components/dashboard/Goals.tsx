import { useGoals } from '../../services/goalsContext';
import { Goal } from 'lucide-react';

function Goals() {
  const { goals } = useGoals();

  return (
    <>
      <div className="widget-header">
        <Goal size={25} /> Goals
      </div>
      <div className="widget-content" style={{ gap: '8px' }}>
        {goals.length === 0 ? (
          <div className="widget-row" style={{ color: '#888', fontStyle: 'italic' }}>
            No goals set yet
          </div>
        ) : (
          goals.map((goal, index) => (
            <div className="widget-row" key={index}>
              {goal}
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Goals;