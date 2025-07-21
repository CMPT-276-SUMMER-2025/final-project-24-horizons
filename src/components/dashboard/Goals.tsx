function Goals() {
  return (
    <>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '12px' }}>🎯 Goals</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="widget-row">Study more for my final</div>
        <div className="widget-row">Go to the gym 3 times this week</div>
        <div className="widget-row">Spend more time with my friends</div>
      </div>
    </>
  );
}

export default Goals;