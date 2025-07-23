import { useGoals } from '../../services/goalsContext';

function Goals() {
  const { goals } = useGoals();

  return (
    <>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '12px' }}>🎯 Goals</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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